const SUBJECT_NAMES = {
  document: "Қазақстан тарихы • 11-сынып • §7–8",
  full: "Толық тест",
  practice20: "Жаттығу тесті",
  quick10: "Жылдам тексеру"
};

const COURSE_CATALOG = {
  kazakhstan: {
    name: "Қазақстан тарихы",
    totalQuestions: 41,
    grades: [
      { grade: 6, topics: [] },
      { grade: 7, topics: [] },
      { grade: 8, topics: [] },
      { grade: 9, topics: [] },
      { grade: 10, topics: [] },
      {
        grade: 11,
        topics: [
          {
            id: "grade-11-7-8",
            section: "§7–8",
            title: "Тақырыптық тест",
            description: "Мемлекеттілік, этникалық үдерістер және Қазақстан тарихының негізгі кезеңдері бойынша білімді тексеру.",
            questionCount: 41
          }
        ]
      }
    ]
  },
  world: {
    name: "Дүниежүзі тарихы",
    totalQuestions: 0,
    grades: [
      { grade: 6, topics: [] },
      { grade: 7, topics: [] },
      { grade: 8, topics: [] },
      { grade: 9, topics: [] },
      { grade: 10, topics: [] },
      { grade: 11, topics: [] }
    ]
  }
};

const state = {
  mode: "full",
  currentSubject: "kazakhstan",
  currentGrade: 11,
  currentTopic: "grade-11-7-8",
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
  [el.subjects, el.catalog, el.grade, el.home, el.quiz, el.results].forEach(function (node) {
    node.classList.add("hidden");
  });
  screen.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showSubjects() {
  setScreen(el.subjects);
  document.title = "Тарих — тақырыптық тесттер";
}

function getSubjectData() {
  return COURSE_CATALOG[state.currentSubject];
}

function renderGrades() {
  const subject = getSubjectData();
  const topicTotal = subject.grades.reduce(function (sum, item) {
    return sum + item.topics.length;
  }, 0);

  el.catalogTitle.textContent = subject.name;
  el.catalogLead.textContent = "Сыныбыңызды таңдаңыз. Әр сыныптың ішінде тақырыптық тесттер орналасады.";
  el.catalogTopicTotal.textContent = topicTotal;
  el.catalogQuestionTotal.textContent = subject.totalQuestions;

  el.gradeGrid.innerHTML = subject.grades.map(function (item) {
    const available = item.topics.length > 0;
    const questionTotal = item.topics.reduce(function (sum, topic) {
      return sum + topic.questionCount;
    }, 0);
    const details = available
      ? item.topics.length + " тақырып • " + questionTotal + " сұрақ"
      : "Тақырыптық тесттер";
    return [
      '<button class="grade-card' + (available ? " available" : "") + '" type="button" data-grade="' + item.grade + '">',
      '<span class="grade-number">' + item.grade + '</span>',
      '<span class="grade-copy"><strong>' + item.grade + '-сынып</strong><small>' + details + '</small></span>',
      '<span class="grade-status ' + (available ? "ready" : "soon") + '">' + (available ? "Ашу →" : "Дайындалады") + '</span>',
      '</button>'
    ].join("");
  }).join("");

  el.gradeGrid.querySelectorAll("[data-grade]").forEach(function (button) {
    button.addEventListener("click", function () {
      showGrade(Number(button.dataset.grade));
    });
  });
}

function showSubjectCatalog(subjectKey) {
  state.currentSubject = subjectKey;
  renderGrades();
  setScreen(el.catalog);
  document.title = getSubjectData().name + " — тақырыптық тесттер";
}

function renderTopics() {
  const subject = getSubjectData();
  const gradeData = subject.grades.find(function (item) {
    return item.grade === state.currentGrade;
  });
  const topics = gradeData ? gradeData.topics : [];

  el.gradeSubjectName.textContent = subject.name;
  el.gradeTitle.textContent = state.currentGrade + "-сынып";
  el.gradeDescription.textContent = topics.length
    ? "Тақырыпты таңдап, тест режимін белгілеңіз."
    : "Бұл сыныптың тақырыптық тесттері кезең-кезеңімен қосылады.";
  el.gradeTopicCount.textContent = topics.length ? topics.length + " тақырып" : "Әзірге бос";

  if (!topics.length) {
    el.topicList.innerHTML = [
      '<div class="empty-topics">',
      '<span aria-hidden="true">+</span>',
      '<h2>Тесттер қосылады</h2>',
      '<p>Осы сыныпқа арналған Word немесе PDF тест құжаты жүктелгенде, жаңа тақырып осы жерде пайда болады.</p>',
      '</div>'
    ].join("");
    return;
  }

  el.topicList.innerHTML = topics.map(function (topic) {
    return [
      '<button class="topic-card" type="button" data-topic="' + topic.id + '">',
      '<span class="topic-section">' + topic.section + '</span>',
      '<span class="topic-copy"><strong>' + topic.title + '</strong><small>' + topic.description + '</small></span>',
      '<span class="topic-meta"><strong>' + topic.questionCount + '</strong><small>сұрақ</small></span>',
      '<span class="topic-arrow" aria-hidden="true">→</span>',
      '</button>'
    ].join("");
  }).join("");

  el.topicList.querySelectorAll("[data-topic]").forEach(function (button) {
    button.addEventListener("click", function () {
      openTopic(button.dataset.topic);
    });
  });
}

function showGrade(grade) {
  state.currentGrade = grade;
  renderTopics();
  setScreen(el.grade);
  document.title = state.currentGrade + "-сынып — " + getSubjectData().name;
}

function openTopic(topicId) {
  state.currentTopic = topicId;
  el.gradeBackButton.textContent = "← " + state.currentGrade + "-сынып тақырыптары";
  setScreen(el.home);
  document.title = "11-сынып §7–8 — тест тренажері";
}

function selectMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".mode-option").forEach(function (button) {
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

  el.progressText.textContent = number + " / " + total;
  el.progressBar.style.width = (number / total) * 100 + "%";
  el.questionNumber.textContent = "Сұрақ " + number;
  el.subjectChip.textContent = SUBJECT_NAMES[item.subject];
  el.subjectChip.classList.remove("world");
  el.questionTitle.textContent = item.question;
  el.feedback.className = "feedback hidden";
  el.feedback.innerHTML = "";
  el.nextButton.classList.add("hidden");
  el.nextButton.innerHTML = number === total
    ? 'Нәтижені көру <span aria-hidden="true">→</span>'
    : 'Келесі сұрақ <span aria-hidden="true">→</span>';

  el.answers.innerHTML = "";
  item.options.forEach(function (option, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.dataset.index = index;
    button.innerHTML = '<span class="answer-letter">' + String.fromCharCode(65 + index) + '</span><span>' + option + '</span>';
    button.addEventListener("click", function () {
      checkAnswer(index);
    });
    el.answers.appendChild(button);
  });
}

function checkAnswer(selectedIndex) {
  if (state.locked) return;
  state.locked = true;
  const item = state.questions[state.current];
  const correct = selectedIndex === item.correct;

  [...el.answers.children].forEach(function (button, index) {
    button.disabled = true;
    if (index === item.correct) button.classList.add("correct-answer");
    if (index === selectedIndex && !correct) button.classList.add("wrong-answer");
  });

  if (correct) {
    state.score += 1;
    el.score.textContent = state.score;
    el.feedback.innerHTML = "<strong>Дұрыс жауап!</strong>" + item.explanation;
  } else {
    state.mistakes.push({ question: item, selectedIndex: selectedIndex });
    el.feedback.classList.add("wrong");
    el.feedback.innerHTML = "<strong>Қате жауап.</strong>Дұрыс нұсқа: " + item.options[item.correct] + ". " + item.explanation;
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

  el.percent.textContent = percent + "%";
  el.resultRing.style.setProperty("--score", percent);
  el.resultMessage.textContent = resultMessage(percent);
  el.correctTotal.textContent = state.score;
  el.wrongTotal.textContent = wrong;
  el.questionTotal.textContent = total;
  el.mistakeCount.textContent = wrong + " қате";
  renderReview();
  setScreen(el.results);
}

function renderReview() {
  if (state.mistakes.length === 0) {
    el.reviewList.innerHTML = '<div class="perfect-state"><span>✓</span>Қате жоқ. Барлық жауап дұрыс!</div>';
    return;
  }

  el.reviewList.innerHTML = state.mistakes.map(function (mistake, index) {
    const question = mistake.question;
    return [
      '<article class="review-item">',
      '<div class="review-subject">' + (index + 1) + ". " + SUBJECT_NAMES[question.subject] + '</div>',
      '<h4>' + question.question + '</h4>',
      '<div class="answer-review">',
      '<p class="was-wrong">Сіздің жауабыңыз: <strong>' + question.options[mistake.selectedIndex] + '</strong></p>',
      '<p class="was-correct">Дұрыс жауап: <strong>' + question.options[question.correct] + '</strong></p>',
      '</div>',
      '<p class="review-note">' + question.explanation + '</p>',
      '</article>'
    ].join("");
  }).join("");
}

function cacheElements() {
  el.subjects = document.querySelector("#subject-screen");
  el.catalog = document.querySelector("#catalog-screen");
  el.grade = document.querySelector("#grade-screen");
  el.home = document.querySelector("#home-screen");
  el.quiz = document.querySelector("#quiz-screen");
  el.results = document.querySelector("#results-screen");
  el.brandHome = document.querySelector("#brand-home");
  el.subjectsBackButton = document.querySelector("#subjects-back-button");
  el.catalogBackButton = document.querySelector("#catalog-back-button");
  el.gradeBackButton = document.querySelector("#grade-back-button");
  el.catalogTitle = document.querySelector("#catalog-title");
  el.catalogLead = document.querySelector("#catalog-lead");
  el.catalogTopicTotal = document.querySelector("#catalog-topic-total");
  el.catalogQuestionTotal = document.querySelector("#catalog-question-total");
  el.gradeGrid = document.querySelector("#grade-grid");
  el.gradeSubjectName = document.querySelector("#grade-subject-name");
  el.gradeTitle = document.querySelector("#grade-title");
  el.gradeDescription = document.querySelector("#grade-description");
  el.gradeTopicCount = document.querySelector("#grade-topic-count");
  el.topicList = document.querySelector("#topic-list");
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
  document.querySelectorAll(".subject-card").forEach(function (button) {
    button.addEventListener("click", function () {
      showSubjectCatalog(button.dataset.subject);
    });
  });
  document.querySelectorAll(".mode-option").forEach(function (button) {
    button.addEventListener("click", function () {
      selectMode(button.dataset.mode);
    });
  });
  el.brandHome.addEventListener("click", function (event) {
    event.preventDefault();
    showSubjects();
  });
  el.subjectsBackButton.addEventListener("click", showSubjects);
  el.catalogBackButton.addEventListener("click", function () {
    showSubjectCatalog(state.currentSubject);
  });
  el.gradeBackButton.addEventListener("click", function () {
    showGrade(state.currentGrade);
  });
  el.startButton.addEventListener("click", startQuiz);
  el.nextButton.addEventListener("click", nextQuestion);
  el.quitButton.addEventListener("click", function () { setScreen(el.home); });
  el.restartButton.addEventListener("click", function () { setScreen(el.home); });
}

document.addEventListener("DOMContentLoaded", init);

if (typeof module !== "undefined") {
  module.exports = { shuffle, getQuestionPool, resultMessage, SUBJECT_NAMES, COURSE_CATALOG };
}
