const NON_LATIN_LETTER = /(?!\p{Script=Latin})\p{Letter}/u;

export function requiresTransliteration(text: string) {
  return NON_LATIN_LETTER.test(text);
}
