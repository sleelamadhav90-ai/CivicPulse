import { en } from './en';
import { hi } from './hi';
import { te } from './te';
import { ta } from './ta';
import { kn } from './kn';
import { mr } from './mr';
import { bn } from './bn';
import { or } from './or';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from './languages';

export * from './languages';

export type TranslationKey = keyof typeof en;

export const TRANSLATIONS: Record<SupportedLanguageCode, Record<string, string>> = {
  en,
  hi,
  te,
  ta,
  kn,
  mr,
  bn,
  or,
};

/**
 * Category translation helper that maps raw internal English categories to localized string.
 */
export function translateCategory(category: string, lang: SupportedLanguageCode): string {
  const c = category.toLowerCase().trim();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  if (c.includes('water') || c.includes('jal') || c.includes('drinking')) {
    return dict['category.water'] || 'Water';
  }
  if (c.includes('road') || c.includes('transit') || c.includes('highway') || c.includes('pothole')) {
    return dict['category.roads'] || 'Roads';
  }
  if (c.includes('health') || c.includes('hospital') || c.includes('clinic') || c.includes('medical')) {
    return dict['category.health'] || 'Health';
  }
  if (c.includes('power') || c.includes('electr') || c.includes('grid') || c.includes('light')) {
    return dict['category.electricity'] || 'Electricity';
  }
  if (c.includes('drain') || c.includes('flood') || c.includes('sewer') || c.includes('culvert')) {
    return dict['category.drainage'] || 'Drainage';
  }
  if (c.includes('sanit') || c.includes('waste') || c.includes('garbage')) {
    return dict['category.sanitation'] || 'Sanitation';
  }
  if (c.includes('educat') || c.includes('school')) {
    return dict['category.education'] || 'Education';
  }
  return category;
}

/**
 * Status translation helper that maps status codes to localized string.
 */
export function translateStatus(status: string, lang: SupportedLanguageCode): string {
  const s = status.toLowerCase().replace(/[-_]/g, ' ').trim();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  if (s.includes('received')) return dict['status.received'] || 'Received';
  if (s.includes('under review') || s.includes('review')) return dict['status.under_review'] || 'Under Review';
  if (s.includes('prioritized')) return dict['status.prioritized'] || 'Prioritized';
  if (s.includes('in progress') || s.includes('execution')) return dict['status.in_progress'] || 'In Progress';
  if (s.includes('approved')) return dict['status.approved'] || 'Approved';
  if (s.includes('completed') || s.includes('resolved')) return dict['status.completed'] || 'Completed';
  if (s.includes('assigned')) return dict['status.assigned'] || 'Assigned';
  if (s.includes('logged')) return dict['status.logged'] || 'Logged';
  if (s.includes('proposed')) return dict['status.proposed'] || 'Proposed';
  return status;
}
