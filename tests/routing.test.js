import test from 'node:test';
import assert from 'node:assert/strict';
import { rooms, corridorNodes, corridorEdges, roomById } from '../src/data/questromMapData.js';
import { findRoute, pointAlong, searchRooms, distance } from '../src/lib/routing.js';

test('floor data has unique IDs, valid polygons and known required destinations',()=>{
  assert.equal(new Set(rooms.map(r=>r.id)).size,rooms.length);
  for(const id of ['101','102','104','105','108','114','138','140A','udc','susilo','main-entrance','silber-entrance','restroom-m','restroom-w','elevator-east','elevator-west'])assert.ok(roomById[id],id);
  for(const r of rooms){assert.ok(r.polygon.length>=4);assert.equal(r.floor,1);assert.ok(r.door.every(Number.isFinite));assert.ok(r.polygon[1][0]>r.polygon[0][0]);}
});
test('all destinations connect to both public entrances and routes are reversible',()=>{
  for(const origin of ['main-entrance','silber-entrance']) for(const room of rooms){
    const route=findRoute(origin,room.id),reverse=findRoute(room.id,origin);
    assert.ok(route,`${origin} → ${room.id}`);assert.deepEqual(route.points[0],roomById[origin].door);assert.deepEqual(route.points.at(-1),room.door);
    assert.ok(Math.abs(route.units-reverse.units)<.001);
    assert.ok(route.steps.at(-1).text.includes(room.short||room.name));
  }
});
test('corridor segments do not cross solid rooms',()=>{
  const solids=rooms.filter(r=>(r.height??2.7)>.3 && !r.id.startsWith('stairs'));
  for(const [a,b] of corridorEdges){const p=corridorNodes[a],q=corridorNodes[b];for(let t=.05;t<.96;t+=.05){const x=p[0]+(q[0]-p[0])*t,z=p[1]+(q[1]-p[1])*t;for(const r of solids){const l=r.polygon[0],right=r.polygon[2];assert.ok(!(x>l[0]+.15&&x<right[0]-.15&&z>l[1]+.15&&z<right[1]-.15),`${a} → ${b} crosses ${r.id} at ${x},${z}`);}}}
});
test('journey interpolation starts and ends exactly and stays on its segments',()=>{
  const route=findRoute('main-entrance','108');assert.deepEqual(pointAlong(route.points,0),route.points[0]);assert.deepEqual(pointAlong(route.points,1),route.points.at(-1));assert.deepEqual(pointAlong(route.points,-1),route.points[0]);
  assert.deepEqual(pointAlong([[0,0],[10,0],[10,10]],.75),[10,5]);assert.deepEqual(pointAlong([[4,5]],.5),[4,5]);assert.equal(pointAlong([],0),null);
});
test('same-location and invalid endpoints have explicit behavior',()=>{
  assert.equal(findRoute('105','105').units,0);assert.equal(findRoute('bad','105'),null);assert.equal(findRoute('105','bad'),null);
});
test('search supports room numbers, abbreviations, amenities and typos',()=>{
  assert.equal(searchRooms('105')[0].id,'105');assert.equal(searchRooms('108A')[0].id,'108A');assert.ok(searchRooms('graduate admissions').some(r=>r.id==='101'));assert.ok(searchRooms('bathroom').some(r=>r.id==='restroom-w'));assert.ok(searchRooms('auditorum').some(r=>r.id==='105'));assert.ok(searchRooms('Susilo Center').some(r=>r.id==='susilo'));assert.equal(searchRooms('xyzzyq').length,0);assert.equal(searchRooms('').length,0);
});
