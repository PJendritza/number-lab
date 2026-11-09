export const LIMITS=[5,10,20];
export const AVATARS=['🐻','🐰','🦊','🐼','🐨','🐸'];
export function createProfile(name,avatar=AVATARS[0]){return {id:crypto.randomUUID(),name:name.trim().slice(0,24),avatar,stars:0,rounds:0,skills:{add:{level:0,history:[]},subtract:{level:0,history:[]}}};}
export function question(operation,level,random=Math.random,previous=''){
 const max=LIMITS[level]; let a,b,key;
 for(let i=0;i<20;i++){a=Math.floor(random()*(max+1));b=Math.floor(random()*(max+1));if(operation==='add')b=Math.floor(random()*(max-a+1));else if(b>a)[a,b]=[b,a];key=`${a}:${b}`;if(key!==previous)break;}
 return {a,b,answer:operation==='add'?a+b:a-b,key};
}
export function record(skill,independent){
 skill.history.push(Boolean(independent));skill.history=skill.history.slice(-10);
 if(skill.history.length===10){const score=skill.history.filter(Boolean).length;if(score>=9&&skill.level<2){skill.level++;skill.history=[];return 'up';}if(score<=5&&skill.level>0){skill.level--;skill.history=[];return 'down';}}
 return 'same';
}
export function validStore(v){return v?.version===1&&Array.isArray(v.profiles)&&v.profiles.length<=8&&v.profiles.every(p=>typeof p.id==='string'&&typeof p.name==='string'&&p.name.length<=24&&AVATARS.includes(p.avatar)&&Number.isInteger(p.stars)&&p.stars>=0&&Number.isInteger(p.rounds)&&p.rounds>=0&&['add','subtract'].every(k=>p.skills?.[k]&&Number.isInteger(p.skills[k].level)&&p.skills[k].level>=0&&p.skills[k].level<=2&&Array.isArray(p.skills[k].history)&&p.skills[k].history.length<=10&&p.skills[k].history.every(x=>typeof x==='boolean')))&&new Set(v.profiles.map(p=>p.id)).size===v.profiles.length;}
