import test from 'node:test';
import assert from 'node:assert/strict';
import { rooms, doors, roomById, wallSegments, cadPoint, mapRevision, sculptureCenter, serviceConnections } from '../src/data/questromMapData.js';
import { sculptureRadius, atriumWalkablePolygon, atriumSeats, atriumTables } from '../src/data/atriumLayout.js';
import { receptionFootprint } from '../src/data/susiloLayout.js';
import { chairs, stagePolygon, planters } from '../src/data/furniture.js';
import { findRoute, pointAlong, searchRooms, navigationGraph } from '../src/lib/routing.js';
import { distance, pointInPolygon, projectOnSegment, segmentIntersection, splitWall } from '../src/lib/geometry.js';

test('CAD revision removes 101H and replaces the older admissions labels',()=>{
 assert.equal(roomById['101H'],undefined);assert.equal(roomById['101D-east'],undefined);assert.deepEqual(searchRooms('101H'),[]);
 for(const id of ['101I','101A','101B','101C','101D','101E','101F','101G','102D','102E','105D','105E','105F','105G','105H','113','117A','125A','188'])assert.ok(roomById[id],id);
 assert.equal(new Set(rooms.map(r=>r.id)).size,rooms.length);assert.equal(mapRevision.source,'Thirteen user-supplied CAD screenshots');
});
test('every authored door is on its room boundary and enters its interior',()=>{
 for(const d of doors){const r=roomById[d.roomId],closest=Math.min(...r.polygon.map((p,i)=>projectOnSegment(d.point,p,r.polygon[(i+1)%r.polygon.length]).distance));assert.ok(closest<.02,`${d.id} misses wall by ${closest}`);assert.ok(pointInPolygon(d.inside,r.polygon),`${d.id} arrival must be inside`);assert.ok(!pointInPolygon(d.outside,r.polygon),`${d.id} approach must be outside`);assert.ok(d.width>=1.6);}
});
test('every navigation segment avoids every solid wall, including door approaches and suite boundaries',()=>{
 for(const[a,b]of navigationGraph.edges){const p=navigationGraph.points[a],q=navigationGraph.points[b];assert.ok(p&&q,`${a} → ${b} missing point`);for(const w of wallSegments){const h=segmentIntersection(p,q,w.a,w.b);assert.ok(!h||h.t<.001||h.t>.999||h.u<.005||h.u>.995,`${a} → ${b} crosses ${w.roomId||'suite boundary'}`);}}
});
test('all confirmed destinations connect from both entrances through the destination door',()=>{
 for(const origin of ['main-entrance','silber-entrance'])for(const room of rooms.filter(r=>r.routable)){
  const route=findRoute(origin,room.id);assert.ok(route,`${origin} → ${room.id}`);if(origin===room.id)continue;
  const door=room.doors.find(d=>d.id===route.endDoor);assert.ok(door);assert.ok(distance(route.points.at(-1),door.inside)<1e-8);assert.ok(route.points.some(p=>distance(p,door.point)<1e-8),`${room.id} must cross its threshold`);assert.ok(route.points.some(p=>distance(p,door.outside)<1e-8));assert.ok(route.steps.at(-1).text.includes(room.short||room.name));
 }
});
test('unconfirmed doors fail closed; there is no nearest-wall fallback',()=>{
 for(const id of ['198','182A','127']){assert.equal(roomById[id].routable,false);assert.equal(findRoute('main-entrance',id),null);}
 assert.equal(findRoute('bad','105'),null);assert.equal(findRoute('105','101H'),null);assert.equal(findRoute('105','105').units,0);
});
test('bidirectional areas have symmetric paths and multi-door endpoints never teleport',()=>{
 for(const [a,b]of [['main-entrance','105C'],['102B','101G'],['101G','104M'],['105E','187B'],['136','114']]){
  const f=findRoute(a,b),r=findRoute(b,a);assert.ok(Math.abs(f.units-r.units)<1e-7);assert.ok(f.points.some(p=>distance(p,doors.find(d=>d.id===f.startDoor).point)<1e-8));
  for(let i=1;i<f.points.length;i++)for(const w of wallSegments){const h=segmentIntersection(f.points[i-1],f.points[i],w.a,w.b);assert.ok(!h||h.t<.001||h.t>.999||h.u<.005||h.u>.995,'Endpoint connector crosses a wall');}
 }
});
test('shared wall opening is actually removed rather than drawn over a solid wall',()=>{
 const parts=splitWall([0,0],[10,0],[{point:[5,0],normal:[0,1],width:2}]);assert.deepEqual(parts,[{a:[0,0],b:[4,0]},{a:[6,0],b:[10,0]}]);
 const port=roomById['104A'].doors[0];assert.ok(!wallSegments.some(w=>projectOnSegment(port.point,w.a,w.b).distance<.03));
});
test('north office doors follow the specific alternating CAD positions',()=>{
 assert.deepEqual(roomById['136'].doors[0].point,cadPoint(6,315,276));assert.deepEqual(roomById['134'].doors[0].point,cadPoint(6,364,276));assert.deepEqual(roomById['108H'].doors[0].point,cadPoint(4,589,248));assert.deepEqual(roomById['104A'].doors[0].point,cadPoint(3,1485,449));
});
test('straight office corridors do not detour to a distant hub and double back',()=>{
 for(const [a,b]of [['104S','104A'],['108H','108A']]){const route=findRoute(a,b);for(let i=1;i<route.points.length;i++)assert.ok(route.points[i][0]>=route.points[i-1][0]-.001,`${a} → ${b} backtracks along the hall`);}
 const route=findRoute('main-entrance','104A'),entry=roomById['104'].doors[0].point,start=route.points.findIndex(p=>distance(p,entry)<.001);assert.ok(start>=0);assert.ok(Math.min(...route.points.slice(start).map(p=>p[0]))>=cadPoint(3,1370,0)[0]);assert.ok(findRoute('136','134').units<15);
});
test('journey interpolation has exact endpoints, including pauses and same-point paths',()=>{
 const route=findRoute('main-entrance','108A');assert.deepEqual(pointAlong(route.points,0),route.points[0]);assert.deepEqual(pointAlong(route.points,1),route.points.at(-1));assert.deepEqual(pointAlong([[0,0],[10,0],[10,10]],.75),[10,5]);assert.deepEqual(pointAlong([[4,5]],.5),[4,5]);assert.equal(pointAlong([],0),null);
});
test('search finds precise new room IDs, amenities and department aliases',()=>{
 assert.equal(searchRooms('105')[0].id,'105');assert.equal(searchRooms('102E')[0].id,'102E');assert.equal(searchRooms('101I')[0].id,'101I');assert.ok(['101','102'].includes(searchRooms('graduate admissions')[0].id));assert.ok(searchRooms('bathroom').some(r=>r.id==='restroom-w'));assert.ok(searchRooms('auditorum').some(r=>r.id==='105'));assert.ok(searchRooms('Susilo Center').some(r=>r.id==='susilo'));assert.equal(searchRooms('xyzzyq').length,0);
});

