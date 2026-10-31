/* AUS-TEST V3: source-grounded, progressive learning supplements.
   Educational paraphrases from Our Common Bond, testable section.
   No storage keys changed. */
const V3_DEEP_CONTENT={
"first-peoples":{page:"8, 12",objective:"Explain why Australian history starts long before 1788.",why:"Aboriginal and Torres Strait Islander peoples are Australia's First Peoples. The booklet identifies their cultures as the oldest continuous cultures in the world. These are distinct peoples with diverse traditions and close connections to Country.",visual:["First Peoples","Continuing cultures","Country, stories, art and dance"],terms:[["Country","Land, waters and cultural connections"],["Welcome to Country","A welcome given by a local Traditional Custodian"],["Acknowledgement of Country","Respect for Traditional Custodians; anyone may give it"]],scenario:"An event host is not a local Traditional Custodian. They can give an Acknowledgement of Country, but should not represent it as a Welcome to Country.",question:"Why is it wrong to say Australia's human story started in 1788?",answer:"Because Aboriginal and Torres Strait Islander peoples lived here for many tens of thousands of years before British settlement."},
"settlement":{page:"8–9",objective:"Separate British settlement, the gold rush and Federation.",why:"The First Fleet arrived in 1788 and British settlement began. Gold discoveries in 1851 encouraged migration. In 1901, the six colonies united. These are three different kinds of events: settlement, migration and national government.",visual:["1788 · First Fleet","1851 · Gold rush","1901 · Federation"],terms:[["First Fleet","Eleven British convict ships"],["Gold rush","Period of migration following gold discoveries"],["Federation","Union of colonies as one nation"]],scenario:"An exam question asks when Australia became a federation. Choose 1901, not 1788.",question:"Explain the difference between 1788 and 1901.",answer:"1788 marks arrival of the First Fleet and commencement of British settlement; 1901 marks Federation of the six colonies."},
"federation":{page:"25–26",objective:"Explain Federation, the Constitution and the referendum double majority.",why:"Before 1901, separate colonial rules caused problems for trade, transport, law enforcement and defence. Federation created one Commonwealth while states retained some powers. The Constitution establishes the rules and institutions of national government.",visual:["Six colonies","1 January 1901 · Federation","Commonwealth of Australia"],terms:[["Constitution","Foundational rules of government"],["Referendum","Vote about proposed constitutional change"],["Double majority","National majority AND majority in at least four states"]],scenario:"A referendum proposal wins 55% of votes nationally, but majorities in only three states. It fails the double-majority test.",question:"Why can a nationwide majority be insufficient in a referendum?",answer:"A constitutional change also needs majority support in at least four of the six states."},
"powers":{page:"26",objective:"Distinguish three kinds of constitutional power.",why:"A system of checks limits concentration of authority. Parliament makes laws, the executive puts them into practice and independent courts interpret and apply them.",visual:["Legislative · makes laws","Executive · administers laws","Judicial · interprets and applies laws"],terms:[["Legislative","Power to make laws"],["Executive","Power to put laws into practice"],["Judicial","Power to interpret and apply laws"]],scenario:"A judge decides how a law applies to a court case. This is judicial power, not legislative power.",question:"If Parliament passes a law and a judge interprets it, which powers are involved?",answer:"Legislative power for Parliament; judicial power for the judge."},
"levels":{page:"29",objective:"Identify the usual responsibilities of three levels of government.",why:"Responsibilities are shared but not identical. The Australian Government handles matters such as immigration, defence and foreign affairs; states and territories primarily operate schools, hospitals and police; councils handle many local services.",visual:["Commonwealth · defence and immigration","State/territory · schools and hospitals","Local council · rubbish and parks"],terms:[["Commonwealth","National or federal government"],["Council","Local government"],["Responsibility","Service or decision assigned to an authority"]],scenario:"A resident reports damaged playground equipment to their council, not the Department of Defence.",question:"Who usually manages local rubbish collection, and who handles immigration?",answer:"Local councils manage rubbish collection; the Australian Government handles immigration."},
"rule-law":{page:"18, 34",objective:"Apply the Rule of Law to people in positions of power.",why:"Every person is subject to Australian law, including the Prime Minister, police and religious leaders. No personal position or belief creates an exemption.",visual:["One Australian legal system","Everyone is subject to the law","No person or group above the law"],terms:[["Rule of Law","Everyone, including government, is bound by the law"],["Equality before the law","The law applies to everyone"]],scenario:"An official claims their position allows them to ignore road laws. That claim conflicts with the Rule of Law.",question:"Does the Prime Minister have to obey Australian law?",answer:"Yes. The Rule of Law applies to everyone."},
"speech":{page:"19, 35",objective:"Separate lawful criticism from threats and violence.",why:"Australians may express their ideas, criticise government and protest peacefully. Freedom does not remove the duty to obey laws or respect others' lawful freedoms.",visual:["Speak and write","Disagree peacefully","Obey Australian law"],terms:[["Freedom of speech","Lawful expression of opinions"],["Peaceful protest","Non-violent public expression of disagreement"]],scenario:"A group peacefully protests against a government policy without harming people or property. This is consistent with Australian values.",question:"Can freedom of speech be used to justify violence against another person?",answer:"No. Speech and protest must remain within Australian law."},
"religion":{page:"19, 35",objective:"Explain secular government and religious freedom.",why:"Australia has no official national religion. People may follow a religion or none. Religious practices cannot override Australian law.",visual:["No official religion","Freedom to believe or not believe","Australian law prevails"],terms:[["Secular","Government operates separately from religion"],["Freedom of religion","Freedom to practise a religion or none, within law"]],scenario:"Someone says a religious custom permits conduct prohibited by Australian law. Australian law still applies.",question:"Can religious rules replace Australian law?",answer:"No. Australian law must be obeyed where there is a conflict."},
"fair-go":{page:"20, 36",objective:"Apply equality of opportunity to employment.",why:"A fair go means opportunities should reflect ability, work and effort rather than wealth, sex, ethnicity or background.",visual:["Equal legal rights","Opportunity to participate","Ability and effort matter"],terms:[["Fair go","Equal opportunity to achieve"],["Discrimination","Unfair treatment because of a protected characteristic"]],scenario:"A company selects the most qualified person rather than a relative of the owner. This reflects a fair go.",question:"What should primarily determine success in a job application?",answer:"Relevant skills, experience and qualifications, not background or wealth."},
"respect":{page:"37",objective:"Practise respectful disagreement and rejection of violence.",why:"Mutual respect asks people to tolerate different lawful views. Intimidation, abuse and violence conflict with Australian values.",visual:["Listen","Disagree peacefully","Respect safety and dignity"],terms:[["Tolerance","Respect for different lawful beliefs and opinions"],["Mutual respect","Recognising other people's dignity and choices"]],scenario:"Two neighbours strongly disagree about a community issue but listen and respond without threats. This models mutual respect.",question:"How should Australians respond to people whose lawful views differ?",answer:"With respect, tolerance and peaceful disagreement."},
"community":{page:"38",objective:"Explain contribution, compassion and mateship.",why:"The booklet links citizenship with participating in community, supporting people in need, volunteering where possible and helping keep society safe.",visual:["Contribute","Help people in need","Protect the community"],terms:[["Mateship","Helping each other, especially in hard times"],["Volunteering","Giving time without expecting payment"]],scenario:"A neighbour drives an elderly person to a medical appointment. This is an example of mateship.",question:"Is helping people in need consistent with Australian values?",answer:"Yes. Compassion and community contribution are important Australian values."}
};
function v3Escape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function v3DomainPanel(id){const d=V3_DEEP_CONTENT[id];if(!d)return '';const v=v3Escape;return '<section class="card" aria-label="V3 deep learning" style="margin:16px 0;padding:20px"><div class="eyebrow">V3 · DEEP LEARNING · OUR COMMON BOND pp '+v(d.page)+'</div><h3>🎯 Learning objective</h3><p>'+v(d.objective)+'</p><h3>🧠 Why this matters</h3><p>'+v(d.why)+'</p><h3>👀 Visual memory sequence</h3><div role="list" style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0">'+d.visual.map((x,i)=>'<span role="listitem" style="padding:10px;border:1px solid #bdb4cc;border-radius:9px">'+(i+1)+'. '+v(x)+'</span>').join('')+'</div><h3>📖 Terms and meanings</h3><dl>'+d.terms.map(x=>'<dt><strong>'+v(x[0])+'</strong></dt><dd>'+v(x[1])+'</dd>').join('')+'</dl><h3>🧩 Apply it</h3><p>'+v(d.scenario)+'</p><details><summary><strong>✍️ Explain it back: '+v(d.question)+'</strong></summary><p>'+v(d.answer)+'</p></details><p><small>Reinforcement: explain without notes now, revisit tomorrow, and test yourself again in one week. Source facts follow the official booklet; teaching examples are illustrative.</small></p></section>';}

