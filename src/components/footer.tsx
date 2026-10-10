import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-16 bg-purple-deep text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-3xl font-bold text-white">Fiat</p>
          <p className="mt-2 text-white/85">
            “Let it be done to me according to your word.” <span className="text-white/60">— Luke 1:38</span>
          </p>
        </div>
        <div className="text-white/85">
          <p className="font-bold text-white">Pray · Serve · See the fruit</p>
          <p className="mt-2">
            A place for every Catholic in Singapore to give their time, talent and prayer — whatever their age, whatever
            their means.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 text-white/85">
          <div className="rounded-xl bg-white px-3 py-2">
            <Image src="/images/cf-logo.png" alt="Catholic Foundation" width={150} height={43} className="h-9 w-auto" />
          </div>
          <p className="text-sm">
            A Fiat Catholic Hackathon prototype for the Catholic Foundation. Organisation names and photos are from their
            public websites; requests and outcomes shown are demo data.
          </p>
        </div>
      </div>
    </footer>
  );
}
