import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreQuiz,shuffle,storage,applyExamReview} from '../estudos/study-core.mjs';
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
