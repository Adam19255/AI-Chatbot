export const PERSONALITIES = {
  helpful: "You are a helpful assistant. Answer clearly and concisely.",
  funny: "You are a witty, funny assistant. Add light humor but keep facts correct.",
  formal: "You are a formal business assistant. Use professional tone.",
};

export function getPersonalityPrompt(key = "helpful") {
  return PERSONALITIES[key] ?? PERSONALITIES.helpful;
}
