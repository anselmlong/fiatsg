import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { currentUser } from "@/lib/auth";
import { MobileMenu } from "./mobile-menu";
import { Translator } from "./translator";

export async function Header() {
  const user = await currentUser();

  const links: { href: string; label: string }[] =
    user?.role === "org"
      ? [
          { href: "/org", label: "Our requests" },
          { href: "/org/requests/new", label: "New request" },
          { href: "/org/profile", label: "Our profile" },
        ]
      : user?.role === "cf_admin"
        ? [
            { href: "/admin", label: "Review queue" },
            { href: "/causes", label: "All causes" },
          ]
        : [
            { href: "/causes", label: "Find a cause" },
            { href: "/faith", label: "Share your faith" },
            ...(user ? [{ href: "/me", label: "My impact" }] : []),
          ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-3 no-underline" aria-label="Fiat home" data-no-translate>
          <span className="font-serif text-3xl font-bold text-purple">Fiat</span>
          <span className="hidden border-l border-line pl-3 sm:block">
            <Image src="/images/cf-logo.png" alt="Catholic Foundation" width={120} height={34} className="h-8 w-auto" />
          </span>
        </Link>
        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-4 py-2 font-bold text-ink no-underline hover:bg-purple-soft">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Translator />
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            {user ? (
              <form action={logout}>
                <button className="btn-ghost !min-h-0 h-11 !py-0 !px-4">Log out</button>
              </form>
            ) : (
              <>
                <Link href="/login" className="btn-ghost !min-h-0 h-11 !py-0 !px-4">Log in</Link>
                <Link href="/join" className="btn-primary !min-h-0 h-11 !py-0 !px-4">Join</Link>
              </>
            )}
          </div>
          <MobileMenu links={links} loggedIn={!!user} logout={logout} />
        </div>
      </div>
      {user && (
        <div className="border-t border-line bg-purple-soft/60">
          <p className="mx-auto max-w-6xl px-4 py-1 text-sm text-purple-deep">
            Signed in as <strong>{user.name}</strong>
            {user.role === "org" && " · Organisation"}
            {user.role === "cf_admin" && " · Catholic Foundation"}
          </p>
        </div>
      )}
    </header>
  );
}
