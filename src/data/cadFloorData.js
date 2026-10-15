import { polygonBounds, splitWall, projectOnSegment } from '../lib/geometry.js';
/** CAD screenshots supplied October 14–15, 2026. Offsets register overlapping walls.
 * Units are drawing units, not meters. Heights are illustrative. 101H is removed.
 * Original screenshots are private working references and are not shipped.
 */
export const mapSource='https://questromapps.bu.edu/maps/images/1new.png';
export const mapRevision={date:'2026-10-15',source:'Fourteen user-supplied CAD screenshots',scale:'20 registered pixels per drawing unit',omitted:['101H'],heightVerified:false};
const offsets={0:[0,0],1:[2014,47],2:[1968,991],3:[868,979],4:[-49,983],5:[0,416],6:[0,0],7:[1175,34],8:[1653,77],9:[550,440],10:[2028,612],14:[1177,44.5]};
const imageScales={9:1.48,10:1.5,14:.75};
const scaleOf=image=>imageScales[image]||1;
export const cadPoint=(image,x,z)=>[(x*scaleOf(image)+offsets[image][0]-224)/20,(z*scaleOf(image)+offsets[image][1]-105)/20];
const P=cadPoint,R=(x,z,w,d)=>[[x,z],[x+w,z],[x+w,z+d],[x,z+d]];
export const categories={academic:{label:'Learning spaces',color:'#b9cfcc',ink:'#3c6660'},center:{label:'Student centers',color:'#b9c9a7',ink:'#527046'},office:{label:'Offices',color:'#e0cbb5',ink:'#8a6946'},amenity:{label:'Amenities',color:'#c0cfdf',ink:'#52708e'},entrance:{label:'Entrances',color:'#d9dfd6',ink:'#617458'}};
export const footprint=[[0,0],[181.5,0],[181.5,28],[163,28],[163,81],[149,81],[149,78],[115,78],[115,82],[89,82],[89,79],[0,79],[0,41],[-5,41],[-5,28],[0,28]];
export const rooms=[];
const door=(x,z,nx,nz,node,width=40,extra={})=>({x,z,normal:[nx,nz],node,width,...extra});
function add(id,type,image,polygon,specs=[],meta={}){
 const shape=polygon.map(p=>P(image,...p)),b=polygonBounds(shape),room={id,type,number:/^\d/.test(id)?id:'',floor:1,name:/^\d/.test(id)?`Office ${id}`:id,polygon:shape,center:[(b.minX+b.maxX)/2,(b.minZ+b.maxZ)/2],height:2.8,label:[id],description:'A first-floor space traced from the supplied CAD close-ups.',hours:'Hours vary · confirm with the department',verified:'Door position traced from supplied CAD screenshots',sourceImage:image,...meta};
 room.doors=specs.map((d,i)=>{const point=P(image,d.x,d.z),normal=d.normal;return{id:`${id}:door${i+1}`,roomId:id,point,normal,width:d.width*scaleOf(image)/20,node:d.node,kind:d.kind||'single',inside:d.inside?P(image,...d.inside):[point[0]-normal[0]*1.05,point[1]-normal[1]*1.05],outside:[point[0]+normal[0]*1.1,point[1]+normal[1]*1.1],via:(d.via||[]).map(p=>P(image,...p)),render:d.render!==false,exitOnly:!!d.exitOnly,storefront:!!d.storefront,routable:d.routable!==false};});
 room.door=room.doors[0]?.point||room.center;room.routable=room.doors.some(d=>d.node&&d.routable);if(!room.routable&&!room.routeNote)room.routeNote='The supplied crops do not establish a complete door connection for this space. Confirm it before routing.';rooms.push(room);return room;
}
const box=(id,type,image,x,z,w,d,specs,meta)=>add(id,type,image,R(x,z,w,d),specs,meta);
// North wing: traced widths and alternating doorway positions.
for(const[id,l,r,dx]of [['136',261,337,315],['134',344,424,364],['132',431,508,486],['130',516,594,536],['128',603,681,660],['126',688,774,752],['124B',781,861,802],['124A',868,949,927],['122',957,1090,1067],['120',1098,1192,1119],['118',1199,1310,1288],['116',1318,1431,1339],['115B',1439,1533,1511]])box(id,'office',6,l,139,r-l,137,[door(dx,276,0,1,'northHall')],{furniture:'none'});
for(const[id,x,z,w,d,dx,dz,nx,nz]of [['133',478,346,115,89,570,346,0,-1],['129A',600,368,120,68,701,368,0,-1],['135',478,442,115,85,493,527,0,1],['129',600,442,173,85,751,527,0,1],['125A',779,346,65,132,800,346,0,-1],['123',854,345,116,133,874,345,0,-1],['121',977,345,114,133,1070,345,0,-1],['119',1104,345,105,133,1124,345,0,-1],['119A',1216,345,101,133,1295,345,0,-1],['117',1325,378,114,100,1346,378,0,-1],['140A',240,367,171,89,411,434,1,0],['138',240,465,171,128,411,489,1,0]])box(id,'office',6,x,z,w,d,[door(dx,dz,nx,nz,['135','129'].includes(id)?'northLower':['138','140A'].includes(id)?'northWest':'northHall')],{furniture:'none'});
box('117A','office',6,1325,346,57,26,[door(1354,346,0,-1,'northHall',32)],{furniture:'none'});
box('127','office',6,780,487,64,40,[],{name:'Room 127',furniture:'none'});
// Latest close-up: conference glazing, open 113 passage and the 115 lounge.
add('114','academic',14,[[675,126],[1135,126],[1135,397],[1078,397],[1078,442],[789,442],[789,397],[675,397]],[door(705,397,0,1,'conferenceWestApproach',55),door(1107,397,0,1,'conferenceEastApproach',50)],{name:'Gaffey Conference Room',label:['GAFFEY CONFERENCE','114'],furniture:'conference',center:P(14,905,260),description:'Conference space with two working entrances: one from area 115 and one from passage 113. The central frontage is glazing, not an entrance.'});
add('113','entrance',14,[[830,452],[1078,452],[1078,397],[1138,397],[1138,448],[1318,448],[1318,610],[1160,610],[1160,557],[830,557]],[door(830,503,-1,0,'udcEast',70,{kind:'double'}),door(1240,610,0,1,'passage113Approach',140,{kind:'open'})],{name:'Passage 113',number:'113',label:['PASSAGE','113'],height:0,furniture:'none',center:P(14,1020,503),aliases:['corridor','undergraduate entrance'],description:'Passage from the atrium into area 115. Use the double doors to reach the Undergraduate lounge, reception and north-wing rooms.'});
add('udc','center',6,[[420,280],[1537,280],[1537,139],[1683.25,139],[1683.25,342.25],[1768.75,342.25],[1768.75,376],[1799.5,376],[1799.5,482],[851,477],[851,338],[770,338],[770,358],[596,358],[596,338],[471,338],[471,527],[420,527]],[door(440,527,0,1,'udcWestOutside',42,{exitOnly:true}),door(1799.5,421.75,1,0,'passage113Inner',52.5,{kind:'double',render:false})],{name:'Undergraduate Development Center',short:'Undergraduate Center',number:'115–140',label:['UNDERGRADUATE CENTER'],height:0,featured:true,aliases:['140','undergraduate development','undergrad','advising'],accessNote:'Enter through passage 113. The west door between 135 and 138 is exit only.',description:'Undergraduate Development Center, reached through passage 113 beside conference room 114.',center:P(14,550,330)});
box('115','center',14,480,126,195,271,[door(480,350,-1,0,'lounge115Approach',64,{kind:'open',render:false})],{name:'Undergraduate Lounge',short:'Lounge 115',number:'115',label:['LOUNGE','115'],height:0,furniture:'lounge115',department:'Undergraduate Development Center',description:'Couch and waiting area beside Undergraduate reception 115A. Furniture is shown schematically.',center:P(14,575,230)});
box('115A','center',14,389,396,190,187,[door(579,480,1,0,'reception115Approach',60,{kind:'open',render:false})],{name:'Undergraduate Reception Desk',short:'Reception 115A',number:'115A',label:['RECEPTION','115A'],height:0,furniture:'reception115',department:'Undergraduate Development Center',center:P(14,450,470),description:'Reception desk serving Undergraduate Development Center. Directions stop on the public side of the counter.'});
// West lobby and the 108 suite, with two separate suite approaches.
box('silber-entrance','entrance',5,124,260,139,230,[door(263,376,1,0,'westLobby',150,{kind:'double',storefront:true})],{number:'197',name:'Silber Way Entrance',label:['SILBER WAY','197'],height:0,aliases:['exit','side door']});
box('west-lobby','entrance',5,275,202,311,335,[door(440,537,0,1,'westLobby',100,{kind:'open'})],{name:'West Lobby',number:'193',label:['WEST LOBBY','193'],height:0});
box('stairs-west','amenity',5,610,212,110,263,[door(706,212,0,-1,'westLobbyUpper',70,{kind:'double'})],{name:'West Staircase',number:'194',label:['STAIR','194'],furniture:'stairs',height:2.2});
box('194A','amenity',5,611,479,109,64,[door(720,513,1,0,'westLobby',45)],{name:'Stair Landing 194A',label:['194A'],furniture:'none'});
for(let i=0;i<3;i++)box(i===0?'elevator-west':`elevator-west-${i+1}`,'amenity',5,850,272+i*105,99,91,[door(949,318+i*105,1,0,'westLift',40,{kind:'lift'})],{name:`West Elevator ${String.fromCharCode(65+i)}`,number:`193${String.fromCharCode(65+i)}`,label:[`193${String.fromCharCode(65+i)}`,'↕'],height:3.2,aliases:['elevator','lift'],furniture:'lift'});
box('193E','amenity',5,850,594,110,108,[door(890,702,0,1,'southWest',40)],{name:'West Service Room 193E',label:['193E'],furniture:'none'});
add('108','center',4,[[459,70],[514,70],[514,249],[821,249],[821,220],[1073,220],[1073,444],[1008,444],[1008,326],[514,326],[514,338],[459,338]],[door(483,70,0,-1,'westLobbyLower',48,{exitOnly:true}),door(1040,220,0,-1,'southWest',45,{exitOnly:true}),door(1073,413,1,0,'feldWest',55,{kind:'open'})],{name:'Feld Center · Office Suite 108',short:'Feld Suite 108',label:['OFFICE SUITE 108','112 · 110'],height:0,aliases:['110','112','Feld offices'],description:'Part of the Feld Center. Enter through the main Feld Center door and follow the internal corridor. The doors to the public west and south corridors are exit only.',accessNote:'Entry via Feld Center · exterior suite doors are exit only',center:P(4,745,287)});
for(const[l,x,z,w,d,dx,dz,nx,nz]of [['H',518,80,97,168,589,248,0,1],['F',620,80,94,168,690,248,0,1],['D',720,80,100,168,793,248,0,1],['B',946,220,70,30,969,250,0,1],['K',296,132,157,109,453,154,1,0],['J',296,246,157,87,453,270,1,0],['I',307,340,211,129,489,340,0,-1],['G',522,326,109,144,550,326,0,-1],['E',638,326,117,111,668,326,0,-1],['C',760,326,113,111,787,326,0,-1],['A',879,326,128,111,900,326,0,-1]])box('108'+l,'office',4,x,z,w,d,[door(dx,dz,nx,nz,'suite108')],{suite:'108',furniture:l==='I'?'conference':l==='B'?'none':'office'});
box('108L','office',5,237,552,167,132,[door(404,611,1,0,'suite108Upper',44)],{suite:'108',furniture:'office'});
// Feld public corridors and individually gated offices.
add('104','academic',3,[[95,385],[1334,385],[1334,222],[1514,222],[1514,445],[95,445]],[door(1395,222,0,-1,'feldEntry',75,{kind:'double',inside:[1378,247]})],{name:'Feld Center',short:'Feld Center',label:['FELD CENTER · 104'],height:0,featured:true,center:P(3,1390,345),description:'Feld Center reception and its connected office corridors.'});
for(const[l,x,z,w,d,dx,dz,nx,nz]of [['S',164,226,77,157,184,383,0,1],['R',246,226,75,157,302,383,0,1],['O',327,226,111,157,377,383,0,1],['M',446,226,182,157,471,383,0,1],['K',638,226,139,157,748,383,0,1],['J',782,226,95,157,858,383,0,1],['H',884,226,111,115,965,341,0,1],['G',1003,226,116,115,1025,341,0,1],['E',1125,226,96,157,1196,383,0,1],['C',1229,226,100,157,1303,383,0,1],['Q',107,449,213,133,298,449,0,-1],['P',327,449,111,147,349,449,0,-1],['N',449,449,108,103,471,449,0,-1],['L',564,449,109,103,585,449,0,-1],['I',681,449,190,106,843,449,0,-1],['D',1125,449,149,133,1245,449,0,-1],['B',1281,449,105,133,1305,449,0,-1],['A',1394,449,120,133,1485,449,0,-1]])box('104'+l,'office',3,x,z,w,d,[door(dx,dz,nx,nz,'feldHall',l==='O'?80:40,{kind:l==='O'?'open':'single'})],{suite:'104',furniture:l==='O'?'storage':l==='M'?'conference':'office'});
add('104F','office',3,[[878,449],[1119,449],[1119,583],[1150,583],[1150,694],[821,694],[821,556],[878,556]],[door(999,449,0,-1,'feldHall',235,{kind:'open'})],{suite:'104',furniture:'conference',label:['104F'],center:P(3,990,610)});
// Admissions: no 101H room, walls, door, furniture, label, or search alias.
box('main-entrance','entrance',2,466,497,261,126,[door(595,497,0,-1,'atriumSouth',225,{kind:'double',storefront:true})],{name:'Main Entrance',number:'180',label:['MAIN ENTRANCE','180'],height:0,featured:true,aliases:['exit','commonwealth','front door']});
add('102','center',2,[[774,214],[1044,214],[1044,374],[1157,374],[1157,435],[774,435]],[door(868,214,0,-1,'admissionsEntry',74,{kind:'double'})],{name:'Graduate Admissions Reception',short:'Graduate Reception',label:['GRADUATE ADMISSIONS','102'],aliases:['graduate admissions','grad admissions','financial aid'],height:0,center:P(2,875,335)});
add('101','center',2,[[1291,214],[1346,214],[1346,307],[1354,307],[1354,374],[1372,374],[1372,566],[1128,566],[1128,435],[1157,435],[1157,374],[1234,374],[1234,396],[1280,396],[1280,347],[1291,347]],[door(1291,230,-1,0,'gradEntry',42)],{name:'Graduate Admissions & Financial Aid',short:'Graduate Admissions',label:['GRADUATE ADMISSIONS','101 · 101J'],height:0,featured:true,center:P(2,1320,425),aliases:['101J'],description:'Graduate Admissions & Financial Aid occupies the southeast 101/102 suite. Open circulation replaces the removed office 101H.'});
for(const[id,x,z,w,d,dx,dz,nx,nz]of [['102A',1016,435,108,133,1095,435,0,-1],['102B',897,435,113,133,925,435,0,-1],['102C',774,435,118,133,869,435,0,-1],['102D',1048,214,106,155,1072,369,0,1],['102E',975,214,66,160,1008,374,0,1],['101A',1159,242,121,127,1212,369,0,1],['101B',1346,192,150,109,1346,278,-1,0],['101C',1354,308,142,61,1354,344,-1,0],['101D',1372,377,115,137,1372,493,-1,0],['101E',1372,522,102,162,1372,542,-1,0],['101F',1254,566,110,116,1326,566,0,-1],['101G',1134,566,114,116,1211,566,0,-1],['101I',1236,352,44,44,1258,396,0,1]]){const node=['101B','101C'].includes(id)?'gradUpper':['101E','101F','101G'].includes(id)?'gradLower':'admissionsHall';box(id,'office',2,x,z,w,d,[door(dx,dz,nx,nz,node,id==='102E'?60:id==='101C'?38:40,{kind:['102E','101C'].includes(id)?'open':'single'})],{suite:id.slice(0,3),furniture:id==='101I'?'none':id==='101A'?'kitchen':'office'});}
box('182A','amenity',2,1494,374,59,193,[],{name:'Service Passage 182A',label:['182A'],furniture:'none'});
box('198','amenity',10,974,40,221,635,[],{name:'Exterior Parking Way',number:'198',label:['PARKING WAY','198 · OUTDOORS'],outdoor:true,height:0,color:'#777e80',description:'Exterior vehicle passage alongside the building, not an indoor room.',routeNote:'Vehicle passage outside the building. Choose Main Entrance or Silber Way Entrance for pedestrian directions.',furniture:'parking'});
// Atrium, business center, east lifts and stair cores.
add('150','office',14,[[1147,343],[1485,343],[1485,610],[1318,610],[1318,448],[1147,448]],[door(1457,610,0,1,'officeHours150Approach',50)],{name:'Office Hours & Question Sessions',short:'Office Hours · 150',label:['OFFICE HOURS','150'],furniture:'office-hours',center:P(14,1385,510),aliases:['doubt sessions','questions','tutoring'],description:'Space allocated for office hours and question sessions. Meeting furniture is schematic.'});
add('150A','office',14,[[1494,397],[1630,397],[1630,516],[1617,516],[1617,566],[1630,566],[1630,610],[1494,610]],[door(1617,541,1,0,'northRestroom',48,{via:[[1690,541]]})],{furniture:'none'});
add('restroom-w','amenity',14,[[1147,132],[1629,132],[1629,234],[1509,234],[1509,310],[1147,310]],[door(1592,234,0,1,'womenVestibule',50)],{number:'189',name:'Women’s Restroom',label:['WOMEN','189'],aliases:['bathroom','toilet','women','189'],furniture:'restroom',center:P(14,1390,200),description:'Women’s restroom reached through two successive doors and an entrance vestibule.'});
box('restroom-w-vestibule','amenity',14,1509,234,121,142,[door(1630,301,1,0,'northRestroom',50)],{name:'Women’s Restroom Entrance',number:'189 entrance',label:['189','ENTRANCE'],furniture:'none',description:'Entrance vestibule between the two doors of women’s restroom 189.'});
add('restroom-m','amenity',1,[[741,196],[998,196],[998,344],[828,344],[828,443],[741,443]],[door(741,395,-1,0,'eastRestroom')],{number:'187',name:'Men’s Restroom',label:['MEN','187'],aliases:['bathroom','toilet','men','187'],center:P(1,868,267),furniture:'restroom'});
box('187B','amenity',1,833,351,174,93,[door(833,396,-1,0,'menVestibule',36),door(1007,395,1,0,null,40,{routable:false})],{name:'Service Room 187B',label:['187B'],furniture:'none',description:'Public map grouping for room 187B. Existing internal partitions and doorways are retained.'});
add('susilo','center',1,[[1092,96],[1266,96],[1266,301],[1299,301],[1299,444],[1177,444],[1177,455],[1092,455],[1092,444],[1007,444],[1007,351],[1092,351]],[door(1138,455,0,1,'businessEntry',70,{kind:'double'})],{number:'186',name:'Susilo Business Center',short:'Susilo Business Center',label:['SUSILO BUSINESS','CENTER · 186'],center:P(1,1180,265),featured:true,hours:'Monday–Friday · 9:00 AM–5:00 PM',hoursSource:'https://questromworld.bu.edu/susilobusinesscenter/',furniture:'business',description:'Course packets, copying, and lost-and-found services. A basic CAD-based reception layout is shown; detailed furnishings and finishes await on-site photographs.'});
add('188','amenity',1,[[1277,72],[1742,72],[1742,303],[1482,303],[1482,234],[1442,234],[1442,303],[1277,303]],[door(1360,303,0,1,'eastGalleryNorth',125,{kind:'shutter'}),door(1600,303,0,1,'eastGalleryNorth',220,{kind:'shutter'})],{name:'Loading Dock',number:'188',label:['LOADING DOCK','188'],color:'#c2c6c3',height:2.8,furniture:'loading',description:'Open loading-dock bays with raised shutters. The center support and side walls follow the supplied CAD.'});
add('185','office',1,[[1305,303],[1741,303],[1741,477],[1681,477],[1681,537],[1305,537]],[door(1305,495,-1,0,'eastGalleryEntry',70,{kind:'double'})],{name:'Room 185 · East Gallery',label:['EAST GALLERY','185'],furniture:'none'});
box('185C','office',1,1305,544,73,66,[door(1344,544,0,-1,'eastGalleryInside',40)],{furniture:'none'});
add('184','amenity',1,[[1385,544],[1681,544],[1681,486],[1808,486],[1808,618],[1469,618],[1469,570],[1385,570]],[door(1697,486,0,-1,'eastGalleryInside',40)],{name:'East Passage 184',label:['184'],furniture:'none'});
box('185A','amenity',1,1206,536,84,94,[door(1230,536,0,-1,'eastGalleryEntry',40)],{name:'East Vestibule 185A',label:['185A'],height:0,furniture:'none'});
box('185B','office',1,1099,554,107,56,[door(1206,586,1,0,'eastVestibule')],{furniture:'none'});
// Two facing pairs open into the central lift lobby, not into the atrium furniture.
for(const [i,x,z,normal]of [[0,725,46,1],[1,800,46,1],[2,725,211,-1],[3,800,211,-1]]){
 const specs=[door(x+32,normal===1?z+61:z,0,normal,'eastLiftHall',34,{kind:'lift',via:[[x+32,157]],routable:i!==1})];
 if(i===1)specs.push(door(x+32,z,0,-1,null,34,{kind:'lift',routable:false}));
 box(i===0?'elevator-east':`elevator-east-${i+1}`,'amenity',10,x,z,63,61,specs,{name:i===1?'Freight Elevator 181B':`East Elevator ${String.fromCharCode(65+i)}`,number:`181${String.fromCharCode(65+i)}`,label:[`181${String.fromCharCode(65+i)}`,i===1?'FREIGHT':'↕'],height:3.2,furniture:'lift',serviceOnly:i===1,aliases:['elevator','lift',`181${String.fromCharCode(65+i)}`,...(i===1?['freight','service elevator']:[])],...(i===1?{description:'Through-car freight elevator with opposing doors to 185A and elevator lobby 181K.',routeNote:'Service connection · excluded from visitor directions. Emergency routing is not enabled.'}:{})});
}
box('east-lift-lobby','amenity',10,710,107,169,104,[door(710,157,-1,0,'eastLiftFront',48,{kind:'open'})],{name:'East Elevator Lobby',number:'181K',label:['EAST ELEVATORS','181K'],height:0});
box('181E','amenity',10,715,286,108,40,[door(754,326,0,1,'eastStairApproach',34)],{name:'Service Room 181E',label:['181E'],furniture:'none'});
add('stairs-east','amenity',0,[[3349.5,1062],[3349.5,681],[3399,681],[3399,617],[3483,617],[3483,665],[3454.5,665],[3454.5,1062]],[door(3376.5,1062,0,1,null,51,{routable:false}),door(3439,617,0,-1,null,40,{routable:false})],{name:'East Service Staircase',number:'183 / 183A',label:['SERVICE STAIR','183 · 183A'],furniture:'switchback',height:2.8,serviceOnly:true,flightPolygon:R(881,80,70,220).map(p=>P(10,...p)),description:'East stairwell with its upper landing connected by a door to passage 184.',routeNote:'Service staircase · excluded from visitor directions. Emergency routing is not enabled.'});
box('stairs-main','amenity',1,478,235,162,253,[door(559,488,0,1,'atriumNorth',140,{kind:'open'})],{name:'Main Staircase',number:'181J',label:['MAIN STAIR','181J'],furniture:'stairs',height:0});
box('atrium','entrance',0,2075,555,970,575,[door(2568,1130,0,1,'atriumSouth',100,{kind:'open'})],{name:'Chiles Atrium',short:'Atrium & Main Staircase',label:['CHILES ATRIUM','181'],height:0,featured:true,center:P(0,2570,925),furniture:'atrium'});
// Auditorium: shared east foyer, independent projector cabin, three seating banks.
add('105','academic',9,[[381,43],[850,43],[850,150],[912,150],[912,215],[890,226],[890,270],[912,283],[912,330],[850,330],[850,455],[381,455],[381,350],[328,327],[328,165],[381,143]],[door(785,455,0,1,'audSouth',50,{kind:'double',inside:[785,444]}),door(850,100,1,0,'audFoyerUpper',38,{kind:'double',inside:[838,100],via:[[880,100]]}),door(850,390,1,0,'audFoyerLower',38,{kind:'double',inside:[838,390],via:[[880,390]]})],{name:'Auditorium',short:'Auditorium 105',label:['AUDITORIUM','105'],color:'#c9c4ba',height:3.3,featured:true,capacity:373,hours:'Access follows scheduled classes and events',center:P(9,670,247),furniture:'auditorium',description:'West-facing auditorium with three seating banks, two cross aisles and a shallow curved timber stage. 105A, 105B and 105D form one connected entrance foyer. 105C is the separate projector cabin.'});
box('105G','amenity',9,328,96,53,47,[door(381,120,1,0,'audFront',28)],{name:'Auditorium Support 105G',label:['105G'],furniture:'none'});
box('105F','amenity',9,328,397,53,58,[door(354,397,0,-1,'audStage',28)],{name:'Auditorium Support 105F',label:['105F'],furniture:'none'});
box('105H','amenity',9,282,46,99,44,[door(381,68,1,0,'audFrontUpper',28)],{name:'Backstage Passage 105H',label:['105H'],furniture:'none'});
box('105E','amenity',9,205,46,77,64,[door(282,68,1,0,'backstage',30)],{name:'Auditorium Support 105E',label:['105E'],furniture:'none'});
box('105D','amenity',9,850,25,160,133,[door(1010,125,1,0,'audEastUpper',50,{kind:'double'})],{name:'Auditorium Entrance Foyer · 105D',label:['105D','SHARED FOYER'],height:0,furniture:'foyer-stairs',description:'Upper portion of the common auditorium entrance foyer, connected openly to 105B and 105A.'});
add('105B','amenity',9,[[912,158],[1010,158],[1010,330],[953,330],[953,215],[912,215]],[door(980,158,0,-1,'audFoyerUpper',34,{kind:'open'})],{name:'Auditorium Entrance Foyer · 105B',label:['105B','SHARED FOYER'],height:0,furniture:'none',center:P(9,980,247),description:'Middle of the same auditorium foyer as 105A and 105D. The projector cabin is a separate enclosed space.'});
box('105A','amenity',9,850,330,160,125,[door(1010,352,1,0,'audEastLower',50,{kind:'double'})],{name:'Auditorium Entrance Foyer · 105A',label:['105A','SHARED FOYER'],height:0,furniture:'foyer-stairs',description:'Lower portion of the common auditorium entrance foyer. Continue inside the foyer to 105B and 105D.'});
add('105C','amenity',9,[[912,215],[953,215],[953,330],[912,330],[912,283],[890,270],[890,226]],[door(930,215,0,-1,'audFoyerMiddle',28,{via:[[930,190]]})],{name:'Auditorium Projector Cabin',number:'105C',label:['PROJECTOR','105C'],furniture:'projector',description:'Enclosed projector/control cabin at the rear of the auditorium, entered through its doorway from the shared foyer.'});
export const roomById=Object.fromEntries(rooms.map(r=>[r.id,r])),featuredIds=['105','udc','susilo','104','101'],doors=rooms.flatMap(r=>r.doors);
export const corridorNodes={},corridorEdges=[];
const node=(id,image,x,z)=>corridorNodes[id]=P(image,x,z),link=(...ids)=>{for(let i=1;i<ids.length;i++)corridorEdges.push([ids[i-1],ids[i]]);};
node('northHall',6,900,310);node('northWest',6,441,506);node('udcWestOutside',6,441,565);node('northCorner',6,441,310);node('northLower',6,737,548);node('northLowerTurn',6,441,548);node('udcEast',6,1745,389);node('udcTurn',6,1606,310);node('udcSouth',6,1606,389);link('udcWestOutside','northLowerTurn');link('northWest','northCorner','northHall','udcTurn','udcSouth','udcEast');link('northLowerTurn','northLower');
node('westLobbyUpper',5,760,190);node('westLobby',5,470,375);node('westLobbyLower',5,465,569);node('westLift',5,983,430);node('westLiftSouth',5,983,725);node('westLobbyCross',5,795,375);node('westUpperLeft',5,470,190);link('udcWestOutside','westUpperLeft','westLobby','westLobbyLower');link('westUpperLeft','westLobbyUpper','westLobbyCross','westLobby');link('westLobbyCross','westLift','westLiftSouth');
node('suite108Upper',4,483,80);node('suite108West',4,483,290);node('suite108',4,1040,290);node('southWest',0,991,1170);node('southMiddle',0,1480,1170);node('audSouth',0,1700,1170);node('southEast',0,2120,1170);link('westLobbyLower','suite108Upper','suite108West','suite108','southWest','southMiddle','audSouth','southEast');link('westLiftSouth','southWest');
node('feldEntry',3,1395,192);node('feldFoyer',3,1378,413);node('feldHall',3,800,413);link('southEast','feldEntry');
node('atriumSouth',0,2568,1270);node('atriumWest',0,2120,1000);node('audEast',0,2120,650);node('atriumNorth',1,440,500);node('northRestroom',1,440,180);node('eastRestroom',1,704,500);node('businessEntry',1,1138,495);node('eastGalleryEntry',1,1260,500);link('atriumSouth','southEast','atriumWest','audEast','atriumNorth','eastRestroom','businessEntry','eastGalleryEntry');link('atriumNorth','northRestroom');
node('admissionsEntry',2,868,180);node('gradEntry',2,1265,180);link('atriumSouth','admissionsEntry','gradEntry');
node('admissionsHall',2,1190,407);node('admissionsReception',2,870,407);node('gradUpper',2,1320,278);node('gradHall',2,1320,419);node('gradLower',2,1320,537);node('gradLowerWest',2,1190,537);
node('businessWest',1,1040,395);node('businessInside',1,1138,420);node('menVestibule',1,805,396);node('eastGalleryInside',1,1430,412);node('eastGalleryNorth',1,1430,330);node('eastVestibule',1,1245,586);node('eastLiftHall',8,1635,725);node('eastLiftFront',8,1430,725);node('eastLiftApproach',8,1360,680);link('eastGalleryInside','eastGalleryNorth');link('eastRestroom','eastLiftApproach','eastLiftFront','eastLiftHall');
node('audFront',5,1136,200);node('audFrontUpper',5,1136,128);node('audStage',5,1080,582);node('audAisleSouth',5,1136,675);node('audAisleWest',5,1200,560);node('backstage',5,1010,128);node('audAccessInside',7,759,605);
// Interior graphs join the public network through their parent room's doorway.
export const interiorLinks=[['104','feldFoyer'],['feldFoyer','feldHall'],['102','admissionsReception'],['admissionsReception','admissionsHall'],['101','gradUpper'],['gradUpper','gradHall'],['gradHall','admissionsHall'],['gradHall','gradLower'],['gradLower','gradLowerWest'],['susilo','businessInside'],['businessInside','businessWest'],['restroom-m','menVestibule'],['185','eastGalleryInside'],['185A','eastVestibule'],['105','audAisleSouth'],['audAisleSouth','audAisleWest'],['audAisleWest','audFront'],['audFront','audFrontUpper'],['audAisleWest','audStage'],['105H','backstage'],['105D','audAccessInside']];
// Resolve small screenshot-registration offsets at shared doorway boundaries.
function alignNorth(id,image,z){const r=roomById[id],old=Math.min(...r.polygon.map(p=>p[1])),next=P(image,0,z)[1];r.polygon=r.polygon.map(([x,y])=>[x,Math.abs(y-old)<.01?next:y]);const d=r.doors[0];d.point[1]=next;d.inside[1]=next+1.05;d.outside[1]=next-1.1;}
alignNorth('185C',1,537);
// The freight car's rear threshold physically meets vestibule 185A.
const freightNorth=roomById['elevator-east-2'].doors[1];
roomById['185A'].polygon[2][1]=roomById['185A'].polygon[3][1]=freightNorth.point[1];
export const serviceConnections=[{from:'elevator-east-2',to:'185A',doorId:freightNorth.id,visitor:false},{from:'stairs-east',to:'184',doorId:'stairs-east:door2',visitor:false}];


