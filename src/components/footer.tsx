import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-purple-deep text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
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
    </footer>
  );
}
