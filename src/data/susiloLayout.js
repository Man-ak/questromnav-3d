import { cadPoint as P } from './questromMapData.js';

// Counter outline and west-wall storage footprint from the supplied CAD.
// Finishes, equipment and shelf contents are a basic layout pending office photos.
export const receptionFootprint=[[1087,370],[1199,370],[1199,444],[1177,444],[1177,392],[1087,392]].map(p=>P(1,...p));
export const receptionSegments=[[1087,370,112,22],[1177,392,22,52]].map(([x,z,w,d])=>({position:P(1,x+w/2,z+d/2),w:w/20,d:d/20}));
export const susiloShelf={position:P(1,1103,190),w:.7,d:7.3,height:2.65};
