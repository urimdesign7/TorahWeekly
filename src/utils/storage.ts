import { DayIndex, DayStudyStatus, PortionProgress, TorahPortion, UserStats } from '../types/torah';
import { TORAH_PORTIONS } from '../data/torahPortions';

const STORAGE_KEYS = {
  PROGRESS: 'torah_memory_progress_v1',
  STATS: 'torah_memory_stats_v1',
  CUSTOM_PORTIONS: 'torah_memory_custom_portions_v1',
  SETTINGS: 'torah_memory_settings_v1',
};

export interface AppSettings {
  showNiqqud: boolean;
  showKoreanPhonetics: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  recitationSpeed: number;
  recitationVoice: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  showNiqqud: true,
  showKoreanPhonetics: true,
  fontSize: 'lg',
  recitationSpeed: 1.0,
  recitationVoice: 'Fenrir',
};

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function getStoredProgress(): Record<string, PortionProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getPortionProgress(portionId: string): PortionProgress {
  const all = getStoredProgress();
  if (all[portionId]) return all[portionId];

  const defaultDays: Record<DayIndex, DayStudyStatus> = {
    1: { completed: false },
    2: { completed: false },
    3: { completed: false },
    4: { completed: false },
    5: { completed: false },
    6: { completed: false },
    7: { completed: false },
  };

  return {
    portionId,
    days: defaultDays,
    isMastered: false,
    favorite: false,
  };
}

export function saveDayProgress(
  portionId: string,
  day: DayIndex,
  status: Partial<DayStudyStatus>
): PortionProgress {
  const all = getStoredProgress();
  const current = getPortionProgress(portionId);

  const updatedDay: DayStudyStatus = {
    ...current.days[day],
    ...status,
    completed: true,
    completedAt: new Date().toISOString(),
  };

  const updatedDays = {
    ...current.days,
    [day]: updatedDay,
  };

  // Check if all 7 days are completed
  const allCompleted = ([1, 2, 3, 4, 5, 6, 7] as DayIndex[]).every(
    (d) => updatedDays[d]?.completed
  );

  const updatedProgress: PortionProgress = {
    ...current,
    days: updatedDays,
    isMastered: allCompleted || current.isMastered,
    masteredAt: allCompleted ? (current.masteredAt || new Date().toISOString()) : current.masteredAt,
  };

  all[portionId] = updatedProgress;
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save progress', e);
  }

  updateStreak();
  return updatedProgress;
}

export function toggleFavoritePortion(portionId: string): boolean {
  const all = getStoredProgress();
  const current = getPortionProgress(portionId);
  const nextFav = !current.favorite;

  all[portionId] = {
    ...current,
    favorite: nextFav,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to toggle favorite', e);
  }

  return nextFav;
}

export function savePortionNotes(portionId: string, notes: string): void {
  const all = getStoredProgress();
  const current = getPortionProgress(portionId);

  all[portionId] = {
    ...current,
    personalNotes: notes,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
}

export function getUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    const defaults: UserStats = {
      streakDays: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      masteredPortionsCount: 0,
      favoriteWords: [],
    };
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);

    // Calculate actual mastered count from progress
    const allProgress = getStoredProgress();
    const masteredCount = Object.values(allProgress).filter((p) => p.isMastered).length;

    return {
      ...defaults,
      ...parsed,
      masteredPortionsCount: masteredCount,
    };
  } catch {
    return {
      streakDays: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      masteredPortionsCount: 0,
      favoriteWords: [],
    };
  }
}

function updateStreak(): void {
  try {
    const stats = getUserStats();
    const today = new Date().toISOString().split('T')[0];

    if (stats.lastStudyDate === today) {
      // already counted today
      return;
    }

    const last = new Date(stats.lastStudyDate);
    const now = new Date(today);
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = stats.streakDays;
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    const updated: UserStats = {
      ...stats,
      streakDays: newStreak,
      lastStudyDate: today,
    };

    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update streak', e);
  }
}

export function getCustomPortions(): TorahPortion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_PORTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomPortion(portion: TorahPortion): void {
  try {
    const current = getCustomPortions();
    const filtered = current.filter((p) => p.id !== portion.id);
    const updated = [portion, ...filtered];
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PORTIONS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save custom portion', e);
  }
}

export function getAllPortions(): TorahPortion[] {
  const custom = getCustomPortions();
  return [...TORAH_PORTIONS, ...custom];
}
