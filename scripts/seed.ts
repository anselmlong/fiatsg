// Resets the database to the demo state. Safe to re-run: `npm run seed`.
import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

const ADMIN = { email: "cf@fiat.sg", password: "fiat-cf-2026" };
const ORG_PASSWORD = "fiat-org-2026";

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
  outcome?: { hours: number; served: number; summary: string };
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
  requests: Req[];
};

const ORGS: OrgSeed[] = [
  {
    email: "cws@fiat.sg",
    contact: "Volunteer Coordinator, CWS",
    name: "Catholic Welfare Services",
    tagline: "Journeying with people-in-need to live life to the fullest.",
    history:
      "Catholic Welfare Services (CWS) was founded in 1959 to uplift the lives of the less fortunate in our community. Over six decades it has grown into an action arm of the Catholic Church in Singapore, running St Theresa's Home, Villa Francis Home for the Aged, St Vincent Home and BT YouthReach, and walking alongside rough sleepers on our streets at night.",
    whyItMatters:
      "Many of the seniors in our homes have outlived their families. A familiar face every week is often the only visit they receive. Your presence tells them they have not been forgotten.",
    website: "https://www.catholicwelfare.org.sg",
    foundedYear: 1959,
    coverUrl: "/images/cws-who.jpg",
    status: "approved",
    requests: [
      {
        title: "Sunday afternoon companions at Villa Francis",
        summary: "Sit, chat, sing and pray with elderly residents who rarely receive visitors.",
        story:
          "Auntie Mary is 91. She used to sing in her parish choir every Sunday. Today she sits by the window of Villa Francis, waiting for a visitor who usually doesn't come.\n\nWe are looking for companions who can spend two hours on Sunday afternoons with our residents — chatting in English, Mandarin, Hokkien or Malay, reading the newspaper aloud, playing a hymn on the piano, or simply holding a hand during the Rosary.\n\nYou don't need any special training. You only need to come back. For our residents, the same face every week is worth more than anything we could buy them.",
        coverUrl: "/images/vf-banner2.jpg",
        skills: ["befriending", "eldercare", "music", "translation"],
        volunteersNeeded: 12,
        kind: "regular",
        startDate: "2026-10-18",
        endDate: "2027-03-28",
        weekdays: ["Sun"],
        startTime: "14:00",
        endTime: "16:00",
        area: "North",
        address: "Villa Francis Home for the Aged, 64 Mandai Estate",
        ageGroup: "all",
        status: "approved",
        prayers: [
          { name: "Theresa", message: "For Auntie Mary and every resident waiting by the window." },
          { name: "A grandson", message: "My grandma lived in a home. Praying someone visits them all." },
        ],
        silentPrayers: 37,
      },
      {
        title: "Friday night walk with rough sleepers",
        summary: "Join our outreach team bringing food, water and a listening ear to people sleeping rough.",
        story:
          "Every Friday night, a small team from CWS walks the void decks and parks of Singapore with bottles of water, packets of food and something harder to carry: time.\n\nMany of the people we meet have lost jobs, homes or family. What they tell us most is that people walk past them as if they are invisible. We stop.\n\nWe need volunteers who can listen without judging, and a few drivers with cars to help us ferry supplies. If you speak Malay, Tamil or a Chinese dialect, even better.",
        coverUrl: "/images/cws-haw2.jpg",
        skills: ["befriending", "driving", "translation", "health"],
        volunteersNeeded: 8,
        kind: "regular",
        startDate: "2026-10-16",
        endDate: "2026-12-18",
        weekdays: ["Fri"],
        startTime: "21:00",
        endTime: "23:30",
        area: "Central",
        address: "Meet at Catholic Centre, 55 Waterloo Street",
        ageGroup: "adults",
        status: "approved",
        prayers: [{ name: "Joseph", message: "For everyone sleeping outside tonight. May they feel seen." }],
        silentPrayers: 21,
      },
      {
        title: "Mid-Autumn lantern evening with our seniors",
        summary: "Families and youth brought mooncakes, lanterns and songs to 80 seniors.",
        story:
          "For many residents, Mid-Autumn used to mean a full table and grandchildren running with lanterns. This year, we asked our volunteers to become that family for one evening.",
        coverUrl: "/images/cws-sjh.jpg",
        skills: ["eldercare", "music", "events", "childcare"],
        volunteersNeeded: 30,
        kind: "one_off",
        startDate: "2026-09-25",
        startTime: "17:00",
        endTime: "20:00",
        area: "Central",
        ageGroup: "all",
        status: "completed",
        outcome: {
          hours: 102,
          served: 80,
          summary:
            "34 volunteers — including 9 families with young children — spent the evening with 80 residents. Four volunteers have since signed up to visit weekly.",
        },
        updates: [
          {
            daysAgo: 14,
            body: "Thank you to every family who came. One resident, who has not spoken much since her stroke, sang the whole of 月亮代表我的心 with the children. Her nurse cried. So did we.",
            photoUrl: "/images/cws-sjh.jpg",
          },
          {
            daysAgo: 6,
            body: "Four of you have asked to keep visiting. We've started a Saturday befriending group because of you. The lanterns are still hanging in the dining hall.",
          },
        ],
        prayers: [{ name: "Grace", message: "Thank you Lord for this beautiful evening." }],
        silentPrayers: 58,
      },
    ],
  },
  {
    email: "acmi@fiat.sg",
    contact: "Volunteer Team, ACMI",
    name: "ACMI — Archdiocesan Commission for the Pastoral Care of Migrants & Itinerant People",
    tagline: "Family to migrants.",
    history:
      "ACMI serves all migrants in Singapore — domestic workers, construction workers, seafarers and foreign students — by welcoming, protecting, enriching and integrating them into our community, regardless of nationality, race or religion. Its volunteers run skills classes, befriending, shelter support and casework.",
    whyItMatters:
      "There are over a million migrant workers in Singapore, far from their own families. Many build our homes and raise our children. A class, a meal or a friend on their one day off can change how they experience this country.",
    website: "https://www.acmi.org.sg",
    foundedYear: null,
    coverUrl: "/images/acmi-volunteer.jpg",
    status: "approved",
    requests: [
      {
        title: "Sunday English classes for migrant domestic workers",
        summary: "Teach conversational English to domestic workers on their day off.",
        story:
          "Rina has worked in Singapore for six years. She looks after a child she loves like her own, but she still can't read the notes his teacher sends home.\n\nOn Sundays, her only day off, she comes to ACMI to learn. We need patient volunteers to lead small groups of 5–6 learners through simple, practical English — reading a letter, speaking to a doctor, writing a message home.\n\nWe provide the lesson plans. You bring kindness and a little patience.",
        coverUrl: "/images/acmi-stories.jpg",
        skills: ["teaching", "translation", "befriending"],
        volunteersNeeded: 10,
        kind: "regular",
        startDate: "2026-10-25",
        endDate: "2027-01-31",
        weekdays: ["Sun"],
        startTime: "10:00",
        endTime: "12:00",
        area: "Central",
        address: "Catholic Centre, 55 Waterloo Street",
        ageGroup: "teens",
        status: "approved",
        prayers: [{ name: "Maria", message: "For all the helpers far from their children." }],
        silentPrayers: 29,
      },
      {
        title: "Pack 500 Christmas welcome kits for migrant workers",
        summary: "One afternoon. Families welcome. Pack toiletries, snacks and a handwritten card.",
        story:
          "For many migrant workers, Christmas in Singapore is spent in a dormitory, thousands of kilometres from home.\n\nThis December, we want each of 500 workers to open a bag and find something that says: you are welcome here. Toiletries, snacks, a phone top-up card — and a handwritten note from a Singaporean family.\n\nBring your children. Bring your grandparents. Bring your small group. Everyone can write a card.",
        coverUrl: "/images/acmi-volunteer.jpg",
        skills: ["events", "childcare"],
        volunteersNeeded: 40,
        kind: "one_off",
        startDate: "2026-12-12",
        startTime: "14:00",
        endTime: "17:00",
        area: "Central",
        address: "Catholic Centre, 55 Waterloo Street",
        ageGroup: "all",
        status: "approved",
        silentPrayers: 12,
      },
      {
        title: "Backpack drive for workers in recovery",
        summary: "Volunteers packed 400 backpacks of essentials for workers recovering from injury.",
        story:
          "Injured migrant workers often wait months for their cases to be resolved, unable to work and far from home. We asked for help to pack backpacks with essentials for each of them.",
        coverUrl: "/images/acmi-events.jpg",
        skills: ["events", "admin"],
        volunteersNeeded: 25,
        kind: "one_off",
        startDate: "2026-08-22",
        startTime: "09:00",
        endTime: "13:00",
        area: "Central",
        ageGroup: "all",
        status: "completed",
        outcome: {
          hours: 116,
          served: 400,
          summary: "29 volunteers packed and delivered 400 backpacks to workers in recovery across 6 dormitories.",
        },
        updates: [
          {
            daysAgo: 40,
            body: "All 400 backpacks have reached the dormitories. One worker, recovering from a hand injury, told us: “I thought nobody in Singapore knew I was here.” Now he knows.",
            photoUrl: "/images/acmi-events.jpg",
          },
        ],
        silentPrayers: 44,
      },
    ],
  },
  {
    email: "caritas@fiat.sg",
    contact: "Caritas Singapore",
    name: "Caritas Singapore",
    tagline: "God's love in action.",
    history:
      "Caritas Singapore is the official social and community arm of the Catholic Church in Singapore and a member of Caritas Internationalis. Together with its family of Catholic charities, it serves people of all ages, races and religions — families in crisis, persons with disabilities, seniors and youth-at-risk.",
    whyItMatters:
      "Behind every form left unfilled is a family that didn't get help it was entitled to. Many seniors and low-income families simply don't know where to start. A patient helper can open doors.",
    website: "https://www.caritas-singapore.org",
    foundedYear: null,
    coverUrl: "/images/caritas-community.jpg",
    status: "approved",
    requests: [
      {
        title: "Help families apply for financial assistance",
        summary: "Sit with low-income families and seniors to fill in assistance forms, in their language.",
        story:
          "Mr Tan is 74 and caring for his wife after her stroke. He is eligible for help, but the forms are online, in English, and ask for documents he doesn't understand.\n\nEvery Saturday morning at our parish help desk, volunteers sit with people like Mr Tan, one at a time, and walk them through it — patiently, in Mandarin, Malay, Tamil or dialect if needed.\n\nIf you're organised, good with forms, or speak a second language, you can quietly change a family's month.",
        coverUrl: "/images/caritas-community.jpg",
        skills: ["admin", "translation", "tech", "befriending"],
        volunteersNeeded: 6,
        kind: "regular",
        startDate: "2026-10-17",
        endDate: "2027-02-27",
        weekdays: ["Sat"],
        startTime: "09:30",
        endTime: "12:00",
        area: "East",
        address: "Parish help desk, Church of the Holy Family, 6 Chapel Road",
        ageGroup: "adults",
        status: "approved",
        silentPrayers: 16,
      },
      {
        title: "Phone & WhatsApp help for seniors",
        summary: "Teach seniors to video-call their grandchildren, book appointments and stay safe from scams.",
        story:
          "A short course run by volunteers for seniors in the parish who want to video-call family overseas, use HealthHub and recognise scam messages.",
        coverUrl: "/images/cws-haw.jpg",
        skills: ["tech", "teaching", "eldercare"],
        volunteersNeeded: 5,
        kind: "one_off",
        startDate: "2026-11-07",
        startTime: "10:00",
        endTime: "12:30",
        area: "West",
        address: "Church of St Mary of the Angels, 5 Bukit Batok East Ave 2",
        ageGroup: "teens",
        status: "pending_review",
      },
    ],
  },
  {
    email: "oyp@fiat.sg",
    contact: "Office for Young People",
    name: "Office for Young People",
    tagline: "Accompanying young Catholics to encounter Christ and each other.",
    history:
      "The Office for Young People (OYP) is the Archdiocese of Singapore's office for youth and young adult ministry. It journeys with NSFs and pre-enlistees, polytechnic, ITE and university students and young working adults through retreats, formation and community. OYP is supported by the Catholic Foundation's GIFT programme.",
    whyItMatters:
      "Many young people drift from the Church between 18 and 30 — not because they stop believing, but because nobody walks with them. An older Catholic who listens can be the reason someone stays.",
    website: "https://www.oyp.org.sg",
    foundedYear: null,
    coverUrl: "/images/oyp-community.webp",
    status: "approved",
    requests: [
      {
        title: "Mentors and musicians for a weekend youth retreat",
        summary: "Accompany small groups of young adults, lead worship, or simply share your story.",
        story:
          "Sixty young people — students, NSFs, first-jobbers — will spend a weekend asking big questions: Who am I? Where is God in my mess?\n\nWe need mentors who have lived a little: parents, grandparents, retirees, working adults, people who have doubted and stayed. You'll sit with a small group and listen. We also need guitarists, singers and a photographer.\n\nYour story might be exactly what someone needs to hear.",
        coverUrl: "/images/oyp-community.webp",
        skills: ["befriending", "music", "photography", "teaching"],
        volunteersNeeded: 15,
        kind: "one_off",
        startDate: "2026-11-21",
        startTime: "09:00",
        endTime: "18:00",
        area: "West",
        address: "Catholic Spirituality Centre, 1261 Upper Serangoon Road",
        ageGroup: "adults",
        status: "approved",
        prayers: [{ name: "Ben, 22", message: "For everyone who feels far from God right now. I was one of them." }],
        silentPrayers: 33,
      },
      {
        title: "Design posters & reels for youth events",
        summary: "Remote, flexible: create social posts for OYP's upcoming events.",
        story:
          "Good design helps young people find their way to something good. If you can make a poster, edit a reel or write a caption, you can help us reach young Catholics where they already are — on their phones. Work from home, at your own pace.",
        coverUrl: "/images/oyp-1.webp",
        skills: ["design", "photography"],
        volunteersNeeded: 4,
        kind: "regular",
        startDate: "2026-10-12",
        endDate: "2026-12-31",
        weekdays: ["Mon", "Wed"],
        startTime: "19:00",
        endTime: "21:00",
        area: "Online",
        ageGroup: "teens",
        status: "approved",
        silentPrayers: 7,
      },
    ],
  },
  {
    email: "cps@fiat.sg",
    contact: "Catholic Prayer Society",
    name: "Catholic Prayer Society",
    tagline: "Enriching the faith in the workplace.",
    history:
      "The Catholic Prayer Society organises lunchtime Masses and prayer services in the Central Business District so that working Catholics can encounter God in the middle of their working day.",
    whyItMatters:
      "For many working adults, a lunchtime Mass is the only quiet moment in a long week. Volunteers make it possible.",
    website: "https://www.cps.org.sg",
    foundedYear: null,
    coverUrl: "/images/cps-mass.jpg",
    status: "pending",
    requests: [],
  },
];

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000);
}

async function main() {
  const { db, orgs, prayers, requests, updates, users } = await import("../src/db");

  await db.execute(sql`truncate table updates, prayers, responses, requests, orgs, users restart identity cascade`);

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
          status: r.status,
          outcomeHours: r.outcome?.hours ?? null,
          outcomePeopleServed: r.outcome?.served ?? null,
          outcomeSummary: r.outcome?.summary ?? null,
          completedAt: r.status === "completed" ? daysAgo(15) : null,
          isDemo: true,
          createdAt: daysAgo(30),
        })
        .returning();
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

  console.log("\nSeeded. Demo logins:");
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
