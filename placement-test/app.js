
(() => {
  'use strict';

  const DATA = window.EXAM_DATA;
  const STORAGE_KEY = 'english-placement-test-state-v2';
  const DB_NAME = 'EnglishPlacementTestAudio';
  const DB_STORE = 'recordings';

  const screen = document.getElementById('screen');
  const toast = document.getElementById('toast');
  const modalRoot = document.getElementById('modalRoot');
  const saveIndicator = document.getElementById('saveIndicator');
  const headerSubtitle = document.getElementById('headerSubtitle');

  let timerHandle = null;
  let mediaRecorder = null;
  let mediaStream = null;
  let recordingChunks = [];
  let recordingStartedAt = null;
  let recordingClock = null;
  let activeAudioQuestionId = null;

  function freshState() {
    return {
      started: false,
      finished: false,
      paused: false,
      viewingResultsSectionIndex: null,
      candidate: { name: '', email: '', purpose: 'General assessment', variety: 'No preference' },
      consent: false,
      sectionIndex: 0,
      questionIndex: 0,
      sectionStatus: DATA.sections.map(() => 'not-started'),
      sectionRemaining: DATA.sections.map(s => s.durationMinutes * 60),
      sectionStartedAt: DATA.sections.map(() => null),
      sectionDeadline: DATA.sections.map(() => null),
      responses: {},
      marked: {},
      listeningPlays: {},
      completedAt: null,
      startedAt: null,
      activityLog: []
    };
  }

  function normalizeState(saved) {
    const base = freshState();
    const normalized = {
      ...base,
      ...(saved || {}),
      candidate: { ...base.candidate, ...((saved || {}).candidate || {}) }
    };
    const fitArray = (value, fallback) => DATA.sections.map((_, i) =>
      Array.isArray(value) && value[i] !== undefined ? value[i] : fallback[i]
    );
    normalized.sectionStatus = fitArray(normalized.sectionStatus, base.sectionStatus);
    normalized.sectionRemaining = fitArray(normalized.sectionRemaining, base.sectionRemaining);
    normalized.sectionStartedAt = fitArray(normalized.sectionStartedAt, base.sectionStartedAt);
    normalized.sectionDeadline = fitArray(normalized.sectionDeadline, base.sectionDeadline);
    normalized.responses = normalized.responses || {};
    normalized.marked = normalized.marked || {};
    normalized.listeningPlays = normalized.listeningPlays || {};
    normalized.activityLog = Array.isArray(normalized.activityLog) ? normalized.activityLog : [];
    normalized.paused = Boolean(normalized.paused);
    normalized.viewingResultsSectionIndex = Number.isInteger(normalized.viewingResultsSectionIndex)
      ? normalized.viewingResultsSectionIndex
      : null;
    return normalized;
  }

  let state = normalizeState(loadState() || freshState());

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Could not load saved state', error);
      return null;
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveIndicator.textContent = 'Saved locally';
    saveIndicator.style.color = '';
  }

  function logActivity(type, details = {}) {
    state.activityLog.push({ type, details, at: new Date().toISOString() });
    saveState();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function formatTime(seconds) {
    const safe = Math.max(0, Math.floor(seconds));
    const m = Math.floor(safe / 60).toString().padStart(2, '0');
    const s = (safe % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function wordCount(text) {
    return String(text || '').trim() ? String(text).trim().split(/\s+/).length : 0;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function showModal({ title, body, buttons }) {
    modalRoot.innerHTML = `
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal">
          <h2>${escapeHtml(title)}</h2>
          <div>${body}</div>
          <div class="modal-actions" id="modalActions"></div>
        </div>
      </div>`;
    const actions = document.getElementById('modalActions');
    buttons.forEach(btn => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = btn.className || 'ghost-button';
      el.textContent = btn.label;
      el.addEventListener('click', () => {
        if (btn.close !== false) modalRoot.innerHTML = '';
        btn.onClick?.();
      });
      actions.appendChild(el);
    });
  }

  function currentSection() { return DATA.sections[state.sectionIndex]; }
  function currentQuestion() { return currentSection().questions[state.questionIndex]; }

  function isAnswered(question) {
    const response = state.responses[question.id];
    if (question.type === 'mcq') return Number.isInteger(response?.selected);
    if (question.type === 'text') return Boolean(response?.text?.trim());
    if (question.type === 'speaking') return Boolean(response?.recorded);
    return false;
  }

  function sectionSummary(section = currentSection()) {
    const answered = section.questions.filter(isAnswered).length;
    const marked = section.questions.filter(q => state.marked[q.id]).length;
    return { answered, marked, unanswered: section.questions.length - answered };
  }

  function completedSectionIndexes() {
    return DATA.sections
      .map((_, i) => i)
      .filter(i => state.sectionStatus[i] === 'completed');
  }

  function scoreSection(section) {
    const objective = section.questions.filter(q => q.type === 'mcq' && Number.isInteger(q.answer));
    const answered = objective.filter(isAnswered).length;
    const correct = objective.filter(q => state.responses[q.id]?.selected === q.answer).length;
    const incorrect = answered - correct;
    const unanswered = objective.length - answered;
    return {
      gradable: objective.length > 0,
      total: objective.length,
      answered,
      correct,
      incorrect,
      unanswered,
      percentage: objective.length ? Math.round((correct / objective.length) * 100) : null
    };
  }

  function completedResultsListHtml() {
    const indexes = completedSectionIndexes();
    if (!indexes.length) return '';
    return `<div class="completed-results-list">
      ${indexes.map(i => {
        const section = DATA.sections[i];
        const score = scoreSection(section);
        const result = score.gradable ? `${score.correct}/${score.total} • ${score.percentage}%` : 'Pending AI grading';
        return `<div class="completed-result-row">
          <div><strong>${escapeHtml(section.title)}</strong><div class="section-meta">${result}</div></div>
          <button class="ghost-button" type="button" data-result-section="${i}">View results</button>
        </div>`;
      }).join('')}
    </div>`;
  }

  function bindCompletedResultButtons() {
    document.querySelectorAll('[data-result-section]').forEach(button => {
      button.addEventListener('click', () => {
        state.viewingResultsSectionIndex = Number(button.dataset.resultSection);
        saveState();
        render();
      });
    });
  }

  function render() {
    stopTimer();
    if (Number.isInteger(state.viewingResultsSectionIndex)) {
      return renderSectionResults(state.viewingResultsSectionIndex);
    }
    if (state.finished) return renderCompletion();
    if (!state.started) return renderWelcome();
    if (state.paused) return renderPaused();

    const status = state.sectionStatus[state.sectionIndex];
    if (status === 'not-started') return renderSectionIntro();
    if (status === 'review') return renderReview();
    if (status === 'completed') return renderBreak();
    return renderQuestion();
  }

  function renderWelcome() {
    headerSubtitle.textContent = 'Secure local examination';
    const totalQuestions = DATA.sections.reduce((sum, s) => sum + s.questions.length, 0);
    screen.innerHTML = `
      <div class="center-shell">
        <section class="hero-card">
          <div class="eyebrow">Diagnostic assessment</div>
          <h1>${escapeHtml(DATA.title)}</h1>
          <p class="lead">A structured, timed examination covering grammar, use of English, vocabulary, phrasal verbs, reading, listening, writing, and speaking.</p>
          <div class="metrics">
            <div class="metric"><div class="metric-label">Sections</div><div class="metric-value">${DATA.sections.length}</div></div>
            <div class="metric"><div class="metric-label">Questions & tasks</div><div class="metric-value">${totalQuestions}</div></div>
            <div class="metric"><div class="metric-label">Estimated time</div><div class="metric-value">3h 30m</div></div>
            <div class="metric"><div class="metric-label">Export</div><div class="metric-value">ZIP</div></div>
          </div>
          <div class="notice"><strong>Privacy:</strong> answers and recordings remain on this device. Nothing is uploaded automatically. At the end, download one ZIP file and upload it to ChatGPT for grading.</div>

          <div class="form-grid">
            <div class="field">
              <label for="candidateName">Candidate name</label>
              <input id="candidateName" autocomplete="name" value="${escapeHtml(state.candidate.name)}" placeholder="Full name">
            </div>
            <div class="field">
              <label for="candidateEmail">Email or candidate ID <span class="helper">(optional)</span></label>
              <input id="candidateEmail" value="${escapeHtml(state.candidate.email)}" placeholder="Email or ID">
            </div>
            <div class="field">
              <label for="purpose">Purpose</label>
              <select id="purpose">
                ${['General assessment','Employment','Teaching role','Study preparation','IELTS preparation','Other'].map(x => `<option ${state.candidate.purpose===x?'selected':''}>${x}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label for="variety">Preferred English variety</label>
              <select id="variety">
                ${['No preference','British English','American English'].map(x => `<option ${state.candidate.variety===x?'selected':''}>${x}</option>`).join('')}
              </select>
            </div>
          </div>

          <h2 style="margin-top:32px">Test sections</h2>
          <div class="section-list">
            ${DATA.sections.map((s,i)=>`<div class="section-list-item"><div class="section-number">${i+1}</div><div><strong>${escapeHtml(s.title)}</strong><div class="section-meta">${s.questions.length} questions/tasks</div></div><div class="section-time">${s.durationMinutes} min</div></div>`).join('')}
          </div>

          <label class="checkbox-row">
            <input id="consent" type="checkbox" ${state.consent?'checked':''}>
            <span>I understand that each section is timed, submitted answers cannot be changed, completed-section scores and correct answers may be reviewed, and the result is diagnostic rather than an official certificate.</span>
          </label>

          <div class="button-row">
            <button class="secondary-button" id="micCheck">Test microphone</button>
            <button class="primary-button" id="beginTest">Begin examination</button>
            ${loadState()?.started ? '<button class="ghost-button" id="resumeTest">Resume saved attempt</button>' : ''}
          </div>
        </section>
      </div>`;

    document.getElementById('micCheck').addEventListener('click', runMicCheck);
    document.getElementById('beginTest').addEventListener('click', () => {
      const name = document.getElementById('candidateName').value.trim();
      if (!name) return showToast('Enter the candidate name.');
      if (!document.getElementById('consent').checked) return showToast('Confirm the test conditions first.');
      state = freshState();
      state.candidate = {
        name,
        email: document.getElementById('candidateEmail').value.trim(),
        purpose: document.getElementById('purpose').value,
        variety: document.getElementById('variety').value
      };
      state.consent = true;
      state.started = true;
      state.startedAt = new Date().toISOString();
      logActivity('test-started');
      render();
    });
  }

  function renderSectionIntro() {
    const section = currentSection();
    headerSubtitle.textContent = `Section ${state.sectionIndex + 1} of ${DATA.sections.length}`;
    screen.innerHTML = `
      <div class="center-shell">
        <section class="hero-card">
          <div class="eyebrow">Section ${state.sectionIndex + 1} of ${DATA.sections.length}</div>
          <h1>${escapeHtml(section.title)}</h1>
          <p class="lead">${escapeHtml(section.instructions)}</p>
          <div class="metrics">
            <div class="metric"><div class="metric-label">Time limit</div><div class="metric-value">${section.durationMinutes} min</div></div>
            <div class="metric"><div class="metric-label">Items</div><div class="metric-value">${section.questions.length}</div></div>
            <div class="metric"><div class="metric-label">Navigation</div><div class="metric-value">Open</div></div>
            <div class="metric"><div class="metric-label">Review flags</div><div class="metric-value">Enabled</div></div>
          </div>
          <div class="notice warning"><strong>The timer starts when you press “Start section”.</strong> It cannot be paused. You may revisit any question in this section while time remains.</div>
          ${section.id === 'speaking' ? '<div class="notice" style="margin-top:12px"><strong>Microphone:</strong> run the microphone check now. Recordings can be replayed and replaced before section submission.</div>' : ''}
          ${completedSectionIndexes().length ? `
            <div class="results-dashboard">
              <h2>Completed-section results</h2>
              <p class="helper">Review scores and correct answers from submitted sections. Submitted answers remain locked.</p>
              ${completedResultsListHtml()}
            </div>` : ''}
          <div class="button-row">
            ${section.id === 'speaking' ? '<button class="secondary-button" id="sectionMicCheck">Test microphone</button>' : ''}
            ${completedSectionIndexes().length ? '<button class="ghost-button" id="downloadCompletedIntro">Download completed sections</button>' : ''}
            <button class="primary-button" id="startSection">Start section</button>
          </div>
        </section>
      </div>`;
    bindCompletedResultButtons();
    document.getElementById('downloadCompletedIntro')?.addEventListener('click', exportCompletedSections);
    document.getElementById('sectionMicCheck')?.addEventListener('click', runMicCheck);
    document.getElementById('startSection').addEventListener('click', () => {
      state.sectionStatus[state.sectionIndex] = 'active';
      state.sectionStartedAt[state.sectionIndex] = new Date().toISOString();
      state.sectionDeadline[state.sectionIndex] = Date.now() + (state.sectionRemaining[state.sectionIndex] * 1000);
      state.questionIndex = 0;
      logActivity('section-started', { section: section.id });
      render();
    });
  }

  function timerTick() {
    const i = state.sectionIndex;
    if (!state.sectionDeadline) state.sectionDeadline = DATA.sections.map(() => null);
    if (!state.sectionDeadline[i]) state.sectionDeadline[i] = Date.now() + (state.sectionRemaining[i] * 1000);
    const previous = state.sectionRemaining[i];
    state.sectionRemaining[i] = Math.max(0, Math.ceil((state.sectionDeadline[i] - Date.now()) / 1000));
    const timerEl = document.getElementById('timer');
    const reviewTimerEl = document.getElementById('reviewTimer');
    [timerEl, reviewTimerEl].filter(Boolean).forEach(el => {
      el.textContent = formatTime(state.sectionRemaining[i]);
      el.classList.toggle('warning', state.sectionRemaining[i] <= 300 && state.sectionRemaining[i] > 60);
      el.classList.toggle('danger', state.sectionRemaining[i] <= 60);
    });
    if (state.sectionRemaining[i] % 10 === 0 && state.sectionRemaining[i] !== previous) saveState();
    if (previous > 300 && state.sectionRemaining[i] <= 300) showToast('Five minutes remaining in this section.');
    if (previous > 60 && state.sectionRemaining[i] <= 60) showToast('One minute remaining.');
    if (state.sectionRemaining[i] <= 0) {
      stopTimer();
      state.sectionStatus[i] = 'review';
      logActivity('section-time-expired', { section: currentSection().id });
      showModal({
        title: 'Time has ended',
        body: '<p>The section timer has reached zero. Your responses have been saved and the section will now be submitted.</p>',
        buttons: [{ label: 'Continue', className: 'primary-button', onClick: () => submitSection(true) }]
      });
    }
  }

  function startTimer() {
    stopTimer();
    timerHandle = setInterval(timerTick, 1000);
  }
  function stopTimer() {
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = null;
  }

  function renderQuestion() {
    const section = currentSection();
    const question = currentQuestion();
    const summary = sectionSummary(section);
    headerSubtitle.textContent = `${section.title} • Section ${state.sectionIndex + 1} of ${DATA.sections.length}`;

    const passage = question.passageId ? DATA.readingPassages[question.passageId] : null;
    const audio = question.audioId ? DATA.listeningScripts[question.audioId] : null;
    const answer = state.responses[question.id] || {};

    screen.innerHTML = `
      <div class="exam-layout">
        <aside class="side-panel">
          <div class="side-heading"><div><div class="question-label">Time remaining</div><div class="timer" id="timer">${formatTime(state.sectionRemaining[state.sectionIndex])}</div></div></div>
          <div class="progress-track"><div class="progress-fill" style="width:${(summary.answered/section.questions.length)*100}%"></div></div>
          <div class="progress-copy">${summary.answered} of ${section.questions.length} answered • ${summary.marked} marked</div>
          <div class="palette" aria-label="Question navigation">
            ${section.questions.map((item,i)=>`<button type="button" data-jump="${i}" class="${isAnswered(item)?'answered ':''}${state.marked[item.id]?'marked ':''}${i===state.questionIndex?'current':''}" aria-label="Question ${i+1}">${i+1}</button>`).join('')}
          </div>
          <div class="legend">
            <div class="legend-row"><span class="legend-dot answered"></span> Answered</div>
            <div class="legend-row"><span class="legend-dot marked"></span> Marked for review</div>
            <div class="legend-row"><span class="legend-dot"></span> Unanswered</div>
          </div>
          <button class="secondary-button" id="reviewSection" style="width:100%;margin-top:18px">Review section</button>
        </aside>

        <section class="exam-main">
          <div class="exam-heading">
            <div><div class="question-label">${escapeHtml(section.title)}</div><h2>Question ${state.questionIndex + 1} of ${section.questions.length}</h2></div>
            <div class="question-label">${escapeHtml(question.skill || '')}</div>
          </div>
          <article class="question-card">
            ${passage ? `<div class="passage-panel"><h3>${escapeHtml(passage.title)}</h3><div class="passage-text">${escapeHtml(passage.text)}</div></div>` : ''}
            <div class="question-body">
              ${audio ? renderAudioBox(question, audio) : ''}
              <p class="question-prompt">${escapeHtml(question.prompt)}</p>
              ${renderAnswerControl(question, answer)}
            </div>
            <footer class="question-footer">
              <label class="mark-button"><input id="markReview" type="checkbox" ${state.marked[question.id]?'checked':''}> Mark for review / not sure</label>
              <div class="nav-group">
                <button class="ghost-button" id="previousQuestion" ${state.questionIndex===0?'disabled':''}>Previous</button>
                <button class="primary-button" id="nextQuestion">${state.questionIndex===section.questions.length-1?'Review section':'Next'}</button>
              </div>
            </footer>
          </article>
        </section>
      </div>`;

    startTimer();
    bindQuestionEvents(question, audio);
  }

  function renderAudioBox(question, audio) {
    const used = state.listeningPlays[audio.title] || 0;
    const remaining = Math.max(0, audio.playsAllowed - used);
    return `<div class="audio-box">
      <div class="audio-header"><div><strong>Listening recording</strong><div class="audio-status">${escapeHtml(audio.title)} • ${remaining} play${remaining===1?'':'s'} remaining</div></div><button class="secondary-button" id="playListening" ${remaining<=0?'disabled':''}>Play recording</button></div>
      <div class="audio-status" id="listeningStatus">Use headphones if available. Questions may be answered after listening.</div>
    </div>`;
  }

  function renderAnswerControl(question, answer) {
    if (question.type === 'mcq') {
      return `<div class="options">${question.options.map((option,i)=>`
        <label class="option-label ${answer.selected===i?'selected':''}">
          <input type="radio" name="answer" value="${i}" ${answer.selected===i?'checked':''}>
          <span><span class="option-letter">${String.fromCharCode(65+i)}.</span>${escapeHtml(option)}</span>
        </label>`).join('')}</div>`;
    }
    if (question.type === 'text') {
      const count = wordCount(answer.text || '');
      return `<div class="field"><textarea id="textAnswer" placeholder="Type your answer here...">${escapeHtml(answer.text || '')}</textarea><div class="word-count ${count>question.wordMax?'out':''}" id="wordCount">${count} words • target ${question.wordMin}–${question.wordMax}</div></div>`;
    }
    if (question.type === 'speaking') {
      return `<div class="record-box">
        <div class="record-header"><div><strong><span class="record-light" id="recordLight"></span>Voice answer</strong><div class="record-status" id="recordStatus">${answer.recorded ? 'Recording saved. You may replay or replace it.' : 'No recording saved yet.'}</div></div><div class="question-label">Suggested: ${Math.round(question.suggestedSec/60)}–${Math.ceil(question.suggestedSec/60)} min</div></div>
        <div class="record-controls">
          <button class="primary-button" id="startRecording">${answer.recorded?'Record again':'Start recording'}</button>
          <button class="danger-button" id="stopRecording" disabled>Stop</button>
          <button class="secondary-button" id="playRecording" ${answer.recorded?'':'disabled'}>Play answer</button>
          <button class="ghost-button" id="deleteRecording" ${answer.recorded?'':'disabled'}>Delete</button>
        </div>
        <audio id="recordedAudio" controls style="width:100%;margin-top:14px;display:none"></audio>
      </div>`;
    }
    return '';
  }

  function bindQuestionEvents(question, audio) {
    document.querySelectorAll('[data-jump]').forEach(btn => btn.addEventListener('click', () => jumpToQuestion(Number(btn.dataset.jump))));
    document.getElementById('reviewSection').addEventListener('click', () => { state.sectionStatus[state.sectionIndex] = 'review'; saveState(); render(); });
    document.getElementById('previousQuestion').addEventListener('click', () => jumpToQuestion(state.questionIndex - 1));
    document.getElementById('nextQuestion').addEventListener('click', () => nextQuestion(question));
    document.getElementById('markReview').addEventListener('change', e => { state.marked[question.id] = e.target.checked; saveState(); showToast(e.target.checked ? 'Question marked for review.' : 'Review mark removed.'); renderQuestion(); });

    if (question.type === 'mcq') {
      document.querySelectorAll('input[name="answer"]').forEach(input => input.addEventListener('change', e => {
        state.responses[question.id] = { selected: Number(e.target.value), answeredAt: new Date().toISOString() };
        saveState();
        document.querySelectorAll('.option-label').forEach(label => label.classList.toggle('selected', label.contains(e.target)));
        refreshPalette();
      }));
    }
    if (question.type === 'text') {
      const area = document.getElementById('textAnswer');
      area.addEventListener('input', () => {
        state.responses[question.id] = { text: area.value, answeredAt: new Date().toISOString() };
        saveState();
        const count = wordCount(area.value);
        const counter = document.getElementById('wordCount');
        counter.textContent = `${count} words • target ${question.wordMin}–${question.wordMax}`;
        counter.classList.toggle('out', count > question.wordMax);
        refreshPalette();
      });
    }
    if (question.type === 'speaking') bindRecordingControls(question);
    if (audio) document.getElementById('playListening').addEventListener('click', () => playListening(audio));
  }

  function refreshPalette() {
    const section = currentSection();
    const summary = sectionSummary(section);
    document.querySelectorAll('[data-jump]').forEach((btn,i) => {
      const item = section.questions[i];
      btn.classList.toggle('answered', isAnswered(item));
      btn.classList.toggle('marked', Boolean(state.marked[item.id]));
    });
    const fill = document.querySelector('.progress-fill');
    if (fill) fill.style.width = `${(summary.answered/section.questions.length)*100}%`;
    const copy = document.querySelector('.progress-copy');
    if (copy) copy.textContent = `${summary.answered} of ${section.questions.length} answered • ${summary.marked} marked`;
  }

  function nextQuestion(question) {
    if (!isAnswered(question)) {
      showModal({
        title: 'No answer entered',
        body: '<p>This question is currently unanswered. You may continue and return to it later while the section timer is running.</p>',
        buttons: [
          { label: 'Stay here', className: 'ghost-button' },
          { label: state.questionIndex === currentSection().questions.length - 1 ? 'Continue to review' : 'Continue unanswered', className: 'primary-button', onClick: moveNext }
        ]
      });
    } else moveNext();
  }

  function moveNext() {
    if (state.questionIndex < currentSection().questions.length - 1) {
      state.questionIndex += 1;
      saveState();
      render();
    } else {
      state.sectionStatus[state.sectionIndex] = 'review';
      saveState();
      render();
    }
  }

  function jumpToQuestion(index) {
    if (index < 0 || index >= currentSection().questions.length) return;
    state.questionIndex = index;
    saveState();
    render();
  }

  function renderReview() {
    const section = currentSection();
    const summary = sectionSummary(section);
    headerSubtitle.textContent = `${section.title} • Review`;
    screen.innerHTML = `
      <div class="center-shell">
        <section class="hero-card">
          <div class="eyebrow">Section review</div>
          <h1>${escapeHtml(section.title)}</h1>
          <div class="metrics">
            <div class="metric"><div class="metric-label">Answered</div><div class="metric-value">${summary.answered}</div></div>
            <div class="metric"><div class="metric-label">Unanswered</div><div class="metric-value">${summary.unanswered}</div></div>
            <div class="metric"><div class="metric-label">Marked</div><div class="metric-value">${summary.marked}</div></div>
            <div class="metric"><div class="metric-label">Time left</div><div class="metric-value" id="reviewTimer">${formatTime(state.sectionRemaining[state.sectionIndex])}</div></div>
          </div>
          <div class="notice ${summary.unanswered?'warning':'success'}">${summary.unanswered ? `You have ${summary.unanswered} unanswered item${summary.unanswered===1?'':'s'}. Open any item below to complete or review it before submission.` : 'Every question has a response. You may still revisit marked questions while time remains.'}</div>
          <div class="review-grid">
            ${section.questions.map((item,i)=>{
              const ans = isAnswered(item);
              const marked = Boolean(state.marked[item.id]);
              return `<div class="review-card"><div class="review-number">${i+1}</div><div><strong>${escapeHtml(item.skill || section.title)}</strong><div class="review-status">${ans?'Response saved':'No response'}${marked?' • Marked for review':''}</div></div><button class="${marked?'secondary-button':'ghost-button'}" data-review-jump="${i}">Open</button></div>`;
            }).join('')}
          </div>
          <div class="button-row end">
            <button class="ghost-button" id="returnToQuestions">Return to questions</button>
            <button class="primary-button" id="submitSection">Submit section</button>
          </div>
        </section>
      </div>`;

    startTimer();
    document.querySelectorAll('[data-review-jump]').forEach(btn => btn.addEventListener('click', () => {
      state.sectionStatus[state.sectionIndex] = 'active';
      state.questionIndex = Number(btn.dataset.reviewJump);
      saveState(); render();
    }));
    document.getElementById('returnToQuestions').addEventListener('click', () => {
      state.sectionStatus[state.sectionIndex] = 'active'; saveState(); render();
    });
    document.getElementById('submitSection').addEventListener('click', () => {
      showModal({
        title: 'Submit this section?',
        body: `<p>After submission, <strong>${escapeHtml(section.title)}</strong> cannot be reopened.</p>${summary.unanswered?`<p class="notice warning">${summary.unanswered} question${summary.unanswered===1?' is':'s are'} unanswered.</p>`:''}`,
        buttons: [
          { label: 'Continue reviewing', className: 'ghost-button' },
          { label: 'Submit section', className: 'primary-button', onClick: () => submitSection(false) }
        ]
      });
    });
  }

  function submitSection(auto) {
    stopTimer();
    const section = currentSection();
    state.sectionStatus[state.sectionIndex] = 'completed';
    state.viewingResultsSectionIndex = state.sectionIndex;
    logActivity('section-submitted', { section: section.id, automatic: auto, remainingSeconds: state.sectionRemaining[state.sectionIndex] });
    render();
  }

  function renderSectionResults(sectionIndex) {
    const section = DATA.sections[sectionIndex];
    const score = scoreSection(section);
    const summary = sectionSummary(section);
    const isLatestCompleted = sectionIndex === state.sectionIndex && state.sectionStatus[state.sectionIndex] === 'completed';
    const isLast = state.sectionIndex === DATA.sections.length - 1;
    headerSubtitle.textContent = `${section.title} • Results`;

    const metrics = score.gradable ? `
      <div class="metrics">
        <div class="metric"><div class="metric-label">Correct</div><div class="metric-value">${score.correct}/${score.total}</div></div>
        <div class="metric"><div class="metric-label">Score</div><div class="metric-value">${score.percentage}%</div></div>
        <div class="metric"><div class="metric-label">Incorrect</div><div class="metric-value">${score.incorrect}</div></div>
        <div class="metric"><div class="metric-label">Unanswered</div><div class="metric-value">${score.unanswered}</div></div>
      </div>` : `
      <div class="metrics">
        <div class="metric"><div class="metric-label">Tasks</div><div class="metric-value">${section.questions.length}</div></div>
        <div class="metric"><div class="metric-label">Responses saved</div><div class="metric-value">${summary.answered}</div></div>
        <div class="metric"><div class="metric-label">Unanswered</div><div class="metric-value">${summary.unanswered}</div></div>
        <div class="metric"><div class="metric-label">Status</div><div class="metric-value" style="font-size:16px">Pending AI grading</div></div>
      </div>`;

    const details = section.questions.map((question, i) => {
      const response = state.responses[question.id] || {};
      if (question.type === 'mcq') {
        const selected = Number.isInteger(response.selected) ? response.selected : null;
        const correct = selected === question.answer;
        const status = selected === null ? 'unanswered' : (correct ? 'correct' : 'incorrect');
        const selectedText = selected === null
          ? 'No answer'
          : `${String.fromCharCode(65 + selected)}. ${escapeHtml(question.options[selected])}`;
        const correctText = `${String.fromCharCode(65 + question.answer)}. ${escapeHtml(question.options[question.answer])}`;
        return `<article class="result-question ${status}">
          <div class="result-question-head">
            <div><span class="result-number">${i + 1}</span><strong>${escapeHtml(question.prompt)}</strong></div>
            <span class="status-chip ${status}">${status === 'correct' ? 'Correct' : status === 'incorrect' ? 'Incorrect' : 'Unanswered'}</span>
          </div>
          <div class="answer-comparison">
            <div class="answer-row"><span class="answer-label">Your answer</span><span class="answer-value">${selectedText}</span></div>
            <div class="answer-row"><span class="answer-label">Correct answer</span><span class="answer-value">${correctText}</span></div>
          </div>
          ${question.rationale ? `<div class="rationale"><strong>Explanation:</strong> ${escapeHtml(question.rationale)}</div>` : ''}
        </article>`;
      }
      if (question.type === 'text') {
        return `<article class="result-question open-response">
          <div class="result-question-head">
            <div><span class="result-number">${i + 1}</span><strong>${escapeHtml(question.prompt)}</strong></div>
            <span class="status-chip pending">Pending AI grading</span>
          </div>
          <div class="submitted-text">${response.text?.trim() ? escapeHtml(response.text) : 'No answer submitted.'}</div>
          <div class="helper">${wordCount(response.text || '')} words</div>
        </article>`;
      }
      return `<article class="result-question open-response">
        <div class="result-question-head">
          <div><span class="result-number">${i + 1}</span><strong>${escapeHtml(question.prompt)}</strong></div>
          <span class="status-chip pending">Pending AI grading</span>
        </div>
        <div class="submitted-text">${response.recorded ? `Voice recording saved${response.durationSeconds ? ` • ${Math.round(response.durationSeconds)} seconds` : ''}.` : 'No recording submitted.'}</div>
      </article>`;
    }).join('');

    screen.innerHTML = `
      <div class="center-shell wide">
        <section class="hero-card">
          <div class="completion-hero">
            <div class="completion-icon">✓</div>
            <div class="eyebrow">Completed section</div>
            <h1>${escapeHtml(section.title)} results</h1>
            <p class="lead" style="margin-left:auto;margin-right:auto">${score.gradable
              ? 'Your score and the correct answers are shown below.'
              : 'Your response is saved below. Writing and speaking require AI review after export.'}</p>
          </div>
          ${metrics}
          <div class="notice warning"><strong>Section locked:</strong> answers can be reviewed but cannot be changed after submission. Seeing feedback before later sections can slightly influence a diagnostic placement result.</div>

          <div class="button-row">
            <button class="ghost-button" id="returnFromResults">${state.finished ? 'Return to final page' : 'Return'}</button>
            <button class="secondary-button" id="downloadCompletedResults">Download completed sections</button>
            ${!state.finished ? '<button class="ghost-button" id="pauseFromResults">Pause and exit</button>' : ''}
            ${isLatestCompleted ? (isLast
              ? '<button class="primary-button" id="continueFromResults">Finish examination</button>'
              : `<button class="primary-button" id="continueFromResults">Continue to ${escapeHtml(DATA.sections[state.sectionIndex + 1].title)}</button>`) : ''}
          </div>

          <div class="results-dashboard">
            <h2>All completed sections</h2>
            ${completedResultsListHtml()}
          </div>

          <div class="results-detail">
            <h2>Question-by-question review</h2>
            ${details}
          </div>
        </section>
      </div>`;

    bindCompletedResultButtons();
    document.getElementById('downloadCompletedResults').addEventListener('click', exportCompletedSections);
    document.getElementById('returnFromResults').addEventListener('click', () => {
      state.viewingResultsSectionIndex = null;
      saveState();
      render();
    });
    document.getElementById('pauseFromResults')?.addEventListener('click', () => {
      state.viewingResultsSectionIndex = null;
      state.paused = true;
      logActivity('test-paused', { afterSection: section.id });
      render();
    });
    document.getElementById('continueFromResults')?.addEventListener('click', () => {
      state.viewingResultsSectionIndex = null;
      if (isLast) {
        state.finished = true;
        state.completedAt = new Date().toISOString();
        logActivity('test-completed');
      } else {
        state.sectionIndex += 1;
        state.questionIndex = 0;
        saveState();
      }
      render();
    });
  }

  function renderPaused() {
    const completed = completedSectionIndexes();
    const nextSection = state.sectionStatus[state.sectionIndex] === 'completed' && state.sectionIndex < DATA.sections.length - 1
      ? DATA.sections[state.sectionIndex + 1]
      : DATA.sections[state.sectionIndex];
    headerSubtitle.textContent = 'Test paused';
    screen.innerHTML = `
      <div class="center-shell">
        <section class="hero-card">
          <div class="completion-hero">
            <div class="completion-icon pause-icon">Ⅱ</div>
            <div class="eyebrow">Progress saved locally</div>
            <h1>Examination paused</h1>
            <p class="lead" style="margin-left:auto;margin-right:auto">You may safely close this browser tab. Return on this device and resume later.</p>
          </div>
          <div class="notice success"><strong>Next section:</strong> ${escapeHtml(nextSection?.title || 'Examination complete')}. Its timer has not started.</div>
          ${completed.length ? `<div class="results-dashboard"><h2>Completed-section results</h2>${completedResultsListHtml()}</div>` : ''}
          <div class="button-row" style="justify-content:center">
            ${completed.length ? '<button class="secondary-button" id="downloadCompletedPaused">Download completed sections</button>' : ''}
            <button class="primary-button" id="resumePaused">Resume examination</button>
          </div>
        </section>
      </div>`;
    bindCompletedResultButtons();
    document.getElementById('downloadCompletedPaused')?.addEventListener('click', exportCompletedSections);
    document.getElementById('resumePaused').addEventListener('click', () => {
      state.paused = false;
      if (state.sectionStatus[state.sectionIndex] === 'completed' && state.sectionIndex < DATA.sections.length - 1) {
        state.sectionIndex += 1;
        state.questionIndex = 0;
      }
      logActivity('test-resumed');
      render();
    });
  }

  function renderBreak() {
    const finishedSection = currentSection();
    const score = scoreSection(finishedSection);
    const last = state.sectionIndex === DATA.sections.length - 1;
    headerSubtitle.textContent = last ? 'All sections completed' : 'Section break';
    screen.innerHTML = `
      <div class="center-shell">
        <section class="hero-card">
          <div class="completion-hero">
            <div class="completion-icon">✓</div>
            <div class="eyebrow">Section submitted</div>
            <h1>${escapeHtml(finishedSection.title)} completed</h1>
            <p class="lead" style="margin-left:auto;margin-right:auto">Your responses are saved locally. ${last ? 'The examination is ready to finish.' : 'Review results or take a break. The next section timer has not started.'}</p>
          </div>
          ${score.gradable ? `
            <div class="metrics">
              <div class="metric"><div class="metric-label">Correct</div><div class="metric-value">${score.correct}/${score.total}</div></div>
              <div class="metric"><div class="metric-label">Score</div><div class="metric-value">${score.percentage}%</div></div>
              <div class="metric"><div class="metric-label">Incorrect</div><div class="metric-value">${score.incorrect}</div></div>
              <div class="metric"><div class="metric-label">Unanswered</div><div class="metric-value">${score.unanswered}</div></div>
            </div>` : '<div class="notice">This section requires AI grading. The submitted response is available in the results review.</div>'}
          <div class="results-dashboard">
            <h2>Completed-section results</h2>
            ${completedResultsListHtml()}
          </div>
          <div class="button-row" style="justify-content:center">
            <button class="secondary-button" id="downloadCompletedBreak">Download completed sections</button>
            ${last ? '<button class="primary-button" id="finishExam">Finish examination</button>' : `
              <button class="ghost-button" id="pauseExam">Pause and exit</button>
              <button class="primary-button" id="nextSection">Continue to ${escapeHtml(DATA.sections[state.sectionIndex+1].title)}</button>`}
          </div>
        </section>
      </div>`;
    bindCompletedResultButtons();
    document.getElementById('downloadCompletedBreak').addEventListener('click', exportCompletedSections);
    document.getElementById('pauseExam')?.addEventListener('click', () => {
      state.paused = true;
      logActivity('test-paused', { afterSection: finishedSection.id });
      render();
    });
    if (last) {
      document.getElementById('finishExam').addEventListener('click', () => {
        state.finished = true;
        state.completedAt = new Date().toISOString();
        logActivity('test-completed');
        render();
      });
    } else {
      document.getElementById('nextSection').addEventListener('click', () => {
        state.sectionIndex += 1;
        state.questionIndex = 0;
        saveState(); render();
      });
    }
  }

  function renderCompletion() {
    headerSubtitle.textContent = 'Examination complete';
    const total = DATA.sections.reduce((sum,s)=>sum+s.questions.length,0);
    const answered = DATA.sections.flatMap(s=>s.questions).filter(isAnswered).length;
    screen.innerHTML = `
      <div class="center-shell">
        <section class="hero-card">
          <div class="completion-hero">
            <div class="completion-icon">✓</div>
            <div class="eyebrow">Completed</div>
            <h1>Examination finished</h1>
            <p class="lead" style="margin-left:auto;margin-right:auto">Download the submission package. It includes all selected answers, writing responses, timing information, the grading manifest, and every saved voice recording.</p>
          </div>
          <div class="metrics">
            <div class="metric"><div class="metric-label">Candidate</div><div class="metric-value" style="font-size:18px">${escapeHtml(state.candidate.name)}</div></div>
            <div class="metric"><div class="metric-label">Responses saved</div><div class="metric-value">${answered}/${total}</div></div>
            <div class="metric"><div class="metric-label">Sections</div><div class="metric-value">${DATA.sections.length}</div></div>
            <div class="metric"><div class="metric-label">Package format</div><div class="metric-value">ZIP</div></div>
          </div>
          <div class="notice success"><strong>Next step:</strong> download the ZIP, then upload that ZIP file to ChatGPT and ask for the complete placement-test report.</div>
          <div class="results-dashboard">
            <h2>Review completed-section results</h2>
            ${completedResultsListHtml()}
          </div>
          <div class="button-row" style="justify-content:center">
            <button class="primary-button" id="downloadPackage">Download all answers and recordings</button>
            <button class="ghost-button" id="downloadText">Download text summary only</button>
            <button class="danger-button" id="resetExam">Erase this attempt</button>
          </div>
        </section>
      </div>`;
    bindCompletedResultButtons();
    document.getElementById('downloadPackage').addEventListener('click', exportZip);
    document.getElementById('downloadText').addEventListener('click', downloadTextSummary);
    document.getElementById('resetExam').addEventListener('click', confirmReset);
  }

  function buildResponsePayload(includeKey = false, sectionIndexes = null) {
    const indexes = Array.isArray(sectionIndexes) ? sectionIndexes : DATA.sections.map((_, i) => i);
    const sections = indexes.map(sectionIndex => {
      const section = DATA.sections[sectionIndex];
      return {
        id: section.id,
        title: section.title,
        status: state.sectionStatus[sectionIndex],
        durationMinutes: section.durationMinutes,
        remainingSeconds: state.sectionRemaining[sectionIndex],
        score: scoreSection(section),
        responses: section.questions.map((question,index) => {
          const response = state.responses[question.id] || {};
          const row = {
            number: index + 1,
            id: question.id,
            type: question.type,
            skill: question.skill,
            levelTarget: question.level,
            prompt: question.prompt,
            markedForReview: Boolean(state.marked[question.id]),
            answered: isAnswered(question)
          };
          if (question.type === 'mcq') {
            row.options = question.options;
            row.selectedIndex = Number.isInteger(response.selected) ? response.selected : null;
            row.selectedLetter = Number.isInteger(response.selected) ? String.fromCharCode(65 + response.selected) : null;
            row.selectedAnswer = Number.isInteger(response.selected) ? question.options[response.selected] : null;
            if (includeKey) {
              row.correctIndex = question.answer;
              row.correctLetter = String.fromCharCode(65 + question.answer);
              row.correctAnswer = question.options[question.answer];
              row.isCorrect = Number.isInteger(response.selected) && response.selected === question.answer;
              row.rationale = question.rationale;
            }
          } else if (question.type === 'text') {
            row.text = response.text || '';
            row.wordCount = wordCount(response.text || '');
            row.targetWords = [question.wordMin, question.wordMax];
          } else if (question.type === 'speaking') {
            row.recorded = Boolean(response.recorded);
            row.audioFilename = response.recorded ? `recordings/${question.id}.webm` : null;
            row.recordedMimeType = response.mimeType || null;
            row.durationSeconds = response.durationSeconds || null;
          }
          return row;
        })
      };
    });
    return {
      exam: { title: DATA.title, version: DATA.version, disclaimer: DATA.disclaimer },
      candidate: state.candidate,
      timing: { startedAt: state.startedAt, completedAt: state.completedAt, exportedAt: new Date().toISOString() },
      partialExport: Array.isArray(sectionIndexes),
      sections,
      activityLog: state.activityLog
    };
  }

  function buildTextSummary(sectionIndexes = null, includeKey = false) {
    const payload = buildResponsePayload(includeKey, sectionIndexes);
    const lines = [];
    lines.push(DATA.title);
    lines.push('='.repeat(DATA.title.length));
    lines.push(`Candidate: ${state.candidate.name}`);
    lines.push(`Purpose: ${state.candidate.purpose}`);
    lines.push(`Started: ${state.startedAt || ''}`);
    lines.push(`Completed: ${state.completedAt || ''}`);
    lines.push('');
    payload.sections.forEach(section => {
      lines.push(`
## ${section.title}`);
      if (section.score.gradable) {
        lines.push(`Score: ${section.score.correct}/${section.score.total} (${section.score.percentage}%)`);
        lines.push(`Incorrect: ${section.score.incorrect} | Unanswered: ${section.score.unanswered}`);
      } else {
        lines.push('Score: Pending AI grading');
      }
      section.responses.forEach(r => {
        lines.push(`
${r.number}. [${r.id}] ${r.prompt}`);
        if (r.type === 'mcq') {
          lines.push(`Your answer: ${r.selectedLetter || 'UNANSWERED'}${r.selectedAnswer ? ` — ${r.selectedAnswer}` : ''}`);
          if (includeKey) {
            lines.push(`Correct answer: ${r.correctLetter} — ${r.correctAnswer}`);
            lines.push(`Result: ${r.isCorrect ? 'CORRECT' : 'INCORRECT OR UNANSWERED'}`);
            if (r.rationale) lines.push(`Explanation: ${r.rationale}`);
          }
        }
        if (r.type === 'text') lines.push(`Answer (${r.wordCount} words):
${r.text || 'UNANSWERED'}`);
        if (r.type === 'speaking') lines.push(`Voice answer: ${r.recorded ? r.audioFilename : 'UNANSWERED'}`);
        if (r.markedForReview) lines.push('Marked for review: Yes');
      });
    });
    return lines.join('\n');
  }

  async function exportZip() {
    if (!window.JSZip) return showToast('ZIP library could not be loaded.');
    const button = document.getElementById('downloadPackage');
    button.disabled = true;
    button.textContent = 'Preparing package...';
    try {
      const zip = new JSZip();
      zip.file('responses.json', JSON.stringify(buildResponsePayload(false), null, 2));
      zip.file('grading_manifest.json', JSON.stringify({
        answerKey: buildResponsePayload(true),
        writingRubric: DATA.rubrics.writing,
        speakingRubric: DATA.rubrics.speaking,
        note: 'Use the response evidence to produce a CEFR-aligned diagnostic report. Do not score by simple percentage alone.'
      }, null, 2));
      zip.file('response_summary.txt', buildTextSummary());
      zip.file('README.txt', `Upload this entire ZIP file to ChatGPT. Ask: "Grade this comprehensive English placement test. Analyse every objective answer, writing task, and voice recording. Give separate CEFR estimates for grammar, use of English, vocabulary/phrasal verbs, reading, listening, writing, and speaking, plus an overall level and study plan."\n\n${DATA.disclaimer}\n`);

      const recordingsFolder = zip.folder('recordings');
      for (const question of DATA.sections.flatMap(s => s.questions).filter(q => q.type === 'speaking')) {
        const blob = await getRecording(question.id);
        if (blob) recordingsFolder.file(`${question.id}.webm`, blob);
      }

      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } }, metadata => {
        button.textContent = `Preparing package... ${Math.round(metadata.percent)}%`;
      });
      downloadBlob(blob, `${safeFilename(state.candidate.name)}_English_Placement_Test_${dateStamp()}.zip`);
      logActivity('package-downloaded');
      showToast('Submission package downloaded.');
    } catch (error) {
      console.error(error);
      showToast('Could not create the ZIP package.');
    } finally {
      button.disabled = false;
      button.textContent = 'Download all answers and recordings';
    }
  }

  async function exportCompletedSections() {
    const indexes = completedSectionIndexes();
    if (!indexes.length) return showToast('No completed sections are available yet.');
    if (!window.JSZip) return showToast('ZIP library could not be loaded.');
    showToast('Preparing completed-section package…');
    try {
      const zip = new JSZip();
      zip.file('completed_responses.json', JSON.stringify(buildResponsePayload(false, indexes), null, 2));
      zip.file('completed_results_with_answer_key.json', JSON.stringify(buildResponsePayload(true, indexes), null, 2));
      zip.file('completed_results.txt', buildTextSummary(indexes, true));
      zip.file('README.txt', `This package contains only sections completed at download time. Objective scores and correct answers are included. Writing and speaking remain pending AI review.\n\n${DATA.disclaimer}\n`);

      const recordingsFolder = zip.folder('recordings');
      const completedQuestions = indexes.flatMap(i => DATA.sections[i].questions);
      for (const question of completedQuestions.filter(q => q.type === 'speaking')) {
        const blob = await getRecording(question.id);
        if (blob) recordingsFolder.file(`${question.id}.webm`, blob);
      }

      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      downloadBlob(blob, `${safeFilename(state.candidate.name)}_Completed_Section_Results_${dateStamp()}.zip`);
      logActivity('completed-sections-downloaded', { sections: indexes.map(i => DATA.sections[i].id) });
      showToast('Completed-section package downloaded.');
    } catch (error) {
      console.error(error);
      showToast('Could not create the completed-section package.');
    }
  }

  function downloadTextSummary() {
    downloadBlob(new Blob([buildTextSummary()], { type: 'text/plain;charset=utf-8' }), `${safeFilename(state.candidate.name)}_response_summary.txt`);
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function safeFilename(value) { return String(value || 'candidate').replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '') || 'candidate'; }
  function dateStamp() { return new Date().toISOString().replace(/[:.]/g, '-'); }

  async function playListening(audio) {
    if (!('speechSynthesis' in window)) return showToast('Speech playback is unavailable in this browser.');
    const used = state.listeningPlays[audio.title] || 0;
    if (used >= audio.playsAllowed) return showToast('No plays remaining for this recording.');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(audio.script);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.lang = state.candidate.variety === 'American English' ? 'en-US' : 'en-GB';
    activeAudioQuestionId = audio.title;
    state.listeningPlays[audio.title] = used + 1;
    saveState();
    const status = document.getElementById('listeningStatus');
    if (status) status.textContent = 'Playing… listen carefully.';
    utterance.onend = () => { activeAudioQuestionId = null; showToast('Recording finished.'); render(); };
    utterance.onerror = () => { activeAudioQuestionId = null; showToast('Audio playback failed. Try Microsoft Edge or Chrome.'); render(); };
    window.speechSynthesis.speak(utterance);
    renderQuestion();
  }

  async function runMicCheck() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getAudioTracks()[0];
      const label = track.label || 'Microphone';
      stream.getTracks().forEach(t => t.stop());
      showModal({
        title: 'Microphone detected',
        body: `<div class="notice success"><strong>${escapeHtml(label)}</strong> is available. The browser has microphone permission.</div><p>During the Speaking section, press “Start recording,” speak, then press “Stop.”</p>`,
        buttons: [{ label: 'Done', className: 'primary-button' }]
      });
    } catch (error) {
      showModal({
        title: 'Microphone unavailable',
        body: '<div class="notice danger">The browser could not access a microphone. Check the site microphone permission and select the correct input device, such as “Microphone Array.”</div>',
        buttons: [{ label: 'Close', className: 'ghost-button' }]
      });
    }
  }

  function chooseMimeType() {
    const types = ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'];
    return types.find(type => window.MediaRecorder?.isTypeSupported(type)) || '';
  }

  function bindRecordingControls(question) {
    document.getElementById('startRecording').addEventListener('click', () => startRecording(question));
    document.getElementById('stopRecording').addEventListener('click', stopRecording);
    document.getElementById('playRecording').addEventListener('click', () => playSavedRecording(question.id));
    document.getElementById('deleteRecording').addEventListener('click', () => deleteSavedRecording(question.id));
  }

  async function startRecording(question) {
    try {
      if (mediaRecorder?.state === 'recording') return;
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      recordingChunks = [];
      const mimeType = chooseMimeType();
      mediaRecorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream);
      recordingStartedAt = Date.now();
      mediaRecorder.ondataavailable = e => { if (e.data.size) recordingChunks.push(e.data); };
      mediaRecorder.onstop = async () => {
        const durationSeconds = Math.max(1, Math.round((Date.now() - recordingStartedAt) / 1000));
        const blob = new Blob(recordingChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
        await putRecording(question.id, blob);
        state.responses[question.id] = { recorded: true, mimeType: blob.type, durationSeconds, answeredAt: new Date().toISOString() };
        saveState();
        mediaStream?.getTracks().forEach(t => t.stop());
        mediaStream = null;
        clearInterval(recordingClock);
        showToast('Voice answer saved.');
        render();
      };
      mediaRecorder.start(250);
      document.getElementById('startRecording').disabled = true;
      document.getElementById('stopRecording').disabled = false;
      document.getElementById('recordLight').classList.add('live');
      const status = document.getElementById('recordStatus');
      const update = () => status.textContent = `Recording… ${formatTime(Math.floor((Date.now() - recordingStartedAt) / 1000))}`;
      update();
      recordingClock = setInterval(update, 500);
    } catch (error) {
      console.error(error);
      showToast('Microphone access failed. Check browser permissions and the selected input device.');
    }
  }

  function stopRecording() {
    if (mediaRecorder?.state === 'recording') mediaRecorder.stop();
  }

  async function playSavedRecording(questionId) {
    const blob = await getRecording(questionId);
    if (!blob) return showToast('No recording was found.');
    const audioEl = document.getElementById('recordedAudio');
    audioEl.src = URL.createObjectURL(blob);
    audioEl.style.display = 'block';
    audioEl.play();
  }

  async function deleteSavedRecording(questionId) {
    showModal({
      title: 'Delete this recording?',
      body: '<p>You may record a new answer afterward.</p>',
      buttons: [
        { label: 'Cancel', className: 'ghost-button' },
        { label: 'Delete recording', className: 'danger-button', onClick: async () => {
          await deleteRecording(questionId);
          delete state.responses[questionId];
          saveState(); render();
        }}
      ]
    });
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function putRecording(id, blob) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(blob, id);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }
  async function getRecording(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).get(id);
      req.onsuccess = () => { db.close(); resolve(req.result || null); };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  }
  async function deleteRecording(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).delete(id);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }
  async function clearRecordings() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).clear();
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  function confirmReset() {
    showModal({
      title: 'Erase this attempt?',
      body: '<div class="notice danger">This permanently deletes all answers and voice recordings stored by this test on this browser.</div>',
      buttons: [
        { label: 'Cancel', className: 'ghost-button' },
        { label: 'Erase attempt', className: 'danger-button', onClick: async () => {
          localStorage.removeItem(STORAGE_KEY);
          await clearRecordings();
          state = freshState();
          render();
        }}
      ]
    });
  }

  document.getElementById('helpButton').addEventListener('click', () => {
    showModal({
      title: 'Test controls',
      body: '<p><strong>Next/Previous:</strong> move between questions in the current section.</p><p><strong>Mark for review:</strong> flag an uncertain or unanswered question. Marked questions appear with an amber indicator.</p><p><strong>Question numbers:</strong> open any question while the section timer remains active.</p><p><strong>Speaking:</strong> recordings are stored locally and included in the final ZIP.</p>',
      buttons: [{ label: 'Close', className: 'primary-button' }]
    });
  });

  window.addEventListener('beforeunload', () => {
    saveState();
    mediaStream?.getTracks().forEach(t => t.stop());
  });

  render();
})();
