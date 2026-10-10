// Resets the database to the starting state. Safe to re-run: `npm run seed`.
import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

const ADMIN = { email: "cf@fiat.sg", password: "fiat-cf-2026" };
const ORG_PASSWORD = "fiat-org-2026";
const VOLUNTEER = { email: "maria@fiat.sg", password: "fiat-2026", name: "Maria Tan" };

type Req = {
  title: string;
  summary: string;
  story: string;
  coverUrl: string;
  skills: string[];
  volunteersNeeded: number;
  kind: "one_off" | "regular";
  startDate: string;
  endDate?: string;
  weekdays?: string[];
  startTime: string;
  endTime: string;
  area: string;
  address?: string;
  ageGroup: string;
  status: "approved" | "pending_review" | "completed";
  category: string;
  // 1 one-off, 2 regular, 3 long-term or skilled. Defaults from kind.
  tier?: number;
  outcome?: { hours?: number; served?: number; summary: string };
  updates?: { body: string; photoUrl?: string; daysAgo: number }[];
  prayers?: { name: string; message: string }[];
  silentPrayers?: number;
};

type OrgSeed = {
  email: string;
  contact: string;
  name: string;
  tagline: string;
  history: string;
  whyItMatters: string;
  website: string;
  foundedYear: number | null;
  coverUrl: string;
  status: "approved" | "pending";
  requests: (Omit<Req, "category"> & { category?: string })[];
  category: string;
};

