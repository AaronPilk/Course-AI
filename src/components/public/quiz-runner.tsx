"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Check, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { awardPoints, POINT_VALUES } from "@/lib/points";

type Question = {
  id: string;
  position: number;
  type: string;
  prompt: string;
  choices: { id: string; text: string }[];
  correctAnswer: string | null;
  explanation: string | null;
  points: number;
};

export function QuizRunner({
  questions,
  nextHref,
  backHref,
  pointKey,
  kind,
}: {
  questions: Question[];
  nextHref: string | null;
  backHref: string;
  /** Unique event key for the points system, e.g. "module-quiz:slug:0" or "lesson-quiz:slug:0:0". */
  pointKey: string;
  kind: "lesson" | "module";
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  const total = questions.length;
  const q = questions[idx];
  const selected = answers[q.id];
  const isRevealed = revealed[q.id];
  const isCorrect = selected && selected === q.correctAnswer;

  function pick(choiceId: string) {
    if (isRevealed) return;
    setAnswers((a) => ({ ...a, [q.id]: choiceId }));
  }

  function check() {
    if (!selected) return;
    setRevealed((r) => ({ ...r, [q.id]: true }));
  }

  function next() {
    if (idx < total - 1) {
      setIdx(idx + 1);
    } else {
      setFinished(true);
    }
  }

  function prev() {
    if (idx > 0) setIdx(idx - 1);
  }

  const score = questions.reduce((sum, qq) => {
    return answers[qq.id] === qq.correctAnswer ? sum + qq.points : sum;
  }, 0);
  const maxScore = questions.reduce((sum, qq) => sum + qq.points, 0);

  // Compute the points to award when the user finishes.
  const passed = score >= Math.ceil(maxScore * 0.8);
  let pointsToAward = 0;
  let pointsLabel = "";
  let pointsType: "lesson_quiz_passed" | "lesson_quiz_completed" | "module_quiz_completed" =
    "lesson_quiz_completed";

  if (kind === "lesson") {
    if (passed) {
      pointsToAward = POINT_VALUES.lesson_quiz_passed;
      pointsLabel = "Quick check passed";
      pointsType = "lesson_quiz_passed";
    } else if (score > 0) {
      pointsToAward = POINT_VALUES.lesson_quiz_completed;
      pointsLabel = "Quick check completed";
      pointsType = "lesson_quiz_completed";
    }
  } else {
    // Module quiz: per-correct + perfect bonus.
    pointsToAward = score * POINT_VALUES.module_quiz_per_correct;
    if (passed) pointsToAward += POINT_VALUES.module_quiz_perfect;
    pointsLabel = "Module quiz completed";
    pointsType = "module_quiz_completed";
  }

  // Idempotently award when the user reaches the finish screen.
  useEffect(() => {
    if (finished && pointsToAward > 0) {
      awardPoints({
        id: pointKey,
        type: pointsType,
        points: pointsToAward,
        label: pointsLabel,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (finished) {
    return (
      <Card>
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div
            className={cn(
              "mx-auto size-14 rounded-full grid place-items-center text-2xl font-semibold",
              passed
                ? "bg-accent/15 text-accent"
                : score >= maxScore * 0.6
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-muted text-mutedForeground"
            )}
          >
            {score}/{maxScore}
          </div>
          <h3 className="text-xl font-semibold tracking-tight">
            {score >= maxScore * 0.8
              ? "Nailed it."
              : score >= maxScore * 0.6
                ? "Solid pass."
                : "Worth another pass."}
          </h3>
          <p className="text-sm text-mutedForeground max-w-md mx-auto">
            You scored {score} out of {maxScore}. Review the explanations for
            any questions you missed, then move on.
          </p>
          {pointsToAward > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium">
              <Sparkles className="size-3.5" />
              +{pointsToAward} points · {pointsLabel}
            </div>
          )}
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <Link href={backHref}>
              <Button variant="outline">
                <ChevronLeft className="size-4" />
                Back to lesson
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                setIdx(0);
                setAnswers({});
                setRevealed({});
                setFinished(false);
              }}
            >
              Retake
            </Button>
            {nextHref && (
              <Link href={nextHref}>
                <Button>
                  Next module
                  <ChevronRight className="size-4" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-mutedForeground">
        <span>
          Question {idx + 1} of {total}
        </span>
        <span>{q.points} pt</span>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-lg font-semibold leading-snug">{q.prompt}</h2>
          <div className="space-y-2">
            {q.choices.map((c) => {
              const chosen = selected === c.id;
              const isAnswer = c.id === q.correctAnswer;
              return (
                <button
                  key={c.id}
                  onClick={() => pick(c.id)}
                  disabled={isRevealed}
                  className={cn(
                    "w-full text-left rounded-xl border px-4 py-3 transition flex items-start gap-3",
                    !isRevealed && chosen
                      ? "border-accent bg-accent/10"
                      : !isRevealed
                        ? "border-border hover:bg-muted/60"
                        : isAnswer
                          ? "border-emerald-500 bg-emerald-500/10"
                          : chosen
                            ? "border-red-500 bg-red-500/10"
                            : "border-border opacity-60"
                  )}
                >
                  <span className="size-6 rounded-full bg-muted text-xs font-semibold grid place-items-center shrink-0 mt-0.5">
                    {c.id.toUpperCase()}
                  </span>
                  <span className="text-sm flex-1 leading-relaxed">
                    {c.text}
                  </span>
                  {isRevealed && isAnswer && (
                    <Check className="size-5 text-emerald-500 shrink-0" />
                  )}
                  {isRevealed && !isAnswer && chosen && (
                    <X className="size-5 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {isRevealed && q.explanation && (
            <div
              className={cn(
                "rounded-xl border p-4 text-sm leading-relaxed",
                isCorrect
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-amber-500/30 bg-amber-500/5"
              )}
            >
              <div className="font-medium mb-1">
                {isCorrect ? "Correct." : "Not quite."}
              </div>
              {q.explanation}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={prev} disabled={idx === 0}>
          <ChevronLeft className="size-4" />
          Back
        </Button>
        {isRevealed ? (
          <Button onClick={next}>
            {idx === total - 1 ? "Finish" : "Next question"}
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={check} disabled={!selected}>
            Check answer
          </Button>
        )}
      </div>
    </div>
  );
}
