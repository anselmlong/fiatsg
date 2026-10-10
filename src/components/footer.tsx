import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-purple-deep text-white">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-14">
        <figure className="mx-auto max-w-xl text-center">
          <blockquote>
          <p className="font-serif text-xl text-gold sm:text-3xl">What can I give Him, poor as I am?</p>
          <div className="mt-4 space-y-0.5 font-serif text-base italic leading-relaxed text-white/85 sm:text-lg">
            <p>If I were a shepherd, I would bring a lamb;</p>
            <p>If I were a wise man, I would do my part;</p>
            <p>Yet what I can I give Him:</p>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">Give my heart.</p>
          </blockquote>
          <figcaption className="mt-3 text-sm text-white/70">
            Christina Rossetti, <cite className="not-italic">“In the Bleak Midwinter”</cite>
          </figcaption>
        </figure>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-3xl font-bold text-white" data-no-translate>Fiat</p>
            <p className="mt-1 text-white/85">
              <span lang="la" className="font-serif italic" data-no-translate>Fiat voluntas tua</span> — thy will be done.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="w-fit rounded-xl bg-white px-3 py-2">
              <Image src="/images/cf-logo.png" alt="Catholic Foundation" width={150} height={43} className="h-8 w-auto" />
            </div>
            <p className="max-w-sm text-sm text-white/75 sm:text-right">Built with the Catholic Foundation, Singapore.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
