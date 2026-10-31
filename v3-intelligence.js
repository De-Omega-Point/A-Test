/* V3 Examination Intelligence. Separate storage key preserves existing learner data. */
const V3_REVIEW_KEY='atest-v3-review';
const V3_DAY=86400000;
function v3ReadReviews(){try{const x=JSON.parse(localStorage.getItem(V3_REVIEW_KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}}
function v3RecordReview(q,correct,now=Date.now()){
 const id=q[1],records=v3ReadReviews(),old=records[id]||{},prior=Number(old.streak)||0;
 const streak=correct?Math.min(12,prior+1):0;
 const delays=[0,1,3,7,14,30,60,90,120,180,240,365];
 records[id]={streak,last:now,due:now+(correct?delays[Math.min(streak,delays.length-1)]*V3_DAY:10*60000),misses:(Number(old.misses)||0)+(correct?0:1),correct:!!correct,domain:typeof questionDomainMap!=='undefined'?(questionDomainMap[id]||null):null,part:q[0]};
 try{localStorage.setItem(V3_REVIEW_KEY,JSON.stringify(records))}catch{}
 return records[id];
}
function v3DueQuestions(now=Date.now()){
 const history=v3ReadReviews();
 return questions.filter(q=>history[q[1]]&&history[q[1]].due<=now).sort((a,b)=>history[a[1]].due-history[b[1]].due);
}
function v3AdaptiveQuestions(limit=10,now=Date.now()){
 const history=v3ReadReviews(),due=v3DueQuestions(now),unique=new Set(),result=[];
 const add=q=>{if(!unique.has(q[1])&&result.length<limit){result.push(q);unique.add(q[1])}};
 // Prioritise due corrections, then fresh evidence gaps and values.
 due.filter(q=>history[q[1]]?.misses>0).forEach(add);
 due.filter(q=>q[0]==='values').forEach(add);
 due.forEach(add);
 // Rotate within each non-due priority tier: unseen first, then least recently
 // answered. Reuse existing review timestamps; selection must not write progress.
 // Stable ties retain bank order, so the same history produces the same session.
 const rotated=questions.slice().sort((a,b)=>{
  const x=history[a[1]],y=history[b[1]];
  if(!x||!y)return Number(!!x)-Number(!!y);
  return (Number(x.last)||0)-(Number(y.last)||0);
 });
 const weak=rotated.filter(q=>{const d=questionDomainMap[q[1]],ev=d&&state.domainEvidence[d];return !ev||ev.t<3||ev.t&&(ev.c/ev.t)<.75});
 weak.filter(q=>q[0]==='values').forEach(add);
 weak.forEach(add);
 rotated.forEach(add);
 return result;
}
function v3ReviewPanel(){
 const h=v3ReadReviews(),entries=Object.values(h),due=v3DueQuestions(),mistakes=entries.filter(x=>x.misses>0&&!x.correct).length;
 return '<section class="card" aria-label="Revision intelligence" style="margin:14px 0;padding:20px"><div class="eyebrow">V3 · REVISION INTELLIGENCE</div><h3>Remember it tomorrow, not just today</h3><p>'+due.length+' question(s) due for spaced review · '+mistakes+' unresolved question(s).</p><p>Wrong answers return soon. Correct answers reappear after increasing intervals. Values remain a high-priority area.</p><div class="actions"><button class="primary" data-v3-adaptive>Train personalised questions</button><button data-v3-due>Review due questions</button></div><small>Progress is stored on this device. Practice is not an official examination result.</small></section>';
}
function v3StartDue(){const due=v3DueQuestions();startSession((due.length?due:v3AdaptiveQuestions()).slice(0,10),'v3-review');}
function v3StartAdaptive(){startSession(v3AdaptiveQuestions(10),'v3-adaptive');}
