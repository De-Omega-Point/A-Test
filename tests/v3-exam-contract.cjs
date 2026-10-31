// V3 exam intelligence contract: node tests/v3-exam-contract.cjs
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert').strict;
const root=path.resolve(__dirname,'..');const saved=new Map();
const context=vm.createContext({localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},Date,console});
vm.runInContext(fs.readFileSync(path.join(root,'v3-intelligence.js'),'utf8'),context);
const run=x=>vm.runInContext(x,context);
run("var questions=[['values','Respect others?', ['Yes','No'],0,'Respect others'],['people','Federation year?', ['1901','1788'],0,'1901']];var questionDomainMap={'Respect others?':'respect','Federation year?':'federation'};var state={domainEvidence:{}};");
run("v3RecordReview(questions[0],false,1000000000)");
assert.equal(run("v3ReadReviews()['Respect others?'].streak"),0);
assert.equal(run("v3ReadReviews()['Respect others?'].misses"),1);
assert.equal(run("v3ReadReviews()['Respect others?'].due"),1000600000);
run("v3RecordReview(questions[0],true,1000600000)");
assert.equal(run("v3ReadReviews()['Respect others?'].streak"),1);
assert.equal(run("v3ReadReviews()['Respect others?'].due"),1000600000+86400000);
assert.equal(run("v3DueQuestions(1000600000+86400000).length"),1);
assert.equal(run("v3AdaptiveQuestions(2,1000600000+86400000).length"),2);
assert.ok(saved.has('atest-v3-review'));
assert.ok(!saved.has('atest-state'),'V3 must not overwrite existing progress data');
const a=fs.readFileSync(path.join(root,'app.js'),'utf8');
assert.ok(a.includes('session.score>=15&&session.valuesCorrect===5'),'Both exam gates remain mandatory');
assert.ok(a.includes('add(nonValues,15);add(values,5)'),'Mock still selects exactly five values questions');
assert.ok(a.includes('v3RecordReview(q,ok)'),'Answer events record spaced review');
console.log('V3 exam intelligence contract passed');
// Deterministic rotation regressions. Keep these in the existing CI contract.
const rotationContext=vm.createContext({Date,console});
vm.runInContext(`
var saved=new Map([['atest-state','legacy-progress']]);
var localStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};
var questions=Array.from({length:30},(_,i)=>['people','q'+i,[],0,'']);
var questionDomainMap=Object.fromEntries(questions.map(q=>[q[1],'strong']));
var state={domainEvidence:{strong:{t:4,c:3}}};
`,rotationContext);
vm.runInContext(fs.readFileSync(path.join(root,'v3-intelligence.js'),'utf8'),rotationContext);
const rr=x=>vm.runInContext(x,rotationContext);
const ids=x=>JSON.parse(rr(`JSON.stringify(${x}.map(q=>q[1]))`));
const initial=rr('JSON.stringify(questions)');
const seen=new Set();
for(let session=0;session<6;session++){
 const now=1000000000+session*1000;
 const chosen=ids(`v3AdaptiveQuestions(10,${now})`);
 assert.equal(new Set(chosen).size,10,'No duplicate question per session');
 if(session<3)chosen.forEach(id=>assert.ok(!seen.has(id),'Unseen questions precede repeats'));
 chosen.forEach(id=>seen.add(id));
 assert.deepEqual(chosen,Array.from({length:10},(_,i)=>'q'+((session%3)*10+i)),'All-seen bank rotates oldest answers first');
 rr(`v3AdaptiveQuestions(10,${now}).forEach(q=>v3RecordReview(q,true,${now}))`);
}
assert.equal(seen.size,30,'Three sessions cover the entire bank');
assert.equal(rr('JSON.stringify(questions)'),initial,'Selection does not reorder the bank');
assert.equal(rr("saved.get('atest-state')"),'legacy-progress','Legacy progress untouched');
const before=rr('JSON.stringify([...saved])');
assert.deepEqual(ids('v3AdaptiveQuestions(10,1000006000)'),ids('v3AdaptiveQuestions(10,1000006000)'),'Same state is reproducible');
assert.equal(rr('JSON.stringify([...saved])'),before,'Selection is read-only');
assert.equal(rr('v3AdaptiveQuestions(0).length'),0);
assert.equal(rr('v3AdaptiveQuestions(100).length'),30);
// Corrections, values reviews and remaining due reviews stay ahead of weak/unseen.
rr(`
questions=[['people','fresh'],['values','weakValue'],['people','weak'],['people','dueOther'],['values','dueValue'],['people','dueMiss']];
questionDomainMap={fresh:'strong',weakValue:'weak',weak:'weak',dueOther:'strong',dueValue:'strong',dueMiss:'strong'};
state.domainEvidence={strong:{t:4,c:3},weak:{t:10,c:7}};
localStorage.setItem(V3_REVIEW_KEY,JSON.stringify({dueOther:{last:10,due:20},dueValue:{last:30,due:40},dueMiss:{last:50,due:60,misses:1}}));
`);
assert.deepEqual(ids('v3AdaptiveQuestions(6,100)'),['dueMiss','dueValue','dueOther','weakValue','weak','fresh']);
assert.deepEqual(ids('v3AdaptiveQuestions(2,100)'),['dueMiss','dueValue'],'Limit preserves highest priorities');
// Rotation also applies inside weak-values and other weak-domain tiers.
rr(`
questions=Array.from({length:12},(_,i)=>['values','weak'+i]);
questionDomainMap=Object.fromEntries(questions.map(q=>[q[1],'weak']));
localStorage.setItem(V3_REVIEW_KEY,'{}');
`);
rr('v3AdaptiveQuestions(10,1000).forEach(q=>v3RecordReview(q,true,1000))');
assert.deepEqual(ids('v3AdaptiveQuestions(2,2000)'),['weak10','weak11']);
rr("questions.forEach(q=>q[0]='people')");
assert.deepEqual(ids('v3AdaptiveQuestions(2,2000)'),['weak10','weak11']);
// Legacy/malformed storage degrades safely without a reset or migration.
rr("localStorage.setItem(V3_REVIEW_KEY,'not json')");
assert.equal(rr('v3AdaptiveQuestions(10,2000).length'),10);
rr("localStorage.setItem(V3_REVIEW_KEY,JSON.stringify({weak0:{due:999999},weak1:{last:1000,due:999999}}))");
assert.equal(ids('v3AdaptiveQuestions(1,2000)')[0],'weak2','Unseen precedes legacy records missing last');
rr("questions=[]");
assert.equal(rr('v3AdaptiveQuestions().length'),0);
console.log('V3 adaptive rotation: coverage, recency, priority, limits, determinism and storage compatibility passed');
// Run the real application bank through repeated, persisted practice sessions.
const realStore=new Map();
const document={querySelector(){return {innerHTML:''}},querySelectorAll(){return[]},addEventListener(){},getElementById(){return null}};
const window={localStorage:{getItem:k=>realStore.get(k)||null,setItem:(k,v)=>realStore.set(k,String(v))},scrollTo(){},addEventListener(){},dispatchEvent(){}};
const real=vm.createContext({window,document,console,localStorage:window.localStorage,Event:class{},setInterval:()=>1,clearInterval(){},Date});
for(const f of ['storage.js','v3-content.js','v3-intelligence.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),real,{filename:f});
const realRun=x=>vm.runInContext(x,real);
realRun('Object.values(questionDomainMap).forEach(d=>state.domainEvidence[d]={t:4,c:3})');
const bankSize=realRun('questions.length');
const covered=new Set();
for(let i=0;i<Math.ceil(bankSize/10);i++){
 const now=1000000000+i*1000;
 const selected=JSON.parse(realRun(`JSON.stringify(v3AdaptiveQuestions(10,${now}).map(q=>q[1]))`));
 const remaining=bankSize-covered.size;
 selected.slice(0,Math.min(10,remaining)).forEach(id=>assert.ok(!covered.has(id),'Real bank unseen coverage advances'));
 selected.forEach(id=>covered.add(id));
 realRun(`v3AdaptiveQuestions(10,${now}).forEach(q=>v3RecordReview(q,true,${now}))`);
}
assert.equal(covered.size,bankSize,'Every real question is reached before review becomes due');
console.log(`V3 real-bank rotation: ${covered.size}/${bankSize} questions covered in ${Math.ceil(bankSize/10)} sessions`);
