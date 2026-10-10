"use client";

import { Languages } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

export const LANGS = [
  { id: "en", label: "English" },
  { id: "zh-CN", label: "中文" },
  { id: "ms", label: "Bahasa Melayu" },
  { id: "ta", label: "தமிழ்" },
] as const;

const KEY = "fiat_lang";
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "SVG"]);

// Originals of every text node and placeholder we have touched, so English can be restored.
const originals = new WeakMap<Node, string>();
const placeholders = new WeakMap<Element, string>();
const applied = new WeakMap<Node, string>();

function readLang() {
  try {
    return localStorage.getItem(KEY) ?? "en";
  } catch {
    return "en";
  }
}

function cacheGet(lang: string, text: string) {
  const pinned = GLOSSARY[lang]?.[text];
  if (pinned) return pinned;
  try {
    return localStorage.getItem(`t:${lang}:${text}`);
  } catch {
    return null;
  }
}

function cacheSet(lang: string, text: string, value: string) {
  try {
    localStorage.setItem(`t:${lang}:${text}`, value);
  } catch {}
}

// Demo-grade machine translation, called from the viewer's browser (Google rate-limits server calls).
// Fast and free, not guaranteed: swap for a paid translation API before real use.
const ENDPOINT = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t";
const MAX_CHARS = 2500;

// "Cause" is read as cause-and-effect by machine translation; pin the few phrases that use it.
const GLOSSARY: Record<string, Record<string, string>> = {
  "zh-CN": { "Join Fiat": "加入 Fiat", "Find a cause": "寻找服务机会", "All causes": "所有服务机会", "More causes": "更多服务机会" },
  ms: { "Join Fiat": "Sertai Fiat", "Find a cause": "Cari peluang khidmat", "All causes": "Semua peluang khidmat", "More causes": "Lagi peluang khidmat" },
  ta: { "Join Fiat": "Fiat-இல் சேரவும்", "Find a cause": "சேவை வாய்ப்பைக் கண்டறிக", "All causes": "அனைத்து சேவை வாய்ப்புகள்", "More causes": "மேலும் சேவை வாய்ப்புகள்" },
};

async function translateBatch(texts: string[], lang: string): Promise<string[]> {
  const res = await fetch(`${ENDPOINT}&tl=${lang}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ q: texts.join("\n") }),
  });
  if (!res.ok) throw new Error(`translate ${res.status}`);
  const data = (await res.json()) as [[string, string][]];
  const lines = data[0].map((seg) => seg[0]).join("").split("\n");
  if (lines.length === texts.length) return lines.map((l) => l.trim());
  // Line count drifted: translate one string per request instead.
  return Promise.all(texts.map((t) => translateBatch([t], lang).then((r) => r[0] ?? t)));
}

async function translateAll(texts: string[], lang: string) {
  const batches: string[][] = [[]];
  let size = 0;
  for (const t of texts) {
    if (size + t.length > MAX_CHARS && batches.at(-1)!.length) {
      batches.push([]);
      size = 0;
    }
    batches.at(-1)!.push(t);
    size += t.length + 1;
  }
  await Promise.all(
    batches.map((b) =>
      translateBatch(b, lang)
        .then((out) => b.forEach((t, i) => cacheSet(lang, t, out[i] || t)))
        .catch(() => {}), // Leave this batch in English if the service refuses.
    ),
  );
}

function collect(root: Node) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = n.parentElement;
      if (!p || SKIP.has(p.tagName.toUpperCase()) || p.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      return originals.has(n) || /[A-Za-z]/.test(n.nodeValue ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  const inputs = [...document.querySelectorAll<HTMLElement>("[placeholder]")].filter((el) => !el.closest("[data-no-translate]"));
  return { nodes, inputs };
}

async function translatePage(lang: string) {
  const { nodes, inputs } = collect(document.body);

  if (lang === "en") {
    for (const n of nodes) if (originals.has(n)) n.nodeValue = originals.get(n)!;
    for (const el of inputs) if (placeholders.has(el)) el.setAttribute("placeholder", placeholders.get(el)!);
    return;
  }

  const jobs: { text: string; apply: (v: string) => void }[] = [];
  for (const n of nodes) {
    // A node we already translated keeps its English original; a node React re-rendered gets a new one.
    if (applied.get(n) !== n.nodeValue) originals.set(n, n.nodeValue ?? "");
    const src = originals.get(n)!;
    const text = src.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const lead = /^\s/.test(src) ? " " : "";
    const trail = /\s$/.test(src) ? " " : "";
    jobs.push({
      text,
      apply: (v) => {
        const out = lead + v + trail;
        applied.set(n, out);
        n.nodeValue = out;
      },
    });
  }
  for (const el of inputs) {
    if (!placeholders.has(el)) placeholders.set(el, el.getAttribute("placeholder") ?? "");
    const text = placeholders.get(el)!.replace(/\s+/g, " ").trim();
    if (text) jobs.push({ text, apply: (v) => el.setAttribute("placeholder", v) });
  }

  const missing = [...new Set(jobs.map((j) => j.text).filter((t) => cacheGet(lang, t) === null))];
  if (missing.length) await translateAll(missing, lang);
  if (readLang() !== lang) return; // The viewer switched language while we waited.
  for (const j of jobs) {
    const v = cacheGet(lang, j.text);
    if (v) j.apply(v);
  }
}

const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function setLang(lang: string) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {}
  listeners.forEach((fn) => fn());
}

export function Translator({ className = "" }: { className?: string }) {
  const lang = useSyncExternalStore(subscribe, readLang, () => "en");

  useEffect(() => {
    document.documentElement.lang = lang === "zh-CN" ? "zh" : lang;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const run = () => translatePage(lang);
    run();
    if (lang === "en") return;
    // Re-translate whatever React renders later (navigation, confirmations, opened menus).
    const observer = new MutationObserver((records) => {
      const ours = records.every((r) => r.type === "characterData" && applied.get(r.target) === r.target.nodeValue);
      if (ours) return;
      clearTimeout(timer);
      timer = setTimeout(run, 120);
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [lang]);

  return (
    <label className={`relative flex shrink-0 items-center ${className}`} data-no-translate>
      <span className="sr-only">Language</span>
      <Languages aria-hidden className="pointer-events-none absolute left-3 h-5 w-5 text-purple" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="min-h-11 w-[8.5rem] cursor-pointer appearance-none truncate rounded-full border-2 border-purple bg-white py-2 pl-10 pr-3 font-bold text-purple sm:w-auto sm:pr-4"
      >
        {LANGS.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
