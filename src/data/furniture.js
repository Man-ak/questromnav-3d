import { rooms, cadPoint as P, sculptureCenter } from './questromMapData.js';
import { polygonBounds, pointInPolygon } from '../lib/geometry.js';
// CAD furniture patterns are schematic: no inferred heights are presented as measured.
export const furnitureBoxes=[],furnitureRounds=[],chairs=[],auditoriumTiers=[];
const box=(x,y,z,w,h,d,color,angle=0)=>furnitureBoxes.push({position:[x,y,z],scale:[w,h,d],color,angle});
const round=(x,y,z,r,h,color)=>furnitureRounds.push({position:[x,y,z],scale:[r,h,r],color});
const chair=(x,z,angle=0,y=0,color='office')=>chairs.push({x,z,angle,y,color});
for(const r of rooms){
 const b=polygonBounds(r.polygon),w=b.maxX-b.minX,d=b.maxZ-b.minZ,[x,z]=r.center;
 if(r.furniture==='office'||r.furniture==='kitchen'){
   const north=r.doors[0]?.normal[1]===-1,deskZ=north?b.maxZ-1.15:b.minZ+1.15,deskX=b.minX+Math.min(1.75,w/2);
   if(w>3&&d>3){box(deskX,.83,deskZ,Math.min(2.7,w-1),.16,1.15,'wood');box(b.minX+.65,.83,deskZ+(north?-.6:.6),.8,.16,2.2,'wood');box(deskX,.42,deskZ,.15,.8,.7,'metal');box(deskX,.99,deskZ-.13,.78,.09,.42,'screen');chair(deskX,deskZ+(north?-1.2:1.2),north?0:Math.PI);chair(b.maxX-1.1,z-.6,Math.PI/2);chair(b.maxX-1.1,z+.7,Math.PI/2);box(b.minX+.45,.7,b.maxZ-1,.45,1.2,1.6,'cabinet');}
 }
 if(r.furniture==='conference'){
   const tableW=Math.min(w*.44,4.6),tableD=Math.min(d*.32,2.4);box(x,.86,z,tableW,.18,tableD,'wood');box(x,.44,z,.35,.8,tableD*.7,'metal');for(const shift of [-1,0,1]){chair(x+shift*tableW*.32,z-tableD/2-.65,0);chair(x+shift*tableW*.32,z+tableD/2+.65,Math.PI);}chair(x-tableW/2-.65,z,-Math.PI/2);chair(x+tableW/2+.65,z,Math.PI/2);
 }
 if(r.furniture==='storage')for(let i=0;i<3;i++)box(b.minX+.6,.8,b.minZ+1+i*1.7,.8,1.5,1.2,'cabinet');
 if(r.furniture==='restroom')for(let i=0;i<3;i++){box(b.minX+1.2+i*1.7,.7,b.minZ+.65,1.1,1.2,.8,'porcelain');box(b.minX+1.2+i*1.7,1.5,b.minZ+.16,1.1,1.3,.06,'glass');}
 if(r.furniture==='stairs'){const stepDepth=(d-1.2)/16;for(let i=0;i<16;i++)box(x,.25+i*.09,b.maxZ-.6-(i+.5)*stepDepth,w-.8,.18,stepDepth,'stair');}
}
// Sixteen curved ranks with two clear cross aisles: 373 schematic seats.
for(let row=0;row<16;row++){
 const middle=15+(row>=11?1:0),rise=row*.055,polygons=[];
 for(const [bank,count]of [[0,4],[1,middle],[2,4]]){
  const trace=[];
  for(let i=0;i<count;i++){
   const t=i/(count-1),u=t*2-1;
   const x=bank===1?480+row*22.7+8*(1-u*u):450+row*24+5*(1-u*u);
   const z=bank===0?70+t*45-row*.9:bank===2?370+t*45+row*.7:154+t*179;
   const [cx,cz]=P(9,x,z);chair(cx,cz,Math.PI/2,rise,'auditorium');trace.push([cx,cz]);
  }
  polygons.push([...trace.map(([x,z])=>[x-.62,z]),...[...trace].reverse().map(([x,z])=>[x+.62,z])]);
 }
 auditoriumTiers.push({rise,polygons});
}
// Opposed flights and a full-width landing in the east stairwell.
const stair=rooms.find(r=>r.id==='stairs-east'),sb=polygonBounds(stair.flightPolygon);
for(let i=0;i<12;i++){
 const z=sb.maxZ-1.6-(i+.5)*.92;
 box(sb.minX+1.4,.27+i*.13,z,1.9,.22,.94,'stair');
 box(sb.maxX-1.4,1.83+(11-i)*.13,z,1.9,.22,.94,'stair');
}
box((sb.minX+sb.maxX)/2,1.72,sb.minZ+2.7,4.35,.25,2.4,'stair');
for(const x of [sb.minX+.38,sb.minX+2.48,sb.maxX-.38])for(let i=0;i<7;i++)box(x,1+i*.24,sb.maxZ-1.9-i*1.65,.06,1.4,.06,'metal');
// Short paired flights in the shared auditorium foyer leave the middle passage open.
for(const [z,sign]of [[81,1],[375,-1]])for(let i=0;i<5;i++){const[x,y]=P(9,953,z+sign*i*6);box(x,.26+i*.1,y,5.4,.16,.44,'stair');}
// Projector lens faces the stage through the glazed cabin aperture.
{const[x,z]=P(9,925,257);box(x,1.3,z,1.4,.55,1,'screen');box(x,.65,z,2,.1,1.4,'metal');}
// Atrium seating is authored separately in atriumLayout.js from the latest crop.
const[rx,rz]=P(2,850,280);box(rx,.75,rz,2,.9,1.2,'lounge');box(rx,.75,rz+3,2,.9,1.2,'lounge');round(rx+2,.6,rz+1.5,.65,.12,'wood');
export const stagePolygon=[[328,165],[410,165],...Array.from({length:25},(_,i)=>{const t=i/24;return[410+18*Math.sin(t*Math.PI),165+162*t];}),[328,327]].map(p=>P(9,...p));
export const podium=P(9,393,280);
export const planters=[];
export { sculptureCenter };
