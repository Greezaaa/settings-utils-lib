/**
 * How the texts speak to the player, in the languages where words change with it (Spanish "listo" or "lista",
 * Italian "pronto" or "pronta", Ukrainian "увійшов" or "увійшла"). Until the player chooses, the texts use the boy's
 * forms, as they always did.
 */
export type WordGender = 'boy' | 'girl';
export const WORD_GENDERS: readonly WordGender[] = ['boy', 'girl'];

/** The boy's or the girl's form of a line */
export const forGender = (gender: WordGender, boy: string, girl: string): string => (gender === 'girl' ? girl : boy);
