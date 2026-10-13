/**
 * Digitized schematic of BU's published Floor 1 drawing (accessed 2026-10-13).
 * Coordinates are drawing units, not surveyed meters. x = east/right, z = south/down.
 * The source gives no scale, confirmed accessible entrances, or emergency exits.
 * Door/graph positions are hand-traced approximations; validate on site before use.
 */
export const mapSource = 'https://questromapps.bu.edu/maps/images/1new.png';
export const categories = {
  academic: { label: 'Learning spaces', color: '#b9cfcc', ink: '#3c6660' },
  center: { label: 'Student centers', color: '#b9c9a7', ink: '#527046' },
  office: { label: 'Offices', color: '#e0cbb5', ink: '#8a6946' },
  amenity: { label: 'Amenities', color: '#c0cfdf', ink: '#52708e' },
  entrance: { label: 'Entrances', color: '#d9dfd6', ink: '#617458' },
};
export const footprint = [[0,0],[150,0],[150,24],[138.5,24],[138.5,57],[136,57],[136,65.5],[120,65.5],[120,61.5],[77,61.5],[77,67],[60.7,67],[60.7,62],[30.4,62],[30.4,57],[0,57]];
const rect = (x,z,w,d) => [[x,z],[x+w,z],[x+w,z+d],[x,z+d]];
function room(id,name,type,x,z,w,d,door,extra={}) {
  return { id, name, type, floor: 1, number: '', polygon: rect(x,z,w,d), center:[x+w/2,z+d/2], door,
    description: 'A space on the first floor of the Rafik B. Hariri Building at BU Questrom.',
    hours: 'Hours vary · confirm with the department', verified: 'Traced from BU floor plan', ...extra };
}
export const rooms = [
  room('105','Auditorium','academic',34,15.5,42,27.2,[32,42],{number:'105',featured:true,short:'Auditorium 105',description:'Questrom’s main auditorium, a gathering space for lectures, guest speakers, and school events.',capacity:373,hours:'Access follows scheduled classes and events',label:['AUDITORIUM','105'],color:'#dba5a0'}),
  room('udc','Undergraduate Development Center','center',55,10,20,5.3,[76.8,12.5],{featured:true,short:'Undergraduate Center',description:'Academic advising and support for Questrom undergraduate students.',label:['UNDERGRADUATE','DEVELOPMENT CENTER']}),
  room('114','Gaffey Conference Room','academic',61,0,14,9.8,[66,10.2],{number:'114',label:['114']}),
  room('susilo','Susilo Business Center','center',116.5,5.2,12.2,11,[115,13.5],{featured:true,short:'Susilo Business Center',description:'Pick up course packets, arrange copying, and ask about lost and found. Located to the right at the back of the atrium.',hours:'Monday–Friday · 9:00 AM–5:00 PM',hoursSource:'https://questromworld.bu.edu/susilobusinesscenter/',label:['SUSILO','BUSINESS CENTER']}),
  room('150','Office 150','office',80.5,7.3,5.8,9.3,[85,18.4],{number:'150',label:['150']}),
  room('150A','Office 150A','office',86.7,9.8,4.2,6.8,[89,18.4],{number:'150A',label:['150A']}),
  room('atrium','Chiles Atrium','entrance',79,21,41,23,[98,33],{featured:true,short:'Atrium & Main Staircase',description:'The open heart of Questrom. Meet here, find the main staircase, or continue toward the auditorium.',label:['CHILES ATRIUM'],height:0.15}),
  room('stairs-main','Main Staircase','amenity',94.5,7.2,7,10,[98,18.4],{description:'Main staircase beside the Chiles Atrium.',label:['STAIRS'],height:1.3}),
  room('restroom-w','Women’s Restroom','amenity',75.4,0,15.5,6.8,[90.5,8.7],{short:'Women’s Restroom',aliases:['bathroom','toilet','women'],label:['WOMEN']}),
  room('restroom-m','Men’s Restroom','amenity',105.4,5.3,10.7,11,[104,13.5],{short:'Men’s Restroom',aliases:['bathroom','toilet','men'],label:['MEN']}),
  room('elevator-west','West Elevators','amenity',21,23,4,13,[27.5,30],{description:'Elevator bank on the Silber Way side. Accessible route suitability requires on-site confirmation.',label:['↕'],height:3.8}),
  room('stairs-west','West Staircase','amenity',15,20.5,5.5,16.5,[13,30],{label:['STAIRS'],height:1.8}),
  room('elevator-east','East Elevators','amenity',120.5,20.4,10,21.2,[119,31],{description:'Elevator bank to the east of the atrium.',label:['↕'],height:3.8}),
  room('stairs-east','East Staircase','amenity',131,25.3,4.7,15.5,[130,43.5],{label:['STAIRS'],height:1.8}),
  room('main-entrance','Main Entrance','entrance',91,56.5,13.8,5,[98,59],{featured:true,short:'Main Entrance',description:'The Commonwealth Avenue entrance to the Rafik B. Hariri Building, 595 Commonwealth Avenue.',label:['MAIN ENTRANCE'],height:0.1,aliases:['exit','commonwealth','front door']}),
  room('silber-entrance','Silber Way Entrance','entrance',0,22,6,13,[3,32],{description:'The entrance on the Silber Way side of Questrom.',label:['SILBER WAY','ENTRANCE'],height:0.1,aliases:['exit','side door']}),
  room('108','Undergraduate Suite','center',7.4,47.8,23,2.7,[26,49],{number:'108',short:'Room 108',description:'Office suite 108, on the Silber Way side of the first floor.',label:['108'],height:0.2}),
  room('104','Feld Center','academic',34,53,40,2.5,[68,54.2],{number:'104',short:'Feld Center',featured:true,description:'Career resources and employer engagement in the Feld Center office suite.',label:['FELD CENTER · 104'],height:0.2}),
  room('101','Graduate Admissions & Financial Aid','center',120.4,53,9.7,7.3,[122,53.7],{number:'101',short:'Graduate Admissions',featured:true,description:'Information and support for prospective graduate students, admissions, and financial aid.',label:['GRADUATE ADMISSIONS','101'],height:0.2}),
  room('102','Admissions Office','center',105.4,46,11.4,9.3,[118,54.4],{number:'102',label:['102']}),
];
// Office numbers and lettered suites are preserved as printed in the source drawing.
let nx=0;
for (const [num,w] of [['136',4.2],['134',3.8],['132',3.5],['130',3.5],['128',4.4],['126',3.8],['124B',3.7],['124A',3.7],['122',5.2],['120',5.1],['118',5],['116',5],['115B',4.3]]) {
  rooms.push(room(num,`Office ${num}`,'office',nx,0,w-.25,7.1,[nx+w/2,8.8],{number:num,label:[num]})); nx+=w;
}
for(const [num,x,z,w,d] of [['133',10,10.1,5,3.6],['129A',15.3,10.1,5,3.6],['135',10,14,5,3.4],['129',15.3,14,10,3.4],['123',25.8,10.1,5.2,5.2],['121',31.4,10.1,4.8,5.2],['119',36.6,10.1,4.8,5.2],['119A',41.8,10.1,4.5,5.2],['117',46.7,10.1,4.5,5.2],['140A',0,10.7,7.3,3.8],['138',0,14.8,7.3,6.7]]) {
  rooms.push(room(num,`Office ${num}`,'office',x,z,w,d,[x+w/2,8.8],{number:num,label:[num]}));
}
const suites = {
  '108': [['L',0,36.4,7,6],['K',0,42.8,7,4.5],['J',0,47.8,7,2.7],['I',0,50.9,9.2,6],['G',9.6,50.9,6.4,6],['E',16.4,50.9,4.2,6],['C',21,50.9,4.2,6],['A',25.6,50.9,4.8,6],['H',9.6,40.4,4.2,7.1],['F',14.2,40.4,4.2,7.1],['D',18.8,40.4,4.2,7.1],['B',27.8,46.2,2.6,1.2]],
  '104': [['S',33.5,46.2,3.7,6.5],['R',37.6,46.2,3.7,6.5],['O',41.7,46.2,3.7,6.5],['M',45.8,46.2,8.8,6.5],['K',55,46.2,4.5,6.5],['J',59.9,46.2,3.5,6.5],['H',63.8,46.2,5.4,4.5],['G',69.6,46.2,5,4.5],['E',75,46.2,4.6,6.5],['C',80,46.2,4.4,6.5],['Q',33.5,56,7.7,6],['P',41.6,56,6.5,6],['N',48.5,56,4.3,4.5],['L',53.2,56,4.8,4.5],['I',58.4,56,6.3,4.5],['F',65.1,56,9.5,10.8],['D',75,56,5.3,6],['B',80.7,56,4.8,6],['A',85.9,56,5,6]],
  '101': [['D',117,46.2,4.5,6.3],['A',121.9,46.2,4.7,6.3],['B',129.6,45.2,5.8,4.5],['C',129.6,50.1,5.8,2.6],['D2',130.4,53.1,5,5.7],['E',130.4,59.2,5,6.2],['F',124.9,60.6,5.1,4.8],['G',120.4,60.6,4.1,4.8],['H',120.4,55.4,3.3,4.8]],
  '102': [['C',105.4,55.6,4.5,5.9],['B',110.3,55.6,4.5,5.9],['A',115.2,55.6,4.8,5.9]],
};
for(const [suite,items] of Object.entries(suites)) for(const [letter,x,z,w,d] of items) {
  const num = suite==='101' && letter==='D2' ? '101D-east' : `${suite}${letter}`;
  const door = suite==='108' ? [x+w/2,49] : suite==='104' ? [x+w/2,54.2] : [suite==='102'?x+w/2:128,54.2];
  rooms.push(room(num,`Office ${num}`,'office',x,z,w,d,door,{number:num,label:[letter==='D2'?'D':letter],suite}));
}
export const roomById=Object.fromEntries(rooms.map(r=>[r.id,r]));
export const featuredIds=['105','udc','susilo','104','101'];
// Explicit connected corridor network: no straight-line routing through room blocks.
export const corridorNodes = {
 main:[98,59],south:[98,44.4],atrium:[98,33],north:[98,18.4],westAtrium:[79,33],udcEntry:[77,12.5],udcTurn:[74,8.8],udcHall:[53,8.8],northWest:[9,8.8],westTop:[9,18.5],westDoor:[3,32],west:[9,32],westLower:[9,38.5],hallWest:[27.5,38.5],audWest:[32,38.5],audDoor:[32,42],hallBottom:[32,44.4],audEast:[79,44.4],feldEntry:[87,44.4],feld:[87,54.2],feldWest:[33,54.2],suite108:[26,44.4],suite108Hall:[26,49],suite108West:[3.5,49],east:[119,33],eastSouth:[119,44.4],gradEntry:[118,54.2],grad:[128,54.2],susilo:[115,18.4],men:[104,18.4],women:[90.5,8.7],elevatorWest:[27.5,30],stairsWest:[13,30],stairsEast:[130,43.5],
};
export const corridorEdges=[['main','south'],['south','atrium'],['atrium','north'],['atrium','westAtrium'],['westAtrium','audEast'],['north','udcEntry'],['udcEntry','udcTurn'],['udcTurn','udcHall'],['udcHall','northWest'],['northWest','westTop'],['westTop','west'],['west','westDoor'],['west','westLower'],['westLower','hallWest'],['hallWest','audWest'],['audWest','audDoor'],['audDoor','hallBottom'],['hallBottom','audEast'],['audEast','feldEntry'],['feldEntry','south'],['feldEntry','feld'],['feld','feldWest'],['hallBottom','suite108'],['suite108','suite108Hall'],['suite108Hall','suite108West'],['atrium','east'],['east','eastSouth'],['eastSouth','south'],['eastSouth','gradEntry'],['gradEntry','grad'],['north','men'],['men','susilo'],['north','women'],['hallWest','elevatorWest'],['west','stairsWest'],['eastSouth','stairsEast']];
// Doglegs keep paths outside the 150 office block and the main staircase.
corridorNodes.udcGate=[77,18.4];
corridorNodes.womenGate=[92,18.4];
corridorNodes.womenHall=[92,8.7];
corridorEdges.splice(corridorEdges.findIndex(([a,b])=>a==='north'&&b==='udcEntry'),1,['north','udcGate'],['udcGate','udcEntry']);
corridorEdges.splice(corridorEdges.findIndex(([a,b])=>a==='north'&&b==='women'),1,['north','womenGate'],['womenGate','womenHall'],['womenHall','women']);
corridorNodes.suite108West=[7.6,49];
corridorNodes.udcTurn=[58,12.5];
corridorNodes.udcHall=[58,8.8];
roomById.udc.height=.2;
roomById['102'].height=.2;
corridorNodes.gradGate=[113,44.4];
corridorNodes.gradReception=[113,54.2];
corridorEdges.splice(corridorEdges.findIndex(([a,b])=>a==='eastSouth'&&b==='gradEntry'),1,['eastSouth','gradGate'],['gradGate','gradReception'],['gradReception','gradEntry']);
Object.assign(roomById['108L'],{door:[8,39]});
Object.assign(roomById['108K'],{door:[8,45]});
Object.assign(roomById['108J'],{door:[7.6,49]});
Object.assign(roomById['108I'],{door:[8.3,50.6]});
