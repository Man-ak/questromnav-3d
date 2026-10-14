import { create } from 'zustand';
import { findRoute } from '../lib/routing';
import { roomById } from '../data/questromMapData';
const initialId = new URLSearchParams(window.location.search).get('location');
export const useMapStore=create((set,get)=>({
  mode:'3d',detail:false,selected:roomById[initialId]?initialId:null,category:'all',panel:'explore',origin:'main-entrance',destination:roomById[initialId]?.routable?initialId:'105',route:null,simulating:false,progress:0,cameraAction:{type:'reset',nonce:0},toast:'',
  select:id=>set(s=>({selected:id,category:'all',cameraAction:{type:'focus',id,nonce:s.cameraAction.nonce+1}})),
  setMode:mode=>set({mode}),setCategory:category=>set({category}),setPanel:panel=>set({panel}),
  navigateTo:id=>{const s=get();set({destination:id,panel:'directions',selected:id,route:findRoute(s.origin,id),simulating:false,progress:0,cameraAction:{type:'route',nonce:s.cameraAction.nonce+1}});},
  setEndpoint:(key,id)=>{const s=get(),origin=key==='origin'?id:s.origin,destination=key==='destination'?id:s.destination;set({[key]:id,route:findRoute(origin,destination),simulating:false,progress:0,cameraAction:{type:'route',nonce:s.cameraAction.nonce+1}});},
  swap:()=>{const s=get();set({origin:s.destination,destination:s.origin,route:findRoute(s.destination,s.origin),simulating:false,progress:0,cameraAction:{type:'route',nonce:s.cameraAction.nonce+1}});},
  plan:()=>set(s=>({route:findRoute(s.origin,s.destination),simulating:false,progress:0,cameraAction:{type:'route',nonce:s.cameraAction.nonce+1}})),
  camera:type=>set(s=>({cameraAction:{type,nonce:s.cameraAction.nonce+1}})),
  setSimulation:simulating=>set(s=>({simulating,progress:simulating&&s.progress>=1?0:s.progress})),
  advance:delta=>set(s=>({progress:Math.min(1,s.progress+delta),simulating:s.progress+delta<1})),
  notify:toast=>set({toast}),
}));
