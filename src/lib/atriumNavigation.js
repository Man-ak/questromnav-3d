import { pointInPolygon, projectOnSegment, segmentIntersection } from './geometry.js';

/** Join open-floor anchors by sight lines, with one blocked sculpture footprint. */
export function connectOpenAtrium(graph,{boundary,center,radius},walls){
 const inside=p=>pointInPolygon(p,boundary);
 const anchors=Object.keys(graph.points).filter(id=>inside(graph.points[id]));
 // Replace fixed corridor bends only inside the atrium, before adding room portals.
 graph.edges=graph.edges.filter(([a,b])=>!inside(graph.points[a])||!inside(graph.points[b]));
 const count=40,clearance=radius+.22,ringRadius=clearance/Math.cos(Math.PI/count);
 for(let i=0;i<count;i++){const id=`atrium:around-sculpture:${i}`,a=i*Math.PI*2/count;graph.points[id]=[center[0]+Math.cos(a)*ringRadius,center[1]+Math.sin(a)*ringRadius];anchors.push(id);}
 for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++){
  const a=graph.points[anchors[i]],b=graph.points[anchors[j]];
  if(projectOnSegment(center,a,b).distance<clearance-1e-7)continue;
  if(walls.some(w=>{const h=segmentIntersection(a,b,w.a,w.b);return h&&h.t>.001&&h.t<.999&&h.u>.005&&h.u<.995;}))continue;
  graph.edges.push([anchors[i],anchors[j]]);
 }
 return graph;
}
