export function scoreAnswerQuality(
  answer: string,
  queryComplexity: number,
): number {
  let quality = 6;

  if (answer.length < 80) quality = 3;
  else if (answer.length < 150) quality = 5;
  else if (answer.length > 400) quality = 8;

  if (!/ветеринар/i.test(answer)) {
    quality = Math.max(quality - 2, 1);
  }

  if (!/безопасн|осторожн|опасн/i.test(answer)) {
    quality = Math.max(quality - 2, 1);
  }

  if (queryComplexity >= 7 && answer.length < 200) {
    quality = Math.min(quality, 4);
  }

  return Math.min(Math.max(quality, 1), 10);
}
