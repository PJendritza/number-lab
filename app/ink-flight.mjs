// Fly a snapshot of the actual ink into the equation, cross-fading to type.
export function flyInk(canvases,digits,target){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const destination=target.getBoundingClientRect(),animations=[],elements=[];
 let cancelled=false;
 canvases.forEach((canvas,i)=>{
  const source=canvas.getBoundingClientRect(),width=destination.width/canvases.length;
  const flight=document.createElement('div');flight.className='ink-flight';flight.setAttribute('aria-hidden','true');
  Object.assign(flight.style,{left:`${source.left}px`,top:`${source.top}px`,width:`${source.width}px`,height:`${source.height}px`});
  const ink=document.createElement('canvas');ink.width=canvas.width;ink.height=canvas.height;ink.getContext('2d').drawImage(canvas,0,0);
  const number=document.createElement('span');number.textContent=digits[i];number.style.fontSize=`${Math.min(source.height*.72,source.width/(String(digits[i]).length*.7))}px`;
  flight.append(ink,number);document.body.append(flight);elements.push(flight);
  const duration=reduced?120:850,options={duration,easing:'cubic-bezier(.22,.7,.25,1)',fill:'forwards'};
  animations.push(flight.animate(reduced?[{opacity:0},{opacity:0}]:[{transform:'translate(0,0) scale(1)'},{transform:`translate(${destination.left+i*width-source.left}px,${destination.top-source.top}px) scale(${width/source.width},${destination.height/source.height})`}],options));
  animations.push(ink.animate([{opacity:1,offset:0},{opacity:.85,offset:.25},{opacity:0,offset:.85},{opacity:0}],options));
  animations.push(number.animate([{opacity:0,offset:0},{opacity:0,offset:.2},{opacity:1,offset:.85},{opacity:1}],options));
 });
 const finished=Promise.all(animations.map(a=>a.finished)).then(()=>!cancelled,()=>false).finally(()=>{elements.forEach(el=>el.remove());animations.forEach(a=>a.cancel());});
 return {finished,cancel(){cancelled=true;animations.forEach(a=>a.cancel());elements.forEach(el=>el.remove());}};
}