// Content below is taken from each organisation's own public website (Oct 2026):
// catholicwelfare.org.sg, villafrancis.org.sg, acmi.org.sg/volunteer, caritas-singapore.org/opportunities,
// caritas-singapore.org/get-involved/volunteer, oyp.org.sg and cps.org.sg.
const ORGS: OrgSeed[] = [
  {
    email: "cws@fiat.sg",
    category: "seniors",
    contact: "Volunteer Team, CWS",
    name: "Catholic Welfare Services",
    tagline: "We journey with people-in-need to live life to the fullest.",
    history:
      "Catholic Welfare Services (CWS) is a non-profit social service agency founded in 1959 with the aim of uplifting the lives of the less fortunate in the community. Over the years it has grown to become an Action Arm of the Catholic Church of Singapore. Its services include shelters, St Joseph's Home, St Theresa's Home, Villa Francis Home for the Aged, St Vincent Home and YouthReach.",
    whyItMatters:
      "CWS volunteers often work directly with clients and beneficiaries. Individuals aged 18 and above, regardless of race and creed, are welcome to volunteer.",
    website: "https://www.catholicwelfare.org.sg",
    foundedYear: 1959,
    coverUrl: "/images/cws-who.jpg",
    status: "approved",
    requests: [
      {
        title: "Befrienders and medical volunteers",
        summary: "Serve the poor and destitute alongside CWS as a befriender or medical volunteer.",
        story:
          "Catholic Welfare Services is looking for befrienders and medical volunteers to serve the poor and destitute.\n\nVolunteers often work directly with clients and beneficiaries. Individuals aged 18 and above, regardless of race and creed, are welcome. CWS will match you to where you are needed after you sign up.",
        coverUrl: "/images/vf-residents.jpg",
        skills: ["befriending", "health", "eldercare"],
        volunteersNeeded: 10,
        kind: "regular",
        startDate: "2026-10-12",
        weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        startTime: "09:00",
        endTime: "17:00",
        area: "Central",
        address: "Catholic Centre, 55 Waterloo Street #06-01",
        ageGroup: "adults",
        status: "approved",
      },
      {
        title: "Help at Villa Francis Home for the Aged",
        summary: "Help residents of Villa Francis live with dignity, belonging and community.",
        story:
          "Villa Francis Home for the Aged, run by Catholic Welfare Services, has served the poor for 46 years. It offers nursing and medical care, rehabilitation and spiritual care, and aims to help residents live with dignity, with a sense of belonging and a sense of community.\n\nThe home says it always welcomes anyone who wants to help. Offer your time here and the home will arrange with you when to come.",
        coverUrl: "/images/vf-resident-smile.jpg",
        skills: ["befriending", "eldercare", "music"],
        volunteersNeeded: 10,
        kind: "regular",
        startDate: "2026-10-12",
        weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        startTime: "09:00",
        endTime: "17:00",
        area: "North",
        address: "Villa Francis Home for the Aged, 91 Yishun Central",
        ageGroup: "adults",
        status: "approved",
      },
    ],
  },
  {
    email: "acmi@fiat.sg",
    category: "migrants",
    contact: "Volunteer Team, ACMI",
    name: "ACMI — Archdiocesan Commission for the Pastoral Care of Migrants & Itinerant People",
    tagline: "Family to migrants.",
    history:
      "ACMI serves all migrants in Singapore through welcoming, protecting, enriching and integrating them into our community, regardless of their socioeconomic status, nationality, race or religion. Its volunteers teach skills classes, run a helpline for transnational families, interpret, and help at events for migrant workers.",
    whyItMatters:
      "“To help them by simply taking pictures of them, and seeing how happy and thankful they are, is really satisfying.” — Joachim Diawara, ACMI volunteer photographer",
    website: "https://www.acmi.org.sg",
    foundedYear: null,
    coverUrl: "/images/acmi-volunteer.jpg",
    status: "approved",
    requests: [
      {
        title: "Helpline volunteers for ACMI Family Connectors",
        tier: 3,
        summary: "Answer the helpline, take in clients and make engagement calls, one 3-hour shift a week.",
        story:
          "ACMI Family Connectors supports transnational families. Helpline volunteers handle helpline support, client intake and referrals, client engagement calls and administrative support.\n\nYou'll need to be aged 18 or above, comfortable on the phone, have basic computer skills and commit to one 3-hour shift a week. Additional languages and a social work or counselling background are an advantage.",
        coverUrl: "/images/acmi-stories.jpg",
        skills: ["befriending", "admin", "translation"],
        volunteersNeeded: 5,
        kind: "regular",
        startDate: "2026-10-12",
        weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        startTime: "09:00",
        endTime: "12:00",
        area: "Central",
        address: "ACMI, Agape Village, 7A Lorong 8 Toa Payoh",
        ageGroup: "adults",
        status: "approved",
      },
      {
        title: "English Level 1 assistant trainer",
        summary: "Help migrant learners one-to-one with pronunciation and vocabulary on the 2nd and 4th Sundays.",
        story:
          "ACMI's skills development programme teaches English to migrant workers on their day off. Assistant trainers support the lead trainer, give one-to-one help with pronunciation, vocabulary and other lesson needs, and help set up the classroom.\n\nClasses run on the 2nd and 4th Sundays of the month, 2pm to 5pm, for a commitment of six months to a year. You'll need good spoken and written English, a basic understanding of phonetics, and basic use of translation tools.",
        coverUrl: "/images/acmi-class.jpg",
        skills: ["teaching", "translation"],
        volunteersNeeded: 4,
        kind: "regular",
        startDate: "2026-10-11",
        weekdays: ["Sun"],
        startTime: "14:00",
        endTime: "17:00",
        area: "Central",
        address: "Agape Village, 7A Lorong 8 Toa Payoh",
        ageGroup: "adults",
        status: "approved",
      },
      {
        title: "Computer literacy accompanying trainer",
        summary: "Help migrant learners with basic computer skills and Microsoft Office on Sundays.",
        story:
          "Accompanying trainers assist the lead trainers in ACMI's Computer Literacy Level 1 and 2 classes, giving one-to-one help with basic computer skills and Microsoft Office, and supporting classroom setup.\n\nClasses run on the 1st and 3rd or the 2nd and 4th Sundays, 10am to 1pm or 2pm to 5pm, for six months to a year. You'll need good Word, Excel and PowerPoint skills, patience, empathy, and basic use of translation tools.",
        coverUrl: "/images/acmi-events.jpg",
        skills: ["tech", "teaching"],
        volunteersNeeded: 4,
        kind: "regular",
        startDate: "2026-10-11",
        weekdays: ["Sun"],
        startTime: "10:00",
        endTime: "13:00",
        area: "Central",
        address: "Agape Village, 7A Lorong 8 Toa Payoh, and parishes",
        ageGroup: "adults",
        status: "approved",
      },
      {
        title: "Interpreter and translator",
        tier: 3,
        summary: "Interpret between ACMI staff and migrant beneficiaries during office hours, for at least 3 months.",
        story:
          "ACMI needs interpreters and translators to help staff and migrant beneficiaries understand each other in conversations, engagements and correspondence.\n\nYou'll need to be aged 18 or above, fluent in English and at least one other language, comfortable with migrant communities, and respectful and patient. Hours are flexible within office hours, for a minimum of three months. A briefing is arranged by appointment.",
        coverUrl: "/images/acmi-volunteer.jpg",
        skills: ["translation", "befriending"],
        volunteersNeeded: 5,
        kind: "regular",
        startDate: "2026-10-12",
        weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        startTime: "09:00",
        endTime: "17:00",
        area: "Central",
        address: "ACMI, Agape Village, 7A Lorong 8 Toa Payoh",
        ageGroup: "adults",
        status: "approved",
      },
      {
        title: "Games Day for migrant workers",
        summary: "A morning of carnival games and team activities for migrant workers.",
        story:
          "Volunteers welcomed and engaged migrant workers, joined carnival games and team activities, and helped with registration and care pack distribution.",
        coverUrl: "/images/acmi-care-packs.jpg",
        skills: ["events", "befriending"],
        volunteersNeeded: 20,
        kind: "one_off",
        startDate: "2026-09-06",
        startTime: "09:00",
        endTime: "13:00",
        area: "East",
        address: "Kaki Bukit Recreation Centre",
        ageGroup: "adults",
        status: "completed",
        outcome: { summary: "Volunteers welcomed migrant workers, joined in the carnival games and team activities, and handed out care packs." },
      },
      {
        title: "Transnational family outing",
        summary: "A day out for transnational families with ACMI Family Connectors.",
        story:
          "Event day facilitators welcomed families, helped with registration, guided the programme, facilitated activities, helped with lunch and looked out for everyone's safety.",
        coverUrl: "/images/acmi-goodie-bags.jpg",
        skills: ["events", "childcare"],
        volunteersNeeded: 15,
        kind: "one_off",
        startDate: "2026-09-10",
        startTime: "09:00",
        endTime: "14:00",
        area: "West",
        address: "Westwood Bowl, Civil Service Club @ Bukit Batok",
        ageGroup: "adults",
        status: "completed",
        outcome: { summary: "Facilitators welcomed families, guided the programme and activities, and helped with lunch." },
      },
    ],
  },
  {
    email: "caritas@fiat.sg",
    category: "seniors",
    contact: "Caritas Singapore",
    name: "Caritas Singapore",
    tagline: "God's love in action.",
    history:
      "Caritas Singapore is the official social and community arm of the Catholic Church in Singapore and a member of Caritas Internationalis. Its social mission family includes over 20 Catholic charities and community organisations, serving people of all ages, races and religions.",
    whyItMatters:
      "“Volunteering outside of the parish helps me see Christ in those who need our help and care.” — Sylvia Lee, Caritas Singapore volunteer",
    website: "https://www.caritas-singapore.org",
    foundedYear: null,
    coverUrl: "/images/caritas-community.jpg",
    status: "approved",
    requests: [
      {
        title: "Volunteer cooks for seniors who live alone",
        summary: "Cook with and for stay-alone seniors at MontFort Care's GoodLife!@Marine Parade.",
        story:
          "MontFort Care, part of the Caritas Singapore family, needs volunteer cooks to engage seniors who live alone through its GoodLife!@Marine Parade programme.\n\nThis is a weekday role during office hours in Marine Parade.",
        coverUrl: "/images/caritas-seniors-outing.jpg",
        skills: ["cooking", "befriending", "eldercare"],
        volunteersNeeded: 6,
        kind: "regular",
        startDate: "2026-10-12",
        weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        startTime: "09:00",
        endTime: "17:00",
        area: "East",
        address: "GoodLife!@Marine Parade, MontFort Care",
        ageGroup: "adults",
        status: "approved",
      },
      {
        title: "Tech-savvy befrienders for seniors, online",
        summary: "Keep stay-alone seniors company online with MontFort Care's GoodLife!@Marine Parade.",
        story:
          "MontFort Care, part of the Caritas Singapore family, is looking for tech-savvy volunteers to engage seniors who live alone, online, through GoodLife!@Marine Parade.\n\nThis is a weekday role during office hours and can be done from anywhere.",
        coverUrl: "/images/caritas-small-group.jpg",
        skills: ["tech", "befriending", "eldercare"],
        volunteersNeeded: 6,
        kind: "regular",
        startDate: "2026-10-12",
        weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        startTime: "09:00",
        endTime: "17:00",
        area: "Online",
        ageGroup: "adults",
        status: "approved",
      },
      {
        title: "Volunteer gardener at CHIJ Sanctuary for Children",
        category: "children",
        summary: "Tend the garden at IJ Village on alternate Wednesdays and Fridays.",
        story:
          "CHIJ Sanctuary for Children, part of the Caritas Singapore family, is looking for a volunteer gardener at IJ Village on Wednesdays and Fridays, on alternate weeks.",
        coverUrl: "/images/caritas-involved.jpg",
        skills: ["handyman"],
        volunteersNeeded: 2,
        kind: "regular",
        startDate: "2026-10-14",
        weekdays: ["Wed", "Fri"],
        startTime: "09:00",
        endTime: "12:00",
        area: "Central",
        address: "IJ Village",
        ageGroup: "adults",
        status: "pending_review",
      },
    ],
  },
  {
    email: "oyp@fiat.sg",
    category: "children",
    contact: "Office for Young People",
    name: "Office for Young People",
    tagline: "Raising up a generation for Christ.",
    history:
      "The Office for Young People (OYP) is the Archdiocese of Singapore's office for young people. It journeys with NSFs and pre-enlistees, polytechnic, ITE and private diploma students, university students and working adults, through communities, formation programmes such as RCIY, and events such as the World Youth Day 2027 contingent. OYP is supported by the Catholic Foundation's GIFT programme.",
    whyItMatters: "OYP's mission is to raise up a generation for Christ.",
    website: "https://www.oyp.org.sg",
    foundedYear: null,
    coverUrl: "/images/oyp-community.webp",
    status: "approved",
    requests: [],
  },
  {
    email: "cps@fiat.sg",
    category: "faith",
    contact: "Catholic Prayer Society",
    name: "Catholic Prayer Society",
    tagline: "Help us enrich the faith in the workplace.",
    history:
      "The Catholic Prayer Society organises Masses and prayer for working Catholics in the workplace. It is looking for volunteers to help with singing and music, preparing slides for Mass, social media, audio-visual equipment, and logistics for its events.",
    whyItMatters: "Volunteers help bring the Mass and prayer into the working day.",
    website: "https://www.cps.org.sg",
    foundedYear: null,
    coverUrl: "/images/caritas-involved.jpg",
    status: "pending",
    requests: [],
  },
];

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000);
}

