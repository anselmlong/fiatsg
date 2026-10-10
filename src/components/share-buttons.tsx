"use client";

import { Check, Link2, Send, Share2 } from "lucide-react";
import { useState } from "react";

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.5c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-3.6.9 1-3.5-.2-.4C3.1 15.6 2.5 13.8 2.5 12 2.5 6.8 6.8 2.5 12 2.5S21.5 6.8 21.5 12 17.2 21.5 12 21.5zM12 .5C5.6.5.5 5.6.5 12c0 2 .5 4 1.5 5.7L.5 23.5l6-1.6c1.7.9 3.6 1.4 5.5 1.4 6.4 0 11.5-5.1 11.5-11.5S18.4.5 12 .5z" />
    </svg>
  );
}

// Direct messaging shortcuts alongside the device share sheet and copy link.
export function ShareButtons({ url, text, title }: { url: string; text: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); } catch {}
      return;
    }
    copy();
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noreferrer" className="btn bg-[#1f8f4e] text-white hover:brightness-110">
          <WhatsAppIcon aria-hidden className="h-5 w-5" /> WhatsApp
        </a>
        <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" className="btn bg-[#087eaf] text-white hover:brightness-110">
          <Send aria-hidden className="h-5 w-5" /> Telegram
        </a>
        <button type="button" onClick={share} className="btn-ghost col-span-2">
          <Share2 aria-hidden className="h-5 w-5" /> Share
        </button>
      </div>
      <button type="button" onClick={copy} className="mx-auto flex items-center gap-2 text-sm font-bold text-purple">
        {copied ? <><Check aria-hidden className="h-4 w-4" /> Link copied</> : <><Link2 aria-hidden className="h-4 w-4" /> Copy link</>}
      </button>
    </div>
  );
}
