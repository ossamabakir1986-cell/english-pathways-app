(()=>{
'use strict';
const D=window.COURSE_DATA;
if(!D?.levels)return;

const levelBand=id=>String(id||'A1').replace('_','.');
const short=s=>String(s||'').replace(/\s+/g,' ').trim();
function goalFor(x){
  const g=x.grammar?.title||'the target language', task=short(x.realWorldTask||x.speaking||x.writing||'use the lesson language in a real situation');
  if(x.day===1)return `Understand what ${g} means, how it is formed, and use it accurately in a short real-life exchange.`;
  if(x.day===2)return `Read for the main idea, find evidence, work out vocabulary from context, and respond to the text in your own words.`;
  if(x.day===3)return `Listen for meaning and detail, then improve intelligibility through focused pronunciation practice.`;
  if(x.day===4)return `Plan and deliver a clear spoken response for this real-world task: ${task}`;
  return `Plan, draft and edit a clear piece of writing for a real reader, using the unit language naturally.`;
}
function whyFor(x){
  if(x.day===1)return `Grammar is useful only when it changes or clarifies a message. In this lesson, connect the form “${x.grammar?.title||'target language'}” to the speaker's purpose, not just to a formula.`;
  if(x.day===2)return `Strong readers do not translate every word. They predict, read for purpose, locate evidence, infer meaning from context and then paraphrase.`;
  if(x.day===3)return `Listening improves when you separate the first listen for overall meaning from later listens for detail. Pronunciation practice then helps you notice the same stress and rhythm patterns as a speaker.`;
  if(x.day===4)return `Successful speaking combines message, organisation, listener awareness and intelligibility. Perfect grammar alone is not enough if the listener cannot follow the point.`;
  return `Good writing begins with reader and purpose. Grammar, vocabulary and punctuation support the message; they should not replace planning and clear organisation.`;
}
function sceneSet(x){
  const topic=short(x.topicTitle||x.unitTitle||x.title);
  if(x.day===1)return [
    {icon:'👀',title:'Notice the situation',text:short(x.hook||`Look at the people, place and purpose in ${topic}.`)},
    {icon:'💬',title:'Choose the language',text:`Notice how ${x.grammar?.title||'the target language'} changes the message or relationship between the speakers.`},
    {icon:'✅',title:'Use it yourself',text:short(x.realWorldTask||x.speaking||'Create your own short response for the same kind of situation.')}
  ];
  if(x.day===2)return [
    {icon:'🔎',title:'Preview',text:`Use the title and visual context to predict what ${topic} will be about.`},
    {icon:'📖',title:'Read for evidence',text:'Find the sentence or detail that supports each answer before you write it.'},
    {icon:'🧠',title:'Respond',text:'Paraphrase the idea, connect it to the real-world problem, and explain your reasoning.'}
  ];
  if(x.day===3)return [
    {icon:'🎧',title:'First listen',text:'Listen for who is speaking, the situation and the main purpose.'},
    {icon:'📝',title:'Second listen',text:'Listen again for names, numbers, contrasts, requests and next steps.'},
    {icon:'🗣️',title:'Say it clearly',text:`Practise ${x.pronunciationFocus||'stress and rhythm'} and compare your recording with the model.`}
  ];
  if(x.day===4)return [
    {icon:'🧭',title:'Plan',text:'Decide your main point and two supporting details before you record.'},
    {icon:'🤝',title:'Fit the listener',text:'Choose language that is polite, clear and appropriate for the situation.'},
    {icon:'🎙️',title:'Deliver',text:'Record once, listen critically, improve one feature and record again.'}
  ];
  return [
    {icon:'🎯',title:'Purpose',text:'Identify the reader, reason for writing and expected result.'},
    {icon:'🧱',title:'Build',text:'Plan the order of ideas before turning notes into full sentences and paragraphs.'},
    {icon:'✍️',title:'Edit',text:'Check meaning first, then grammar, vocabulary, punctuation and readability.'}
  ];
}
function canDoFor(x){
  const g=x.grammar?.title||'the target language', topic=short(x.topicTitle||x.unitTitle);
  if(x.day===1)return [`explain what ${g} means in this lesson`,`build accurate examples of ${g}`,`recognise and correct common mistakes`,`use the language in a short exchange about ${topic}`];
  if(x.day===2)return ['predict a text from its title and context','find evidence for comprehension answers','infer the meaning of selected words from context','summarise the main point in my own words'];
  if(x.day===3)return ['identify the speakers and purpose','listen again for important details',`notice ${x.pronunciationFocus||'stress and rhythm'}`,'record a clearer version after self-checking'];
  if(x.day===4)return ['plan a spoken response before recording','use useful expressions from the unit','speak in clear thought groups','improve one specific feature after AI or self-feedback'];
  return ['identify reader and purpose before writing','organise ideas in a logical order',`use ${g} naturally where it helps the message`,'edit my draft for clarity and accuracy'];
}
function extraQuestions(x){
  if(x.day===2)return [
    'Which detail in the text is most important for understanding the situation, and why?',
    `Choose one course word from the text and explain what it means in this context.`,
  ];
  if(x.day===3)return [
    'Which words or phrases signal the most important information in the conversation?',
    'What detail from the recording supports your answer about the speaker’s purpose?'
  ];
  return [];
}
function speakingMethod(x){
  return [
    'Decide your message before choosing individual sentences.',
    'Plan three short points: opening, important detail, ending or next step.',
    `Use at least two lesson expressions${x.usefulPhrases?.length?`: ${x.usefulPhrases.slice(0,2).join(' / ')}`:''}.`,
    'Speak in thought groups instead of reading word by word.',
    'Listen to your recording once and improve one specific feature.'
  ];
}
function writingModel(x){
  const phrases=(x.usefulPhrases||[]).slice(0,2);
  const ex=x.grammar?.examples?.[0]||'';
  return {
    plan:['Who will read this?','What does the reader need to know?','What should happen after the reader finishes?'],
    model:`A strong response has a clear opening, connected detail and a purposeful ending.${ex?` It can use the target form naturally, for example: “${short(ex)}”`:''}${phrases.length?` Useful language from the unit includes ${phrases.join(' and ')}.`:''}`
  };
}
function applyCustomA1U1(x){
  if(x.id!=='A1-U1-D1')return;
  x._v4={...x._v4,
    displayTitle:'Introducing Yourself',
    goal:'Greet someone, say your name, ask another person’s name, and make a simple introduction naturally.',
    realLifeDialogue:[
      "Sara: Hi. I'm Sara. What's your name?",
      "Omar: Hi, Sara. I'm Omar. Nice to meet you.",
      "Sara: Nice to meet you too."
    ],
    keyLanguage:['Hi. / Hello.',"I'm Sara.",'My name is Sara.',"What's your name?",'Nice to meet you.','Nice to meet you too.'],
    grammarWhy:"We use the verb be to connect a person with information about that person. English normally needs a verb, so we say “I am Sara”, not “I Sara”. In everyday conversation, “I am” usually contracts to “I'm”.",
    grammarForm:"Full form: I am Sara. Short form: I'm Sara. The apostrophe shows that letters have been removed. With other subjects, the verb changes: he/she/it is; you/we/they are.",
    commonMistakes:[
      "I is Ahmed. → I am Ahmed. ‘I’ goes with ‘am’.",
      "I'm name Ahmed. → I'm Ahmed. / My name is Ahmed. Do not mix the two structures.",
      'My name Ahmed. → My name is Ahmed. The verb is is necessary.'
    ],
    pronunciationWhy:"In normal speech, “I am” often becomes “I'm”. The name usually carries stronger stress because it is the important new information: “I'm SARA.” English rhythm becomes clearer when important words are stronger and small grammar words are lighter.",
    scenes:[
      {icon:'👋',title:'1. Greet',text:'Two people meet for the first time and open the conversation with Hi or Hello.'},
      {icon:'🙋',title:'2. Introduce',text:"They give their names and ask “What's your name?”"},
      {icon:'🤝',title:'3. Respond politely',text:'They close the introduction with “Nice to meet you.”'}
    ],
    canDo:['greet someone','say my name with I am / I\'m','ask someone’s name','respond politely when meeting someone']
  };
}

for(const l of D.levels){
  for(const u of l.units){
    for(const x of u.lessons){
      const ep=x._ep||{};
      x._v4={
        band:levelBand(l.id),
        goal:goalFor(x),
        whyItMatters:whyFor(x),
        scenes:sceneSet(x),
        canDo:canDoFor(x),
        extraQuestions:extraQuestions(x),
        speakingMethod:speakingMethod(x),
        writingModel:writingModel(x),
        grammarWhy:ep.grammarWhy||x.grammar?.rule||'',
        grammarForm:ep.grammarForm||x.grammar?.rule||'',
        commonMistakes:ep.commonMistakes||[],
        interactionTarget:/A1|A2/.test(l.id)?12:/B1|B2/.test(l.id)?14:16
      };
      applyCustomA1U1(x);
    }
  }
}
})();