roomById['184'].polygon=roomById['184'].polygon.map(([x,z])=>[x,Math.abs(z-P(1,0,486)[1])<.01?P(1,0,477)[1]:z]);const galleryDoor=roomById['184'].doors[0];galleryDoor.point=P(1,1697,477);galleryDoor.inside=P(1,1697,498);galleryDoor.outside=P(1,1697,455);
corridorNodes.atriumSouth=P(0,2568,1148);
const removeEdge=(a,b)=>{const i=corridorEdges.findIndex(e=>e[0]===a&&e[1]===b);if(i>=0)corridorEdges.splice(i,1);};
removeEdge('westLobbyCross','westLobby');removeEdge('westLobbyCross','westLift');
node('westStairBottom',5,795,569);node('westLiftBase',5,795,725);link('westLobby','westLobbyLower','westStairBottom','westLobbyCross');link('westStairBottom','westLiftBase','westLiftSouth');
roomById['194A'].doors[0].node='westLobbyCross';roomById['194A'].doors[0].via=[P(5,795,513)];
interiorLinks.splice(interiorLinks.findIndex(([a,b])=>a==='audAisleWest'&&b==='audStage'),1);node('stageFoot',5,983,582);link('westLift','stageFoot','audStage');
for(const r of rooms)for(const d of r.doors)if(['northHall','northLower','northWest','feldHall','suite108','admissionsHall','gradUpper','gradLower'].includes(d.node)){const source=corridorNodes[d.node];d.via=d.normal[0]?[[source[0],d.outside[1]]]:[[d.outside[0],source[1]]];}
for(const id of ['108K','108J','108I','108L']){const d=roomById[id].doors[0];d.node='suite108West';d.via=[[corridorNodes.suite108West[0],d.outside[1]]];}
for(const id of ['101E','101F','101G']){const d=roomById[id].doors[0];d.via=[[d.outside[0],corridorNodes.gradLower[1]]];}


