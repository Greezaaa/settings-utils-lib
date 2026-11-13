export type WordGender = 'boy' | 'girl';
export const WORD_GENDERS: readonly WordGender[] = ['boy', 'girl'];

export const forGender = (gender: WordGender, boy: string, girl: string): string => (gender === 'girl' ? girl : boy);
