const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{const page=await browser.newPage();await page.goto(process.env.BASE_URL||'http://127.0.0.1:8075/');const results=await page.evaluate(async()=>{
 const {loadModel,pixelsFromCanvas,assessDigit,predict,hasMiddleCrossbar}=await import('./app/recognition.mjs');const model=await loadModel();const cases=[];
 for(const [name,strokes,label] of [
 ['German 1',[[[95,120],[165,60],[165,260]]],1],
 ['long leading stroke 1',[[[65,145],[170,55],[165,265]]],1],
 ['slanted 1',[[[90,115],[160,55],[180,265]]],1],
 ['footed 1',[[[95,120],[165,60],[165,260]],[[115,260],[215,260]]],1],
 ['uncrossed 7',[[[75,65],[245,65],[125,260]]],null],
 ['crossed 7',[[[75,65],[245,65],[125,260]],[[100,155],[225,155]]],7],
 ['short bar 7',[[[75,65],[245,65],[125,260]],[[155,155],[207,155]]],7],
 ['sloping bar 7',[[[75,65],[245,65],[125,260]],[[110,165],[225,150]]],7]
 ])for(const width of [12,20]){const c=document.createElement('canvas');c.width=c.height=320;const ctx=c.getContext('2d');ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';for(const points of strokes){ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.stroke();}const pixels=pixelsFromCanvas(c);const original=predict(pixels,model),decision=assessDigit(pixels,model);
 const forceSeven={...model,weights:[[Array(784).fill(0)],Array.from({length:10},()=>[0])],biases:[[0],Array.from({length:10},(_,i)=>i===7?30:0)]};
 cases.push({name,width,label,original:original.digit,...decision,bar:hasMiddleCrossbar(pixels),forced:assessDigit(pixels,forceSeven)});}
 return cases;
 });
 for(const r of results){if(r.label===null){assert(!r.accepted,`${r.name} must not pass`);assert(!r.forced.accepted);}else{assert(r.accepted,`${r.name} ${r.width}: ${r.reason}`);assert.equal(r.digit,r.label);if(r.label===1){assert(!r.bar,`${r.name} is not a crossbar`);assert(!r.forced.accepted||r.forced.digit===1,'a confident 7 cannot override the policy');}}}
 // Actual exercise: an uncrossed 7 cannot fly; adding its bar enables it.
 await page.evaluate(async()=>{const {createProfile}=await import('./app/learning.mjs');const p=createProfile('Test');p.skills.add.level=1;localStorage.setItem('number-lab-v1',JSON.stringify({version:1,activeId:p.id,profiles:[p]}));});await page.reload();await page.evaluate(()=>{let i=0;Math.random=()=>[.6,0,.2][i++]??.2;});await page.getByRole('button',{name:'Addition: write'}).click();assert.match(await page.locator('.equation').innerText(),/6.*\+.*1/s);
 const box=await page.locator('canvas').boundingBox();async function stroke(points){const move=([x,y])=>page.mouse.move(box.x+x/480*box.width,box.y+y/400*box.height);await move(points[0]);await page.mouse.down();for(const p of points.slice(1))await move(p);await page.mouse.up();}
 await stroke([[145,100],[315,100],[195,295]]);await page.locator('.pad-wrap.wiggle').waitFor();assert.equal(await page.locator('.ink-flight').count(),0);assert.equal(await page.locator('.answer-box').innerText(),'?');await stroke([[170,190],[295,190]]);await page.locator('.ink-flight').waitFor();assert.equal(await page.locator('.ink-flight span').innerText(),'7');await page.locator('#celebration.active').waitFor();assert.equal(await page.locator('.answer-box').innerText(),'7');
 console.log('PASS: German 1 variants, required middle bar for 7, sloping/short bars, two stroke widths, and forced-high-confidence 7 predictions.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
