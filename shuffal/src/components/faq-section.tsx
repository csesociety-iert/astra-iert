"use client";

import { useState } from "react";

const questions = [
  {
    question: "What is ASTRA?",
    answer:
      "ASTRA is the CSE Society portal at IERT for coding practice and learning. You can explore DSA problems, daily practice, contests, quizzes, and your activity dashboard.",
  },
  {
    question: "Who can use ASTRA?",
    answer:
      "CSE Society members can sign in with their Society ID or registered email and existing password. Guests can create an account with their name, email address, and a password.",
  },
  {
    question: "Do I need prior coding experience?",
    answer:
      "You can start with the practice problems available on ASTRA and build your skills as you go. Read each problem's description and examples before writing a solution.",
  },
  {
    question: "Which programming language can I use in the editor?",
    answer:
      "The coding workspace is currently configured for Python 3.",
  },
  {
    question: "How do I run or submit a solution?",
    answer:
      "Use Run to execute your code against the selected input. Submit is available for problems with judging configured; the workspace will show the result when judging completes.",
  },
  {
    question: "Where can I see my submissions and progress?",
    answer:
      "Sign in and visit your dashboard or submissions page to review your coding activity. Accepted submissions also contribute to your activity and streak where supported.",
  },
  {
    question: "What should I do if I can't sign in?",
    answer:
      "For a member account, try your Society ID or registered email with your existing member password. If the problem continues, contact the CSE Society team to check your account details.",
  },
];

export function FaqSection() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <section className="home-faq" aria-labelledby="home-faq-heading">
      <div className="home-faq-inner">
        <header className="home-faq-heading">
          <h2 id="home-faq-heading">Your Questions, Answered</h2>
          <p>Quick answers to common questions about ASTRA and the CSE Society portal.</p>
        </header>
        <div className="home-faq-list">
          {questions.map(({ question, answer }) => (
            <details className="home-faq-item" key={question} open={openQuestion === question}>
              <summary
                onClick={(event) => {
                  event.preventDefault();
                  setOpenQuestion((current) => current === question ? null : question);
                }}
              >
                {question}
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