async function main() {
  const { db, orgs, prayers, requests, responses, saintMeetings, updates, users } = await import("../src/db");

  await db.execute(sql`truncate table saint_meetings, updates, prayers, responses, requests, orgs, users restart identity cascade`);
  const byTitle = new Map<string, number>();

  await db.insert(users).values({
    email: ADMIN.email,
    name: "Catholic Foundation Team",
    passwordHash: await bcrypt.hash(ADMIN.password, 10),
    role: "cf_admin",
  });

  const orgHash = await bcrypt.hash(ORG_PASSWORD, 10);
  for (const o of ORGS) {
    const [owner] = await db
      .insert(users)
      .values({ email: o.email, name: o.contact, passwordHash: orgHash, role: "org", phone: "6000 0000" })
      .returning();
    const [org] = await db
      .insert(orgs)
      .values({
        ownerId: owner.id,
        name: o.name,
        tagline: o.tagline,
        history: o.history,
        whyItMatters: o.whyItMatters,
        website: o.website,
        foundedYear: o.foundedYear,
        coverUrl: o.coverUrl,
        status: o.status,
        isDemo: true,
      })
      .returning();

    for (const r of o.requests) {
      const [req] = await db
        .insert(requests)
        .values({
          orgId: org.id,
          title: r.title,
          summary: r.summary,
          story: r.story,
          coverUrl: r.coverUrl,
          skills: r.skills,
          volunteersNeeded: r.volunteersNeeded,
          kind: r.kind,
          startDate: r.startDate,
          endDate: r.endDate ?? null,
          weekdays: r.weekdays ?? [],
          startTime: r.startTime,
          endTime: r.endTime,
          area: r.area,
          address: r.address ?? null,
          ageGroup: r.ageGroup,
          category: r.category ?? o.category,
          tier: r.tier ?? (r.kind === "one_off" ? 1 : 2),
          status: r.status,
          outcomeHours: r.outcome?.hours ?? null,
          outcomePeopleServed: r.outcome?.served ?? null,
          outcomeSummary: r.outcome?.summary ?? null,
          completedAt: r.status === "completed" ? daysAgo(15) : null,
          isDemo: true,
          createdAt: daysAgo(30),
        })
        .returning();
      byTitle.set(r.title, req.id);
      for (const u of r.updates ?? []) {
        await db.insert(updates).values({ requestId: req.id, body: u.body, photoUrl: u.photoUrl ?? null, createdAt: daysAgo(u.daysAgo) });
      }
      const ps = [
        ...(r.prayers ?? []).map((p, i) => ({ requestId: req.id, name: p.name, message: p.message, createdAt: daysAgo(i + 1) })),
        ...Array.from({ length: r.silentPrayers ?? 0 }, (_, i) => ({ requestId: req.id, createdAt: daysAgo(3 + (i % 20)) })),
      ];
      if (ps.length) await db.insert(prayers).values(ps);
    }
  }

  // A demo volunteer who has already met St Monica (praying), St Joseph (offering help) and St Frances Cabrini (Games Day).
  // She's confirmed for Sunday's English class, where checking in by QR brings St Josephine Bakhita.
  const [maria] = await db
    .insert(users)
    .values({
      email: VOLUNTEER.email,
      name: VOLUNTEER.name,
      passwordHash: await bcrypt.hash(VOLUNTEER.password, 10),
      role: "supporter",
      phone: "9123 4567",
      skills: ["befriending", "teaching", "translation"],
      area: "Central",
      createdAt: daysAgo(40),
    })
    .returning();
  const gamesDay = byTitle.get("Games Day for migrant workers")!;
  const english = byTitle.get("English Level 1 assistant trainer")!;
  const villa = byTitle.get("Help at Villa Francis Home for the Aged")!;
  await db.insert(prayers).values({ requestId: villa, userId: maria.id, name: "Maria", createdAt: daysAgo(20) });
  await db.insert(responses).values([
    { requestId: gamesDay, userId: maria.id, status: "accepted", checkedInAt: daysAgo(34), createdAt: daysAgo(38) },
    { requestId: english, userId: maria.id, status: "accepted", note: "I taught English in a parish catechism class for years.", createdAt: daysAgo(5) },
  ]);
  await db.insert(saintMeetings).values([
    { userId: maria.id, saintId: "monica", taskId: "pray", seenAt: daysAgo(20), createdAt: daysAgo(20) },
    { userId: maria.id, saintId: "joseph", taskId: "offer", seenAt: daysAgo(38), createdAt: daysAgo(38) },
    { userId: maria.id, saintId: "cabrini", requestId: gamesDay, seenAt: daysAgo(34), createdAt: daysAgo(34) },
  ]);

  console.log("\nSeeded. Demo logins:");
  console.log(`  Volunteer: ${VOLUNTEER.email} / ${VOLUNTEER.password}`);
  console.log(`  Catholic Foundation admin: ${ADMIN.email} / ${ADMIN.password}`);
  for (const o of ORGS) console.log(`  ${o.status === "pending" ? "(pending) " : ""}${o.name.split(" — ")[0]}: ${o.email} / ${ORG_PASSWORD}`);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