test('suite 108 entry always passes Feld; exit-only doors work outward',()=>{
 const threshold=roomById['104'].doors[0].point;
 for(const start of ['main-entrance','silber-entrance','105','udc','101'])for(const end of rooms.filter(r=>r.suite==='108'||r.id==='108')){
  const r=findRoute(start,end.id);assert.ok(r.points.some(p=>distance(p,threshold)<.001),`${start} → ${end.id} bypasses Feld`);
 }
 const incoming=findRoute('silber-entrance','108A'),outgoing=findRoute('108A','silber-entrance');
 assert.ok(outgoing.units<incoming.units);assert.ok(!outgoing.points.some(p=>distance(p,threshold)<.001));
 const exit=roomById['108'].doors[0];assert.ok(outgoing.points.some(p=>distance(p,exit.point)<.001));
 // The authored graph itself has no public-to-suite edge at either exit.
 for(const d of roomById['108'].doors.filter(d=>d.exitOnly))assert.ok(navigationGraph.edges.filter(e=>e[0].startsWith(d.id)||e[1].startsWith(d.id)).some(e=>e[2]===true));
});

test('department moves retain physical room IDs and update semantic search',()=>{
 assert.match(roomById.udc.name,/Undergraduate/);assert.match(roomById['101'].name,/Graduate Admissions/);assert.match(roomById['102'].name,/Graduate/);
 assert.equal(searchRooms('undergraduate development')[0].id,'udc');assert.ok(!searchRooms('graduate admissions').some(r=>r.id==='udc'));
 assert.equal(roomById['108'].name,'Feld Center · Office Suite 108');
});

test('four facing east lifts, connected auditorium foyer and separate projector cabin',()=>{
 for(const [i,n]of ['181A','181B','181C','181D'].entries()){const r=roomById[i?`elevator-east-${i+1}`:'elevator-east'];assert.equal(r.number,n);assert.equal(r.doors[0].normal[1],i<2?1:-1);assert.equal(searchRooms(n)[0].id,r.id);}
 for(const id of ['105A','105B','105D']){assert.equal(roomById[id].height,0);assert.match(roomById[id].name,/Entrance Foyer/);assert.ok(findRoute(id,'105'));}
 assert.equal(roomById['105C'].name,'Auditorium Projector Cabin');assert.ok(findRoute('105A','105C'));
 const route=findRoute('105D','105A');assert.ok(route.units<25);assert.ok(!route.points.some(p=>distance(p,roomById['105'].doors[0].point)<.001));
 assert.equal(chairs.filter(c=>c.color==='auditorium').length,373);
 for(const c of chairs.filter(c=>c.color==='auditorium')){assert.ok(pointInPolygon([c.x,c.z],roomById['105'].polygon));assert.ok(!pointInPolygon([c.x,c.z],stagePolygon));assert.ok(Math.sin(c.angle)>.9,'Seat backs must face east so the audience faces the west stage');}
});

