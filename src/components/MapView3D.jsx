import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, OrthographicCamera, Line } from '@react-three/drei';
import * as THREE from 'three';
import { roomById, sceneCenter } from '../data/questromMapData';
import { pointAlong } from '../lib/routing';
import { useMapStore } from '../store/useMapStore';
import CadModel from './CadModel';

function RouteLine(){
 const route=useMapStore(s=>s.route),progress=useMapStore(s=>s.progress),simulating=useMapStore(s=>s.simulating),marker=useRef(),flow=useRef();
 useFrame(({clock})=>{if(marker.current)marker.current.scale.setScalar(1+Math.sin(clock.elapsedTime*4)*.1);if(flow.current)flow.current.material.dashOffset=-clock.elapsedTime*2;});
 if(!route?.points.length)return null;const p=pointAlong(route.points,progress),last=route.points.at(-1);
 return <group>{route.points.length>1&&<><Line points={route.points.map(([x,z])=>[x,.48,z])} color="#f0c2be" lineWidth={9} transparent opacity={.65}/><Line points={route.points.map(([x,z])=>[x,.51,z])} color="#cc0000" lineWidth={3.5}/><Line ref={flow} points={route.points.map(([x,z])=>[x,.54,z])} color="#ffd8d0" lineWidth={1.5} dashed dashSize={1.5} gapSize={3}/></>}
 <mesh position={[last[0],.57,last[1]]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.4,.65,32]}/><meshBasicMaterial color="#cc0000"/></mesh>
 {(simulating||progress>0)&&<group ref={marker} position={[p[0],1.1,p[1]]}><mesh><sphereGeometry args={[.5,20,20]}/><meshBasicMaterial color="#4285f4"/></mesh><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.7,0]}><ringGeometry args={[.75,1,32]}/><meshBasicMaterial color="#83b4ff" transparent opacity={.5}/></mesh></group>}
 </group>;
}
function CameraRig(){
 const controls=useRef(),target=useRef(null),zoom=useRef(null),{camera,size}=useThree(),action=useMapStore(s=>s.cameraAction),detail=useRef(false),baseZoom=Math.min(size.width/205,size.height/132);
 useEffect(()=>{zoom.current=baseZoom;},[baseZoom]);
 useEffect(()=>{
  if(action.type==='focus'){const r=roomById[action.id];target.current=new THREE.Vector3(...[r.center[0],0,r.center[1]]);zoom.current=Math.max(baseZoom,Math.min(11,size.width/45));}
  if(action.type==='route'){const points=useMapStore.getState().route?.points;if(points?.length){const xs=points.map(p=>p[0]),zs=points.map(p=>p[1]),w=Math.max(25,Math.max(...xs)-Math.min(...xs)),d=Math.max(22,Math.max(...zs)-Math.min(...zs));target.current=new THREE.Vector3((Math.min(...xs)+Math.max(...xs))/2,0,(Math.min(...zs)+Math.max(...zs))/2);zoom.current=Math.min(size.width/(w*1.45),size.height/(d*1.6));}}
  if(action.type==='reset'){target.current=new THREE.Vector3(sceneCenter[0],0,sceneCenter[1]);zoom.current=baseZoom;camera.position.set(135,155,195);}
  if(action.type==='in')zoom.current=Math.min(24,camera.zoom*1.35);
  if(action.type==='out')zoom.current=Math.max(1.1,camera.zoom/1.35);
 },[action]);
 useFrame((_,dt)=>{
  if(!controls.current)return;
  if(target.current){const diff=target.current.clone().sub(controls.current.target);if(diff.length()>.02){diff.multiplyScalar(1-Math.exp(-dt*5));controls.current.target.add(diff);camera.position.add(diff);}else target.current=null;}
  if(zoom.current!==null){camera.zoom=THREE.MathUtils.damp(camera.zoom,zoom.current,6,dt);camera.updateProjectionMatrix();if(Math.abs(camera.zoom-zoom.current)<.01)zoom.current=null;}
  const next=camera.zoom>6;if(next!==detail.current){detail.current=next;useMapStore.setState({detail:next});}controls.current.update();
 });
 return <OrbitControls ref={controls} target={[sceneCenter[0],0,sceneCenter[1]]} makeDefault enableDamping dampingFactor={.09} minZoom={1.1} maxZoom={24} minPolarAngle={.05} maxPolarAngle={Math.PI/2.3} onStart={()=>{target.current=null;zoom.current=null;}} mouseButtons={{LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE}} touches={{ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE}}/>;
}
function Scene(){return <>
 <OrthographicCamera makeDefault position={[135,155,195]} zoom={4.5} near={.1} far={900}/><ambientLight intensity={1.25}/><directionalLight position={[35,130,0]} intensity={2.4} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-140} shadow-camera-right={140} shadow-camera-top={140} shadow-camera-bottom={-140} shadow-bias={-.001}/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[90,-.9,40]} receiveShadow><planeGeometry args={[600,600]}/><shadowMaterial transparent opacity={.13}/></mesh>
 <CadModel/><RouteLine/><CameraRig/>
 <Html center position={[115,0,90]} style={{pointerEvents:'none'}}><span className="street-label">COMMONWEALTH AVENUE</span></Html><Html center position={[-10,0,35]} style={{pointerEvents:'none'}}><span className="street-label side-street">SILBER WAY</span></Html>
 </>;}
export default function MapView3D(){return <Canvas shadows dpr={[1,1.75]} gl={{antialias:true,alpha:true}} aria-label="Detailed CAD-based 3D floor map with individual door openings. Drag to pan, right-drag to rotate, scroll to zoom."><Suspense fallback={null}><Scene/></Suspense></Canvas>;}
