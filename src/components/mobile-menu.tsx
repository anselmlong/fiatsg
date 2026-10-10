"use client";

import Link from "next/link";
import { useState } from "react";

export function MobileMenu({
  links,
  loggedIn,
  logout,
}: {
  links: { href: string; label: string }[];
  loggedIn: boolean;
  logout: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost !min-h-11 !px-4 whitespace-nowrap"
      >
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <div id="mobile-nav" className="absolute inset-x-0 top-full border-b border-line bg-paper px-4 pb-6 pt-2 shadow-lg">
          <nav aria-label="Mobile" className="flex flex-col">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-line py-4 text-lg font-bold text-ink no-underline">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex gap-3">
            {loggedIn ? (
              <form action={logout} className="w-full">
                <button className="btn-ghost w-full">Log out</button>
              </form>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost flex-1">Log in</Link>
                <Link href="/join" onClick={() => setOpen(false)} className="btn-primary flex-1">Join</Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
