// Heuristic copyright risk classifier. Cheap to compute, designed to
// trigger a closer human look — not to be a copyright determination.

export type Risk = "unknown" | "low" | "medium" | "high";

export interface RiskInput {
  source: { url?: string | null; license?: string | null };
  text: string;
}

const HIGH_RISK_HINTS = [
  /copyright\s+©/i,
  /all rights reserved/i,
  /reproduction\s+prohibited/i,
  /confidential/i,
];

const PERMISSIVE_LICENSES = [
  /creative commons/i,
  /cc[-\s]?by/i,
  /mit license/i,
  /apache 2/i,
  /bsd /i,
  /public domain/i,
  /gpl/i,
];

const HIGH_RISK_HOSTS = [
  /sci-hub/i,
  /libgen/i,
  /z-lib/i,
];

export function scoreCopyrightRisk(input: RiskInput): Risk {
  const { text } = input;
  const url = input.source.url ?? "";
  const license = input.source.license ?? "";

  if (HIGH_RISK_HOSTS.some((rx) => rx.test(url))) return "high";

  if (PERMISSIVE_LICENSES.some((rx) => rx.test(license))) return "low";
  if (PERMISSIVE_LICENSES.some((rx) => rx.test(text.slice(0, 4000)))) {
    return "low";
  }

  const hit = HIGH_RISK_HINTS.find((rx) => rx.test(text.slice(0, 4000)));
  if (hit) return "medium";

  return "unknown";
}
