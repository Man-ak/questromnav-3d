import { sculptureCenter } from './questromMapData.js';

// Register the latest atrium crop at its sculpture center; .75 drawing pixels / crop pixel.
export const atriumPoint=(x,z)=>[sculptureCenter[0]+(x-812)*.0375,sculptureCenter[1]+(z-430)*.0375];
export const sculptureRadius=129*.0375;
export const atriumWalkablePolygon=[[115,0],[1510,0],[1510,845],[115,845]].map(p=>atriumPoint(...p));
export const atriumTables=[],atriumSeats=[],atriumRugs=[];
function seat(x,z,angle,tone='sand'){const p=atriumPoint(x,z);atriumSeats.push({x:p[0],z:p[1],angle,tone});}
function table(x,z,count=4,start=0){
 const [cx,cz]=atriumPoint(x,z);atriumTables.push({x:cx,z:cz,r:.77,height:.86});
 for(let i=0;i<count;i++){const a=start+i*Math.PI*2/count;seat(x+Math.cos(a)*35,z+Math.sin(a)*35,Math.atan2(Math.cos(a),Math.sin(a)),i%2?'sand':'scarlet');}
}
function lounge(x,z,angle=0){seat(x,z,angle,'scarlet');}
function coffee(x,z){const [cx,cz]=atriumPoint(x,z);atriumTables.push({x:cx,z:cz,r:.48,height:.55});}
// Four CAD seating clusters. The center circulation stays open.
for(const [x,z]of [[324,110],[532,110],[324,320],[532,320],[395,215],[463,215]])table(x,z);
for(const [x,z]of [[292,210],[414,80],[568,230],[412,355]])lounge(x,z);
for(const p of [[292,245],[454,80],[455,355]])coffee(...p);
table(425,550,3,-Math.PI/2);table(425,713,3,Math.PI/2);table(355,635);table(504,635);
for(const [x,z]of [[294,505],[335,505],[520,505],[562,505],[294,740],[335,770],[520,770],[562,740]])lounge(x,z,x<425?-Math.PI/2:Math.PI/2);
for(const p of [[294,545],[562,545],[294,780],[562,780],[430,635]])coffee(...p);
table(1085,110);table(1290,110,3,Math.PI/2);table(1085,320,3,-Math.PI/2);table(1290,320);table(1195,220);
for(const p of [[1055,210],[1185,80],[1330,210],[1190,355]])lounge(...p);
for(const p of [[1220,80],[1150,355]])coffee(...p);
for(const p of [[1085,535],[1290,535],[1085,740],[1290,740]])table(...p);
table(1195,570,3,-Math.PI/2);table(1195,690,3,Math.PI/2);coffee(1195,635);
for(const p of [[1055,635],[1155,635],[1235,635],[1330,635]])lounge(...p);
for(const [x,z]of [[425,215],[425,640],[1195,215],[1195,640]]){const [cx,cz]=atriumPoint(x,z);atriumRugs.push({x:cx,z:cz,w:12.6,d:12.5});}
