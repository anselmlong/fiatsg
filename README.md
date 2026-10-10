# Fiat — *Fiat voluntas tua*

A progressive web app for the **Catholic Foundation (Singapore)**, built for the Fiat Catholic Hackathon.
Not everyone can give money. Everyone can give something: their time, their skills, their prayer.

**Live:** https://fiat.anselmlong.com

## What it does

- **Supporters** sign up with their gifts (skills), see a "For you" list of causes that need them, offer to help,
  pray for causes, and follow the impact on "My impact".
- **Organisations** register (vetted by CF), post one-off or weekly volunteer requests, see who offered (with
  contact details and matching skills), accept or decline, post updates and mark requests complete with outcomes.
- **Catholic Foundation** approves, rejects or asks for changes on every organisation and every request.

## Demo logins (after `npm run seed`)

| Role | Email | Password |
| --- | --- | --- |
| Catholic Foundation admin | cf@fiat.sg | fiat-cf-2026 |
| Catholic Welfare Services | cws@fiat.sg | fiat-org-2026 |
| ACMI | acmi@fiat.sg | fiat-org-2026 |
| Caritas Singapore | caritas@fiat.sg | fiat-org-2026 |
| Office for Young People | oyp@fiat.sg | fiat-org-2026 |
| Catholic Prayer Society (pending review) | cps@fiat.sg | fiat-org-2026 |

Supporter accounts are created live through **Join**.

## Stack

Next.js 16 (App Router, server actions) · TypeScript · Tailwind CSS v4 · Neon Postgres + Drizzle ORM ·
cookie sessions (jose + bcrypt) · deployed on Vercel.

```bash
vercel env pull .env.local   # DATABASE_URL, SESSION_SECRET
npm install
npm run db:push              # create tables
npm run seed                 # reset to the demo data (safe to re-run)
npm run dev
```

Organisation names, descriptions and photos come from each organisation's public website (see `SOURCES.md`).
Requests, stories and outcome numbers are demo data and are labelled as such in the app.
