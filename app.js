const SUBJECT_NAMES = {
  document: "Қазақстан тарихы • §7–8",
  full: "Толық тест",
  practice20: "Жаттығу тесті",
  quick10: "Жылдам тексеру"
};

const state = {
  mode: "full",
  questions: [],
  current: 0,
  score: 0,
  mistakes: [],
  locked: false
};

const el = {};

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getQuestionPool(mode) {
  if (mode === "practice20") return shuffle(QUIZ_QUESTIONS).slice(0, 20);
  if (mode === "quick10") return shuffle(QUIZ_QUESTIONS).slice(0, 10);
  return [...QUIZ_QUESTIONS];
}

function setScreen(screen) {
  [el.home, el.quiz, el.results].forEach((node) => node.classList.add("hidden"));
  screen.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".mode-option").forEach((button) => {
    button.classList.toggle("selected", button.dataset.mode === mode);
  });
}

function startQuiz() {
  state.questions = shuffle(getQuestionPool(state.mode));
  state.current = 0;
  state.score = 0;
  state.mistakes = [];
  state.locked = false;
  el.score.textContent = "0";
  el.modeLabel.textContent = SUBJECT_NAMES[state.mode];
  setScreen(el.quiz);
  renderQuestion();
}

function renderQuestion() {
  state.locked = false;
  const item = state.questions[state.current];
  const number = state.current + 1;
  const total = state.questions.length;

  el.progressText.textContent = `${number} / ${total}`;
  el.progressBar.style.width = `${(number / total) * 100}%`;
  el.questionNumber.textContent = `Сұрақ ${number}`;
  el.subjectChip.textContent = SUBJECT_NAMES[item.subject];
  el.subjectChip.classList.remove("world");
  el.questionTitle.textContent = item.question;
  el.feedback.className = "feedback hidden";
  el.feedback.innerHTML = "";
  el.nextButton.classList.add("hidden");
  el.nextButton.innerHTML = number === total
    ? "Нәтижені көру <span aria-hidden=\"true\">→</span>"
    : "Келесі сұрақ <span aria-hidden=\"true\">→</span>";

  el.answers.innerHTML = "";
  item.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.dataset.index = index;
    button.innerHTML = `<span class="answer-letter">${String.fromCharCode(65 + index)}</span><span>${option}</span>`;
    button.addEventListener("click", () => checkAnswer(index));
    el.answers.appendChild(button);
  });
}

function checkAnswer(selectedIndex) {
  if (state.locked) return;
  state.locked = true;
  const item = state.questions[state.current];
  const correct = selectedIndex === item.correct;

  [...el.answers.children].forEach((button, index) => {
    button.disabled = true;
    if (index === item.correct) button.classList.add("correct-answer");
    if (index === selectedIndex && !correct) button.classList.add("wrong-answer");
  });

  if (correct) {
    state.score += 1;
    el.score.textContent = state.score;
    el.feedback.innerHTML = `<strong>Дұрыс жауап!</strong>${item.explanation}`;
  } else {
    state.mistakes.push({ question: item, selectedIndex });
    el.feedback.classList.add("wrong");
    el.feedback.innerHTML = `<strong>Қате жауап.</strong>Дұрыс нұсқа: ${item.options[item.correct]}. ${item.explanation}`;
  }

  el.feedback.classList.remove("hidden");
  el.nextButton.classList.remove("hidden");
}

function nextQuestion() {
  if (!state.locked) return;
  if (state.current < state.questions.length - 1) {
    state.current += 1;
    renderQuestion();
  } else {
    showResults();
  }
}

function resultMessage(percent) {
  if (percent >= 90) return "Өте жақсы! Тақырыптарды сенімді меңгергенсіз.";
  if (percent >= 70) return "Жақсы нәтиже. Қателерді қайталау ұпайды тез көтереді.";
  if (percent >= 50) return "Негіз бар. Төмендегі қателерге назар аударып, тестті қайталаңыз.";
  return "Бұл — бастапқы нәтиже. Қате сұрақтарды талдау арқылы ілгерілеуге болады.";
}

function showResults() {
  const total = state.questions.length;
  const percent = Math.round((state.score / total) * 100);
  const wrong = total - state.score;

  el.percent.textContent = `${percent}%`;
  el.resultRing.style.setProperty("--score", percent);
  el.resultMessage.textContent = resultMessage(percent);
  el.correctTotal.textContent = state.score;
  el.wrongTotal.textContent = wrong;
  el.questionTotal.textContent = total;
  el.mistakeCount.textContent = `${wrong} қате`;
  renderReview();
  setScreen(el.results);
}

function renderReview() {
  if (state.mistakes.length === 0) {
    el.reviewList.innerHTML = `<div class="perfect-state"><span>✓</span>Қате жоқ. Барлық жауап дұрыс!</div>`;
    return;
  }

  el.reviewList.innerHTML = state.mistakes.map(({ question, selectedIndex }, index) => `
    <article class="review-item">
      <div class="review-subject">${index + 1}. ${SUBJECT_NAMES[question.subject]}</div>
      <h4>${question.question}</h4>
      <div class="answer-review">
        <p class="was-wrong">Сіздің жауабыңыз: <strong>${question.options[selectedIndex]}</strong></p>
        <p class="was-correct">Дұрыс жауап: <strong>${question.options[question.correct]}</strong></p>
      </div>
      <p class="review-note">${question.explanation}</p>
    </article>
  `).join("");
}

function cacheElements() {
  el.home = document.querySelector("#home-screen");
  el.quiz = document.querySelector("#quiz-screen");
  el.results = document.querySelector("#results-screen");
  el.startButton = document.querySelector("#start-button");
  el.quitButton = document.querySelector("#quit-button");
  el.nextButton = document.querySelector("#next-button");
  el.restartButton = document.querySelector("#restart-button");
  el.modeLabel = document.querySelector("#mode-label");
  el.progressText = document.querySelector("#progress-text");
  el.progressBar = document.querySelector("#progress-bar");
  el.score = document.querySelector("#score-text");
  el.subjectChip = document.querySelector("#subject-chip");
  el.questionNumber = document.querySelector("#question-number");
  el.questionTitle = document.querySelector("#question-title");
  el.answers = document.querySelector("#answers");
  el.feedback = document.querySelector("#feedback");
  el.percent = document.querySelector("#percent-text");
  el.resultRing = document.querySelector("#result-ring");
  el.resultMessage = document.querySelector("#result-message");
  el.correctTotal = document.querySelector("#correct-total");
  el.wrongTotal = document.querySelector("#wrong-total");
  el.questionTotal = document.querySelector("#question-total");
  el.mistakeCount = document.querySelector("#mistake-count");
  el.reviewList = document.querySelector("#review-list");
}

function init() {
  cacheElements();
  document.querySelectorAll(".mode-option").forEach((button) => {
    button.addEventListener("click", () => selectMode(button.dataset.mode));
  });
  el.startButton.addEventListener("click", startQuiz);
  el.nextButton.addEventListener("click", nextQuestion);
  el.quitButton.addEventListener("click", () => setScreen(el.home));
  el.restartButton.addEventListener("click", () => setScreen(el.home));
}

document.addEventListener("DOMContentLoaded", init);

if (typeof module !== "undefined") {
  module.exports = { shuffle, getQuestionPool, resultMessage, SUBJECT_NAMES };
}
