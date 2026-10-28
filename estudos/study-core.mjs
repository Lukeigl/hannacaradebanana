export function scoreQuiz(questions,answers){
 let correct=0,unanswered=0;const wrong=[];
 for(const q of questions){if(answers[q.id]===undefined)unanswered++;if(answers[q.id]===q.correct)correct++;else wrong.push(q.id)}
 return {correct,total:questions.length,unanswered,wrong};
}
export function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export function normalizeLessonProgress(value){
 const v=value&&typeof value==='object'?value:{};
 return {step:Number.isInteger(v.step)?Math.max(0,Math.min(5,v.step)):0,completed:[...new Set(Array.isArray(v.completed)?v.completed.filter(n=>Number.isInteger(n)&&n>=0&&n<6):[])].sort((a,b)=>a-b)};
}
export function balancedQuestions(questions,count){
 const groups=new Map();for(const q of questions){if(!groups.has(q.topic))groups.set(q.topic,[]);groups.get(q.topic).push(q)}
 const pools=shuffle([...groups.values()].map(shuffle));const result=[];
 while(result.length<Math.min(count,questions.length)){let added=false;for(const pool of pools){if(pool.length&&result.length<count){result.push(pool.pop());added=true}}if(!added)break}
 return shuffle(result);
}
export function advanceRoute(path,picked,choice){
 const correct=choice===picked.length&&choice<path.length;const next=correct?[...picked,choice]:[...picked];
 return {picked:next,correct,complete:next.length===path.length};
}
export function applyExamReview(state,questions,answers){
 const result=scoreQuiz(questions,answers);
 for(const q of questions){const wrong=result.wrong.includes(q.id);state.review[q.id]=wrong;if(wrong)delete state.answers[q.id]}
 return result;
}
export function storage(driver){
 const mem=new Map();return {get(k,fallback){if(mem.has(k))return mem.get(k);try{const raw=driver?.getItem(k);return raw===null||raw===undefined?fallback:JSON.parse(raw)}catch{return fallback}},set(k,v){mem.set(k,v);try{driver?.setItem(k,JSON.stringify(v))}catch{}}};
}
