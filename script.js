// Global Variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
const timeLimit = 30; // Time per question (seconds)

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const startButton = document.getElementById('start-btn');
const retryButton = document.getElementById('retry-btn');
const questionElement = document.getElementById('question');
const choicesElement = document.getElementById('choices');
const nextButton = document.getElementById('next-btn');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const difficultySelect = document.getElementById('difficulty');

// Event Listeners
startButton.addEventListener('click', startQuiz);
retryButton.addEventListener('click', restartQuiz);
nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  loadQuestion();
});

// Fetch Questions from API
async function fetchQuestions() {
  const difficulty = difficultySelect.value || 'medium'; // Get selected difficulty
  const apiUrl = `https://opentdb.com/api.php?amount=5&category=9&difficulty=${difficulty}&type=multiple`;

  try {
    const response = await fetch(apiUrl);

    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if questions are returned
    if (!data.results || data.results.length === 0) {
      throw new Error('No quiz questions found!');
    }

    // Map questions to the expected format
    questions = data.results.map((item) => {
      const choices = [...item.incorrect_answers];
      choices.push(item.correct_answer);
      return {
        question: item.question,
        choices: shuffleArray(choices),
        answer: item.correct_answer,
      };
    });

    loadQuestion(); // Load the first question
  } catch (error) {
    console.error('Failed to fetch quiz questions:', error);
    alert('Error fetching questions. Please try again later.');
  }
}

// Start Quiz
function startQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  startScreen.classList.remove('visible');
  quizScreen.classList.add('visible');
  fetchQuestions();
}

// Load Question
function loadQuestion() {
  clearInterval(timerInterval); // Clear the previous timer
  if (currentQuestionIndex >= questions.length) {
    endQuiz();
    return;
  }

  const currentQuestion = questions[currentQuestionIndex];
  questionElement.innerHTML = currentQuestion.question;
  choicesElement.innerHTML = '';

  currentQuestion.choices.forEach((choice) => {
    const button = document.createElement('button');
    button.textContent = choice;
    button.classList.add('choice-btn');
    button.addEventListener('click', () => handleAnswer(button, currentQuestion.answer));
    choicesElement.appendChild(button);
  });

  startTimer(timeLimit);
}

// Handle Answer Selection
function handleAnswer(selectedButton, correctAnswer) {
  clearInterval(timerInterval); // Stop the timer
  const isCorrect = selectedButton.textContent === correctAnswer;

  if (isCorrect) {
    selectedButton.classList.add('correct');
    score++;
  } else {
    selectedButton.classList.add('wrong');
    // Highlight the correct answer
    Array.from(choicesElement.children).forEach((button) => {
      if (button.textContent === correctAnswer) {
        button.classList.add('correct');
      }
    });
  }

  // Disable all buttons after an answer is selected
  Array.from(choicesElement.children).forEach((button) => (button.disabled = true));

  nextButton.classList.remove('hidden'); // Show "Next Question" button
}

// Start Timer
function startTimer(duration) {
  let timeRemaining = duration;
  timerElement.textContent = `Time Left: ${timeRemaining}s`;

  timerInterval = setInterval(() => {
    timeRemaining--;
    timerElement.textContent = `Time Left: ${timeRemaining}s`;

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      handleAnswer({ textContent: '' }, questions[currentQuestionIndex].answer); // Auto-submit
    }
  }, 1000);
}

// End Quiz
function endQuiz() {
  quizScreen.classList.remove('visible');
  resultScreen.classList.add('visible');

  scoreElement.textContent = `You answered ${score} out of ${questions.length} questions correctly.`;
}

// Restart Quiz
function restartQuiz() {
  resultScreen.classList.remove('visible');
  startScreen.classList.add('visible');
}

// Utility: Shuffle Array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
