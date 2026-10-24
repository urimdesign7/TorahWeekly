import React, { useState } from 'react';
import { X, Plus, Sparkles, BookOpen } from 'lucide-react';
import { HebrewWord, TorahPortion } from '../types/torah';

interface CustomVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePortion: (portion: TorahPortion) => void;
}

export const CustomVerseModal: React.FC<CustomVerseModalProps> = ({
  isOpen,
  onClose,
  onSavePortion,
}) => {
  const [nameKorean, setNameKorean] = useState('');
  const [nameHebrew, setNameHebrew] = useState('');
  const [reference, setReference] = useState('');
  const [hebrewVerse, setHebrewVerse] = useState('');
  const [koreanPronunciation, setKoreanPronunciation] = useState('');
  const [koreanTranslation, setKoreanTranslation] = useState('');
  const [themeSummary, setThemeSummary] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKorean || !reference || !hebrewVerse || !koreanTranslation) {
      setFormError('필수 항목(포션명, 구절 출처, 히브리어 원문, 한글 번역)을 모두 입력해주세요.');
      return;
    }
    setFormError(null);

    // Split Hebrew text into words
    const rawTokens = hebrewVerse.trim().split(/\s+/);
    const pronTokens = koreanPronunciation.trim() ? koreanPronunciation.trim().split(/\s+/) : [];

    const words: HebrewWord[] = rawTokens.map((token, idx) => {
      const cleanPlain = token.replace(/[\u0591-\u05C7׃]/g, '');
      return {
        id: `custom-w-${Date.now()}-${idx}`,
        hebrew: token,
        hebrewPlain: cleanPlain,
        pronunciation: pronTokens[idx] || '단어 ' + (idx + 1),
        phoneticEn: 'word-' + (idx + 1),
        meaning: '단어 ' + (idx + 1),
        root: cleanPlain.slice(0, 3) || '어근',
        strongNumber: 'H0000',
        grammar: '원어 단어',
        breakdownNote: '사용자 지정 등록 성경 원어',
      };
    });

    const newPortion: TorahPortion = {
      id: `custom-${Date.now()}`,
      portionNumber: 99,
      nameHebrew: nameHebrew || 'תּוֹרָה',
      nameEnglish: 'Custom Verse',
      nameKorean: nameKorean,
      book: 'Custom',
      bookKorean: '특별 암송',
      torahReference: reference,
      themeSummary: themeSummary || '사용자가 직접 등록한 히브리어 성경 암송 구절',
      keyInsights: [
        '사용자 맞춤형 성경 원어 암송 구절입니다.',
        '7일간의 체계적인 암송 루틴을 통해 마음에 깊이 새기세요.'
      ],
      memoryVerse: {
        reference,
        referenceEn: reference,
        hebrewWithNiqqud: hebrewVerse,
        hebrewWithoutNiqqud: hebrewVerse.replace(/[\u0591-\u05C7]/g, ''),
        koreanPronunciation: koreanPronunciation || '음역 미입력',
        koreanTranslation,
        englishTranslation: 'Personal memory verse',
        words,
      },
    };

    onSavePortion(newPortion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-amber-600/40 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100 font-display">
              새로운 히브리어 암송 구절 등록
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                구절 명칭 (한국어)*
              </label>
              <input
                type="text"
                required
                value={nameKorean}
                onChange={(e) => setNameKorean(e.target.value)}
                placeholder="예: 아론의 축복, 시편 23편"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-amber-500/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                히브리어 명칭
              </label>
              <input
                type="text"
                dir="rtl"
                value={nameHebrew}
                onChange={(e) => setNameHebrew(e.target.value)}
                placeholder="בִּרְכַּת כֹּהֲנִים"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 font-hebrew text-right focus:border-amber-500/60 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              성경 출처/구절*
            </label>
            <input
              type="text"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="예: 민수기 6:24-26, 시편 23:1"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-amber-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              히브리어 원어 구절 (모음 부호 포함 권장)*
            </label>
            <textarea
              required
              dir="rtl"
              value={hebrewVerse}
              onChange={(e) => setHebrewVerse(e.target.value)}
              placeholder="יְבָרֶכְךָ יְהוָה וְיִשְׁמְרֶךָ׃"
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-amber-200 placeholder-slate-600 font-hebrew text-right focus:border-amber-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              한글 발음 (음역)
            </label>
            <input
              type="text"
              value={koreanPronunciation}
              onChange={(e) => setKoreanPronunciation(e.target.value)}
              placeholder="예: 예바레케카 아도나이 베이쉬메레카"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-amber-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              한국어 번역*
            </label>
            <textarea
              required
              value={koreanTranslation}
              onChange={(e) => setKoreanTranslation(e.target.value)}
              placeholder="예: 여호와는 네게 복을 주시고 너를 지키시기를 원하며..."
              rows={2}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 placeholder-slate-600 focus:border-amber-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              주제 및 묵상 요약 (선택)
            </label>
            <input
              type="text"
              value={themeSummary}
              onChange={(e) => setThemeSummary(e.target.value)}
              placeholder="예: 주님의 은혜와 평강을 구하는 대제사장의 축복"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-amber-500/60 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
            >
              등록하고 바로 암송하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
