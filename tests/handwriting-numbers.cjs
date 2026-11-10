const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:8070/');
 const results=await page.evaluate(async()=>{
  const {loadModel}=await import('./app/recognition.mjs');const {readNumber}=await import('./app/number-recognition.mjs');const model=await loadModel();
  function digit(ctx,n,style='german'){
   const path=points=>{ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.stroke();};
   if(n==='1'){path(style==='plain'?[[165,60],[165,260]]:[[95,120],[165,60],[165,260]]);if(style==='foot')path([[115,260],[215,260]]);}
   if(n==='7'){path([[75,65],[245,65],[125,260]]);if(style!=='plain')path([[100,155],[225,155]]);}
   if(n==='0'){ctx.beginPath();ctx.ellipse(160,160,68,100,0,0,Math.PI*2);ctx.stroke();}
   if(n==='2'){ctx.beginPath();ctx.moveTo(80,100);ctx.bezierCurveTo(95,20,260,35,230,115);ctx.bezierCurveTo(210,165,125,200,85,255);ctx.lineTo(245,255);ctx.stroke();}
  }
  const cases=[['1','german'],['1','plain'],['1','foot'],['7','german'],['7','plain'],['10','german'],['11','german'],['12','german'],['17','german'],['20','german'],['20','close'],['17','small-side']];
  const results=cases.map(([text,style])=>{const canvas=document.createElement('canvas');canvas.width=480;canvas.height=400;const ctx=canvas.getContext('2d');ctx.lineWidth=16;ctx.lineCap='round';ctx.lineJoin='round';
   [...text].forEach((n,i)=>{ctx.save();if(style==='small-side'){ctx.translate(200+i*100,140);ctx.scale(.32,.48);}else if(text.length===2){ctx.translate(15+i*(style==='close'?110:220),55);ctx.scale(.68,.85);}else ctx.translate(70,35);digit(ctx,n,style);ctx.restore();});return {expected:text==='7'&&style==='plain'?null:text,style,...readNumber(canvas,model)};});
  // Three written digits must not quietly become one or two.
  const c=document.createElement('canvas');c.width=480;c.height=400;const ctx=c.getContext('2d');ctx.lineWidth=14;for(let i=0;i<3;i++){ctx.save();ctx.translate(i*145,50);ctx.scale(.5,.8);digit(ctx,'1');ctx.restore();}results.push({expected:null,...readNumber(c,model)});
  return results;
 });

 for(const r of results){if(r.expected===null)assert(!r.accepted);else{assert.equal(r.accepted,true,`${r.expected} (${r.style}): ${r.reason}`);assert.equal(r.text,r.expected);}}
 console.log('PASS: German/plain/footed 1, crossed 7, reject uncrossed 7, and 10/11/12/17/20 in one box.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
