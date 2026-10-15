import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { receptionSegments, susiloShelf } from '../data/susiloLayout';
import { cadPoint as P, roomById, doors } from '../data/questromMapData';

function Block({at,size,color='#d9d0bb',glass=false,rotation=0}){
 return <mesh position={at} rotation={[0,rotation,0]} castShadow={!glass} receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={glass?.2:.75} metalness={glass?.25:.1} transparent={glass} opacity={glass?.28:1} depthWrite={!glass}/></mesh>;
}
// Local canvas lettering keeps architectural signage independent of external fonts.
function Sign({at,size=[5,1],text,rotation=0,color='#343e3c',background='#e9e2d0'}){
 const texture=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=160;const ctx=canvas.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,1024,160);ctx.fillStyle=color;ctx.font='600 58px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,80,960);return new THREE.CanvasTexture(canvas);},[text,color,background]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh position={at} rotation={[0,rotation,0]}><planeGeometry args={size}/><meshBasicMaterial map={texture} side={THREE.DoubleSide}/></mesh>;
}
function DoorBank({width,bays=4}){
 const bay=width/bays;
 return <group>
  {/* Closely spaced framed leaves, transom and pull handles replace oversized flaps. */}
  <Block at={[0,3.1,0]} size={[width,.12,.14]} color="#73786f"/>
  <Block at={[0,2.5,0]} size={[width,.1,.14]} color="#73786f"/>
  {Array.from({length:bays*2+1},(_,i)=><Block key={'m'+i} at={[-width/2+i*bay/2,1.7,0]} size={[.065,3.1,.12]} color="#73786f"/>)}
  {Array.from({length:bays*2},(_,i)=>{const x=-width/2+(i+.5)*bay/2;return <group key={i}>
   <Block at={[x,1.45,0]} size={[bay/2-.08,2.02,.055]} color="#99b9b5" glass/>
   <Block at={[x,.43,0]} size={[bay/2-.08,.15,.09]} color="#9c9e91"/>
   <Block at={[x,2.78,0]} size={[bay/2-.08,.44,.055]} color="#a9c4bf" glass/>
   <Block at={[x+(i%2?-.33:.33)*bay/2,1.24,.11]} size={[.045,.7,.09]} color="#c3c6bd"/>
   <Block at={[x,1.63,.05]} size={[bay/2-.12,.07,.06]} color="#e9e6d7"/>
  </group>;})}
 </group>;
}
function Entrance({west=false}){
 const r=roomById[west?'silber-entrance':'main-entrance'],d=r.doors[0],[x,z]=d.point;
 const depth=west?6.95:6.3,width=d.width;
 return <group position={[x,0,z]} rotation={[0,west?Math.PI/2:0,0]}>
  <DoorBank width={width} bays={west?3:4}/>
  <group position={[0,0,depth]}><DoorBank width={width} bays={west?3:4}/></group>
  <Block at={[0,.24,depth*.5]} size={[width+.7,.05,depth]} color="#e3dac5"/>
  <Block at={[0,.29,depth*.57]} size={[width*.8,.04,2.3]} color="#5a6660"/>
  {[-1,1].map(side=><group key={side}>
   <Block at={[side*(width/2+.42),1.95,depth]} size={[.72,3.7,1.2]}/>
   {[.65,1.4,2.15,2.9].map(y=><Block key={y} at={[side*(width/2+.42),y,depth+.61]} size={[.73,.035,.02]} color="#b9b3a3"/>)}
  </group>)}
  <Block at={[0,3.83,depth+.1]} size={[width+1.6,.8,1.65]} color="#e9e2d0"/>
  <Sign at={[0,3.82,depth+.94]} size={[width*.93,.46]} text={west?'QUESTROM · SILBER WAY':'QUESTROM SCHOOL OF BUSINESS'}/>
  <Sign at={[-width/2-.43,1.8,depth+.63]} size={[.5,.8]} text="BU" color="white" background="#cc0000"/>
 </group>;
}
function Auditorium(){
 const [x,z]=P(9,328,246),[px,pz]=P(9,393,280);
 return <group>
  <Block at={[x+.12,2.25,z]} size={[.18,3.9,11.99]} color="#e0d6bd"/>
  <Block at={[x+.25,2.22,z]} size={[.08,3.2,10.1]} color="#f1eddd"/>
  {[-1,0,1].map(i=><Block key={i} at={[x+.32,2.22,z+i*3.3]} size={[.055,3.2,.045]} color="#6d513c"/>)}
  {[1.2,2.2,3.2].map(y=><Block key={y} at={[x+.33,y,z]} size={[.055,.045,10.1]} color="#6d513c"/>)}
  <Block at={[x+.38,4.13,z]} size={[.2,.24,12.1]} color="#6d513c"/>
  <Sign at={[px+.46,1.5,pz]} size={[.9,.65]} text="QUESTROM" rotation={Math.PI/2} color="#eee6cd" background="#684a38"/>
  {/* The projection aperture looks west; the cabin remains enclosed. */}
  {(()=>{const[a,b]=P(9,890,248);return <Block at={[a-.04,2.1,b]} size={[.1,.8,2.4]} glass color="#455e60"/>;})()}
  {[[374,160],[374,338]].map(([sx,sz],j)=>{const[a,b]=P(9,sx,sz);return <group key={j}>{[0,1,2].map(i=><Block key={i} at={[a,.28+i*.18,b+(j?-1:1)*i*.35]} size={[2,.18,.4]} color="#bca27e"/>)}</group>;})}
 </group>;
}
function LobbyDetails(){
 const [x,z]=P(5,410,350),[sx,sz]=P(1,559,360);
 return <group>
  {/* Low stone and brick accents preserve the open, roofless wayfinding cutaway. */}
  <Block at={[x,.27,z]} size={[9.5,.06,8.5]} color="#e6dfc9"/>
  <Block at={[x-3.8,1.4,z-3]} size={[.3,2.2,3.3]} color="#9c6750"/>
  {[0,1,2,3,4].map(i=><Block key={i} at={[x-3.62,.6+i*.4,z-3]} size={[.03,.025,3.3]} color="#d2bda2"/>)}
  <Sign at={[x-3.55,1.7,z-3]} size={[2.8,.65]} text="WEST LOBBY · 193" rotation={Math.PI/2}/>
  {[-1,1].map(side=><group key={side}>
   <mesh position={[sx+side*3.8,1.95,sz]} rotation={[.12,0,0]}><boxGeometry args={[.08,.08,11.9]}/><meshStandardMaterial color="#8b8d7b"/></mesh>
   {Array.from({length:9},(_,i)=><Block key={i} at={[sx+side*3.8,.8+i*.16,sz+5.8-i*1.45]} size={[.07,1.1,.07]} color="#929483"/>)}
  </group>)}
  {doors.filter(d=>d.exitOnly).map(d=><Sign key={d.id} at={[d.point[0],2.7,d.point[1]+.1]} size={[2.7,.55]} text="EXIT ONLY" color="white" background="#9b2926"/>)}
 </group>;
}
function Parking(){
 const r=roomById['198'],xs=r.polygon.map(p=>p[0]),zs=r.polygon.map(p=>p[1]),x=(Math.min(...xs)+Math.max(...xs))/2,z0=Math.min(...zs),z1=Math.max(...zs),w=Math.max(...xs)-Math.min(...xs);
 return <group>
  <Block at={[x,-.02,(z0+z1)/2]} size={[w,.3,z1-z0]} color="#6f7779"/>
  {Array.from({length:12},(_,i)=><Block key={i} at={[x,.19,z0+2+i*3.7]} size={[.12,.025,1.9]} color="#e8dcc2"/>)}
  {[-1,1].map(side=><Block key={side} at={[x+side*(w/2-.25),.2,(z0+z1)/2]} size={[.18,.06,z1-z0]} color="#d5c79d"/>)}
  <Block at={[x-w/2+.65,.8,z1-2]} size={[.65,1.4,.65]} color="#d5d6cb"/>
  <Block at={[x,1.36,z1-2]} size={[w-1,.18,.2]} color="#eee8d5"/>
  {Array.from({length:7},(_,i)=><Block key={i} at={[x-w/2+1+i*1.05,1.37,z1-1.88]} size={[.42,.19,.025]} color="#cc0000"/>)}
  <Sign at={[x,2.4,z1-1.8]} size={[7,.65]} text="198 · EXTERIOR PARKING WAY" color="#f2eddd" background="#556064"/>
 </group>;
}
function LiftDoors(){return <>{doors.filter(d=>d.kind==='lift').map(d=>{
 const rotation=Math.atan2(d.normal[0],d.normal[1]),r=roomById[d.roomId];
 return <group key={d.id} position={[d.point[0],0,d.point[1]]} rotation={[0,rotation,0]}>
  {[-1,1].map(side=><Block key={side} at={[side*d.width/4,1.36,.03]} size={[d.width/2-.03,2.2,.1]} color="#b5b8af"/>)}
  <Block at={[d.width/2+.19,1.42,.14]} size={[.12,.24,.05]} color="#454e48"/>
  <Block at={[d.width/2+.19,1.47,.175]} size={[.04,.04,.02]} color="#ddbd65"/>
  <Sign at={[0,2.83,.12]} size={[d.width+.2,.38]} text={r.number}/>
 </group>;
 })}</>;}
