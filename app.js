const M=[
{id:"people",icon:"🇦🇺",title:"Australia & its people",desc:"First peoples, history, geography, symbols and key dates."},
{id:"rights",icon:"🗳️",title:"Democratic beliefs, rights & liberties",desc:"Democracy, rule of law, freedoms, equality and citizenship."},
{id:"government",icon:"🏛️",title:"Government & the law",desc:"Constitution, Parliament, powers, levels, courts and police."},
{id:"values",icon:"🤝",title:"Australian values",desc:"Freedom, respect, equality, fairness, peaceful democracy and law."}
];
const LES={
people:["Aboriginal and Torres Strait Islander peoples and continuing cultures","States, territories and capital cities","Australia Day: 26 January","Anzac Day: 25 April","Federation: 1 January 1901","Australian flags, anthem and national symbols"],
rights:["Parliamentary democracy","Rule of law","Freedom of speech and expression","Freedom of religion and association","Equality of men and women","Citizenship responsibilities and privileges"],
government:["The Australian Constitution","Legislative, executive and judicial powers","Federal, state/territory and local government","House of Representatives and Senate","How a Bill becomes law","Courts, police and the justice system"],
values:["Respect for freedom and dignity","Freedom within Australian law","Equality of opportunity","Peaceful disagreement and democratic participation","A fair go and mutual respect","Community participation and loyalty to Australia"]
};
const CARDS=[
["When did Australia federate?","1 January 1901","people"],
["What is Australia’s national capital?","Canberra","people"],
["When is Australia Day?","26 January","people"],
["When is Anzac Day?","25 April","people"],
["What are the three powers of government?","Legislative, executive, judicial","government"],
["What is a proposed law called?","A Bill","government"],
["What does rule of law mean?","No person or group is above the law","rights"],
["Voting age for eligible citizens?","18 years and over","rights"],
["Can religion override Australian law?","No","values"],
["How many values questions must be correct?","All 5","values"],
["Minimum overall test score?","15 out of 20","values"],
["Standard test time?","45 minutes","people"]
];
const Q=[
["people","Australia became a federation in which year?",["1788","1851","1901","1915"],2,"Six colonies → one Commonwealth → 1901"],
["people","What is Australia’s national capital?",["Sydney","Melbourne","Canberra","Adelaide"],2,"Australia → Canberra"],
["rights","Which is a responsibility of eligible Australian citizens aged 18 or over?",["Owning a home","Enrolling and voting","Joining a political party","Serving in the military"],1,"Citizen 18+ → enrol → vote"],
["government","Which are the three powers of government?",["Federal, state, local","Legislative, executive, judicial","Parliament, police, council","King, Governor-General, Prime Minister"],1,"MAKE → DO → JUDGE"],
["government","A proposed new law introduced into Parliament is called what?",["A Bill","A ballot","A petition","A referendum"],0,"Bill → Parliament → Royal Assent → law"],
["values","If a religious practice conflicts with Australian law, which takes precedence?",["The religious rule","Family preference","Australian law","Whichever rule is older"],2,"Everyone → Australian law"],
["values","Which best reflects equality in Australia?",["Leadership preference by gender","Equal opportunity regardless of gender","Only citizens receive legal protection","Ignore discrimination law"],1,"Equal dignity → equal opportunity"],
["values","A person strongly disagrees with a government decision. Which response reflects Australian values?",["Use violence","Peacefully protest within the law","Threaten officials","Stop others expressing views"],1,"Disagree → peaceful action → law"]
];
const A=document.querySelector("#app");
let state=JSON.parse(localStorage.getItem("atest2")||'{"known":{},"attempts":0,"scores":{}}');
let S=null,ci=0,flipped=false;
function save(){localStorage.setItem("atest2",JSON.stringify(state))}
function moduleCards(){
 return M.map(m=>'<article class="card module"><i>'+m.icon+'</i><h3>'+m.title+'</h3><p>'+m.desc+'</p></article>').join("");
}
function home(){
 const known=Object.values(state.known).filter(Boolean).length;
 A.innerHTML='<section class="hero"><div><div class="eyebrow">LEARN → VISUALISE → RECALL → REINFORCE</div><h1>Your citizenship<br>learning lab.</h1><p class="lead">Study the material first. Turn it into pictures, flashcards and retrieval practice until it sticks.</p><div class="actions"><button class="btn" data-v="learn">Start learning</button><button data-v="visual">Explore infographics</button></div></div><aside class="card gate"><span>FLASHCARD MASTERY</span><strong>'+known+' / '+CARDS.length+'</strong><div class="progress"><i style="width:'+(known/CARDS.length*100)+'%"></i></div><br><span>EXAM GATE</span><strong>15 / 20</strong><b>plus 5 / 5 values</b></aside></section><section class="grid">'+moduleCards()+'</section>';
}
function learn(){
 A.innerHTML='<div class="eyebrow">LEARNING MATERIAL</div><h2>Four testable parts</h2><p class="lead">Learn the concepts first, then reinforce them with visuals and retrieval.</p><div class="topics">'+M.map(m=>'<article class="card topic"><span class="tag">'+m.icon+' '+m.id.toUpperCase()+'</span><h3>'+m.title+'</h3><ul>'+LES[m.id].map(x=>'<li>'+x+'</li>').join("")+'</ul><div class="actions"><button class="btn" data-focus="'+m.id+'">Visualise</button><button data-p="'+m.id+'">Check recall</button></div></article>').join("")+'</div>';
}
function visual(id){
 id=id||"government";
 const cards=M.map(m=>'<button class="card infoBtn '+(m.id===id?"active":"")+'" data-focus="'+m.id+'"><h3>'+m.icon+' '+m.title+'</h3><p>'+m.desc+'</p></button>').join("");
 A.innerHTML='<div class="eyebrow">INTERACTIVE INFOGRAPHICS</div><h2>See how the ideas connect</h2><div class="grid">'+cards+'</div><section class="card detail">'+diagram(id)+'</section>';
}
function diagram(id){
 if(id==="people") return '<h2>Australia timeline</h2><div class="flow"><span class="node">First peoples<br><small>continuing cultures</small></span><span class="arrow">→</span><span class="node">1788<br><small>First Fleet</small></span><span class="arrow">→</span><span class="node">1851<br><small>gold rush era</small></span><span class="arrow">→</span><span class="node">1901<br><small>Federation</small></span></div><div class="visual">Anchor dates to events, not isolated numbers.</div>';
 if(id==="rights") return '<h2>Democratic beliefs</h2><div class="flow"><span class="node">Democracy</span><span class="arrow">+</span><span class="node">Rule of law</span><span class="arrow">+</span><span class="node">Freedom</span><span class="arrow">+</span><span class="node">Equality</span></div><div class="visual">Freedoms operate within Australian law.</div>';
 if(id==="values") return '<h2>Australian values decision filter</h2><div class="flow"><span class="node">Is it lawful?</span><span class="arrow">→</span><span class="node">Is it peaceful?</span><span class="arrow">→</span><span class="node">Does it respect dignity & equality?</span></div><div class="visual">Values are a hard gate: 5 / 5.</div>';
 return '<h2>Government: two different sets of three</h2><h3>Three powers</h3><div class="flow"><span class="node">Legislative<br><small>makes laws</small></span><span class="arrow">→</span><span class="node">Executive<br><small>puts laws into action</small></span><span class="arrow">→</span><span class="node">Judicial<br><small>interprets and applies law</small></span></div><h3>Three levels</h3><div class="flow"><span class="node">Federal<br><small>national matters</small></span><span class="node">State / territory<br><small>regional services</small></span><span class="node">Local<br><small>local services</small></span></div>';
}
function cards(){
 const c=CARDS[ci], known=!!state.known[ci];
 A.innerHTML='<div class="eyebrow">FLASHCARDS • '+(ci+1)+' / '+CARDS.length+'</div><section class="card flash"><span class="tag">'+c[2].toUpperCase()+'</span><div class="face">'+(flipped?c[1]:c[0])+'</div><p class="hint">'+(flipped?"Answer":"Think first, then reveal.")+'</p><div class="actions" style="justify-content:center"><button class="btn" data-flip>'+(flipped?"Show question":"Reveal answer")+'</button></div>'+(flipped?'<div class="actions" style="justify-content:center"><button data-rate="0">× Review again</button><button class="btn" data-rate="1">✓ I know this</button></div>':"")+'</section><div class="actions" style="justify-content:center"><button data-prev>← Previous</button><button data-next>Next →</button></div><p style="text-align:center;color:var(--muted)">'+(known?"✓ Marked known":"Not mastered yet")+'</p>';
}
function practice(){
 A.innerHTML='<div class="eyebrow">REINFORCEMENT</div><h2>Retrieve, correct, repeat</h2><p class="lead">Wrong answers become signals for what to revisit.</p><section class="grid">'+M.map(m=>'<button class="card module" data-p="'+m.id+'"><i>'+m.icon+'</i><h3>'+m.title+'</h3><p>Focused retrieval drill</p></button>').join("")+'</section><div class="actions"><button class="btn" data-p="all">Mixed drill</button></div>';
}
function start(mode){
 let q=mode==="all"?Q.slice():Q.filter(x=>x[0]===mode);
 S={q:q.sort(()=>Math.random()-.5),i:0,n:0,mode:mode};
 draw();
}
function draw(){
 let q=S.q[S.i];
 A.innerHTML='<section class="card quiz"><div class="eyebrow">RECALL '+(S.i+1)+' / '+S.q.length+'</div><div class="question">'+q[1]+'</div><div class="choices">'+q[2].map((x,i)=>'<button class="choice" data-a="'+i+'">'+String.fromCharCode(65+i)+'. '+x+'</button>').join("")+'</div><div id="f"></div></section>';
}
function answer(i){
 let q=S.q[S.i],ok=i===q[3];
 if(ok)S.n++;
 document.querySelectorAll(".choice").forEach((b,n)=>{b.disabled=true;if(n===q[3])b.classList.add("correct");else if(n===i)b.classList.add("wrong")});
 document.querySelector("#f").innerHTML='<div class="feedback"><b class="'+(ok?"good":"bad")+'">'+(ok?"✓ Correct":"✕ Not yet")+'</b><div class="visual">'+q[4]+'</div><button class="btn" id="next">'+(S.i===S.q.length-1?"Finish":"Next")+'</button></div>';
 document.querySelector("#next").onclick=()=>{S.i++;if(S.i>=S.q.length)finish();else draw()};
}
function finish(){
 const pct=Math.round(S.n/S.q.length*100);
 state.attempts++;state.scores[S.mode]=pct;save();
 A.innerHTML='<section class="card quiz"><div class="eyebrow">REINFORCEMENT COMPLETE</div><h1>'+S.n+'/'+S.q.length+'</h1><h2 class="'+(pct>=75?"good":"bad")+'">'+pct+'%</h2><p class="lead">'+(pct>=75?"Strong retrieval. Keep spacing your reviews.":"Revisit the visual and flashcards for this topic, then retry.")+'</p><div class="actions"><button class="btn" data-v="learn">Review material</button><button data-v="practice">Train again</button></div></section>';
}
document.addEventListener("click",e=>{
 const v=e.target.closest("[data-v]"),f=e.target.closest("[data-focus]"),p=e.target.closest("[data-p]"),a=e.target.closest("[data-a]");
 if(v){const x=v.dataset.v;({home,learn,visual,cards,practice}[x]||home)()}
 else if(f)visual(f.dataset.focus);
 else if(p)start(p.dataset.p);
 else if(a)answer(+a.dataset.a);
 else if(e.target.closest("[data-flip]")){flipped=!flipped;cards()}
 else if(e.target.closest("[data-next]")){ci=(ci+1)%CARDS.length;flipped=false;cards()}
 else if(e.target.closest("[data-prev]")){ci=(ci-1+CARDS.length)%CARDS.length;flipped=false;cards()}
 else if(e.target.closest("[data-rate]")){state.known[ci]=e.target.closest("[data-rate]").dataset.rate==="1";save();ci=(ci+1)%CARDS.length;flipped=false;cards()}
});
home();