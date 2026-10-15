import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { MapPin } from 'lucide-react';
import { rooms, doors, wallSegments, categories, footprint, cadPoint as P } from '../data/questromMapData';
import { chairs, furnitureBoxes, furnitureRounds, stagePolygon, podium, planters, sculptureCenter, auditoriumTiers } from '../data/furniture';
import ArchitecturalDetails from './ArchitecturalDetails';
import { distance } from '../lib/geometry';
import { useMapStore } from '../store/useMapStore';

export function shapeOf(polygon){const shape=new THREE.Shape();polygon.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();return shape;}
function Solid({polygon,height=.18,y=0,color,...props}){const geometry=useMemo(()=>new THREE.ExtrudeGeometry(shapeOf(polygon),{depth:height,bevelEnabled:false}),[polygon,height]);useEffect(()=>()=>geometry.dispose(),[geometry]);return <mesh {...props} geometry={geometry} rotation={[-Math.PI/2,0,0]} position={[0,y,0]} receiveShadow><meshStandardMaterial color={color} roughness={.84}/></mesh>;}
const RoomFloor=memo(function RoomFloor({room}){
 const select=useMapStore(s=>s.select),selected=useMapStore(s=>s.selected===room.id),category=useMapStore(s=>s.category),detail=useMapStore(s=>s.detail),[hovered,setHovered]=useState(false);
 const faded=category!=='all'&&category!==room.type,color=selected?'#d76a60':faded?'#e2e4df':room.color||categories[room.type].color;
 const showLabel=room.featured||room.id==='main-entrance'||room.id==='silber-entrance'||selected||hovered||detail;
 return <group onClick={e=>{e.stopPropagation();select(room.id);}} onPointerOver={e=>{e.stopPropagation();setHovered(true);document.body.style.cursor='pointer';}} onPointerOut={()=>{setHovered(false);document.body.style.cursor='auto';}}>
 <Solid polygon={room.polygon} color={color} y={room.height===0?.015:.06}/>
 {selected&&<Line points={[...room.polygon,room.polygon[0]].map(([x,z])=>[x,.35,z])} color="#cc0000" lineWidth={2.5}/>}
 {showLabel&&<Html center position={[room.center[0],selected?5.7:3.7,room.center[1]]} zIndexRange={[15,0]} style={{pointerEvents:'none',opacity:faded?.25:1}}><div className={`room-label ${room.featured?'featured-label':''} ${selected?'selected-label':''}`} style={{color:selected?'#ae0000':room.outdoor?'#f3eddb':categories[room.type].ink}}>{room.label.map((t,i)=><div key={i}>{t}</div>)}</div></Html>}
 {selected&&<Html center position={[room.center[0],9,room.center[1]]} zIndexRange={[26,20]} style={{pointerEvents:'none'}}><div className="map-pin"><MapPin size={22} fill="currentColor"/><span>{room.short||room.name}</span></div></Html>}
 </group>;
});
function Instances({items,shape='box',color,opacity=1}){
 const ref=useRef(),matrix=useMemo(()=>new THREE.Object3D(),[]);
 useLayoutEffect(()=>{if(!ref.current)return;items.forEach((item,i)=>{matrix.position.set(...item.position);matrix.rotation.set(0,item.angle||0,0);matrix.scale.set(...item.scale);matrix.updateMatrix();ref.current.setMatrixAt(i,matrix.matrix);});ref.current.instanceMatrix.needsUpdate=true;ref.current.computeBoundingSphere();},[items,matrix]);
 if(!items.length)return null;
 return <instancedMesh ref={ref} args={[null,null,items.length]} castShadow receiveShadow>{shape==='round'?<cylinderGeometry args={[1,1,1,20]}/>:<boxGeometry args={[1,1,1]}/>}<meshStandardMaterial color={color} roughness={.72} transparent={opacity<1} opacity={opacity}/></instancedMesh>;
}
function WallsAndDoors(){
 const walls=useMemo(()=>wallSegments.map(w=>({position:[(w.a[0]+w.b[0])/2,w.height/2+.18,(w.a[1]+w.b[1])/2],scale:[distance(w.a,w.b),w.height,.18],angle:-Math.atan2(w.b[1]-w.a[1],w.b[0]-w.a[0])})),[]);
 const trim=useMemo(()=>walls.map(w=>({...w,position:[w.position[0],w.position[1]*2-.08,w.position[2]],scale:[w.scale[0],.09,.21]})),[walls]);
 const {frames,leaves,sills}=useMemo(()=>{const frames=[],leaves=[],sills=[];for(const d of doors){const[x,z]=d.point,[nx,nz]=d.normal,t=[-nz,nx],angle=-Math.atan2(t[1],t[0]);sills.push({position:[x,.245,z],scale:[d.width,.055,.26],angle});if(d.kind==='open'||d.storefront)continue;for(const sign of [-1,1])frames.push({position:[x+t[0]*d.width/2*sign,1.37,z+t[1]*d.width/2*sign],scale:[.09,2.4,.14],angle});frames.push({position:[x,2.59,z],scale:[d.width+.12,.12,.14],angle});if(d.kind==='lift')continue;const halves=d.kind==='double'?2:1;for(let i=0;i<halves;i++){const sign=i===0?-1:1,leafWidth=d.width/halves*.88,hx=x+t[0]*d.width/2*sign,hz=z+t[1]*d.width/2*sign;leaves.push({position:[hx-nx*leafWidth/2,1.23,hz-nz*leafWidth/2],scale:[.07,2.1,leafWidth],angle:-Math.atan2(-nx,nz)});}}return{frames,leaves,sills};},[]);
 return <><Instances items={walls} color="#f3efe5"/><Instances items={trim} color="#e2dccd"/><Instances items={frames} color="#a99b7f"/><Instances items={leaves} color="#b7c9cc"/><Instances items={sills} color="#b79666"/></>;
}
const materials={wood:'#bca78b',metal:'#596762',screen:'#344942',cabinet:'#d1cbbd',porcelain:'#eeeee5',glass:'#b0c9cf',stair:'#d1cebf',lounge:'#9da78d'};
function Furniture(){
 const colors=Object.keys(materials);
 const seats=useMemo(()=>{const groups={};for(const color of ['office','auditorium','lounge']){const items=chairs.filter(c=>c.color===color),base=items.map(c=>({position:[c.x,c.y+.65,c.z],scale:[.69,.16,.7],angle:c.angle})),backs=items.map(c=>({position:[c.x+Math.sin(c.angle)*.31,c.y+1.02,c.z+Math.cos(c.angle)*.31],scale:[.69,.67,.12],angle:c.angle})),legs=items.map(c=>({position:[c.x,c.y+.36,c.z],scale:[.14,.55,.14],angle:0}));groups[color]={base,backs,legs};}return groups;},[]);
 return <group>{colors.map(color=><Instances key={color} items={furnitureBoxes.filter(b=>b.color===color)} color={materials[color]}/>)}{colors.map(color=><Instances key={'r'+color} items={furnitureRounds.filter(b=>b.color===color)} shape="round" color={materials[color]}/>)}{Object.entries(seats).map(([color,parts])=><group key={color}><Instances items={parts.base} color={color==='auditorium'?'#666e6c':color==='lounge'?'#a64840':'#7c8b80'}/><Instances items={parts.backs} color={color==='auditorium'?'#858d88':'#839580'}/><Instances items={parts.legs} color="#62695f"/></group>)}
 <Solid polygon={stagePolygon} color="#b69a79" height={.7} y={.2}/><mesh position={[podium[0],1.4,podium[1]]} castShadow><boxGeometry args={[.9,1.8,1.1]}/><meshStandardMaterial color="#7f6952"/></mesh>
 {auditoriumTiers.flatMap((row,i)=>row.polygons.map((polygon,j)=><Solid key={`${i}-${j}`} polygon={polygon} y={.22} height={.1+row.rise} color={i%2?'#aaa99f':'#b7b6ac'}/>))}
 </group>;
}
function Landmarks(){const[x,z]=sculptureCenter;return <group>
 <mesh position={[x,.5,z]} receiveShadow><cylinderGeometry args={[3.8,3.8,.6,48]}/><meshStandardMaterial color="#b5ad9b"/></mesh><mesh position={[x,2.9,z]}><sphereGeometry args={[1.9,32,24]}/><meshStandardMaterial color="#a3a68d" metalness={.7} roughness={.28}/></mesh><mesh position={[x,2.9,z]} rotation={[.5,0,.35]}><torusGeometry args={[2.9,.2,12,48]}/><meshStandardMaterial color="#68745e" metalness={.65} roughness={.3}/></mesh>
 {planters.map(([x,z],i)=><group key={i} position={[x,0,z]}><mesh position={[0,.6,0]}><cylinderGeometry args={[.85,.65,1.2,16]}/><meshStandardMaterial color="#c1b39c"/></mesh><mesh position={[0,2,0]} castShadow><icosahedronGeometry args={[1.4,1]}/><meshStandardMaterial color="#81936c"/></mesh></group>)}
 {/* North glazing is visible in the CAD; low glass panels preserve the cutaway. */}
 {Array.from({length:22},(_,i)=>{const[x,z]=P(0,300+i*155,125);return <mesh key={i} position={[x,1.25,z]}><boxGeometry args={[5.6,2.2,.09]}/><meshStandardMaterial color="#adcbd0" transparent opacity={.42} roughness={.25}/></mesh>;})}
 </group>;}
export default function CadModel(){return <><Solid polygon={footprint} height={.75} y={-.8} color="#e4e2d9"/>{[...rooms].sort((a,b)=>a.height-b.height).map(room=><RoomFloor key={room.id} room={room}/>)}<WallsAndDoors/><Furniture/><Landmarks/><ArchitecturalDetails/></>;}