function SusiloInterior(){
 const [sx,sz]=susiloShelf.position,[signX,signZ]=P(1,1138,392);
 return <group>
  {receptionSegments.map((c,i)=><group key={i}>
   <Block at={[c.position[0],.79,c.position[1]]} size={[c.w-.08,1.1,c.d-.08]} color="#a98562"/>
   <Block at={[c.position[0],1.41,c.position[1]]} size={[c.w+.1,.16,c.d+.1]} color="#ece5d6"/>
   <Block at={[c.position[0],.3,c.position[1]]} size={[c.w-.2,.12,c.d-.2]} color="#5e625a"/>
  </group>)}
  <Sign at={[signX,.95,signZ+.08]} size={[3.1,.58]} text="SUSILO BUSINESS CENTER" background="#a98562" color="#fff4df"/>
  {[0,1,2,3].map(i=><group key={i}>
   <Block at={[sx,.55+i*.59,sz]} size={[susiloShelf.w,.09,susiloShelf.d]} color="#b2916b"/>
   {[-1,0,1].map(j=><Block key={j} at={[sx+.05,.72+i*.59,sz+j*2.1]} size={[.52,.21,1.35]} color={(i+j)%2?'#eee7d7':'#d1bf9e'}/>)}
  </group>)}
  {[-1,1].map(j=><Block key={j} at={[sx,1.5,sz+j*susiloShelf.d/2]} size={[susiloShelf.w,2.6,.1]} color="#a58b69"/>)}
  {[[1120,379,0],[1187,420,-Math.PI/2]].map(([x,z,rotation],i)=>{const[a,b]=P(1,x,z);return <group key={i} position={[a,0,b]} rotation={[0,rotation,0]}>
   <Block at={[0,1.55,0]} size={[.55,.08,.3]} color="#505b55"/><Block at={[0,1.72,0]} size={[.08,.3,.08]} color="#505b55"/>
   <Block at={[0,1.99,0]} size={[1.15,.63,.1]} color="#3c4744"/><Block at={[0,1.99,.06]} size={[1.02,.5,.015]} color="#a9c2bd"/>
   <Block at={[0,1.52,.4]} size={[.85,.035,.28]} color="#626a62"/>
  </group>;})}
 </group>;
}
function LoadingDock(){return <group>{roomById['188'].doors.map(d=>{
 const[x,z]=d.point;return <group key={d.id}>
  {[-1,1].map(side=><Block key={side} at={[x+side*d.width/2,1.65,z]} size={[.15,2.9,.19]} color="#67726e"/>)}
  <Block at={[x,3.2,z]} size={[d.width+.3,.22,.42]} color="#69756f"/>
  {[0,1,2,3,4].map(i=><Block key={i} at={[x,3.3+i*.1,z]} size={[d.width,.075,.25]} color="#b2b7af"/>)}
  <Block at={[x,.27,z+.5]} size={[d.width,.025,.15]} color="#d7b55e"/>
 </group>;
})}</group>;}

export default function ArchitecturalDetails(){return <><Entrance/><Entrance west/><Auditorium/><LobbyDetails/><Parking/><LiftDoors/><SusiloInterior/><LoadingDock/></>;}
