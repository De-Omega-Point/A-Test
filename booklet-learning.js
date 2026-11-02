/* Booklet chapter companion: Read → Recall → Check → Revisit.
   Entirely optional and independent of official exam and mock-exam scores.
   The source-linked prompts are educational paraphrases, not official questions. */
const ATEST_MICRO_KEY='atest-booklet-micro-v1';
const ATEST_MICRO_DAY=86400000;
const ATEST_MICRO_INTERVALS=[ATEST_MICRO_DAY,3*ATEST_MICRO_DAY,7*ATEST_MICRO_DAY,14*ATEST_MICRO_DAY];
let atestValuesRun=null;
function atestMicroEscape(value){
 return String(value).replace(/[&<>"']/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
 });
}
function atestMicroRead(){
 try{
  const raw=JSON.parse(localStorage.getItem(ATEST_MICRO_KEY)||'{}');
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return {cards:{},values:{}};
  return {cards:raw.cards&&typeof raw.cards==='object'?raw.cards:{},
   values:raw.values&&typeof raw.values==='object'?raw.values:{}};
 }catch{return {cards:{},values:{}}}
}
function atestMicroWrite(data){
 try{localStorage.setItem(ATEST_MICRO_KEY,JSON.stringify(data));return true}
 catch{return false}
}
function atestMicroRecord(cardId){
 const r=atestMicroRead().cards[cardId];
 return r&&typeof r==='object'?r:{};
}
function atestMicroDue(card,now=Date.now()){
 return Number(card.attempts)>0&&Number(card.dueAt)<=now;
}
function atestMicroMastered(card){return Number(card.streak)>=3&&card.lastCorrect===true;}
function atestMicroGrade(cardId,choice,now=Date.now()){
 const card=ATEST_MICRO_CARDS.find(c=>c.id===cardId);
 if(!card||!Number.isInteger(choice)||choice<0||choice>=card.choices.length)return null;
 const data=atestMicroRead(),prev=data.cards[cardId]||{};
 if(Number.isInteger(prev.lastChoice))return null; // a single answer per attempt
 const right=choice===card.correct;
 const eligible=!(Number(prev.dueAt)>now);
 const streak=right?(eligible?Math.min(4,(Number(prev.streak)||0)+1):(Number(prev.streak)||0)):0;
 const next=right?(eligible?now+ATEST_MICRO_INTERVALS[Math.min(3,Math.max(0,streak-1))]:Number(prev.dueAt)):now+10*60000;
 const record={
  attempts:(Number(prev.attempts)||0)+1,
  correctAnswers:(Number(prev.correctAnswers)||0)+(right?1:0),
  streak, dueAt:next, lastAt:now, lastChoice:choice,
  lastCorrect:right, counted:right&&eligible
 };
 data.cards[cardId]=record;atestMicroWrite(data);
 return {card,record,right,eligible};
}
function atestMicroAgain(cardId){
 const data=atestMicroRead();
 if(!data.cards[cardId])return;
 data.cards[cardId].lastChoice=null;
 atestMicroWrite(data);
}
function atestMicroDate(timestamp){
 if(!Number.isFinite(Number(timestamp))||!Number(timestamp))return '';
 return new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}).format(new Date(timestamp));
}
function atestMicroStatus(r,now=Date.now()){
 if(!r.attempts)return 'Not started';
 if(atestMicroDue(r,now))return r.lastCorrect?'Review due':'Revisit this';
 if(atestMicroMastered(r))return '3-step recall strengthened';
 if(!r.lastCorrect)return 'Worth revisiting';
 if(!r.streak)return 'Practised, not yet spaced';
 return 'Step '+Math.min(3,r.streak)+'/3';
}
function atestMicroCounts(part){
 const data=atestMicroRead();
 const list=ATEST_MICRO_CARDS.filter(c=>!part||c.part===part);
 return {
  total:list.length,
  started:list.filter(c=>Number((data.cards[c.id]||{}).attempts)>0).length,
  due:list.filter(c=>atestMicroDue(data.cards[c.id]||{})).length,
  mastered:list.filter(c=>atestMicroMastered(data.cards[c.id]||{})).length
 };
}
function atestMicroNext(part){
 const data=atestMicroRead(),list=ATEST_MICRO_CARDS.filter(c=>!part||c.part===part);
 return list.find(c=>atestMicroDue(data.cards[c.id]||{}))||
        list.find(c=>!(data.cards[c.id]||{}).attempts)||
        list.find(c=>!atestMicroMastered(data.cards[c.id]||{}))||
        list[0]||null;
}
function atestMicroCockpitHtml(){
 const n=atestMicroCounts(),next=atestMicroNext(),p=n.total?Math.round(n.mastered/n.total*100):0;
 const values=atestMicroRead().values||{};
 const reading=typeof atestReadBooklet==='function'?atestReadBooklet():{};
 const resume=Number(reading.pdfPage)||9;
 return '<section class="booklet-learning-cockpit" id="booklet-learning-cockpit" aria-label="Booklet learning and reinforcement">'+
  '<div class="micro-cockpit-top"><span class="micro-kicker">READ · RECALL · CHECK · REVISIT</span>'+
  '<h2>Make each page stick</h2><p>One small idea at a time, with quick checks and spaced reminders. These are independent study aids, not official citizenship test questions.</p></div>'+
  '<div class="micro-stat-grid">'+
  '<div><strong>'+n.started+' / '+n.total+'</strong><span>Ideas practised</span></div>'+
  '<div><strong>'+n.mastered+'</strong><span>Recall strengthened</span></div>'+
  '<div><strong>'+n.due+'</strong><span>Ready for review</span></div>'+
  '<div><strong>'+p+'%</strong><span>Spaced mastery</span></div></div>'+
  '<div class="micro-progress-track" role="progressbar" aria-label="Microlearning recall strengthened" aria-valuenow="'+n.mastered+'" aria-valuemin="0" aria-valuemax="'+n.total+'"><i style="width:'+p+'%"></i></div>'+
  '<div class="micro-cockpit-actions">'+
  (next?'<button type="button" class="micro-action-primary" data-micro-jump="'+atestMicroEscape(next.id)+'">'+(n.due?'↻ Review due concept':'▶ '+(n.started?'Continue micro-learning':'Start first mini-lesson'))+'</button>':'')+
  '<button type="button" data-micro-resume="'+resume+'">📖 Resume reading at page '+(resume>=9&&resume<=45?(resume-2):'PDF '+resume)+'</button>'+ 
  '<button type="button" data-micro-values-jump>🛡️ Australian Values 5/5 practice</button></div>'+
  '<div class="micro-chapter-nav" aria-label="Four learning parts">'+ATEST_MICRO_CHAPTERS.map(ch=>{
   const c=atestMicroCounts(ch.id);
   return '<button type="button" data-micro-chapter-jump="'+ch.id+'"><span aria-hidden="true">'+ch.icon+'</span><span>Part '+ch.number+'</span><small>'+c.started+'/'+c.total+' started</small></button>';
  }).join('')+'</div>'+
  '<p class="micro-cockpit-note">Your microlearning record is saved on this device separately from the 20-question mock exam. '+(values.passedAt?'Values practice: last perfect run recorded.':'Australian Values practice still requires a perfect 5/5.')+'</p></section>';
}
function atestMicroChapterHeader(pdf){
 const ch=ATEST_MICRO_CHAPTERS.find(c=>c.start+2===pdf);
 if(!ch)return '';
 const x=atestMicroCounts(ch.id),n=atestMicroNext(ch.id);
 return '<section class="booklet-chapter-panel" id="booklet-chapter-'+ch.id+'" aria-label="Part '+ch.number+' microlearning">'+
  '<div class="booklet-chapter-icon" aria-hidden="true">'+ch.icon+'</div><div class="booklet-chapter-copy">'+
  '<p class="micro-kicker">PART '+ch.number+' · PRINTED PAGES '+ch.start+'–'+ch.end+'</p>'+
  '<h2>'+atestMicroEscape(ch.title)+'</h2><p>'+atestMicroEscape(ch.goal)+'</p>'+
  '<p data-micro-chapter-progress="'+ch.id+'">'+x.started+'/'+x.total+' practised · '+x.mastered+' strengthened · '+x.due+' due</p>'+
  '</div>'+(n?'<button type="button" data-micro-jump="'+atestMicroEscape(n.id)+'">Next 2-minute check</button>':'')+
  '</section>';
}
function atestMicroCardHtml(card,open=false){
 const rec=atestMicroRecord(card.id),answered=Number.isInteger(rec.lastChoice);
 const status=atestMicroStatus(rec),right=rec.lastCorrect===true;
 const feedback=answered?'<div class="micro-feedback '+(right?'micro-feedback-good':'micro-feedback-review')+'" tabindex="-1" id="micro-feedback-'+card.id+'" role="status">'+
  '<strong>'+(right?'✓ Correct. '+(rec.counted?'Spaced recall credited.':'Practice remembered; next spaced check unchanged.'):'↻ Not quite. Read the source idea and retry.')+'</strong>'+
  '<p>'+atestMicroEscape(card.why)+'</p>'+
  '<p>'+((rec.dueAt&&rec.dueAt>Date.now())?'Scheduled review: '+atestMicroDate(rec.dueAt):'This item is due for another try.')+'</p>'+
  '<button type="button" data-micro-again="'+card.id+'">Try this check again</button></div>':'';
 return '<details class="booklet-micro-card" id="booklet-micro-'+card.id+'" data-micro-id="'+card.id+'" '+(open?'open':'')+'>'+
  '<summary><span class="micro-card-icon" aria-hidden="true">'+card.icon+'</span>'+
  '<span class="micro-card-title"><small>2-MINUTE MEMORY STOP · BOOKLET P. '+card.page+'</small><strong>'+atestMicroEscape(card.title)+'</strong></span>'+
  '<span class="micro-state">'+atestMicroEscape(status)+'</span></summary>'+
  '<div class="micro-card-body"><p class="micro-key-idea"><strong>The idea:</strong> '+atestMicroEscape(card.idea)+'</p>'+
  '<p class="micro-memory-hook">🧠 Memory hook: '+atestMicroEscape(card.hook)+'</p>'+
  '<details class="micro-recall"><summary>First recall it without looking: '+atestMicroEscape(card.recall)+'</summary>'+
  '<p><strong>Model answer:</strong> '+atestMicroEscape(card.reveal)+'</p></details>'+
  '<div class="micro-quiz" aria-label="One question knowledge check">'+
  '<p class="micro-quiz-label">QUICK CHECK · NO TIMER</p><h3>'+atestMicroEscape(card.question)+'</h3>'+
  '<div class="micro-options">'+card.choices.map((choice,i)=>
   '<button type="button" data-micro-choice="'+i+'" data-micro-id="'+card.id+'"'+(answered?' disabled':'')+
   (answered&&rec.lastChoice===i?' class="micro-chosen"':'')+'><span aria-hidden="true">'+String.fromCharCode(65+i)+'</span>'+atestMicroEscape(choice)+'</button>'
  ).join('')+'</div>'+feedback+'</div>'+
  '<p class="micro-source">Source: <button type="button" data-booklet-page="'+card.page+'">Read printed booklet page '+card.page+'</button>. '+(rec.streak?'Recall step '+Math.min(3,rec.streak)+'/3.':'Your first answer starts a spaced revision sequence.')+'</p></div></details>';
}
function atestMicroAfterPdf(pdf){
 const printed=pdf-2;
 const cards=ATEST_MICRO_CARDS.filter(c=>c.page===printed);
 let html=cards.length?'<section class="booklet-mini-stops" aria-label="Page '+printed+' reinforcement">'+
  '<div class="micro-group-heading"><span class="micro-kicker">AFTER PAGE '+printed+'</span><h2>Check what you remember</h2></div>'+
  cards.map(card=>atestMicroCardHtml(card)).join('')+'</section>':'';
 if(printed===39)html+=atestValuesContainerHtml();
 return html;
}
function atestMicroRefresh(){
 const dock=document.getElementById('booklet-learning-cockpit');
 if(dock)dock.outerHTML=atestMicroCockpitHtml();
 for(const chapter of ATEST_MICRO_CHAPTERS){
  const node=document.querySelector('[data-micro-chapter-progress="'+chapter.id+'"]');
  if(node){const c=atestMicroCounts(chapter.id);node.textContent=c.started+'/'+c.total+' practised · '+c.mastered+' strengthened · '+c.due+' due';}
 }
}
function atestMicroJump(id){
 const c=ATEST_MICRO_CARDS.find(item=>item.id===id);
 if(!c)return;
 const target=document.getElementById('booklet-micro-'+id);
 if(!target)return;
 target.open=true;
 target.scrollIntoView({block:'start',behavior:'auto'});
 const summary=target.querySelector('summary');
 if(summary)summary.focus({preventScroll:true});
}
function atestValuesContainerHtml(){
 return '<section id="booklet-values-practice" class="booklet-values-practice" aria-label="Australian values 5 out of 5 practice challenge">'+atestValuesHtml()+'</section>';
}
function atestValuesHtml(){
 const r=atestValuesRun,saved=atestMicroRead().values||{};
 const header='<span class="micro-kicker">SPECIAL CHALLENGE · PART 4 · BOOKLET PAGES 34–38</span>'+
  '<h2>🛡️ Australian Values: 5/5</h2>'+
  '<p>Five short real-life scenarios. All five must be correct to complete this <strong>practice</strong> challenge. No timer. This is not an official test or a substitute for the full 20-question mock.</p>';
 if(!r){
  return header+'<div class="values-challenge-status"><strong>Best practice result: '+(saved.best||0)+'/5</strong>'+
   '<span>'+(saved.passedAt?'Previously completed perfectly.':'A perfect practice run is still ahead.')+'</span></div>'+
   '<button class="micro-action-primary" type="button" data-values-start>Start five scenarios</button>';
 }
 if(r.done){
  return header+'<div class="values-challenge-result" tabindex="-1" id="values-challenge-feedback" role="status">'+
   '<strong>'+(r.correct===5?'✓ 5/5: Perfect practice run':'↻ '+r.correct+'/5: Revisit and retry')+'</strong>'+
   '<p>'+(r.correct===5?'Well done. Now test your understanding with unfamiliar questions in a full mock exam.':'The five-value gate is all-or-nothing for this practice. Use the pages listed in the feedback, then try again.')+'</p>'+
   '<p>Previous best: '+(saved.best||0)+'/5. This is a learning challenge, not an official result.</p></div>'+
   '<button type="button" data-values-start>Try a new five-question run</button>';
 }
 const scenario=ATEST_VALUES_PRACTICE[r.order[r.index]],graded=!!r.answered;
 return header+'<p class="values-progress">Scenario '+(r.index+1)+' of 5 · '+r.correct+' correct so far</p>'+
  '<div class="values-five-track" role="group" aria-label="Five-question progress">'+Array.from({length:5},(_,i)=>'<span class="'+(i<r.index?'done':i===r.index?'now':'')+'" aria-hidden="true"></span>').join('')+'</div>'+
  '<h3>'+atestMicroEscape(scenario.question)+'</h3><div class="micro-options">'+scenario.choices.map((choice,i)=>
   '<button type="button" data-values-choice="'+i+'"'+(graded?' disabled':'')+
   (graded&&r.choice===i?' class="micro-chosen"':'')+'><span aria-hidden="true">'+String.fromCharCode(65+i)+'</span>'+atestMicroEscape(choice)+'</button>'
  ).join('')+'</div>'+
  (graded?'<div class="micro-feedback '+(r.lastCorrect?'micro-feedback-good':'micro-feedback-review')+'" tabindex="-1" id="values-challenge-feedback" role="status">'+
   '<strong>'+(r.lastCorrect?'✓ Correct':'↻ Let’s strengthen that value')+'</strong><p>'+atestMicroEscape(scenario.why)+'</p>'+
   '<button type="button" data-values-next>'+(r.index===4?'See 5/5 practice result':'Next scenario')+'</button></div>':'');
}
function atestValuesRender(focus=false){
 const node=document.getElementById('booklet-values-practice');
 if(!node)return;
 node.innerHTML=atestValuesHtml();
 if(focus){
  const focusNode=node.querySelector('#values-challenge-feedback')||node.querySelector('h3')||node.querySelector('h2');
  if(focusNode){focusNode.tabIndex=-1;focusNode.focus({preventScroll:true});}
 }
}
function atestValuesStart(){
 const order=[0,1,2,3,4];
 for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const x=order[i];order[i]=order[j];order[j]=x;}
 atestValuesRun={order,index:0,correct:0,answered:false,choice:null,lastCorrect:false,done:false};
 atestValuesRender(true);
}
function atestValuesChoice(index){
 const run=atestValuesRun;
 if(!run||run.answered||run.done||!Number.isInteger(index)||index<0||index>2)return;
 const scenario=ATEST_VALUES_PRACTICE[run.order[run.index]];
 run.answered=true;run.choice=index;run.lastCorrect=index===scenario.correct;
 if(run.lastCorrect)run.correct++;
 atestValuesRender(true);
}
function atestValuesNext(){
 const run=atestValuesRun;if(!run||!run.answered||run.done)return;
 if(run.index<4){run.index++;run.answered=false;run.choice=null;atestValuesRender(true);return;}
 run.done=true;
 const data=atestMicroRead(),v=data.values;
 v.attempts=(Number(v.attempts)||0)+1;v.best=Math.max(Number(v.best)||0,run.correct);
 v.lastScore=run.correct;v.lastAt=Date.now();
 if(run.correct===5)v.passedAt=Date.now();
 atestMicroWrite(data);
 atestValuesRender(true);atestMicroRefresh();
}
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-micro-choice],[data-micro-again],[data-micro-jump],[data-micro-chapter-jump],[data-micro-values-jump],[data-micro-resume],[data-values-start],[data-values-choice],[data-values-next]');
 if(!button||button.disabled)return;
 event.preventDefault();
 if(button.hasAttribute('data-micro-jump')){atestMicroJump(button.dataset.microJump);return;}
 if(button.hasAttribute('data-micro-chapter-jump')){
  const target=document.getElementById('booklet-chapter-'+button.dataset.microChapterJump);
  if(target)target.scrollIntoView({block:'start',behavior:'auto'});
  return;
 }
 if(button.hasAttribute('data-micro-resume')){
  if(typeof atestBookletGoPdf==='function')atestBookletGoPdf(Number(button.dataset.microResume));
  return;
 }
 if(button.hasAttribute('data-micro-values-jump')){
  const target=document.getElementById('booklet-values-practice');
  if(target)target.scrollIntoView({block:'start',behavior:'auto'});
  return;
 }
 if(button.hasAttribute('data-values-start')){atestValuesStart();return;}
 if(button.hasAttribute('data-values-choice')){atestValuesChoice(Number(button.dataset.valuesChoice));return;}
 if(button.hasAttribute('data-values-next')){atestValuesNext();return;}
 const id=button.dataset.microId||button.dataset.microAgain;
 const card=ATEST_MICRO_CARDS.find(c=>c.id===id);
 if(!card)return;
 if(button.hasAttribute('data-micro-again'))atestMicroAgain(id);
 else {
  const outcome=atestMicroGrade(id,Number(button.dataset.microChoice));
  if(!outcome)return;
 }
 const el=document.getElementById('booklet-micro-'+id);
 if(el)el.outerHTML=atestMicroCardHtml(card,true);
 const updated=document.getElementById('booklet-micro-'+id);
 const focusNode=updated&&(updated.querySelector('#micro-feedback-'+id)||updated.querySelector('.micro-quiz h3'));
 if(focusNode){focusNode.tabIndex=-1;focusNode.focus({preventScroll:true});}
 atestMicroRefresh();
});
