export type MovieCandidate = {
  id: string;
  title: string;
  url: string;
  extraUrls: string[];
  notes: string;
  year: number | null;
  date: string;
};

function flattenText(text: unknown): string {
  if (typeof text === 'string') return text;
  if (Array.isArray(text)) {
    return text
      .map(t => (typeof t === 'string' ? t : (t && typeof (t as any).text === 'string' ? (t as any).text : '')))
      .join('');
  }
  return '';
}

const URL_RE = /https?:\/\/[^\s<>"'  ]+/g;

function extractUrls(msg: any): string[] {
  const urls: string[] = [];
  const entities = Array.isArray(msg.text_entities) ? msg.text_entities : [];
  for (const e of entities) {
    if (!e || typeof e !== 'object') continue;
    if (e.type === 'text_link' && typeof e.href === 'string') urls.push(e.href);
    else if (e.type === 'link' && typeof e.text === 'string') urls.push(e.text);
  }
  if (urls.length === 0) {
    const flat = flattenText(msg.text);
    let m;
    while ((m = URL_RE.exec(flat)) !== null) urls.push(m[0]);
    URL_RE.lastIndex = 0;
  }
  return Array.from(new Set(urls.map(u => u.trim()).filter(Boolean)));
}

function stripUrls(text: string, urls: string[]): string {
  let t = text;
  for (const u of urls) t = t.split(u).join(' ');
  return t;
}

function extractYear(text: string): number | null {
  const m = text.match(/\b(19\d{2}|20\d{2})\b/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  return y >= 1900 && y <= 2100 ? y : null;
}

function firstMeaningfulLine(text: string): string {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines[0] || '';
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'ссылка';
  }
}

function makeTitle(flat: string, urls: string[]): string {
  const noUrls = stripUrls(flat, urls).replace(/[ \t]+/g, ' ').trim();
  const first = firstMeaningfulLine(noUrls);
  if (first) {
    return first.replace(/^[\s\p{P}\p{S}]+|[\s\p{P}\p{S}]+$/gu, '').slice(0, 120) || first.slice(0, 120);
  }
  return safeHostname(urls[0] || '');
}

export function parseTelegramExport(text: string): MovieCandidate[] {
  let parsed: any;
  try { parsed = JSON.parse(text); }
  catch { throw new Error('Не удалось прочитать JSON'); }

  const messages = Array.isArray(parsed?.messages) ? parsed.messages : null;
  if (!messages) {
    throw new Error('Не похоже на экспорт Telegram: нет поля "messages". Экспортируй чат через Telegram Desktop → Export chat history → Machine-readable JSON.');
  }

  const out: MovieCandidate[] = [];
  for (const msg of messages) {
    if (!msg || msg.type !== 'message') continue;
    const urls = extractUrls(msg);
    if (urls.length === 0) continue;
    const flat = flattenText(msg.text);
    const title = makeTitle(flat, urls);
    if (!title) continue;
    const rawNotes = stripUrls(flat, urls).replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    const year = extractYear(title) ?? extractYear(flat);
    out.push({
      id: String(msg.id ?? `${Date.now()}-${Math.random()}`),
      title,
      url: urls[0],
      extraUrls: urls.slice(1),
      notes: rawNotes,
      year,
      date: typeof msg.date === 'string' ? msg.date : '',
    });
  }
  return out;
}

export function isTelegramExport(text: string): boolean {
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed?.messages);
  } catch {
    return false;
  }
}
