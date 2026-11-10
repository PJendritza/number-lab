// Optional browser regression: normalization and forgiving shape acceptance.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  const page=await browser.newPage();
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:8070/');
  const results=await page.evaluate(async()=>{
   const {loadModel,pixelsFromCanvas,assessDigit}=await import('./app/recognition.mjs');
   const model=await loadModel();
   return [[160,160,65,95],[65,75,35,50],[220,200,55,85],[160,160,85,90],[160,160,45,105]].map(([x,y,rx,ry])=>{
    const c=document.createElement('canvas');c.width=c.height=320;
    const ctx=c.getContext('2d');ctx.lineWidth=16;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.stroke();
    return assessDigit(pixelsFromCanvas(c),model);
   });
  });
  for(const result of results){assert.equal(result.digit,0);assert.equal(result.accepted,true);}
  console.log('PASS: centered, small/off-center, wide and narrow handwritten zeros.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
