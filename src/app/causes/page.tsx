import Link from "next/link";
import { CauseCard, Container, Notice } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { listCauses } from "@/lib/queries";
import { AREAS, SKILLS } from "@/lib/skills";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Find a cause" };

export default async function CausesPage({ searchParams }: PageProps<"/causes">) {
  const sp = await searchParams;
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const skill = pick("skill");
  const kind = pick("kind");
  const area = pick("area");
  const showCompleted = pick("show") === "completed";

  const [user, all] = await Promise.all([currentUser(), listCauses(showCompleted ? ["completed"] : ["approved"])]);
  const mySkills = user?.role === "supporter" ? user.skills : [];

  const filtered = all.filter(
    (c) =>
      (!skill || c.request.skills.includes(skill)) &&
      (!kind || c.request.kind === kind) &&
      (!area || c.request.area === area),
  );
  const isFiltered = !!(skill || kind || area);
  const matchScore = (s: string[]) => s.filter((x) => mySkills.includes(x)).length;
  const forYou = !isFiltered && !showCompleted ? filtered.filter((c) => matchScore(c.request.skills) > 0).sort((a, b) => matchScore(b.request.skills) - matchScore(a.request.skills)) : [];
  const rest = filtered.filter((c) => !forYou.includes(c));

  return (
    <Container className="py-10">
      {pick("welcome") && user && (
        <div className="mb-8">
          <Notice tone="ok">
            <strong>Welcome to Fiat, {user.name.split(" ")[0]}!</strong>{" "}
            {mySkills.length ? "We've picked out causes that need your gifts below." : "Browse the causes below — anyone can help."}
          </Notice>
        </div>
      )}
      <h1 className="text-4xl font-bold sm:text-5xl">Find a cause</h1>

      <details open={isFiltered} className="mt-6">
        <summary className="btn-ghost cursor-pointer list-none">{isFiltered ? "Change filters" : "Filter by skill, day or place"}</summary>
      <form method="get" className="card mt-4 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="field">
          <span className="label">Skill</span>
          <select name="skill" defaultValue={skill} className="input">
            <option value="">Any skill</option>
            {SKILLS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="label">How often</span>
          <select name="kind" defaultValue={kind} className="input">
            <option value="">One-off or regular</option>
            <option value="one_off">One-off</option>
            <option value="regular">Regular (weekly)</option>
          </select>
        </label>
        <label className="field">
          <span className="label">Where</span>
          <select name="area" defaultValue={area} className="input">
            <option value="">Anywhere in Singapore</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>{a === "Online" ? "Online / from home" : a}</option>
            ))}
          </select>
        </label>
        {showCompleted && <input type="hidden" name="show" value="completed" />}
        <div className="flex items-end gap-2">
          <button className="btn-primary w-full sm:w-auto">Search</button>
          {isFiltered && <Link href={showCompleted ? "/causes?show=completed" : "/causes"} className="btn-ghost">Clear</Link>}
        </div>
      </form>
      </details>

      <div className="mt-6 flex gap-2" role="tablist">
        <Link href="/causes" role="tab" aria-selected={!showCompleted} className={`rounded-full px-5 py-2 font-bold no-underline ${!showCompleted ? "bg-purple text-white" : "bg-white text-purple"}`}>
          Needing help
        </Link>
        <Link href="/causes?show=completed" role="tab" aria-selected={showCompleted} className={`rounded-full px-5 py-2 font-bold no-underline ${showCompleted ? "bg-purple text-white" : "bg-white text-purple"}`}>
          Stories of impact
        </Link>
      </div>

      {user?.role === "supporter" && !mySkills.length && !showCompleted && (
        <div className="mt-8">
          <Notice>
            <Link href="/me#skills" className="font-bold">Add your skills</Link> to see the causes that need you most.
          </Notice>
        </div>
      )}
      {!user && !showCompleted && (
        <div className="mt-8">
          <Notice>
            <Link href="/join" className="font-bold">Join Fiat</Link> to see the causes that match your skills first.
          </Notice>
        </div>
      )}

      {forYou.length > 0 && (
        <section className="mt-10" aria-labelledby="for-you">
          <h2 id="for-you" className="flex items-center gap-3 text-3xl font-bold"><Sparkles aria-hidden className="h-7 w-7 text-gold" /> For you</h2>
          <p className="mt-1 text-muted">These need gifts you have.</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {forYou.map((c) => <CauseCard key={c.request.id} cause={c} mySkills={mySkills} />)}
          </div>
        </section>
      )}

      <section className="mt-12" aria-labelledby="all">
        <h2 id="all" className="text-3xl font-bold">
          {showCompleted ? "Completed causes" : forYou.length ? "More causes" : isFiltered ? `${rest.length} matching ${rest.length === 1 ? "cause" : "causes"}` : "All causes"}
        </h2>
        {rest.length === 0 ? (
          <p className="mt-6 text-lg text-muted">Nothing matches those filters yet. Try “Any skill” or “Anywhere”.</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((c) => <CauseCard key={c.request.id} cause={c} mySkills={mySkills} />)}
          </div>
        )}
      </section>
    </Container>
  );
}
