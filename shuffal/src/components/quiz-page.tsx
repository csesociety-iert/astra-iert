"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Brain, Check, CircleAlert, RotateCcw, Trophy } from "lucide-react";

const questions = [
  {
    prompt: "What is the average lookup time for a key in a hash map?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: 0,
    explanation: "A hash function maps the key directly to a bucket, giving average constant-time lookup.",
  },
  {
    prompt: "Which data structure is most suitable for checking balanced parentheses?",
    options: ["Queue", "Stack", "Binary search tree", "Hash set"],
    answer: 1,
    explanation: "A stack tracks the most recently opened bracket so it can be matched first.",
  },
  {
    prompt: "What must be true before applying binary search to an array?",
    options: ["The array must be sorted", "The array must have unique values", "The array must have even length", "The array must contain positive values"],
    answer: 0,
    explanation: "Binary search relies on sorted order to discard half of the remaining search space at each step.",
  },
  {
    prompt: "Which traversal explores a graph as far as possible before backtracking?",
    options: ["Breadth-first search", "Level-order traversal", "Depth-first search", "Topological sort"],
    answer: 2,
    explanation: "Depth-first search follows a path deeply before backtracking, usually using recursion or an explicit stack.",
  },
  {
    prompt: "For a sorted array, what is the time complexity of the two-pointer pair-sum scan?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 2,
    explanation: "Each pointer moves at most n times, so the scan runs in linear time.",
  },
];

export function QuizPage() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const isComplete = questionIndex === questions.length;
  const question = questions[questionIndex];
  const progress = Math.round(((questionIndex + Number(answered)) / questions.length) * 100);

  function checkAnswer() {
    if (selectedAnswer === null || answered) return;
    if (selectedAnswer === question.answer) setScore((current) => current + 1);
    setAnswered(true);
  }

  function continueQuiz() {
    setQuestionIndex((current) => current + 1);
    setSelectedAnswer(null);
    setAnswered(false);
  }

  function restartQuiz() {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
  }

  return (
    <main className="container-shell portal-content interactive-quiz-page">
      <header className="interactive-quiz-heading">
        <p className="interactive-quiz-eyebrow"><Brain size={15} aria-hidden="true" /> ASTRA KNOWLEDGE CHECK</p>
        <h1>Quick quiz. Sharper skills.</h1>
        <p>Five questions on data structures and algorithms. Choose an answer to see how you did.</p>
      </header>

      <section className="interactive-quiz-card" aria-label="Data structures and algorithms quiz">
        <div className="interactive-quiz-card-header">
          <span>{isComplete ? "Quiz complete" : `Question ${questionIndex + 1} of ${questions.length}`}</span>
          <span className="interactive-quiz-score"><Trophy size={15} aria-hidden="true" /> {score} / {questions.length}</span>
        </div>
        <div
          className="interactive-quiz-progress"
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={isComplete ? 100 : progress}
        >
          <span style={{ width: `${isComplete ? 100 : progress}%` }} />
        </div>

        {isComplete ? (
          <div className="interactive-quiz-result" aria-live="polite">
            <span className="interactive-quiz-result-icon"><Trophy size={25} aria-hidden="true" /></span>
            <p className="interactive-quiz-eyebrow">YOUR RESULT</p>
            <h2>{score} out of {questions.length} correct</h2>
            <p>{score === questions.length
              ? "Excellent work—you have a strong grasp of these fundamentals."
              : score >= 3
                ? "Nice work. Keep practicing to make these concepts second nature."
                : "A good start. Review the explanations and give it another try."}</p>
            <div className="interactive-quiz-result-actions">
              <button type="button" onClick={restartQuiz}><RotateCcw size={16} aria-hidden="true" /> Try again</button>
              <Link href="/problems">Practice questions <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
        ) : (
          <div className="interactive-quiz-question" aria-live="polite">
            <h2>{question.prompt}</h2>
            <fieldset>
              <legend className="sr-only">Select one answer</legend>
              {question.options.map((option, index) => {
                const isCorrect = answered && index === question.answer;
                const isIncorrect = answered && index === selectedAnswer && index !== question.answer;
                return (
                  <label
                    key={option}
                    className={`interactive-quiz-option${selectedAnswer === index ? " is-selected" : ""}${isCorrect ? " is-correct" : ""}${isIncorrect ? " is-incorrect" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`quiz-question-${questionIndex}`}
                      value={index}
                      checked={selectedAnswer === index}
                      disabled={answered}
                      onChange={() => setSelectedAnswer(index)}
                    />
                    <span className="interactive-quiz-option-marker">{String.fromCharCode(65 + index)}</span>
                    <span>{option}</span>
                    {isCorrect && <Check size={17} aria-label="Correct answer" />}
                    {isIncorrect && <CircleAlert size={17} aria-label="Incorrect answer" />}
                  </label>
                );
              })}
            </fieldset>

            {answered && (
              <div className={`interactive-quiz-feedback${selectedAnswer === question.answer ? " is-correct" : " is-incorrect"}`} role="status">
                <strong>{selectedAnswer === question.answer ? "That’s correct." : "Not quite."}</strong>
                <span>{question.explanation}</span>
              </div>
            )}

            <div className="interactive-quiz-actions">
              {!answered ? (
                <button type="button" onClick={checkAnswer} disabled={selectedAnswer === null}>Check answer</button>
              ) : (
                <button type="button" onClick={continueQuiz}>
                  {questionIndex === questions.length - 1 ? "See results" : "Next question"}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
