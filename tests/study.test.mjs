import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreQuiz,shuffle,storage,applyExamReview} from '../estudos/study-core.mjs';
import * as core from '../estudos/study-core.mjs';
test('guided progress sanitizes corrupt legacy state and never marks unseen steps',()=>{
 assert.equal(typeof core.normalizeLessonProgress,'function');
 assert.deepEqual(core.normalizeLessonProgress({step:99,completed:[0,2,2,-1,7,'3']}),{step:5,completed:[0,2]});
 assert.deepEqual(core.normalizeLessonProgress(null),{step:0,completed:[]});
 assert.deepEqual(core.normalizeLessonProgress({step:NaN,completed:'bad'}),{step:0,completed:[]});
});
test('larger exams stay balanced and never repeat a question',()=>{
 assert.equal(typeof core.balancedQuestions,'function');
 const qs=['a','b','c'].flatMap(topic=>Array.from({length:8},(_,i)=>({id:topic+i,topic})));
 for(const n of [3,6,12,24]){const result=core.balancedQuestions(qs,n);assert.equal(result.length,n);assert.equal(new Set(result.map(q=>q.id)).size,n);for(const t of ['a','b','c'])assert.equal(result.filter(q=>q.topic===t).length,n/3)}
 assert.equal(core.balancedQuestions(qs,100).length,24);
});
test('route reconstruction rejects wrong and repeated choices without advancing',()=>{
 assert.equal(typeof core.advanceRoute,'function');
 assert.deepEqual(core.advanceRoute(['a','b','c'],[],1),{picked:[],correct:false,complete:false});
 assert.deepEqual(core.advanceRoute(['a','b','c'],[0],0),{picked:[0],correct:false,complete:false});
 assert.deepEqual(core.advanceRoute(['a','b','c'],[0,1],2),{picked:[0,1,2],correct:true,complete:true});
});
test('unanswered questions count in total but not as correct',()=>{
 assert.deepEqual(scoreQuiz([{id:'a',correct:0},{id:'b',correct:1},{id:'c',correct:0}],{a:0,b:0}),{correct:1,total:3,unanswered:1,wrong:['b','c']});
});
test('shuffle preserves items and does not mutate input',()=>{
 const a=[1,2,3,4]; const b=shuffle(a);assert.deepEqual([...b].sort(),a);assert.notEqual(a,b);
});
test('storage denial and malformed values do not break the app',()=>{
 const s=storage({getItem(){throw Error('denied')},setItem(){throw Error('denied')}});
 assert.deepEqual(s.get('x',{}),{});s.set('x',{a:1});assert.deepEqual(s.get('x',{}),{a:1});
 assert.deepEqual(storage({getItem(){return 'bad json'}}).get('x',[]),[]);
});
test('exam mistakes clear stale successful practice answers for a fresh retry',()=>{
 const state={answers:{a:0,b:1,z:2},review:{a:false,b:true}};
 applyExamReview(state,[{id:'a',correct:0},{id:'b',correct:1}],{a:1,b:1});
 assert.equal(state.answers.a,undefined);assert.equal(state.review.a,true);
 assert.equal(state.review.b,false);assert.equal(state.answers.b,1);assert.equal(state.answers.z,2);
});
