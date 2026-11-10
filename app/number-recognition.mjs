import {assessDigit,pixelsFromCanvas} from './recognition.mjs';

// Segment the visible ink, independently of the question or expected answer.
export function readNumber(canvas,model){
 const {width:w,height:h}=canvas,data=canvas.getContext('2d').getImageData(0,0,w,h).data;
 const columns=Array(w).fill(0);let left=w,right=-1,top=h,bottom=-1;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>50){columns[x]++;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 if(right<left)return {accepted:false,reason:'blank'};
 const height=bottom-top+1;
 function segment(x0,x1){
  const part=document.createElement('canvas');part.width=x1-x0+1;part.height=h;part.getContext('2d').drawImage(canvas,x0,0,part.width,h,0,0,part.width,h);
  const pixels=pixelsFromCanvas(part);return pixels?assessDigit(pixels,model):{accepted:false};
 }
 function tallEnough(x0,x1){let y0=h,y1=-1;for(let y=top;y<=bottom;y++)for(let x=x0;x<=x1;x++)if(data[(y*w+x)*4+3]>50){y0=Math.min(y0,y);y1=Math.max(y1,y);}return y1-y0+1>=height*.55;}
 const gaps=[];
 for(let x=left+1;x<right;x++){if(columns[x])continue;const start=x;while(x<right&&!columns[x])x++;if(x-start>=2)gaps.push({x:Math.floor((start+x)/2),width:x-start});}
 const plausible=gaps.filter(g=>tallEnough(left,g.x)&&tallEnough(g.x+1,right));
 if(plausible.length){
  // Prefer a genuine space. Do not silently reinterpret an unclear pair as one digit.
  const candidates=plausible.map(g=>({parts:[segment(left,g.x),segment(g.x+1,right)],gap:g.width})).filter(c=>c.parts.every(p=>p.accepted));
  if(!candidates.length)return {accepted:false,reason:'unclear-pair'};
  candidates.sort((a,b)=>b.gap-a.gap);return result(candidates[0].parts);
 }
 // Touching digits are only split at a thin bridge, with tall ink on both sides.
 // If no reliable separation exists, retain the single-digit check rather than inventing a split.
 if((right-left+1)/height>1.05){
  const cuts=[];for(let x=Math.round(left+(right-left)*.25);x<left+(right-left)*.75;x++){
   if(columns[x]<=Math.max(2,height*.08)&&tallEnough(left,x)&&tallEnough(x+1,right))cuts.push(x);
  }
  for(const x of cuts.sort((a,b)=>columns[a]-columns[b])){const parts=[segment(left,x),segment(x+1,right)];if(parts.every(p=>p.accepted))return result(parts);}
 }
 return result([segment(left,right)]);
}
function result(parts){return parts.every(p=>p.accepted)?{accepted:true,text:parts.map(p=>p.digit).join(''),digits:parts}: {accepted:false,reason:'unclear-digit'};}
