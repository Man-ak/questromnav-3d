import { cadPoint as P } from './questromMapData.js';

// Reception footprint follows the CAD. Couch and meeting furnishings are schematic.
export const undergraduateCounter=[[490,397],[523,397],[523,583],[389,583],[389,557],[490,557]].map(p=>P(14,...p));
export const undergraduateCounterParts=[[490,397,33,186],[389,557,101,26]].map(([x,z,w,d])=>({center:P(14,x+w/2,z+d/2),w:w*.75/20,d:d*.75/20}));
export const lounge115Sofa={center:P(14,648,240),rotation:Math.PI/2,w:3.4,d:1.5};
export const officeHoursTables=[[1205,388],[1385,388],[1400,535]].map(p=>P(14,...p));
