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
 if(r.furniture==='business'){box(x,.85,z,5,.16,1.5,'wood');for(const shift of [-2,0,2])box(x+shift,.6,z-2,1.6,1.1,1.2,'cabinet');}
 if(r.furniture==='stairs'){const stepDepth=(d-1.2)/16;for(let i=0;i<16;i++)box(x,.25+i*.09,b.maxZ-.6-(i+.5)*stepDepth,w-.8,.18,stepDepth,'stair');}
}
// 16 fan-shaped seating rows in three banks; gaps form the radial aisles.
const [stageX,stageZ]=P(5,1040,391),aud=rooms.find(r=>r.id==='105');
for(let row=0;row<16;row++){
 const radius=14+row*1.48,middle=12+Math.floor(row/2)-(row>=13?1:0),banks=[[-.37,-.26,4],[-.20,.20,middle],[.26,.37,4]],rise=row*.045;
 auditoriumTiers.push({radius,rise,center:[stageX,stageZ]});
 for(const[min,max,count]of banks)for(let i=0;i<count;i++){const angle=min+(max-min)*i/(count-1),x=stageX+Math.cos(angle)*radius,z=stageZ+Math.sin(angle)*radius;if(pointInPolygon([x,z],aud.polygon))chair(x,z,-Math.PI/2-angle,rise,'auditorium');}
}
// Atrium café tables and lounge chairs from the visible clusters in crops 1 and 8.
for(const [sx,sz]of [[200,560],[355,560],[205,710],[355,710],[770,560],[924,560],[770,710],[924,710]]){
 const[x,z]=P(1,sx,sz);round(x,.82,z,1.05,.12,'wood');round(x,.43,z,.16,.8,'metal');for(let i=0;i<4;i++){const a=i*Math.PI/2;chair(x+Math.cos(a)*1.7,z+Math.sin(a)*1.7,-a+Math.PI/2);}
}
for(const[sx,sz]of [[275,620],[850,635]]){const[x,z]=P(1,sx,sz);round(x,.55,z,.8,.09,'wood');for(let i=0;i<4;i++){const a=i*Math.PI/2;chair(x+Math.cos(a)*1.55,z+Math.sin(a)*1.55,-a+Math.PI/2,0,'lounge');}}
const[rx,rz]=P(2,850,280);box(rx,.75,rz,2,.9,1.2,'lounge');box(rx,.75,rz+3,2,.9,1.2,'lounge');round(rx+2,.6,rz+1.5,.65,.12,'wood');
export const stagePolygon=[[1035,265],[1090,250],[1143,285],[1177,340],[1177,435],[1143,500],[1090,531],[1035,531]].map(p=>P(5,...p));
export const podium=P(5,1127,391);
export const planters=[P(0,2150,730),P(0,2950,730),P(0,2150,1060),P(0,2950,1060)];
export { sculptureCenter };
