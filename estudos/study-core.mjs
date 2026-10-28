export function scoreQuiz(questions,answers){
 let correct=0,unanswered=0;const wrong=[];
 for(const q of questions){if(answers[q.id]===undefined)unanswered++;if(answers[q.id]===q.correct)correct++;else wrong.push(q.id)}
 return {correct,total:questions.length,unanswered,wrong};
}
export function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export function applyExamReview(state,questions,answers){
 const result=scoreQuiz(questions,answers);
 for(const q of questions){const wrong=result.wrong.includes(q.id);state.review[q.id]=wrong;if(wrong)delete state.answers[q.id]}
 return result;
}
export function storage(driver){
 const mem=new Map();return {get(k,fallback){if(mem.has(k))return mem.get(k);try{const raw=driver?.getItem(k);return raw===null||raw===undefined?fallback:JSON.parse(raw)}catch{return fallback}},set(k,v){mem.set(k,v);try{driver?.setItem(k,JSON.stringify(v))}catch{}}};
}