// Phase 2: additional booklet-ordered learning domains.
Object.assign(V3_DEEP_CONTENT,{
  "states": {
    "page": "10–11",
    "objective": "Pair six states and two mainland territories with capitals.",
    "why": "Canberra is the national capital; state and territory capitals differ.",
    "visual": [
      "Six states",
      "NSW Sydney, Vic Melbourne, Qld Brisbane, WA Perth, SA Adelaide, Tas Hobart",
      "ACT Canberra, NT Darwin."
    ],
    "terms": [
      [
        "Key distinction",
        "Pair six states and two mainland territories with capitals."
      ],
      [
        "Exam cue",
        "The national capital is not Sydney."
      ]
    ],
    "scenario": "The national capital is not Sydney.",
    "question": "What is the capital of Australia?",
    "answer": "Canberra."
  },
  "traditions": {
    "page": "12–13",
    "objective": "Distinguish cultural protocols and significant national days.",
    "why": "A Welcome to Country is given by a local Traditional Custodian; anyone may give an Acknowledgement. Australia Day is 26 January and Anzac Day 25 April.",
    "visual": [
      "Welcome",
      "Traditional Custodian; Acknowledgement",
      "anyone; 26 Jan",
      "Australia Day; 25 Apr",
      "Anzac Day."
    ],
    "terms": [
      [
        "Key distinction",
        "Distinguish cultural protocols and significant national days."
      ],
      [
        "Exam cue",
        "Anzac Day remembers service and sacrifice, not the arrival of the First Fleet."
      ]
    ],
    "scenario": "Anzac Day remembers service and sacrifice, not the arrival of the First Fleet.",
    "question": "Who can give an Acknowledgement of Country?",
    "answer": "Anyone."
  },
  "flags": {
    "page": "14",
    "objective": "Identify the three recognised flags and their symbols.",
    "why": "The national flag includes the Union Jack, Commonwealth Star and Southern Cross. The Aboriginal Flag features black, red and yellow; the Torres Strait Islander Flag has green, blue, black and white.",
    "visual": [
      "National",
      "Commonwealth Star; Aboriginal",
      "yellow sun; Torres Strait",
      "white headdress."
    ],
    "terms": [
      [
        "Key distinction",
        "Identify the three recognised flags and their symbols."
      ],
      [
        "Exam cue",
        "The Commonwealth Star has seven points representing six states and territories."
      ]
    ],
    "scenario": "The Commonwealth Star has seven points representing six states and territories.",
    "question": "What does the yellow circle on the Aboriginal Flag represent?",
    "answer": "The sun."
  },
  "symbols": {
    "page": "15–16",
    "objective": "Recall national symbols and anthem.",
    "why": "The Commonwealth Coat of Arms represents national unity and authority. Golden wattle is the national flower, green and gold the national colours, opal the national gemstone and Advance Australia Fair the anthem.",
    "visual": [
      "Coat of Arms",
      "national authority; wattle",
      "flower; opal",
      "gemstone; Advance Australia Fair",
      "anthem."
    ],
    "terms": [
      [
        "Key distinction",
        "Recall national symbols and anthem."
      ],
      [
        "Exam cue",
        "The kangaroo and emu support the Coat of Arms shield."
      ]
    ],
    "scenario": "The kangaroo and emu support the Coat of Arms shield.",
    "question": "What is Australia's national floral emblem?",
    "answer": "Golden wattle."
  },
  "democracy": {
    "page": "18",
    "objective": "Explain representative parliamentary democracy.",
    "why": "Australian citizens vote for representatives to Parliament; government power comes from the people and representatives answer to voters at elections.",
    "visual": [
      "People",
      "vote",
      "representatives",
      "Parliament."
    ],
    "terms": [
      [
        "Key distinction",
        "Explain representative parliamentary democracy."
      ],
      [
        "Exam cue",
        "Citizens do not vote directly on every parliamentary bill."
      ]
    ],
    "scenario": "Citizens do not vote directly on every parliamentary bill.",
    "question": "Where does government power come from in a parliamentary democracy?",
    "answer": "The Australian people."
  },
  "peaceful-change": {
    "page": "18",
    "objective": "Explain how democratic change should occur.",
    "why": "Australians support discussion, peaceful persuasion and democratic processes rather than violence.",
    "visual": [
      "Disagree",
      "discuss",
      "persuade",
      "vote."
    ],
    "terms": [
      [
        "Key distinction",
        "Explain how democratic change should occur."
      ],
      [
        "Exam cue",
        "A strong political disagreement does not justify intimidation."
      ]
    ],
    "scenario": "A strong political disagreement does not justify intimidation.",
    "question": "How should Australians seek political change?",
    "answer": "Through peaceful democratic processes."
  },
  "association": {
    "page": "19",
    "objective": "Recognise voluntary, lawful membership and protest.",
    "why": "People may join or leave lawful political, cultural, religious or other groups, or choose not to join. Public gatherings must be peaceful and lawful.",
    "visual": [
      "Join",
      "leave",
      "choose not to join."
    ],
    "terms": [
      [
        "Key distinction",
        "Recognise voluntary, lawful membership and protest."
      ],
      [
        "Exam cue",
        "Freedom of association does not require anyone to join a group."
      ]
    ],
    "scenario": "Freedom of association does not require anyone to join a group.",
    "question": "Can a person be forced to join a political party?",
    "answer": "No."
  },
  "equality-law": {
    "page": "20, 36",
    "objective": "Apply equality before the law.",
    "why": "Australian law recognises equal legal rights regardless of background, gender, age, race, disability, religion or sexual orientation.",
    "visual": [
      "Different backgrounds",
      "equal legal protection.",
      "Apply in a question"
    ],
    "terms": [
      [
        "Key distinction",
        "Apply equality before the law."
      ],
      [
        "Exam cue",
        "Equality under law does not mean officials may favour friends."
      ]
    ],
    "scenario": "Equality under law does not mean officials may favour friends.",
    "question": "Are Australians from different religions equal before Australian law?",
    "answer": "Yes."
  },
  "gender": {
    "page": "20, 36",
    "objective": "Describe equal rights of men and women.",
    "why": "Men and women have equal rights and opportunity in employment, education, voting and personal choices; gender discrimination is against the law.",
    "visual": [
      "Women and men",
      "equal rights",
      "equal opportunities."
    ],
    "terms": [
      [
        "Key distinction",
        "Describe equal rights of men and women."
      ],
      [
        "Exam cue",
        "A woman may be selected for a job on better skills and qualifications."
      ]
    ],
    "scenario": "A woman may be selected for a job on better skills and qualifications.",
    "question": "Should gender decide who receives a job?",
    "answer": "No. Relevant qualifications and skills should determine selection."
  },
  "responsibilities": {
    "page": "20–21",
    "objective": "Identify duties of citizenship.",
    "why": "Citizens must obey laws, vote in relevant elections and referendums, defend Australia if needed and serve on a jury if called.",
    "visual": [
      "Law",
      "vote",
      "defence if needed",
      "jury if called."
    ],
    "terms": [
      [
        "Key distinction",
        "Identify duties of citizenship."
      ],
      [
        "Exam cue",
        "ADF service is voluntary, even though defence is described as a civic responsibility."
      ]
    ],
    "scenario": "ADF service is voluntary, even though defence is described as a civic responsibility.",
    "question": "Name two citizenship responsibilities.",
    "answer": "Obey Australian laws and vote in relevant elections."
  },
  "privileges": {
    "page": "20–22",
    "objective": "Identify citizenship privileges.",
    "why": "Citizens may seek an Australian passport, freely re-enter Australia, seek election subject to conditions and request overseas consular help.",
    "visual": [
      "Passport",
      "re-entry",
      "representation",
      "consular help."
    ],
    "terms": [
      [
        "Key distinction",
        "Identify citizenship privileges."
      ],
      [
        "Exam cue",
        "A passport privilege differs from the duty to vote."
      ]
    ],
    "scenario": "A passport privilege differs from the duty to vote.",
    "question": "What travel privilege comes with Australian citizenship?",
    "answer": "The right to re-enter Australia without needing a visa."
  },
  "participation": {
    "page": "22",
    "objective": "Connect participation and tax to community services.",
    "why": "Citizens can volunteer, join organisations and participate in civic life. Taxes help finance healthcare, education, roads, defence and social security.",
    "visual": [
      "Work",
      "taxes",
      "public services; volunteer",
      "stronger community."
    ],
    "terms": [
      [
        "Key distinction",
        "Connect participation and tax to community services."
      ],
      [
        "Exam cue",
        "Tax is required by law, not merely an optional donation."
      ]
    ],
    "scenario": "Tax is required by law, not merely an optional donation.",
    "question": "Name one public service supported by taxes.",
    "answer": "Healthcare, education or roads."
  },
  "say": {
    "page": "24",
    "objective": "Explain voting, representation and secret ballots.",
    "why": "Eligible citizens enrol and vote; their ballots are secret and they can contact elected representatives about concerns.",
    "visual": [
      "Enrol",
      "vote privately",
      "representative."
    ],
    "terms": [
      [
        "Key distinction",
        "Explain voting, representation and secret ballots."
      ],
      [
        "Exam cue",
        "A secret ballot protects voters from pressure."
      ]
    ],
    "scenario": "A secret ballot protects voters from pressure.",
    "question": "Must you tell anyone whom you voted for?",
    "answer": "No."
  },
  "aec": {
    "page": "24",
    "objective": "Identify the AEC's function and independence.",
    "why": "The Australian Electoral Commission conducts federal elections and referendums and maintains the federal electoral roll independently of government.",
    "visual": [
      "AEC",
      "federal elections",
      "referendums",
      "roll."
    ],
    "terms": [
      [
        "Key distinction",
        "Identify the AEC's function and independence."
      ],
      [
        "Exam cue",
        "Political parties cannot direct the AEC's decisions."
      ]
    ],
    "scenario": "Political parties cannot direct the AEC's decisions.",
    "question": "Who conducts federal elections?",
    "answer": "Australian Electoral Commission."
  },
  "referendum": {
    "page": "25",
    "objective": "Distinguish a referendum from an election.",
    "why": "A referendum is a vote on a proposed change to the Constitution; a double majority is required.",
    "visual": [
      "National voter majority + majorities in at least four states.",
      "Remember the difference",
      "Apply in a question"
    ],
    "terms": [
      [
        "Key distinction",
        "Distinguish a referendum from an election."
      ],
      [
        "Exam cue",
        "A majority across Australia alone is insufficient."
      ]
    ],
    "scenario": "A majority across Australia alone is insufficient.",
    "question": "What two majorities must a constitutional referendum achieve?",
    "answer": "A national majority and majorities in at least four states."
  },
  "head-state": {
    "page": "26–27",
    "objective": "Distinguish Head of State and government leader.",
    "why": "The King of Australia is Head of State; the Governor-General represents the King in Australia. The Prime Minister leads the Australian Government.",
    "visual": [
      "King",
      "Head of State; Governor-General",
      "representative; PM",
      "government leader."
    ],
    "terms": [
      [
        "Key distinction",
        "Distinguish Head of State and government leader."
      ],
      [
        "Exam cue",
        "The Prime Minister is not Australia's Head of State."
      ]
    ],
    "scenario": "The Prime Minister is not Australia's Head of State.",
    "question": "Who represents the Head of State in Australia?",
    "answer": "The Governor-General."
  },
  "parliament": {
    "page": "27–28",
    "objective": "Distinguish the two federal Houses.",
    "why": "The House of Representatives represents electorates and helps determine government formation; the Senate reviews legislation and represents states and territories.",
    "visual": [
      "House",
      "people/electorates; Senate",
      "states and territories."
    ],
    "terms": [
      [
        "Key distinction",
        "Distinguish the two federal Houses."
      ],
      [
        "Exam cue",
        "The Senate is not the same as the House of Representatives."
      ]
    ],
    "scenario": "The Senate is not the same as the House of Representatives.",
    "question": "What is the Senate often called?",
    "answer": "The House of Review or States' House."
  },
  "leaders": {
    "page": "27–28",
    "objective": "Match leadership titles with levels of government.",
    "why": "Prime Minister leads the Australian Government; Premier leads a state; Chief Minister leads a territory; Mayor or Shire President leads local government.",
    "visual": [
      "Federal",
      "PM; state",
      "Premier; territory",
      "Chief Minister; local",
      "Mayor."
    ],
    "terms": [
      [
        "Key distinction",
        "Match leadership titles with levels of government."
      ],
      [
        "Exam cue",
        "A Premier does not lead the national government."
      ]
    ],
    "scenario": "A Premier does not lead the national government.",
    "question": "Who leads a state government?",
    "answer": "The Premier."
  },
  "parties": {
    "page": "30",
    "objective": "Explain parties, coalitions and independents.",
    "why": "Political parties organise around shared ideas. A coalition joins parties; an independent MP is not in a political party. The Opposition scrutinises government.",
    "visual": [
      "Parties",
      "shared policy; coalition",
      "parties together; independent",
      "no party."
    ],
    "terms": [
      [
        "Key distinction",
        "Explain parties, coalitions and independents."
      ],
      [
        "Exam cue",
        "A coalition is not necessarily a single party."
      ]
    ],
    "scenario": "A coalition is not necessarily a single party.",
    "question": "What is a political independent?",
    "answer": "A representative not belonging to a political party."
  },
  "ministers": {
    "page": "30",
    "objective": "Describe ministers and Cabinet.",
    "why": "Ministers oversee government portfolios; senior ministers form Cabinet, a key government decision-making body.",
    "visual": [
      "Prime Minister",
      "ministers and portfolios",
      "Cabinet."
    ],
    "terms": [
      [
        "Key distinction",
        "Describe ministers and Cabinet."
      ],
      [
        "Exam cue",
        "Cabinet and Parliament are not identical institutions."
      ]
    ],
    "scenario": "Cabinet and Parliament are not identical institutions.",
    "question": "What is a ministerial portfolio?",
    "answer": "An assigned area of government responsibility."
  },
  "laws": {
    "page": "30",
    "objective": "Trace a proposal becoming an Act.",
    "why": "A proposed new law is a Bill. Both Houses debate and vote; after passage the Governor-General gives Royal Assent.",
    "visual": [
      "Bill",
      "both Houses",
      "Royal Assent",
      "law."
    ],
    "terms": [
      [
        "Key distinction",
        "Trace a proposal becoming an Act."
      ],
      [
        "Exam cue",
        "A proposal is not automatically law when first introduced."
      ]
    ],
    "scenario": "A proposal is not automatically law when first introduced.",
    "question": "What is Royal Assent?",
    "answer": "The Governor-General's formal assent to a Bill becoming law."
  },
  "courts": {
    "page": "31",
    "objective": "Explain judicial independence and juries.",
    "why": "Judges and magistrates apply law independently; courts consider evidence. Juries decide guilt in some trials and judges determine penalties.",
    "visual": [
      "Evidence",
      "independent court",
      "judgement; some cases",
      "jury."
    ],
    "terms": [
      [
        "Key distinction",
        "Explain judicial independence and juries."
      ],
      [
        "Exam cue",
        "Police arrest suspects, but courts determine guilt."
      ]
    ],
    "scenario": "Police arrest suspects, but courts determine guilt.",
    "question": "Who decides penalties after a jury returns a guilty verdict?",
    "answer": "The judge."
  },
  "police": {
    "page": "31",
    "objective": "Distinguish police and courts.",
    "why": "Police protect people and property, maintain order and investigate crimes; the court decides guilt. AFP investigates federal offences.",
    "visual": [
      "Police",
      "investigate/arrest; courts",
      "decide guilt."
    ],
    "terms": [
      [
        "Key distinction",
        "Distinguish police and courts."
      ],
      [
        "Exam cue",
        "It is a crime to offer a bribe to a police officer."
      ]
    ],
    "scenario": "It is a crime to offer a bribe to a police officer.",
    "question": "Can police determine a person's guilt in court?",
    "answer": "No; the court decides."
  },
  "law-types": {
    "page": "32",
    "objective": "Apply everyday legal obligations.",
    "why": "Family violence, assault, fraud and dangerous driving can be criminal offences; traffic rules include seatbelts, registration and lawful driving.",
    "visual": [
      "Safe relationships + lawful roads + no violence.",
      "Remember the difference",
      "Apply in a question"
    ],
    "terms": [
      [
        "Key distinction",
        "Apply everyday legal obligations."
      ],
      [
        "Exam cue",
        "Not knowing a law is not an excuse for breaking it."
      ]
    ],
    "scenario": "Not knowing a law is not an excuse for breaking it.",
    "question": "Is family violence accepted under Australian law?",
    "answer": "No. It is against the law."
  },
  "freedom-dignity": {
    "page": "34–35",
    "objective": "Connect freedom with responsibility and dignity.",
    "why": "Australian values recognise personal freedom and respect while expecting everyone to obey the law and respect others.",
    "visual": [
      "Freedom",
      "dignity",
      "lawful conduct."
    ],
    "terms": [
      [
        "Key distinction",
        "Connect freedom with responsibility and dignity."
      ],
      [
        "Exam cue",
        "Freedom never authorises violence or intimidation."
      ]
    ],
    "scenario": "Freedom never authorises violence or intimidation.",
    "question": "Is threatening someone a valid way to exercise freedom?",
    "answer": "No."
  },
  "values-law": {
    "page": "34",
    "objective": "Apply rule of law and parliamentary democracy.",
    "why": "Everyone must obey law, including leaders; people elect representatives who make laws in Parliament.",
    "visual": [
      "Equal before law + elected lawmakers.",
      "Remember the difference",
      "Apply in a question"
    ],
    "terms": [
      [
        "Key distinction",
        "Apply rule of law and parliamentary democracy."
      ],
      [
        "Exam cue",
        "Even when no one is watching, the law still applies."
      ]
    ],
    "scenario": "Even when no one is watching, the law still applies.",
    "question": "Can a powerful leader disregard the law?",
    "answer": "No."
  },
  "values-freedoms": {
    "page": "35",
    "objective": "Apply lawful speech, association and religion.",
    "why": "People may express views, peacefully protest, associate voluntarily and choose religion or none; Australian law prevails.",
    "visual": [
      "Speak + meet + believe; stay lawful.",
      "Remember the difference",
      "Apply in a question"
    ],
    "terms": [
      [
        "Key distinction",
        "Apply lawful speech, association and religion."
      ],
      [
        "Exam cue",
        "Religious practice cannot override Australian criminal law."
      ]
    ],
    "scenario": "Religious practice cannot override Australian criminal law.",
    "question": "Can a person peacefully criticise government?",
    "answer": "Yes, within the law."
  },
  "values-equality": {
    "page": "36",
    "objective": "Apply equality and fair opportunity.",
    "why": "People must be treated equally under law; men and women have equal rights and employment decisions should reflect skills.",
    "visual": [
      "Equal legal rights",
      "opportunity",
      "skills."
    ],
    "terms": [
      [
        "Key distinction",
        "Apply equality and fair opportunity."
      ],
      [
        "Exam cue",
        "A job should not be awarded based purely on wealth or gender."
      ]
    ],
    "scenario": "A job should not be awarded based purely on wealth or gender.",
    "question": "Should employers choose based on relevant skills?",
    "answer": "Yes."
  },
  "mutual-respect": {
    "page": "37",
    "objective": "Distinguish tolerance from intimidation.",
    "why": "Australians are expected to respect differing lawful opinions and dignity, rejecting racism, violence and abuse.",
    "visual": [
      "Listen",
      "respect",
      "peaceful disagreement."
    ],
    "terms": [
      [
        "Key distinction",
        "Distinguish tolerance from intimidation."
      ],
      [
        "Exam cue",
        "Tolerance does not require agreeing with every opinion."
      ]
    ],
    "scenario": "Tolerance does not require agreeing with every opinion.",
    "question": "Can people disagree while showing respect?",
    "answer": "Yes."
  },
  "english": {
    "page": "38",
    "objective": "Understand English's civic role.",
    "why": "The booklet identifies English as the national language, supporting participation in education, work and community.",
    "visual": [
      "English",
      "communication",
      "participation."
    ],
    "terms": [
      [
        "Key distinction",
        "Understand English's civic role."
      ],
      [
        "Exam cue",
        "Respect for English does not remove value from other languages."
      ]
    ],
    "scenario": "Respect for English does not remove value from other languages.",
    "question": "Why does the booklet encourage learning English?",
    "answer": "It helps people participate in society, education and employment."
  },
  "safety": {
    "page": "38",
    "objective": "Apply community safety principles.",
    "why": "People should report suspected serious crimes and child abuse to authorities. Online stalking, harassment and non-consensual sharing of intimate images may be unlawful.",
    "visual": [
      "Recognise danger",
      "report",
      "protect."
    ],
    "terms": [
      [
        "Key distinction",
        "Apply community safety principles."
      ],
      [
        "Exam cue",
        "Online behaviour is not exempt from Australian law."
      ]
    ],
    "scenario": "Online behaviour is not exempt from Australian law.",
    "question": "What should someone do if they know of child abuse?",
    "answer": "Report it to police to investigate."
  },
  "loyalty": {
    "page": "38",
    "objective": "Explain citizenship loyalty and dual citizenship.",
    "why": "Citizens pledge loyalty to Australia and its people, obey its laws and avoid undermining national security; dual citizenship may be possible.",
    "visual": [
      "Pledge",
      "loyalty",
      "respect laws."
    ],
    "terms": [
      [
        "Key distinction",
        "Explain citizenship loyalty and dual citizenship."
      ],
      [
        "Exam cue",
        "Holding another citizenship does not exempt someone from Australian laws in Australia."
      ]
    ],
    "scenario": "Holding another citizenship does not exempt someone from Australian laws in Australia.",
    "question": "Must a dual citizen obey Australian law while in Australia?",
    "answer": "Yes."
  }
});