// The west 115 door is outward-only; all incoming north-wing routes use 113.
node('passage113Approach',14,1240,650);node('passage113Turn',14,1240,503);node('passage113Inner',14,950,503);
node('conferenceEastApproach',14,1107,475);node('conferenceWestApproach',14,705,475);
node('lounge115Approach',14,440,350);node('reception115Approach',14,620,480);
node('officeHours150Approach',14,1457,650);node('northRestroom',14,1690,301);node('womenVestibule',14,1580,301);
link('udcEast','conferenceWestApproach');link('udcTurn','lounge115Approach');link('udcSouth','reception115Approach');
interiorLinks.push(['udc:door1:inside','northWest'],['udc:door2:inside','udcEast'],['113:door1:inside','passage113Inner'],['113:door2:inside','passage113Turn'],['passage113Turn','passage113Inner'],['passage113Inner','conferenceEastApproach'],['restroom-w-vestibule','womenVestibule']);

// October 15 circulation corrections. Exit-only ports are directed in routing.js.
const disconnect=(a,b)=>{for(const list of [corridorEdges,interiorLinks])for(let i=list.length-1;i>=0;i--)if((list[i][0]===a&&list[i][1]===b)||(list[i][0]===b&&list[i][1]===a))list.splice(i,1);};
disconnect('westLobbyLower','suite108Upper');disconnect('suite108','southWest');
node('feldWest',3,200,413);link('feldHall','feldWest');
interiorLinks.push(['108:door3:inside','suite108']);
interiorLinks.push(['108:door1:inside','suite108Upper'],['108:door2:inside','suite108']);
roomById['108'].doors[2].via=[P(3,200,417)];
// Stable physical location IDs retain saved links after the department move.
for(const r of rooms){if(r.sourceImage===6&&r.id!=='udc')r.department='Undergraduate Development Center';if(r.suite==='101'||r.suite==='102')r.department='Graduate Admissions & Financial Aid';if(r.suite==='108')r.department='Feld Center';}
for(let i=interiorLinks.length-1;i>=0;i--)if(interiorLinks[i].some(id=>id.startsWith('aud')||id==='105'||id==='105H'||id==='105D'))interiorLinks.splice(i,1);
disconnect('westLift','stageFoot');disconnect('stageFoot','audStage');
node('audFront',9,440,135);node('audFrontUpper',9,440,68);node('backstage',9,305,68);node('audStage',9,354,373);
node('stageFoot',9,305,373);link('westLift','stageFoot','audStage');
node('audSouth',9,785,493);node('audAisleSouth',9,785,444);node('audAisleWest',9,400,444);node('audFrontLower',9,440,355);
node('audUpperRear',9,838,135);node('audLowerRear',9,838,355);
node('audFoyerUpper',9,980,140);node('audFoyerMiddle',9,980,190);node('audFoyerLower',9,980,350);
node('audEastUpper',9,1040,125);node('audEastLower',9,1040,352);link('audEast','audEastUpper','audEastLower','atriumWest');
interiorLinks.push(['105:door1:inside','audAisleSouth'],['audAisleSouth','audAisleWest'],['audAisleWest','audFrontLower'],['audFrontLower','audFront'],['audFront','audFrontUpper'],['audFront','audUpperRear'],['audFrontLower','audLowerRear'],['105:door2:inside','audUpperRear'],['105:door3:inside','audLowerRear'],['105H','backstage'],['105D','audFoyerUpper'],['audFoyerUpper','audFoyerMiddle'],['audFoyerMiddle','audFoyerLower'],['105A','audFoyerLower']);
roomById['105G'].doors[0].via=[P(9,400,120)];
// The sculpture occupies the middle; both sides are walkable directly across the atrium.
node('atriumDirectWest',10,280,245);node('atriumStairFoot',0,2573,555);node('atriumDirectEast',10,560,245);
node('atriumWestClear',10,280,150);
roomById['stairs-main'].doors[0].node='atriumStairFoot';
link('atriumSouth','atriumDirectWest','atriumWestClear','atriumStairFoot','atriumNorth');link('atriumSouth','atriumDirectEast','atriumStairFoot');
node('eastLiftFront',10,690,157);node('eastLiftHall',10,790,157);node('eastLiftApproach',10,660,125);
node('eastStairApproach',10,690,350);node('eastStairDoor',10,899,350);link('admissionsEntry','eastStairApproach','eastStairDoor');
link('atriumDirectEast','eastLiftFront');interiorLinks.push(['east-lift-lobby','eastLiftHall']);

