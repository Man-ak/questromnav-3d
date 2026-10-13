import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, OrthographicCamera, Line } from '@react-three/drei';
import * as THREE from 'three';
import { MapPin } from 'lucide-react';
import { rooms, footprint, categories, roomById } from '../data/questromMapData';
import { pointAlong } from '../lib/routing';
import { useMapStore } from '../store/useMapStore';

function shapeOf(polygon){const shape=new THREE.Shape();polygon.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();return shape;}
function Room({room}){
  const select=useMapStore(s=>s.select),selected=useMapStore(s=>s.selected===room.id),category=useMapStore(s=>s.category),[hovered,setHovered]=useState(false);
  const faded=category!=='all'&&category!==room.type;
  const [x,z]=room.center,w=room.polygon[1][0]-room.polygon[0][0],d=room.polygon[2][1]-room.polygon[1][1];
  const height=room.height??2.7;
  const geometry=useMemo(()=>{
    const shape=shapeOf(room.polygon);
    if(w>1.2&&d>1.2){const hole=new THREE.Path();const px=room.polygon[0][0],pz=room.polygon[0][1],t=.42;hole.moveTo(px+t,-pz-t);hole.lineTo(px+t,-pz-d+t);hole.lineTo(px+w-t,-pz-d+t);hole.lineTo(px+w-t,-pz-t);hole.closePath();shape.holes.push(hole);}
    return new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});
  },[room,height,w,d]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  const color=selected?'#cc0000':room.color||categories[room.type].color;
  const showLabel=room.label&&(!room.suite||selected||hovered);
  return <group onClick={e=>{e.stopPropagation();select(room.id);}} onPointerOver={e=>{e.stopPropagation();setHovered(true);document.body.style.cursor='pointer';}} onPointerOut={()=>{setHovered(false);document.body.style.cursor='auto';}}>
    <mesh position={[x,.35,z]} receiveShadow><boxGeometry args={[w,.4,d]}/><meshStandardMaterial color={faded?'#e4e5e1':color} roughness={.85}/></mesh>
    {height>.3&&<mesh geometry={geometry} rotation={[-Math.PI/2,0,0]} position={[0,.5,0]} castShadow receiveShadow><meshStandardMaterial color={selected?'#cc0000':hovered?'#cfc9bb':'#f5f0e5'} roughness={.7}/></mesh>}
    {showLabel&&<Html position={[x,height+.9,z]} center zIndexRange={[12,0]} style={{pointerEvents:'none',opacity:faded?.28:1}}><div className={`room-label ${room.featured?'featured-label':''} ${selected?'selected-label':''}`} style={{color:selected?'#cc0000':categories[room.type].ink}}>{room.label.map((text,i)=><div key={i}>{text}</div>)}</div></Html>}
    {selected&&<Html center position={[x,11,z]} zIndexRange={[25,20]} style={{pointerEvents:'none'}}><div className="map-pin"><MapPin size={21} fill="currentColor"/><span>{room.short||room.name}</span></div></Html>}
  </group>;
}
function Landmarks(){return <group>
  {/* Repeated seats and stage make the auditorium legible at a glance. */}
  <mesh position={[56,.9,19]}><boxGeometry args={[28,.8,2]}/><meshStandardMaterial color="#a78476"/></mesh>
  {Array.from({length:6},(_,row)=>Array.from({length:11},(_,col)=><mesh key={`${row}-${col}`} position={[39+col*3.1,.95,23+row*2.8]} castShadow><boxGeometry args={[1.7,1.1,1.3]}/><meshStandardMaterial color="#b77975"/></mesh>))}
  {/* Open atrium sculpture and planters, rather than an opaque room block. */}
  <mesh position={[98,1.2,32]}><boxGeometry args={[8,1.2,8]}/><meshStandardMaterial color="#d2c6b5"/></mesh>
  <mesh position={[98,4,32]}><sphereGeometry args={[2.5,24,24]}/><meshStandardMaterial color="#aaa995" metalness={.65} roughness={.3}/></mesh>
  <mesh position={[98,4,32]} rotation={[.4,0,.3]}><torusGeometry args={[3.5,.3,10,40]}/><meshStandardMaterial color="#7a826c" metalness={.4}/></mesh>
  {[[82,24],[115,24],[83,40],[114,40]].map(([x,z],i)=><group key={i} position={[x,0,z]}><mesh position={[0,1,0]} castShadow><cylinderGeometry args={[1.4,1.1,2,12]}/><meshStandardMaterial color="#c5b8a2"/></mesh><mesh position={[0,3,0]} castShadow><icosahedronGeometry args={[2.2,1]}/><meshStandardMaterial color="#879e75"/></mesh></group>)}
  {Array.from({length:9},(_,i)=><mesh key={i} position={[98,.5+i*.25,16-i*.9]}><boxGeometry args={[6,.4,.85]}/><meshStandardMaterial color="#e0ddd2"/></mesh>)}
</group>;}
function RouteLine(){
  const route=useMapStore(s=>s.route),progress=useMapStore(s=>s.progress),simulating=useMapStore(s=>s.simulating);const marker=useRef(),flow=useRef();
  useFrame(({clock})=>{if(marker.current)marker.current.scale.setScalar(1+Math.sin(clock.elapsedTime*4)*.1);if(flow.current)flow.current.material.dashOffset=-clock.elapsedTime*2;});
  if(!route?.points.length)return null;
  const p=pointAlong(route.points,progress);
  return <group>{route.points.length>1&&<><Line points={route.points.map(([x,z])=>[x,.95,z])} color="#f0c2be" lineWidth={11} transparent opacity={.65}/><Line points={route.points.map(([x,z])=>[x,1,z])} color="#cc0000" lineWidth={4}/><Line ref={flow} points={route.points.map(([x,z])=>[x,1.04,z])} color="#ffd8d0" lineWidth={1.8} dashed dashSize={1.5} gapSize={3}/></>}
    <mesh position={[route.points.at(-1)[0],1.1,route.points.at(-1)[1]]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.9,1.7,32]}/><meshBasicMaterial color="#cc0000"/></mesh>
    {(simulating||progress>0)&&<group position={[p[0],2,p[1]]} ref={marker}><mesh><sphereGeometry args={[1.25,24,24]}/><meshBasicMaterial color="#4285f4"/></mesh><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.5,0]}><ringGeometry args={[1.8,2.5,32]}/><meshBasicMaterial color="#83b4ff" transparent opacity={.5}/></mesh></group>}
  </group>;
}
function CameraRig(){
  const controls=useRef(),target=useRef(new THREE.Vector3(75,0,33)),desiredZoom=useRef(null);const {camera,size}=useThree();const action=useMapStore(s=>s.cameraAction);
  const baseZoom=Math.min(size.width/173,size.height/112);
  useEffect(()=>{desiredZoom.current=baseZoom;},[baseZoom]);
  useEffect(()=>{
    if(action.type==='reset'){desiredZoom.current=baseZoom;camera.position.set(115,135,160);}
    if(action.type==='in')desiredZoom.current=Math.min(18,camera.zoom*1.25);
    if(action.type==='out')desiredZoom.current=Math.max(1.2,camera.zoom/1.25);
  },[action]);
  useFrame((_,dt)=>{if(!controls.current)return;if(target.current){const difference=target.current.clone().sub(controls.current.target);if(difference.length()>.02){difference.multiplyScalar(1-Math.exp(-dt*5));controls.current.target.add(difference);camera.position.add(difference);}else target.current=null;}
    if(desiredZoom.current!==null){camera.zoom=THREE.MathUtils.damp(camera.zoom,desiredZoom.current,6,dt);camera.updateProjectionMatrix();if(Math.abs(camera.zoom-desiredZoom.current)<.01)desiredZoom.current=null;}controls.current.update();});
  // Recreate target after a user gesture; user pan must not snap back automatically.
  useEffect(()=>{if(action.type==='focus'){const r=roomById[action.id];target.current=new THREE.Vector3(r.center[0]*.4+45,0,r.center[1]*.4+19.8);}if(action.type==='reset')target.current=new THREE.Vector3(75,0,33);},[action]);
  return <OrbitControls ref={controls} target={[75,0,33]} makeDefault enableDamping dampingFactor={.09} minZoom={1.2} maxZoom={18} minPolarAngle={.05} maxPolarAngle={Math.PI/2.3} onStart={()=>{target.current=null;desiredZoom.current=null;}} mouseButtons={{LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE}} touches={{ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE}}/>;
}
function Scene(){
  const floor=useMemo(()=>new THREE.ExtrudeGeometry(shapeOf(footprint),{depth:1.4,bevelEnabled:false}),[]);
  return <><OrthographicCamera makeDefault position={[115,135,160]} zoom={4.5} near={.1} far={800}/><ambientLight intensity={1.4}/><directionalLight position={[20,95,20]} intensity={2.5} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-110} shadow-camera-right={110} shadow-camera-top={110} shadow-camera-bottom={-110} shadow-bias={-.001}/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[75,-1.5,33]} receiveShadow><planeGeometry args={[500,500]}/><shadowMaterial transparent opacity={.13}/></mesh>
  <mesh geometry={floor} rotation={[-Math.PI/2,0,0]} position={[0,-1.1,0]} receiveShadow castShadow><meshStandardMaterial color="#e8e5dc"/></mesh>
  {rooms.map(room=><Room key={room.id} room={room}/>)}<Landmarks/><RouteLine/><CameraRig/>
  <Html center position={[85,0,80]} style={{pointerEvents:'none'}}><span className="street-label">COMMONWEALTH AVENUE</span></Html>
  <Html center position={[-10,0,31]} style={{pointerEvents:'none'}}><span className="street-label side-street">SILBER WAY</span></Html>
  <Html center position={[98,2,64]} zIndexRange={[15,0]}><button className="entrance-label" onClick={()=>useMapStore.getState().select('main-entrance')}><span className="entrance-dot"/> Main entrance</button></Html>
  </>;
}
export default function MapView3D(){return <Canvas shadows dpr={[1,1.75]} gl={{antialias:true,alpha:true}} aria-label="Interactive 3D floor map. Drag to pan, right-drag to rotate, scroll to zoom."><Suspense fallback={null}><Scene/></Suspense></Canvas>;}
