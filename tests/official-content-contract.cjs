/* Official-content integrity contract.
   Reference: Australian Citizenship: Our Common Bond, 2020 testable booklet,
   pp 7-39 and glossary pp 40-43. This is an automated screen, not a substitute
   for a human item-by-item source review. */
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert').strict;
const root=path.resolve(__dirname,'..');
const files=['storage.js','v3-content.js','v3-intelligence.js','app.js'];
const store=new Map();
const document={querySelector(){return {innerHTML:''}},querySelectorAll(){return[]},addEventListener(){},getElementById(){return null}};
const window={localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))},scrollTo(){},addEventListener(){},dispatchEvent(){}};
const ctx=vm.createContext({window,document,console,localStorage:window.localStorage,Event:class{},setInterval:()=>1,clearInterval(){},Date});
for(const f of files) vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const data=vm.runInContext('({curriculum:curriculumV2,questions,domainKnowledge,domainQuestionBank,deep:V3_DEEP_CONTENT})',ctx);
const ids=data.curriculum.flatMap(p=>p.domains.map(x=>x[0]));
assert.equal(ids.length,42,'42 official-subject domain mappings');
assert.equal(new Set(ids).size,42,'Domain identifiers unique');
for(const id of ids){
 assert.ok(data.domainKnowledge[id],id+' missing original study content');
 const d=data.deep[id];
 assert.ok(d,id+' missing V3 deep content');
 assert.ok(/^\d+(?:[–,-]\d+)*(?:, \d+)*$/.test(d.page),id+' invalid source page');
 for(const n of d.page.match(/\d+/g).map(Number))assert.ok(n>=7&&n<=39,id+' source page outside official testable section');
 for(const k of ['objective','why','scenario','question','answer'])assert.ok(typeof d[k]==='string'&&d[k].trim().length>10,id+' incomplete '+k);
 assert.ok(d.visual.length>=3,id+' requires visual sequence of three stages');
}
const validParts=['people','rights','government','values'];
const knownQuestions=new Set();
const perPart={people:0,rights:0,government:0,values:0};
for(const q of data.questions){
 assert.ok(validParts.includes(q[0]),'Question has unknown part');
 assert.equal(q.length,5,'Question record must contain 5 fields');
 assert.equal(q[2].length,4,'Mock uses four answers for '+q[1]);
 assert.ok(Number.isInteger(q[3])&&q[3]>=0&&q[3]<=3,'Invalid answer index: '+q[1]);
 assert.ok(q[2][q[3]]?.trim(),'Correct option missing: '+q[1]);
 assert.ok(q[4]?.trim().length>=12,'Explanation missing: '+q[1]);
 const norm=q[1].trim().toLocaleLowerCase('en-AU');
 assert.ok(!knownQuestions.has(norm),'Duplicate prompt: '+q[1]);knownQuestions.add(norm);perPart[q[0]]++;
}
assert.ok(data.questions.length>=20,'At least 20 questions needed');
assert.ok(perPart.values>=5,'Minimum five values questions');
assert.ok(data.questions.filter(q=>q[0]!=='values').length>=15,'At least 15 other questions');
assert.ok(data.domainQuestionBank.length>=42,'Every curriculum topic needs a mapped item');
assert.equal(new Set(data.domainQuestionBank.map(q=>q[0])).size,42,'Every curriculum domain has a mapped item');
// Fixed, source-checked anchors verified against the official 2020 booklet.
const anchors={
 'federation':['1901','Constitution','majority'],
 'states':['Canberra'],
 'traditions':['25 April','26 January'],
 'flags':['Commonwealth Star'],
 'symbols':['wattle'],
 'rule-law':['law'],
 'religion':['Australian law'],
 'powers':['Legislative','Executive','Judicial'],
 'head-state':['King','Governor-General'],
 'laws':['Bill','Royal Assent']
};
for(const [id,needles] of Object.entries(anchors)){
 const t=JSON.stringify(data.deep[id])+' '+JSON.stringify(data.domainKnowledge[id]);
 for(const needle of needles)assert.ok(t.toLowerCase().includes(needle.toLowerCase()),id+' missing source anchor '+needle);
}
console.log('Official-content integrity screen passed: '+ids.length+' mapped lessons; '+data.questions.length+' four-choice questions; '+perPart.values+' values questions. Manual fact audit remains required.');
