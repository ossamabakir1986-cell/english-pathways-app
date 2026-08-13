(()=>{
'use strict';
const D=window.COURSE_DATA;
if(!D?.levels)return;

function purposeFor(title=''){
  const t=title.toLowerCase();
  if(/be, subject pronouns/.test(t))return 'The verb be identifies or describes people and things, while subject pronouns show who or what the sentence is about. English changes be to am, is or are so the verb agrees with the subject; questions reverse the usual subject–verb order.';
  if(/present|past|future|perfect|continuous/.test(t))return 'English uses this system to place events in time and to show whether an action is a habit, a temporary event, a completed result, an earlier background event, or an expected future event.';
  if(/conditional|wish|if only/.test(t))return 'This structure connects a condition, imagined situation or regret with its result. The verb forms signal how real, possible, remote or impossible the situation is.';
  if(/modal|can|could|may|must|should|have to|obligation|deduction|possibility/.test(t))return 'Modal language shows the speaker’s attitude: ability, permission, obligation, probability, advice, distance or certainty. The choice of modal changes the strength of the message.';
  if(/passive|causative|agency/.test(t))return 'The passive changes the information focus. English can put the action, process or result first when the person who performs it is unknown, obvious or less important.';
  if(/relative|participle clause/.test(t))return 'These clauses attach extra information to a noun without starting a completely new sentence. They help English pack related ideas together clearly.';
  if(/reported|reporting|stance|hedg|distanc/.test(t))return 'Reporting and stance language separates the writer or speaker from a claim. It shows whose idea it is and how strongly the speaker accepts, questions or limits it.';
  if(/quantifier|countable|uncountable|approximation|proportional/.test(t))return 'Quantity language tells the listener how much, how many or how strongly two amounts relate. The noun type and the amount determine the form.';
  if(/pronoun|possessive|reference|ellipsis|substitution/.test(t))return 'Reference words prevent unnecessary repetition and help the listener track exactly which person, thing or idea is being discussed.';
  if(/preposition/.test(t))return 'Prepositions express relationships such as place, time, direction, cause or connection. Many advanced combinations are conventional patterns, so meaning and collocation must be learned together.';
  if(/inversion|cleft|focus|information structure|nominalisation|formal style|sentence architecture/.test(t))return 'This is information-structure grammar. It changes what receives emphasis, how formal the sentence sounds, and which idea the reader notices first.';
  if(/concession|contrast|connector|discourse|cohesion|metadiscourse|signposting|reformulation/.test(t))return 'These forms organise ideas across sentences. They tell the reader whether the next idea adds, contrasts, qualifies, explains, reformulates or concludes.';
  if(/pragmatic|irony|implication|rhetorical|register|parallelism/.test(t))return 'This area is about meaning beyond grammar alone: what a speaker implies, how wording fits the situation, and how rhythm or structure influences the listener.';
  if(/imperative|request/.test(t))return 'Imperatives and request forms manage actions between people. English changes the form to sound direct, neutral, polite or especially careful.';
  return 'The form is not only a rule to memorise. It carries a meaning and a communication purpose. Notice what changes in the sentence, then connect that change to the message it creates.';
}
function formFor(title='',examples=[]){
  const t=title.toLowerCase();
  if(/present simple/.test(t))return 'Typical pattern: subject + base verb; add -s/-es with he, she or it. Questions and negatives normally use do/does.';
  if(/present continuous/.test(t))return 'Typical pattern: subject + am/is/are + verb-ing. The form combines the verb be with an -ing participle.';
  if(/past simple/.test(t))return 'Typical pattern: subject + past form. Regular verbs normally take -ed; many common verbs have an irregular past form. Questions and negatives normally use did + base verb.';
  if(/past continuous/.test(t))return 'Typical pattern: subject + was/were + verb-ing. It often gives the background action around another past event.';
  if(/present perfect continuous/.test(t))return 'Typical pattern: subject + have/has been + verb-ing. It links an activity that began earlier with the present situation.';
  if(/present perfect/.test(t))return 'Typical pattern: subject + have/has + past participle. The structure connects a past event or experience to the present.';
  if(/past perfect/.test(t))return 'Typical pattern: subject + had + past participle. It marks an event as earlier than another past reference point.';
  if(/future continuous/.test(t))return 'Typical pattern: will be + verb-ing. It presents an activity as in progress at a future time.';
  if(/future perfect/.test(t))return 'Typical pattern: will have + past participle. It looks back from a future point to something completed by then.';
  if(/going to/.test(t))return 'Typical pattern: am/is/are going to + base verb. Use it especially for plans and predictions based on present evidence.';
  if(/passive/.test(t))return 'Core pattern: a form of be + past participle. Add by + agent only when the performer of the action matters.';
  if(/conditional/.test(t))return 'A conditional contains an if-clause and a result clause. The tense/modality combination tells the listener how real or remote the condition is.';
  if(/modal|can|could|may|must|should/.test(t))return 'Core pattern: modal + base verb. Modals do not normally take -s with he/she/it, and questions invert the modal and subject.';
  if(/relative/.test(t))return 'Attach a relative clause after the noun it describes, commonly with who, which, that, whose, where or a reduced participle form.';
  if(/reported speech/.test(t))return 'Reporting usually combines a reporting verb with a clause. Pronouns, time references and tense may shift when the viewpoint changes.';
  if(/be, subject pronouns/.test(t))return 'Core pattern: I am; he/she/it is; you/we/they are. In yes/no questions, move am/is/are before the subject.';
  return examples?.length ? `Use the rule, then compare the model: “${String(examples[0]).replace(/\s+/g,' ')}” Notice the word order and the words that carry the grammatical meaning.` : 'Identify the fixed part of the structure, the part that changes, and the position of each element in the sentence.';
}
function commonMistakes(title=''){
  const t=title.toLowerCase();
  const a=[];
  if(/present simple/.test(t))a.push('Forgetting third-person -s or using do/does with the wrong verb form.');
  if(/perfect/.test(t))a.push('Using a past simple form where a past participle is required, or choosing the perfect when there is no connection to the reference time.');
  if(/continuous/.test(t))a.push('Forgetting the form of be, or using the continuous with a verb that is normally stative in that meaning.');
  if(/modal/.test(t))a.push('Adding to or -s after a modal when the pattern requires the base verb.');
  if(/passive/.test(t))a.push('Using be + base verb instead of be + past participle, or adding an unnecessary by-agent.');
  if(/conditional/.test(t))a.push('Mixing the condition and result patterns without a meaning reason. Decide first whether the situation is real, possible, hypothetical or impossible.');
  if(/relative/.test(t))a.push('Using the wrong relative word or adding a pronoun that repeats the noun inside the relative clause.');
  if(/preposition/.test(t))a.push('Translating a preposition directly from another language instead of learning the English phrase as a complete pattern.');
  if(!a.length)a.push('Copying the model mechanically without checking whether the meaning and register fit the situation.');
  a.push('Focusing only on form. Always ask: what meaning does this grammar add here?');
  return a;
}
function readingMethod(level='A1'){
  const advanced=/C1|C2/.test(level), upper=/B2/.test(level);
  return advanced ? [
    'Preview the title and predict the writer’s purpose and likely position.',
    'Read once for argument structure, not individual vocabulary.',
    'Mark claims, evidence, qualification, contrast and reference chains.',
    'Reread difficult sentences by identifying the main clause before embedded detail.',
    'Summarise the writer’s position in your own words and identify what is implied rather than stated.'
  ] : upper ? [
    'Preview the title and decide what information you expect.',
    'Read quickly for the main idea and paragraph purpose.',
    'On the second read, underline evidence, contrast words and pronoun references.',
    'Infer unfamiliar vocabulary from the sentence before opening Word Help.',
    'Answer from evidence, then paraphrase instead of copying the passage.'
  ] : [
    'Look at the title and picture. Say what you think the text will be about.',
    'Read once without stopping. Find the people, place and main action.',
    'Read again and underline names, times, places and action words.',
    'Answer one question at a time and point to the sentence that supports your answer.',
    'Retell the passage in two or three simple sentences.'
  ];
}
function writingMethod(level='A1'){
  const advanced=/C1|C2/.test(level), upper=/B2/.test(level);
  return advanced ? [
    'Define audience, purpose and required register before drafting.',
    'Plan the information hierarchy: claim, support, qualification and conclusion.',
    'Draft for meaning first; then edit cohesion, stance, sentence architecture and lexical precision.',
    'Check paragraph openings and reference words so the reader can follow the argument without rereading.',
    'Final edit: remove repetition, test punctuation and verify that every sentence contributes to the task.'
  ] : upper ? [
    'Identify the reader, purpose and tone.',
    'Plan two or three paragraph purposes before writing full sentences.',
    'Use the target grammar where it naturally improves meaning; do not force it into every sentence.',
    'Edit connectors, reference words, verb forms and punctuation.',
    'Read the final version aloud and simplify any sentence that is difficult to understand.'
  ] : [
    'Answer: Who am I writing to? Why am I writing?',
    'Write three key ideas as short notes.',
    'Turn each note into a clear sentence and put the sentences in a logical order.',
    'Check the target grammar, capital letters, full stops and important spelling.',
    'Read it once as the reader. Add a missing detail if the message is not complete.'
  ];
}
function pronunciationWhy(focus='clear speech'){
  const f=String(focus||'clear speech').toLowerCase();
  if(/stress/.test(f))return 'English stress helps listeners find the important words. Content words usually carry more weight, while less important grammar words may become shorter or weaker.';
  if(/intonation|tone/.test(f))return 'Intonation is the movement of pitch across a thought group. It helps signal whether an idea is finished, continuing, uncertain, contrasting or emotionally marked.';
  if(/link|connected|weak form|reduction/.test(f))return 'In connected speech, words do not stay as isolated dictionary forms. Sounds may link and unstressed words may reduce, which makes speech smoother and helps listening comprehension.';
  if(/rhythm|cadence|pacing/.test(f))return 'English rhythm groups speech around stressed beats. Clear pacing gives the listener time to process ideas and prevents every word from receiving equal, unnatural emphasis.';
  if(/ending|final|ed|plural|third-person/.test(f))return 'Small final sounds can carry grammar, such as tense, number or agreement. They matter because losing the ending can change the grammatical message even when the main vocabulary is clear.';
  if(/vowel|consonant|sound|phoneme/.test(f))return 'A sound contrast matters when it helps distinguish words or keeps the message intelligible. The goal is reliable communication, not copying one native accent.';
  return `The focus “${focus}” matters because pronunciation carries structure as well as sound. Stress, rhythm, grouping and clear key sounds help the listener recognise words and understand how the message is organised.`;
}
function pronunciationMethod(focus='clear speech'){
  return [
    `Listen for ${focus}. Do not begin by repeating every word at full speed.`,
    'Mark thought groups with / and underline the words that carry the main message.',
    'Shadow one short phrase: listen, pause, repeat, then compare your rhythm.',
    'Record once at a comfortable speed. Check intelligibility before accent imitation.',
    'Repeat only the part that needs improvement, then record the whole sentence again.'
  ];
}
function extensionPassage(x,levelId){
  const topic=x.topicTitle||x.unitTitle||'the situation';
  const hook=x.hook||''; const fact=x.fact||''; const problem=x.problem||''; const task=x.realWorldTask||'';
  const advanced=/B2|C1|C2/.test(levelId);
  if(advanced){
    return `${hook} ${fact} A useful way to examine ${topic.toLowerCase()} is to separate the immediate facts from the assumptions people make about them. ${problem} One response may appear efficient, but a stronger response usually considers audience, evidence and possible consequences.\n\nImagine that a second person challenges the first decision and asks for a clearer reason. The speakers must explain what they know, what remains uncertain and why one option is preferable. ${task} The language focus becomes meaningful when it helps the speaker qualify a claim, organise information or make the relationship between ideas explicit.`;
  }
  return `${hook} ${fact} ${problem} The people stop and check the important information before they decide what to do. They use short, clear sentences and ask one extra question when something is not clear.\n\nNow the situation changes a little. A new person joins and needs the main information quickly. The group explains the situation again, chooses one useful next step and checks that everyone understands. ${task}`;
}
function extensionQuestions(x){
  const topic=x.topicTitle||x.unitTitle||'the situation';
  return [
    `What is the main point of the second text about ${topic}?`,
    'Which detail changes or develops the original situation?',
    'What decision or response seems most useful, and what evidence supports it?',
    `Write one sentence about the situation using the lesson grammar: ${x.grammar?.title||'target structure'}.`
  ];
}
function extraActivities(x,levelId){
  const ex=x.grammar?.examples||[]; const v=(x.vocab||[]).slice(0,4).map(o=>o.word);
  return [
    {title:'Notice the pattern',task:`Compare these model sentences: ${ex.slice(0,2).join(' / ')}. Underline the part that changes and explain what meaning changes with it.`},
    {title:'Retrieval challenge',task:`Close the explanation. Say the rule in your own words, then create one new example connected to ${x.topicTitle||x.unitTitle}.`},
    {title:'Vocabulary connection',task:`Use at least three of these words in one connected situation: ${v.join(', ')}.`},
    {title:'Meaning before form',task:`Describe the message you want to communicate first. Then choose the target grammar because it expresses that meaning, not simply because it is today’s rule.`}
  ];
}
for(const lvl of D.levels){
  for(const unit of lvl.units){
    for(const x of unit.lessons){
      x._ep={
        grammarWhy:purposeFor(x.grammar?.title),
        grammarForm:formFor(x.grammar?.title,x.grammar?.examples),
        commonMistakes:commonMistakes(x.grammar?.title),
        readingMethod:readingMethod(lvl.id),
        writingMethod:writingMethod(lvl.id),
        pronunciationMethod:pronunciationMethod(x.pronunciationFocus),
        pronunciationWhy:pronunciationWhy(x.pronunciationFocus),
        extensionPassage:extensionPassage(x,lvl.id),
        extensionQuestions:extensionQuestions(x),
        activities:extraActivities(x,lvl.id)
      };
    }
  }
}
})();
