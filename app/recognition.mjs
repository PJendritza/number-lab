let modelPromise;
export function loadModel(){return modelPromise??=Promise.all(['digits.json','digit-shapes.json'].map(name=>fetch(new URL(`./models/${name}`,import.meta.url)).then(r=>{if(!r.ok)throw Error('Model unavailable');return r.json();}))).then(([model,shapes])=>({...model,shapes:decodeShapes(shapes)})).catch(e=>{modelPromise=null;throw e;});}
export const decodeShapes=groups=>groups.map(group=>group.map(hex=>Float32Array.from(hex,c=>parseInt(c,16)/15)));
export function predict(pixels,model){let values=pixels;for(let layer=0;layer<model.weights.length;layer++){values=model.weights[layer].map((row,i)=>{let n=model.biases[layer][i];for(let j=0;j<row.length;j++)n+=row[j]*values[j];return layer===0?Math.max(0,n):n;});}const best=Math.max(...values),exp=values.map(v=>Math.exp(v-best)),sum=exp.reduce((a,b)=>a+b,0),digit=values.indexOf(best);const probabilities=exp.map(v=>v/sum).sort((a,b)=>b-a);return {digit,confidence:probabilities[0],margin:probabilities[0]-probabilities[1]};}
export function pixelsFromCanvas(canvas){const ctx=canvas.getContext('2d'),{width:w,height:h}=canvas,data=ctx.getImageData(0,0,w,h).data;let minX=w,minY=h,maxX=0,maxY=0,count=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>50){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);count++;}
 if(count<30||maxY-minY<12)return null;
 const size=28,tmp=document.createElement('canvas');tmp.width=tmp.height=size;const t=tmp.getContext('2d'),bw=maxX-minX+1,bh=maxY-minY+1,scale=20/Math.max(bw,bh),dw=bw*scale,dh=bh*scale;
 t.drawImage(canvas,minX,minY,bw,bh,(28-dw)/2,(28-dh)/2,dw,dh);let img=t.getImageData(0,0,28,28),mass=0,cx=0,cy=0;for(let y=0;y<28;y++)for(let x=0;x<28;x++){const v=img.data[(y*28+x)*4+3]/255;mass+=v;cx+=x*v;cy+=y*v;}
 t.clearRect(0,0,28,28);t.putImageData(img,Math.round(13.5-cx/mass),Math.round(13.5-cy/mass));img=t.getImageData(0,0,28,28);return Array.from({length:784},(_,i)=>img.data[i*4+3]/255);}
export function attachPad(canvas,onInk,onEnd=()=>{}){const ctx=canvas.getContext('2d');let drawing=false,last=null,pointer=null;ctx.lineWidth=16;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#285c49';ctx.fillStyle='#285c49';const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};};
 canvas.onpointerdown=e=>{if(pointer!==null)return;e.preventDefault();pointer=e.pointerId;canvas.setPointerCapture(pointer);drawing=true;last=point(e);ctx.beginPath();ctx.arc(last.x,last.y,8,0,Math.PI*2);ctx.fill();onInk();};canvas.onpointermove=e=>{if(!drawing||e.pointerId!==pointer)return;e.preventDefault();const p=point(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;onInk();};const end=e=>{if(e.pointerId!==pointer)return;drawing=false;pointer=null;onEnd();};canvas.onpointerup=end;canvas.onpointercancel=end;canvas.onlostpointercapture=end;
 return ()=>{ctx.clearRect(0,0,canvas.width,canvas.height);onInk();};}

// A closed-set classifier always has a winner, even for noise. Accept only
// reasonably clear predictions which also resemble handwritten examples.
// Leave room for children’s proportions and less steady finger strokes.
export function assessDigit(pixels,model){
 const result=predict(pixels,model);let mass=0;for(const value of pixels)mass+=value;
 if(mass<12||mass>240)return {...result,accepted:false,reason:'ink'};
 // German convention: a 7 must have an actual middle crossbar. A high
 // classifier score never overrides this requirement.
 if(result.digit===7&&!hasMiddleCrossbar(pixels)){
  const distance=shapeDistance(pixels,model.shapes[1]);
  if(hasGermanOneStem(pixels)&&distance<=.085)return {digit:1,confidence:null,modelDigit:7,modelConfidence:result.confidence,distance,accepted:true,reason:'german-one-shape'};
  return {...result,accepted:false,reason:'missing-seven-crossbar'};
 }
 if(result.confidence<.80||result.margin<.60)return {...result,accepted:false,reason:'uncertain'};
 let stable=0;for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const shifted=Array(784).fill(0);for(let y=1;y<27;y++)for(let x=1;x<27;x++)shifted[(y+dy)*28+x+dx]=pixels[y*28+x];if(predict(shifted,model).digit===result.digit)stable++;}
 if(stable<2)return {...result,accepted:false,reason:'unstable'};
 const distance=shapeDistance(pixels,model.shapes[result.digit]);
 return {...result,distance,accepted:distance<=.10,reason:distance<=.10?'digit':'shape'};
}
function shapeDistance(pixels,templates){let best=Infinity;for(const template of templates){let squared=0;for(let i=0;i<784;i++)squared+=(pixels[i]-template[i])**2;best=Math.min(best,squared/784);}return best;}
function inkBounds(pixels){let left=28,right=-1,top=28,bottom=-1;for(let y=0;y<28;y++)for(let x=0;x<28;x++)if(pixels[y*28+x]>.22){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}return {left,right,top,bottom,width:right-left+1,height:bottom-top+1};}
export function hasMiddleCrossbar(pixels){
 const b=inkBounds(pixels);if(b.height<10)return false;
 const required=Math.max(4,Math.ceil(b.width*.30),Math.ceil(b.height*.22));
 // Look for a continuous near-horizontal run in the middle, not the top
 // stroke of a 7 or the sloping leading stroke of a German 1.
 for(let y=Math.ceil(b.top+b.height*.34);y<=b.top+b.height*.70;y++)for(const slope of [-.22,-.11,0,.11,.22]){
  let run=0;for(let x=b.left;x<=b.right;x++){const yy=Math.round(y+slope*(x-(b.left+b.right)/2));const ink=yy>=0&&yy<28&&pixels[yy*28+x]>.22;run=ink?run+1:0;if(run>=required)return true;}
 }
 return false;
}
export function hasGermanOneStem(pixels){
 const b=inkBounds(pixels);if(b.height<10)return false;
 const centers=[];for(let y=Math.ceil(b.top+b.height*.45);y<=b.top+b.height*.82;y++){let sum=0,weight=0;for(let x=b.left;x<=b.right;x++){const v=pixels[y*28+x];if(v>.22){sum+=x*v;weight+=v;}}if(weight)centers.push(sum/weight);}
 if(centers.length<5)return false;
 const middle=centers.reduce((a,v)=>a+v,0)/centers.length;
 if(Math.max(...centers)-Math.min(...centers)>b.height*.16)return false;
 let leading=false;for(let y=Math.ceil(b.top+b.height*.12);y<b.top+b.height*.43;y++)for(let x=b.left;x<middle-b.height*.13;x++)if(pixels[y*28+x]>.22)leading=true;
 return leading;
}
export function hasInk(canvas){const data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;return data.some((v,i)=>i%4===3&&v>50);}
