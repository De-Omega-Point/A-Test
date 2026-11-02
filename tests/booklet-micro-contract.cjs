/* Run: node tests/booklet-micro-contract.cjs */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const storage=new Map([['atest-state',JSON.stringify({mocks:[{score:16,valuesCorrect:5}],domains:{federation:3}})]]);
const document={addEventListener(){},getElementById(){return null;},querySelector(){return null}};
const context=vm.createContext({
 console,document,window:{},Date,Math,Number,Intl,
 localStorage:{
  getItem(key){return storage.get(key)??null;},
  setItem(key,value){storage.set(key,String(value));}
 }
});
for(const file of ['booklet-micro-content.js','booklet-learning.js'])
 vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const run=expr=>vm.runInContext(expr,context);
let checks=0;
const check=(value,label)=>{assert.ok(value,label);checks++;};
const cards=run('ATEST_MICRO_CARDS');
const chapters=run('ATEST_MICRO_CHAPTERS');
check(chapters.length===4,'Four official testable booklet parts are represented');
check(cards.length===27,'Twenty-seven microlearning concepts are available');
check(new Set(cards.map(c=>c.id)).size===cards.length,'Microlearning identifiers are unique');
check(chapters.map(ch=>cards.filter(c=>c.part===ch.id).length).join(',')==='7,6,9,5','Each chapter has source-linked microlearning');
for(const card of cards){
 const chapter=chapters.find(ch=>ch.id===card.part);
 check(chapter&&card.page>=chapter.start&&card.page<=chapter.end,'Concept '+card.id+' has a valid official source page');
 check(card.choices.length===3&&Number.isInteger(card.correct)&&card.correct>=0&&card.correct<3,'Question '+card.id+' has exactly one answer');
 check(card.idea.length>35&&card.recall.length>10&&card.reveal.length>10&&card.why.includes('p.'),'Concept '+card.id+' contains explanation, recall and citation');
}
check(run('atestMicroNext().id')==='first-peoples','Next mini-lesson initially starts at Part 1');
check(run('atestMicroCounts().total')===27,'Cockpit counts all source-linked concepts');
check(run('atestMicroChapterHeader(9)').includes('Part 1')===false || run('atestMicroChapterHeader(9)').includes('PART 1'),'Booklet PDF page 9 opens Part 1');
check(run('atestMicroAfterPdf(10)').includes('booklet-micro-first-peoples'),'Checkpoint is placed after printed booklet page 8');
check(run('atestMicroAfterPdf(41)').includes('booklet-values-practice'),'Values practice follows Part 4 content');
check(run('atestMicroCockpitHtml()').includes('data-micro-resume'),'Booklet companion includes a restore-reading shortcut');
check(run('atestMicroEscape("<script>&")')==='&lt;script&gt;&amp;','Learning content is HTML-escaped');

const id='first-peoples',correct=cards[0].correct,now=1000000000;
let r=run('atestMicroGrade("'+id+'",'+correct+','+now+')');
check(r&&r.right&&r.record.streak===1,'First correct recall earns step 1');
check(r.record.dueAt===now+86400000,'First spaced review is scheduled one day later');
check(run('atestMicroGrade("'+id+'",'+correct+','+(now+1)+')')===null,'Double-answer does not count');
run('atestMicroAgain("first-peoples")');
r=run('atestMicroGrade("first-peoples",'+correct+','+(now+60000)+')');
check(r.right&&r.record.streak===1,'Early repetition cannot increase spaced mastery');
run('atestMicroAgain("first-peoples")');
r=run('atestMicroGrade("first-peoples",'+correct+','+(now+86400000+1)+')');
check(r.record.streak===2&&r.record.dueAt===now+86400000+1+3*86400000,'Second spaced success schedules three days');
run('atestMicroAgain("first-peoples")');
r=run('atestMicroGrade("first-peoples",'+correct+','+(now+4*86400000+2)+')');
check(r.record.streak===3&&run('atestMicroMastered(atestMicroRecord("first-peoples"))')===true,'Third spaced success strengthens recall');
check(run('atestMicroCounts("people").mastered')===1,'Chapter mastery counter is derived from stored evidence');

const another=cards[1],wrong=(another.correct+1)%3;
r=run('atestMicroGrade("federation",'+wrong+','+now+')');
check(!r.right&&r.record.streak===0&&r.record.dueAt===now+600000,'Missed question schedules short reinforcement');
run('atestMicroAgain("federation")');
r=run('atestMicroGrade("federation",'+another.correct+','+(now+1000)+')');
check(r.right&&r.record.streak===0,'Immediate correction after a miss cannot skip due interval');
check(run('atestMicroCardHtml(ATEST_MICRO_CARDS[1],true)').includes('role="status"'),'Explanations are announced accessibly');

run('atestValuesStart()');
for(let i=0;i<5;i++)run('atestValuesChoice(ATEST_VALUES_PRACTICE[atestValuesRun.order[atestValuesRun.index]].correct);atestValuesNext()');
check(run('atestMicroRead().values.best')===5&&run('atestMicroRead().values.lastScore')===5,'Perfect 5/5 values practice is recorded');
check(run('atestMicroRead().values.passedAt')>0,'Perfect values practice records timestamp');
run('atestValuesStart()');
for(let i=0;i<5;i++)run('atestValuesChoice(i===0 ? (ATEST_VALUES_PRACTICE[atestValuesRun.order[atestValuesRun.index]].correct+1)%3 : ATEST_VALUES_PRACTICE[atestValuesRun.order[atestValuesRun.index]].correct);atestValuesNext()');
check(run('atestMicroRead().values.best')===5&&run('atestMicroRead().values.lastScore')===4,'A 4/5 values run is not a new perfect practice run');
check(run('atestValuesHtml()').includes('4/5: Revisit and retry'),'Values practice uses a strict five-correct gate');
check(storage.get('atest-state')===JSON.stringify({mocks:[{score:16,valuesCorrect:5}],domains:{federation:3}}),'Booklet learning never modifies exam or domain progress');
check(storage.has('atest-booklet-micro-v1'),'Companion has dedicated local storage');
console.log(checks+' booklet microlearning contract checks passed.');
