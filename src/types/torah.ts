export interface HebrewWord {
  id: string;
  hebrew: string;              // with Niqqud (e.g., בְּרֵאשִׁית)
  hebrewPlain: string;         // consonants only (e.g., בראשית)
  pronunciation: string;       // 한글 음역 (e.g., 베레쉬트)
  phoneticEn: string;          // English phonetics
  meaning: string;             // 한국어 의미 (e.g., 태초에)
  root: string;                // 어근 (e.g., ר־א־שׁ 로쉬)
  strongNumber: string;        // 스트롱 번호 (e.g., H7225)
  grammar: string;             // 문법 설명 (e.g., 전치사 ב + 여성 명사)
  breakdownNote?: string;       // 분해 설명
}

export interface TorahVerse {
  reference: string;           // e.g. "창세기 1:1"
  referenceEn: string;         // e.g. "Genesis 1:1"
  hebrewWithNiqqud: string;
  hebrewWithoutNiqqud: string;
  koreanPronunciation: string;
  koreanTranslation: string;
  englishTranslation: string;
  words: HebrewWord[];
}

export interface TorahPortion {
  id: string;
  portionNumber: number;
  nameHebrew: string;
  nameEnglish: string;
  nameKorean: string;
  book: 'Genesis' | 'Exodus' | 'Leviticus' | 'Numbers' | 'Deuteronomy' | 'Custom';
  bookKorean: string;
  torahReference: string;      // e.g., "창세기 1:1 - 6:8"
  haftarahReference?: string;  // e.g., "이사야 42:5 - 43:10"
  britChadashah?: string;      // e.g., "요한복음 1:1-14"
  themeSummary: string;
  memoryVerse: TorahVerse;
  keyInsights: string[];
}

export type DayIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface DayStudyStatus {
  completed: boolean;
  score?: number;
  completedAt?: string;
  notes?: string;
  recordingBlobUrl?: string;
}

export interface PortionProgress {
  portionId: string;
  days: Record<DayIndex, DayStudyStatus>;
  isMastered: boolean;
  masteredAt?: string;
  personalNotes?: string;
  favorite: boolean;
}

export interface UserStats {
  streakDays: number;
  lastStudyDate: string;
  masteredPortionsCount: number;
  favoriteWords: string[];
}