test('atrium permits short traversals to stairs and lifts while clearing the sculpture',()=>{
 const route=findRoute('main-entrance','stairs-main');assert.ok(route.units<60);assert.ok(route.steps.some(s=>s.text.includes('across the open atrium')));assert.equal(roomById['stairs-main'].doors[0].node,'atriumStairFoot');
 for(const id of ['stairs-main','elevator-east','elevator-east-3','elevator-east-4']){const r=findRoute('main-entrance',id);for(let i=1;i<r.points.length;i++)assert.ok(projectOnSegment(sculptureCenter,r.points[i-1],r.points[i]).distance>4.5,`${id} crosses sculpture`);}
 assert.equal(roomById['198'].outdoor,true);assert.equal(roomById['198'].height,0);assert.match(roomById['198'].name,/Exterior Parking/);
});

test('service-only freight and east stairs have physical connections but no visitor paths',()=>{
 for(const id of ['elevator-east-2','stairs-east']){assert.equal(roomById[id].routable,false);assert.equal(findRoute('main-entrance',id),null);assert.equal(findRoute(id,'main-entrance'),null);assert.ok(roomById[id].doors.every(d=>d.routable===false));}
 assert.equal(roomById['elevator-east-2'].doors.length,2);assert.deepEqual(roomById['elevator-east-2'].doors.map(d=>d.normal),[[0,1],[0,-1]]);
 for(const c of serviceConnections){const d=doors.find(d=>d.id===c.doorId),destination=roomById[c.to];assert.equal(c.visitor,false);assert.ok(pointInPolygon(d.outside,destination.polygon));assert.ok(Math.min(...destination.polygon.map((p,i)=>projectOnSegment(d.point,p,destination.polygon[(i+1)%destination.polygon.length]).distance))<.001);assert.ok(!navigationGraph.edges.some(e=>e.some(id=>typeof id==='string'&&id.startsWith(d.id))));}
 assert.ok(findRoute('main-entrance','stairs-main'));assert.ok(findRoute('main-entrance','elevator-east-3'));
});

test('former office identity is removed while 187B keeps the physical divider and door',()=>{
 assert.equal(roomById['186A'],undefined);assert.deepEqual(searchRooms('186A'),[]);assert.equal(findRoute('main-entrance','186A'),null);
 const group=roomById['187B'];assert.equal(group.doors.length,2);assert.equal(group.doors[1].routable,false);assert.ok(pointInPolygon(cadPoint(1,940,400),group.polygon));
 assert.ok(wallSegments.some(w=>projectOnSegment(cadPoint(1,881.5,400),w.a,w.b).distance<.01));
});

test('atrium allows direct visible crossings; all graph edges clear the sole central obstacle',()=>{
 const direct=(a,b)=>navigationGraph.edges.some(e=>e[0]===a&&e[1]===b||e[0]===b&&e[1]===a);
 assert.ok(direct('atriumWest','atriumStairFoot'));assert.ok(direct('eastLiftFront','atriumStairFoot'));
 for(const[a,b]of navigationGraph.edges)assert.ok(projectOnSegment(sculptureCenter,navigationGraph.points[a],navigationGraph.points[b]).distance>=sculptureRadius-.001,`${a} → ${b} crosses centerpiece`);
 assert.deepEqual(planters,[]);assert.equal(atriumSeats.length,98);assert.equal(atriumTables.length,32);
 for(const c of atriumSeats){assert.ok(pointInPolygon([c.x,c.z],atriumWalkablePolygon));assert.ok(distance([c.x,c.z],sculptureCenter)>sculptureRadius+1);}
});

test('Susilo counter is inside its room and visitor arrival stays in front of reception',()=>{
 for(const p of receptionFootprint){const shape=roomById.susilo.polygon;assert.ok(pointInPolygon(p,shape)||Math.min(...shape.map((a,i)=>projectOnSegment(p,a,shape[(i+1)%shape.length]).distance))<.0001);}
 const r=findRoute('main-entrance','susilo');assert.ok(!pointInPolygon(r.points.at(-1),receptionFootprint));assert.match(roomById.susilo.description,/basic CAD-based reception/);
});

test('loading dock bays have raised shutter portals and preserve the center support',()=>{
 const r=roomById['188'];assert.equal(r.name,'Loading Dock');assert.equal(r.doors.length,2);assert.ok(r.doors.every(d=>d.kind==='shutter'));
 assert.equal(pointInPolygon(cadPoint(1,1460,280),r.polygon),false);assert.ok(findRoute('main-entrance','188'));
});
