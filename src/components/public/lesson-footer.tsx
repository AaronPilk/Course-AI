"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { awardPoints, revokePoints, POINT_VALUES } from "@/lib/points";

const STORAGE_KEY = "cf:completed-lessons";

function getCompleted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setCompleted(list: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function LessonFooter({
  slug,
  moduleIdx,
  lessonIdx,
  prevHref,
  nextHref,
}: {
  slug: string;
  moduleIdx: number;
  lessonIdx: number;
  prevHref: string | null;
  nextHref: string | null;
}) {
  const key = `${moduleIdx}-${lessonIdx}`;
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(getCompleted().includes(key));
  }, [key]);

  function toggle() {
    const list = getCompleted();
    const eventId = `lesson_complete:${slug}:${key}`;
    let next: string[];
    if (list.includes(key)) {
      next = list.filter((k) => k !== key);
      revokePoints(eventId);
    } else {
      next = [...list, key];
      awardPoints({
        id: eventId,
        type: "lesson_complete",
        points: POINT_VALUES.lesson_complete,
        label: "Lesson completed",
      });
    }
    setCompleted(next);
    setDone(next.includes(key));
  }

  return (
    <footer className="mt-16 pt-8 border-t border-border/60 flex items-center justify-between gap-3 flex-wrap">
      <div>
        {prevHref ? (
          <Link href={prevHref}>
            <Button variant="ghost" size="md">
              <ChevronLeft className="size-4" />
              Previous
            </Button>
          </Link>
        ) : (
          <span />
        )}
      </div>

      <Button
        onClick={toggle}
        variant={done ? "outline" : "primary"}
        size="md"
      >
        {done ? (
          <>
            <Check className="size-4" />
            Completed
          </>
        ) : (
          <>Mark as complete</>
        )}
      </Button>

      <div>
        {nextHref ? (
          <Link href={nextHref}>
            <Button size="md">
              Next
              <ChevronRight className="size-4" />
            </Button>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </footer>
  );
}

// Hook that exposes completed list to other components (sidebar).
export function useCompletedLessons() {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    setList(getCompleted());
    function onStorage() {
      setList(getCompleted());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return list;
}
