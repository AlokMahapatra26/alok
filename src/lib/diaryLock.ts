/**
 * Diary Vault Security & Lock Management
 * Protects diary entries with passkey: sakshi19
 */

const DIARY_PASSKEY = 'sakshi19';
const STORAGE_KEY = 'diary_vault_token';
const TOKEN_VALUE = 'unlocked_sakshi19';

export function isDiaryUnlocked(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Check if logged in as Author
  try {
    const authorSession = localStorage.getItem('author_auth_session');
    if (authorSession) return true;
  } catch (e) {}

  // 2. Check vault unlock token in sessionStorage or localStorage
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === TOKEN_VALUE) return true;
    if (localStorage.getItem(STORAGE_KEY) === TOKEN_VALUE) return true;
  } catch (e) {}

  return false;
}

export function unlockDiary(passkey: string): boolean {
  if (typeof window === 'undefined') return false;

  const normalized = (passkey || '').trim();
  if (normalized === DIARY_PASSKEY) {
    try {
      sessionStorage.setItem(STORAGE_KEY, TOKEN_VALUE);
      localStorage.setItem(STORAGE_KEY, TOKEN_VALUE);
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('diary_lock_changed', { 
      detail: { unlocked: true } 
    }));
    return true;
  }
  return false;
}

export function lockDiary(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}

  window.dispatchEvent(new CustomEvent('diary_lock_changed', { 
    detail: { unlocked: false } 
  }));
}