// Split each DECLARED straight hall at its authored door approaches. This avoids
// star-graph backtracking without snapping any new room onto an arbitrary hall.
const removeLink=(a,b)=>{for(const list of [corridorEdges,interiorLinks]){const i=list.findIndex(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a));if(i>=0)list.splice(i,1);}};
roomById['101D'].doors[0].node='gradHall';roomById['101D'].doors[0].via=[P(2,1320,493)];
node('gradAcross',2,1320,407);removeLink('admissionsReception','admissionsHall');removeLink('gradHall','admissionsHall');link('gradAcross','gradHall');
function joinHall(key,base,doorNodes,axis){
 const ports=doors.filter(d=>doorNodes.includes(d.node)&&d.via.length),junctions=[...base];
 for(const d of ports){const id=`hall:${key}:${d.id}`;corridorNodes[id]=d.via[0];d.node=id;d.via=d.via.slice(1);junctions.push(id);}
 junctions.sort((a,b)=>corridorNodes[a][axis]-corridorNodes[b][axis]);
 for(let i=1;i<base.length;i++)removeLink(base[i-1],base[i]);link(...junctions);
}
joinHall('feld',['feldHall','feldFoyer'],['feldHall'],0);
joinHall('north',['northCorner','northHall','udcTurn'],['northHall'],0);
joinHall('northLower',['northLowerTurn','northLower'],['northLower'],0);
joinHall('northWest',['northCorner','northWest'],['northWest'],1);
joinHall('108',['suite108West','suite108'],['suite108'],0);
joinHall('108west',['suite108Upper','suite108West'],['suite108West'],1);
joinHall('admissions',['admissionsReception','admissionsHall','gradAcross'],['admissionsHall'],0);
joinHall('gradVertical',['gradUpper','gradHall','gradLower'],['gradUpper','gradHall'],1);
joinHall('gradLower',['gradLowerWest','gradLower'],['gradLower'],0);
for(const r of rooms)r.door=r.doors[0]?.point||r.center;
const partition=(image,a,b)=>({a:P(image,...a),b:P(image,...b),height:2.8});
export const extraPartitions=[partition(3,[1334,222],[1514,222]),partition(3,[1514,222],[1514,445]),partition(2,[774,214],[1044,214]),partition(2,[1291,214],[1291,347]),partition(4,[459,70],[514,70]),partition(9,[850,25],[1010,25]),partition(9,[1010,25],[1010,455]),partition(9,[850,455],[1010,455]),partition(1,[881.5,351],[881.5,444]),partition(14,[830,452],[830,557]),partition(14,[830,557],[1138,557]),partition(6,[420,527],[471,527])];
// Windows lower the rendered wall to a sill, but remain solid route barriers.
export const windows=[['conference-114',14,[862,442],[1025,442]],['office-hours-150',14,[1318,458],[1318,565]],['office-150A',14,[1500,610],[1535,610]]].map(([id,image,a,b])=>{const start=P(image,...a),end=P(image,...b),dx=end[0]-start[0],dz=end[1]-start[1],width=Math.hypot(dx,dz);return{id,a:start,b:end,point:[(start[0]+end[0])/2,(start[1]+end[1])/2],normal:[-dz/width,dx/width],width,sillHeight:.65,height:2.8};});
const walls=rooms.filter(r=>r.height>.3).flatMap(r=>r.polygon.map((a,i)=>({a,b:r.polygon[(i+1)%r.polygon.length],height:r.height,roomId:r.id}))),seenWalls=new Set();
export const wallSegments=[...walls,...extraPartitions].flatMap(w=>splitWall(w.a,w.b,doors).map(segment=>({...w,...segment}))).flatMap(w=>{
 const glass=windows.filter(g=>projectOnSegment(g.a,w.a,w.b).distance<.01&&projectOnSegment(g.b,w.a,w.b).distance<.01);
 return glass.length?[...splitWall(w.a,w.b,glass).map(segment=>({...w,...segment})),...glass.map(g=>({...w,a:g.a,b:g.b,height:g.sillHeight,windowId:g.id}))]:[w];
}).filter(w=>{const key=[w.a,w.b].map(p=>p.map(n=>n.toFixed(2)).join(',')).sort().join('|');if(seenWalls.has(key))return false;seenWalls.add(key);return true;});
export const sculptureCenter=P(10,355,158),sceneCenter=[90.5,40];
