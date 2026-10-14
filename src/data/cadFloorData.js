import { polygonBounds, splitWall } from '../lib/geometry.js';
/** CAD screenshots supplied October 14, 2026. Offsets register overlapping walls.
 * Units are drawing units, not meters. Heights are illustrative. 101H is removed.
 * Original screenshots are private working references and are not shipped.
 */
export const mapSource='https://questromapps.bu.edu/maps/images/1new.png';
export const mapRevision={date:'2026-10-14',source:'Eight user-supplied CAD screenshots',scale:'20 registered pixels per drawing unit',omitted:['101H'],heightVerified:false};
const offsets={0:[0,0],1:[2014,47],2:[1968,991],3:[868,979],4:[-49,983],5:[0,416],6:[0,0],7:[1175,34],8:[1653,77]};
export const cadPoint=(image,x,z)=>[(x+offsets[image][0]-224)/20,(z+offsets[image][1]-105)/20];
const P=cadPoint,R=(x,z,w,d)=>[[x,z],[x+w,z],[x+w,z+d],[x,z+d]];
export const categories={academic:{label:'Learning spaces',color:'#b9cfcc',ink:'#3c6660'},center:{label:'Student centers',color:'#b9c9a7',ink:'#527046'},office:{label:'Offices',color:'#e0cbb5',ink:'#8a6946'},amenity:{label:'Amenities',color:'#c0cfdf',ink:'#52708e'},entrance:{label:'Entrances',color:'#d9dfd6',ink:'#617458'}};
export const footprint=[[0,0],[181.5,0],[181.5,63],[179,63],[179,81],[149,81],[149,78],[115,78],[115,82],[89,82],[89,79],[0,79],[0,41],[-5,41],[-5,28],[0,28]];
export const rooms=[];
const door=(x,z,nx,nz,node,width=40,extra={})=>({x,z,normal:[nx,nz],node,width,...extra});
function add(id,type,image,polygon,specs=[],meta={}){
 const shape=polygon.map(p=>P(image,...p)),b=polygonBounds(shape),room={id,type,number:/^\d/.test(id)?id:'',floor:1,name:/^\d/.test(id)?`Office ${id}`:id,polygon:shape,center:[(b.minX+b.maxX)/2,(b.minZ+b.maxZ)/2],height:2.8,label:[id],description:'A first-floor space traced from the supplied CAD close-ups.',hours:'Hours vary · confirm with the department',verified:'Door position traced from supplied CAD screenshots',sourceImage:image,...meta};
 room.doors=specs.map((d,i)=>{const point=P(image,d.x,d.z),normal=d.normal;return{id:`${id}:door${i+1}`,roomId:id,point,normal,width:d.width/20,node:d.node,kind:d.kind||'single',inside:d.inside?P(image,...d.inside):[point[0]-normal[0]*1.05,point[1]-normal[1]*1.05],outside:[point[0]+normal[0]*1.1,point[1]+normal[1]*1.1],via:(d.via||[]).map(p=>P(image,...p)),routable:d.routable!==false};});
 room.door=room.doors[0]?.point||room.center;room.routable=room.doors.some(d=>d.node&&d.routable);if(!room.routable)room.routeNote='The supplied crops do not establish a complete door connection for this space. Confirm it before routing.';rooms.push(room);return room;
}
const box=(id,type,image,x,z,w,d,specs,meta)=>add(id,type,image,R(x,z,w,d),specs,meta);
// North wing: traced widths and alternating doorway positions.
for(const[id,l,r,dx]of [['136',261,337,315],['134',344,424,364],['132',431,508,486],['130',516,594,536],['128',603,681,660],['126',688,774,752],['124B',781,861,802],['124A',868,949,927],['122',957,1090,1067],['120',1098,1192,1119],['118',1199,1310,1288],['116',1318,1431,1339],['115B',1439,1533,1511]])box(id,'office',6,l,139,r-l,137,[door(dx,276,0,1,'northHall')],{furniture:'none'});
for(const[id,x,z,w,d,dx,dz,nx,nz]of [['133',478,346,115,89,570,346,0,-1],['129A',600,368,120,68,701,368,0,-1],['135',478,442,115,85,493,527,0,1],['129',600,442,173,85,751,527,0,1],['125A',779,346,65,132,800,346,0,-1],['123',854,345,116,133,874,345,0,-1],['121',977,345,114,133,1070,345,0,-1],['119',1104,345,105,133,1124,345,0,-1],['119A',1216,345,101,133,1295,345,0,-1],['117',1325,378,114,100,1346,378,0,-1],['115A',1471,346,101,132,1492,346,0,-1],['140A',240,367,171,89,411,434,1,0],['138',240,465,171,128,411,489,1,0]])box(id,'office',6,x,z,w,d,[door(dx,dz,nx,nz,['135','129'].includes(id)?'northLower':['138','140A'].includes(id)?'northWest':'northHall')],{furniture:'none'});
box('117A','office',6,1325,346,57,26,[door(1354,346,0,-1,'northHall',32)],{furniture:'none'});
box('127','office',6,780,487,64,40,[],{name:'Room 127',furniture:'none'});
add('114','academic',7,[[509,106],[848,106],[848,303],[814,303],[814,339],[597,339],[597,303],[509,303]],[door(535,303,0,1,'udcEast'),door(829,303,0,1,null,42,{routable:false})],{name:'Gaffey Conference Room',label:['GAFFEY CONFERENCE','114'],furniture:'conference',description:'Gaffey Conference Room with its recessed front window and two visible doors. The second doorway is shown but its onward corridor connection remains unconfirmed.'});
box('113','office',7,628,346,219,77,[door(628,384,-1,0,'udcEast',65,{kind:'double'})],{furniture:'none'});
add('udc','center',6,[[420,280],[1659,280],[1659,340],[1590,340],[1590,477],[851,477],[851,338],[770,338],[770,358],[596,358],[596,338],[471,338],[471,527],[420,527]],[door(440,527,0,1,'northWest',42,{kind:'open'})],{name:'Undergraduate Development Center',short:'Undergraduate Center',number:'115',label:['UNDERGRADUATE CENTER','115 · 140'],height:0,featured:true,aliases:['140','undergraduate development','advising'],center:P(6,1598,414)});
// West lobby and the 108 suite, with two separate suite approaches.
box('silber-entrance','entrance',5,124,260,139,230,[door(263,376,1,0,'westLobby',150,{kind:'double'})],{number:'197',name:'Silber Way Entrance',label:['SILBER WAY','197'],height:0,aliases:['exit','side door']});
box('west-lobby','entrance',5,275,202,311,335,[door(440,537,0,1,'westLobby',100,{kind:'open'})],{name:'West Lobby',number:'193',label:['WEST LOBBY','193'],height:0});
box('stairs-west','amenity',5,610,212,110,263,[door(706,212,0,-1,'westLobbyUpper',70,{kind:'double'})],{name:'West Staircase',number:'194',label:['STAIR','194'],furniture:'stairs',height:2.2});
box('194A','amenity',5,611,479,109,64,[door(720,513,1,0,'westLobby',45)],{name:'Stair Landing 194A',label:['194A'],furniture:'none'});
for(let i=0;i<3;i++)box(i===0?'elevator-west':`elevator-west-${i+1}`,'amenity',5,850,272+i*105,99,91,[door(949,318+i*105,1,0,'westLift',40,{kind:'lift'})],{name:`West Elevator ${String.fromCharCode(65+i)}`,number:`193${String.fromCharCode(65+i)}`,label:[`193${String.fromCharCode(65+i)}`,'↕'],height:3.2,aliases:['elevator','lift'],furniture:'lift'});
box('193E','amenity',5,850,594,110,108,[door(890,702,0,1,'southWest',40)],{name:'West Service Room 193E',label:['193E'],furniture:'none'});
add('108','center',4,[[459,70],[514,70],[514,249],[821,249],[821,220],[1073,220],[1073,444],[1008,444],[1008,326],[514,326],[514,338],[459,338]],[door(483,70,0,-1,'westLobbyLower',48),door(1040,220,0,-1,'southWest',45)],{name:'Undergraduate Suite',short:'Room 108',label:['OFFICE SUITE 108','112 · 110'],height:0,aliases:['110','112'],center:P(4,745,287)});
for(const[l,x,z,w,d,dx,dz,nx,nz]of [['H',518,80,97,168,589,248,0,1],['F',620,80,94,168,690,248,0,1],['D',720,80,100,168,793,248,0,1],['B',946,220,70,30,969,250,0,1],['K',296,132,157,109,453,154,1,0],['J',296,246,157,87,453,270,1,0],['I',307,340,211,129,489,340,0,-1],['G',522,326,109,144,550,326,0,-1],['E',638,326,117,111,668,326,0,-1],['C',760,326,113,111,787,326,0,-1],['A',879,326,128,111,900,326,0,-1]])box('108'+l,'office',4,x,z,w,d,[door(dx,dz,nx,nz,'suite108')],{suite:'108',furniture:l==='I'?'conference':l==='B'?'none':'office'});
box('108L','office',5,237,552,167,132,[door(404,611,1,0,'suite108Upper',44)],{suite:'108',furniture:'office'});
// Feld public corridors and individually gated offices.
add('104','academic',3,[[95,385],[1334,385],[1334,222],[1514,222],[1514,445],[95,445]],[door(1395,222,0,-1,'feldEntry',75,{kind:'double',inside:[1378,247]})],{name:'Feld Center',short:'Feld Center',label:['FELD CENTER · 104'],height:0,featured:true,center:P(3,1390,345),description:'Feld Center reception and its connected office corridors.'});
for(const[l,x,z,w,d,dx,dz,nx,nz]of [['S',164,226,77,157,184,383,0,1],['R',246,226,75,157,302,383,0,1],['O',327,226,111,157,377,383,0,1],['M',446,226,182,157,471,383,0,1],['K',638,226,139,157,748,383,0,1],['J',782,226,95,157,858,383,0,1],['H',884,226,111,115,965,341,0,1],['G',1003,226,116,115,1025,341,0,1],['E',1125,226,96,157,1196,383,0,1],['C',1229,226,100,157,1303,383,0,1],['Q',107,449,213,133,298,449,0,-1],['P',327,449,111,147,349,449,0,-1],['N',449,449,108,103,471,449,0,-1],['L',564,449,109,103,585,449,0,-1],['I',681,449,190,106,843,449,0,-1],['D',1125,449,149,133,1245,449,0,-1],['B',1281,449,105,133,1305,449,0,-1],['A',1394,449,120,133,1485,449,0,-1]])box('104'+l,'office',3,x,z,w,d,[door(dx,dz,nx,nz,'feldHall',l==='O'?80:40,{kind:l==='O'?'open':'single'})],{suite:'104',furniture:l==='O'?'storage':l==='M'?'conference':'office'});
add('104F','office',3,[[878,449],[1119,449],[1119,583],[1150,583],[1150,694],[821,694],[821,556],[878,556]],[door(999,449,0,-1,'feldHall',235,{kind:'open'})],{suite:'104',furniture:'conference',label:['104F'],center:P(3,990,610)});
// Admissions: no 101H room, walls, door, furniture, label, or search alias.
box('main-entrance','entrance',2,466,497,261,126,[door(595,497,0,-1,'atriumSouth',225,{kind:'double'})],{name:'Main Entrance',number:'180',label:['MAIN ENTRANCE','180'],height:0,featured:true,aliases:['exit','commonwealth','front door']});
add('102','center',2,[[774,214],[1044,214],[1044,374],[1157,374],[1157,435],[774,435]],[door(868,214,0,-1,'admissionsEntry',74,{kind:'double'})],{name:'Admissions Reception',short:'Admissions Reception',label:['ADMISSIONS','102'],height:0,center:P(2,875,335)});
add('101','center',2,[[1291,214],[1346,214],[1346,307],[1354,307],[1354,374],[1372,374],[1372,566],[1128,566],[1128,435],[1157,435],[1157,374],[1234,374],[1234,396],[1280,396],[1280,347],[1291,347]],[door(1291,230,-1,0,'gradEntry',42)],{name:'Graduate Admissions & Financial Aid',short:'Graduate Admissions',label:['GRADUATE ADMISSIONS','101 · 101J'],height:0,featured:true,center:P(2,1320,425),aliases:['101J'],description:'Graduate admissions and financial aid, with open circulation in place of the removed office partition.'});
for(const[id,x,z,w,d,dx,dz,nx,nz]of [['102A',1016,435,108,133,1095,435,0,-1],['102B',897,435,113,133,925,435,0,-1],['102C',774,435,118,133,869,435,0,-1],['102D',1048,214,106,155,1072,369,0,1],['102E',975,214,66,160,1008,374,0,1],['101A',1159,242,121,127,1212,369,0,1],['101B',1346,192,150,109,1346,278,-1,0],['101C',1354,308,142,61,1354,344,-1,0],['101D',1372,377,115,137,1372,493,-1,0],['101E',1372,522,102,162,1372,542,-1,0],['101F',1254,566,110,116,1326,566,0,-1],['101G',1134,566,114,116,1211,566,0,-1],['101I',1236,352,44,44,1258,396,0,1]]){const node=['101B','101C'].includes(id)?'gradUpper':['101E','101F','101G'].includes(id)?'gradLower':'admissionsHall';box(id,'office',2,x,z,w,d,[door(dx,dz,nx,nz,node,id==='102E'?60:id==='101C'?38:40,{kind:['102E','101C'].includes(id)?'open':'single'})],{suite:id.slice(0,3),furniture:id==='101I'?'none':id==='101A'?'kitchen':'office'});}
box('182A','amenity',2,1494,374,59,193,[],{name:'Service Passage 182A',label:['182A'],furniture:'none'});
box('198','amenity',2,1562,68,274,537,[],{name:'Room 198',label:['198'],description:'Large space visible in the east crop. Its entrance is unconfirmed, so it is excluded from wayfinding.',furniture:'none'});
// Atrium, business center, east lifts and stair cores.
add('150','office',1,[[25,253],[281,253],[281,452],[155,452],[155,333],[25,333]],[door(260,452,0,1,'atriumNorth')],{furniture:'none'});
box('150A','office',1,289,291,87,163,[door(376,399,1,0,'atriumNorth')],{furniture:'none'});
add('restroom-w','amenity',1,[[24,96],[389,96],[389,174],[297,174],[297,227],[24,227]],[door(389,151,1,0,'northRestroom')],{number:'189',name:'Women’s Restroom',label:['WOMEN','189'],aliases:['bathroom','toilet','women','189'],furniture:'restroom'});
add('restroom-m','amenity',1,[[741,196],[998,196],[998,344],[828,344],[828,443],[741,443]],[door(741,395,-1,0,'eastRestroom')],{number:'187',name:'Men’s Restroom',label:['MEN','187'],aliases:['bathroom','toilet','men','187'],center:P(1,868,267),furniture:'restroom'});
box('187B','amenity',1,833,351,45,92,[door(833,396,-1,0,'menVestibule',36)],{name:'Room 187B',furniture:'none'});
add('susilo','center',1,[[1092,96],[1266,96],[1266,301],[1299,301],[1299,444],[1177,444],[1177,455],[1092,455],[1092,444],[1007,444],[1007,351],[1092,351]],[door(1138,455,0,1,'businessEntry',70,{kind:'double'})],{number:'186',name:'Susilo Business Center',short:'Susilo Business Center',label:['SUSILO BUSINESS','CENTER · 186'],center:P(1,1180,265),featured:true,hours:'Monday–Friday · 9:00 AM–5:00 PM',hoursSource:'https://questromworld.bu.edu/susilobusinesscenter/',furniture:'business',description:'Course packets, copying, and lost-and-found services. Room 186 with its internal 186A office.'});
box('186A','office',1,885,351,122,93,[door(1007,395,1,0,'businessWest')],{suite:'186',furniture:'office'});
box('188','office',1,1277,72,465,218,[door(1322,290,0,1,'eastGalleryInside')],{label:['188'],furniture:'none'});
add('185','office',1,[[1305,303],[1741,303],[1741,477],[1681,477],[1681,537],[1305,537]],[door(1305,495,-1,0,'eastGalleryEntry',70,{kind:'double'})],{name:'Room 185 · East Gallery',label:['EAST GALLERY','185'],furniture:'none'});
box('185C','office',1,1305,544,73,66,[door(1344,544,0,-1,'eastGalleryInside',40)],{furniture:'none'});
add('184','amenity',1,[[1385,544],[1681,544],[1681,486],[1808,486],[1808,618],[1469,618],[1469,570],[1385,570]],[door(1697,486,0,-1,'eastGalleryInside',40)],{name:'East Passage 184',label:['184'],furniture:'none'});
box('185A','amenity',1,1206,536,84,94,[door(1230,536,0,-1,'eastGalleryEntry',40)],{name:'East Vestibule 185A',label:['185A'],height:0,furniture:'none'});
box('185B','office',1,1099,554,107,56,[door(1206,586,1,0,'eastVestibule')],{furniture:'none'});
for(let i=0;i<2;i++)box(i===0?'elevator-east':'elevator-east-2','amenity',8,1467+i*104,607,95,89,[door(1514+i*104,696,0,1,'eastLiftHall',45,{kind:'lift'})],{name:`East Elevator ${i?'B':'A'}`,number:`181${i?'B':'A'}`,label:[`181${i?'B':'A'}`,'↕'],height:3.2,furniture:'lift',aliases:['elevator','lift']});
box('stairs-east','amenity',8,1694,642,43,98,[door(1694,718,-1,0,'eastLiftHall',34)],{name:'East Staircase',number:'183A',label:['STAIR','183A'],furniture:'stairs'});
box('stairs-main','amenity',1,478,235,162,253,[door(559,488,0,1,'atriumNorth',140,{kind:'open'})],{name:'Main Staircase',number:'181J',label:['MAIN STAIR','181J'],furniture:'stairs',height:0});
box('atrium','entrance',0,2075,555,970,575,[door(2568,1130,0,1,'atriumSouth',100,{kind:'open'})],{name:'Chiles Atrium',short:'Atrium & Main Staircase',label:['CHILES ATRIUM','181'],height:0,featured:true,center:P(0,2570,925),furniture:'atrium'});
// Auditorium cutaway, fan seating and observed south entrance.
add('105','academic',5,[[1110,83],[1765,62],[1803,196],[1895,235],[1895,545],[1803,568],[1765,702],[1110,702],[1110,570],[1035,570],[1035,531],[1027,510],[1027,265],[1110,238]],[door(1700,702,0,1,'audSouth',76,{kind:'double',inside:[1700,676]})],{name:'Auditorium',short:'Auditorium 105',label:['AUDITORIUM','105'],color:'#d6aaa5',height:3.3,featured:true,capacity:373,hours:'Access follows scheduled classes and events',center:P(5,1480,395),furniture:'auditorium',description:'Auditorium 105 with fan-shaped seating, curved stage, perimeter aisles and a CAD-traced south entrance.'});
box('105G','amenity',5,1034,158,76,82,[door(1110,200,1,0,'audFront',40)],{name:'Auditorium Support 105G',label:['105G'],furniture:'none'});
box('105F','amenity',5,1034,610,76,85,[door(1080,610,0,-1,'audStage',40)],{name:'Auditorium Support 105F',label:['105F'],furniture:'none'});
box('105H','amenity',5,970,87,140,64,[door(1110,128,1,0,'audFrontUpper',40)],{name:'Backstage Passage 105H',label:['105H'],furniture:'none'});
box('105E','amenity',5,850,87,120,96,[door(970,128,1,0,'backstage',44)],{name:'Auditorium Support 105E',label:['105E'],furniture:'none'});
add('105D','amenity',7,[[633,438],[844,438],[844,551],[875,551],[875,632],[724,632],[724,555],[633,555]],[door(875,592,1,0,'audEast',73,{kind:'double'})],{name:'Auditorium Upper Access',number:'105D',label:['105D'],furniture:'stairs'});
box('105B','amenity',8,247,598,148,143,[door(269,598,0,-1,'audAccessInside',40)],{name:'Auditorium Support 105B',label:['105B'],furniture:'none'});
box('105C','amenity',8,247,741,148,90,[],{name:'Auditorium Support 105C',label:['105C'],furniture:'none',description:'This support space is cropped below the supplied views; its door connection remains unconfirmed.'});
export const roomById=Object.fromEntries(rooms.map(r=>[r.id,r])),featuredIds=['105','udc','susilo','104','101'],doors=rooms.flatMap(r=>r.doors);
export const corridorNodes={},corridorEdges=[];
const node=(id,image,x,z)=>corridorNodes[id]=P(image,x,z),link=(...ids)=>{for(let i=1;i<ids.length;i++)corridorEdges.push([ids[i-1],ids[i]]);};
node('northHall',6,900,310);node('northWest',6,441,565);node('northCorner',6,441,310);node('northLower',6,737,548);node('northLowerTurn',6,441,548);node('udcEast',6,1745,389);node('udcTurn',6,1606,310);node('udcSouth',6,1606,389);link('northWest','northLowerTurn','northCorner','northHall','udcTurn','udcSouth','udcEast');link('northLowerTurn','northLower');
node('westLobbyUpper',5,760,190);node('westLobby',5,470,375);node('westLobbyLower',5,465,569);node('westLift',5,983,430);node('westLiftSouth',5,983,725);node('westLobbyCross',5,795,375);node('westUpperLeft',5,470,190);link('northWest','westUpperLeft','westLobby','westLobbyLower');link('westUpperLeft','westLobbyUpper','westLobbyCross','westLobby');link('westLobbyCross','westLift','westLiftSouth');
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
alignNorth('185C',1,537);alignNorth('105B',8,589);
const room188=roomById['188'];room188.polygon[2][1]=room188.polygon[3][1]=P(1,0,303)[1];room188.doors[0].point=P(1,1322,303);room188.doors[0].inside=P(1,1322,282);room188.doors[0].outside=P(1,1322,325);
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
roomById['114'].doors[0].via=[P(6,1745,358),P(7,535,325)];
roomById['105F'].doors[0].inside=P(5,1080,638);
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
joinHall('northWest',['northCorner','northLowerTurn','northWest'],['northWest'],1);
joinHall('108',['suite108West','suite108'],['suite108'],0);
joinHall('108west',['suite108Upper','suite108West'],['suite108West'],1);
joinHall('admissions',['admissionsReception','admissionsHall','gradAcross'],['admissionsHall'],0);
joinHall('gradVertical',['gradUpper','gradHall','gradLower'],['gradUpper','gradHall'],1);
joinHall('gradLower',['gradLowerWest','gradLower'],['gradLower'],0);
for(const r of rooms)r.door=r.doors[0]?.point||r.center;
const partition=(image,a,b)=>({a:P(image,...a),b:P(image,...b),height:2.8});
export const extraPartitions=[partition(3,[1334,222],[1514,222]),partition(3,[1514,222],[1514,445]),partition(2,[774,214],[1044,214]),partition(2,[1291,214],[1291,347]),partition(4,[459,70],[514,70])];
const walls=rooms.filter(r=>r.height>.3).flatMap(r=>r.polygon.map((a,i)=>({a,b:r.polygon[(i+1)%r.polygon.length],height:r.height,roomId:r.id}))),seenWalls=new Set();
export const wallSegments=[...walls,...extraPartitions].flatMap(w=>splitWall(w.a,w.b,doors).map(segment=>({...w,...segment}))).filter(w=>{const key=[w.a,w.b].map(p=>p.map(n=>n.toFixed(2)).join(',')).sort().join('|');if(seenWalls.has(key))return false;seenWalls.add(key);return true;});
export const sculptureCenter=P(0,2570,925),sceneCenter=[90.5,40];
