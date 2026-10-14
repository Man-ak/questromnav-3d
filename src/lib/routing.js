import { corridorNodes, corridorEdges, interiorLinks, roomById, rooms, doors } from '../data/questromMapData.js';
export const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const same=(a,b)=>distance(a,b)<0.01;
/** Every connector is authored against a visible CAD door. No nearest-wall snap. */
export function buildNavigationGraph(){
 const points={...corridorNodes},edges=[...corridorEdges];
 for(const d of doors.filter(d=>d.routable&&d.node)){
   let previous=d.node;
   for(const [i,p]of [...d.via,d.outside,d.point,d.inside].entries()){
     const id=`${d.id}:${i}`;points[id]=p;edges.push([previous,id]);previous=id;
   }
   points[`${d.id}:inside`]=d.inside;edges.push([previous,`${d.id}:inside`]);
 }
 const resolve=id=>roomById[id]?`${roomById[id].doors[0].id}:inside`:id;
 for(const[a,b]of interiorLinks)edges.push([resolve(a),resolve(b)]);
 return{points,edges};
}
export const navigationGraph=buildNavigationGraph();
export function findRoute(startId,endId){
  const start=roomById[startId],end=roomById[endId];
  if(!start?.routable||!end?.routable)return null;
  if(startId===endId)return {points:[start.doors[0].inside],units:0,minutes:0,steps:[{text:`You’re already at ${end.name}.`,kind:'arrive'}]};
  const graph={points:{...navigationGraph.points,start:null,end:null},edges:[...navigationGraph.edges]};
  // Virtual endpoints choose among authored doors; they never attach to corridors.
  for(const d of start.doors.filter(d=>d.routable))graph.edges.push(['start',`${d.id}:inside`]);
  for(const d of end.doors.filter(d=>d.routable))graph.edges.push([`${d.id}:inside`,'end']);
  const adjacency=Object.fromEntries(Object.keys(graph.points).map(k=>[k,[]]));
  for(const [u,v] of graph.edges){const w=graph.points[u]&&graph.points[v]?distance(graph.points[u],graph.points[v]):0;adjacency[u].push([v,w]);adjacency[v].push([u,w]);}
  const costs={start:0},previous={},unvisited=new Set(Object.keys(adjacency));
  while(unvisited.size){
    const u=[...unvisited].reduce((a,b)=>(costs[a]??Infinity)<=(costs[b]??Infinity)?a:b);
    if(costs[u]===undefined)break; unvisited.delete(u); if(u==='end')break;
    for(const [v,w]of adjacency[u])if((costs[v]??Infinity)>costs[u]+w){costs[v]=costs[u]+w;previous[v]=u;}
  }
  if(costs.end===undefined)return null;
  const keys=[];for(let k='end';k;k=previous[k])keys.unshift(k);
  const raw=keys.map(k=>graph.points[k]).filter(Boolean).filter((p,i,arr)=>!i||!same(p,arr[i-1]));
  const startDoor=start.doors.find(d=>keys.includes(`${d.id}:inside`)),endDoor=end.doors.find(d=>keys.includes(`${d.id}:inside`));
  // Keep threshold points in the animated path so doors remain auditable.
  const points=raw;
  const steps=[{text:`Start at ${start.short||start.name}.`,kind:'start',point:points[0]}];
  for(let i=1;i<points.length-1;i++){
    const [p,q,r]=[points[i-1],points[i],points[i+1]],cross=(q[0]-p[0])*(r[1]-q[1])-(q[1]-p[1])*(r[0]-q[0]);
    if(Math.abs(cross)<.15||Math.min(distance(p,q),distance(q,r))<1.5)continue;
    const landmark=Object.entries(corridorNodes).filter(([k])=>['atriumSouth','atriumNorth','audEast','audSouth','feldEntry','westLobby','northHall','gradEntry'].includes(k)).sort((a,b)=>distance(a[1],q)-distance(b[1],q))[0];
    const labels={atriumSouth:'the Chiles Atrium',atriumNorth:'the main staircase',audEast:'Auditorium 105',audSouth:'Auditorium 105',feldEntry:'the Feld Center',westLobby:'the west lobby',northHall:'the undergraduate offices',gradEntry:'Graduate Admissions'};
    steps.push({text:`Turn ${cross>0?'right':'left'}${landmark&&distance(landmark[1],q)<13?' near '+labels[landmark[0]]:''} and continue along the corridor.`,kind:cross>0?'right':'left',point:q});
  }
  steps.push({text:`Enter ${end.short||end.name} through its ${end.doors[0].kind==='open'?'open entrance':'marked doorway'}${end.number?' · '+end.number:''}.`,kind:'arrive',point:points.at(-1)});
  return {points,units:costs.end,minutes:Math.max(1,Math.ceil(costs.end/65)),steps,startDoor:startDoor.id,endDoor:endDoor.id};
}
export function pointAlong(points,progress){
  if(!points?.length)return null;
  if(progress<=0)return points[0];if(progress>=1)return points.at(-1);
  let lengths=points.slice(1).map((p,i)=>distance(points[i],p)),remaining=lengths.reduce((a,b)=>a+b,0)*Math.max(0,Math.min(1,progress));
  for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]){const t=lengths[i]?remaining/lengths[i]:0;return [points[i][0]+(points[i+1][0]-points[i][0])*t,points[i][1]+(points[i+1][1]-points[i][1])*t];}remaining-=lengths[i];}
  return points.at(-1);
}
const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
function editDistance(a,b){const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=0;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length];}
export function searchRooms(query){
  const q=normalize(query);if(!q)return [];
  if(q==='101h')return [];
  const tokens=query.toLowerCase().trim().split(/\s+/).map(normalize).filter(Boolean);
  return rooms.map(r=>{const text=normalize([r.name,r.number,r.short,...(r.aliases||[])].join(' '));const words=[r.name,r.short||'',...(r.aliases||[])].join(' ').toLowerCase().split(/\s+/);return {room:r,score:normalize(r.number)===q?100:text.includes(q)?70:tokens.every(t=>text.includes(t))?60:q.length>3&&words.some(w=>editDistance(q,normalize(w))<=Math.floor(q.length/4))?40:0};}).filter(x=>x.score).sort((a,b)=>b.score-a.score).map(x=>x.room);
}
