import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { MediaItem } from "../lib/media";

export type Role = "supporter" | "org" | "cf_admin";
export type OrgStatus = "pending" | "changes_requested" | "approved" | "rejected";
export type RequestStatus =
  | "pending_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "completed";
export type ResponseStatus = "offered" | "accepted" | "declined";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").$type<Role>().notNull().default("supporter"),
  skills: text("skills").array().notNull().default([]),
  otherSkill: text("other_skill"),
  area: text("area"),
  // The supporter whose share link brought this person to Fiat.
  invitedBy: integer("invited_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orgs = pgTable("orgs", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  history: text("history").notNull().default(""),
  whyItMatters: text("why_it_matters").notNull().default(""),
  website: text("website"),
  contactPhone: text("contact_phone"),
  coverUrl: text("cover_url"),
  foundedYear: integer("founded_year"),
  status: text("status").$type<OrgStatus>().notNull().default("pending"),
  reviewComment: text("review_comment"),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id")
    .notNull()
    .references(() => orgs.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  story: text("story").notNull(),
  coverUrl: text("cover_url"),
  media: jsonb("media").$type<MediaItem[]>().notNull().default([]),
  skills: text("skills").array().notNull().default([]),
  volunteersNeeded: integer("volunteers_needed").notNull().default(1),
  kind: text("kind").$type<"one_off" | "regular">().notNull(),
  // one-off: startDate is the day. regular: startDate..endDate on weekdays.
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  weekdays: text("weekdays").array().notNull().default([]),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  area: text("area").notNull(),
  address: text("address"),
  // Shown only to volunteers the organisation has accepted.
  volunteerNotes: text("volunteer_notes"),
  ageGroup: text("age_group").notNull().default("all"),
  // Which saints a cause brings: see lib/saints.ts. Null until the org picks a category.
  category: text("category"),
  tier: integer("tier").notNull().default(1),
  status: text("status").$type<RequestStatus>().notNull().default("pending_review"),
  reviewComment: text("review_comment"),
  outcomeHours: integer("outcome_hours"),
  outcomePeopleServed: integer("outcome_people_served"),
  outcomeSummary: text("outcome_summary"),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const responses = pgTable(
  "responses",
  {
    id: serial("id").primaryKey(),
    requestId: integer("request_id")
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    note: text("note"),
    status: text("status").$type<ResponseStatus>().notNull().default("offered"),
    checkedInAt: timestamp("checked_in_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("responses_request_user").on(t.requestId, t.userId)],
);

export const prayers = pgTable("prayers", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id")
    .notNull()
    .references(() => requests.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name"),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const updates = pgTable("updates", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id")
    .notNull()
    .references(() => requests.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Each saint a supporter has met, and the task that brought them. seenAt is set once the reveal has played.
export const saintMeetings = pgTable(
  "saint_meetings",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    saintId: text("saint_id").notNull(),
    taskId: text("task_id"),
    requestId: integer("request_id").references(() => requests.id, { onDelete: "set null" }),
    seenAt: timestamp("seen_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("saint_meetings_user_saint").on(t.userId, t.saintId)],
);

export type User = typeof users.$inferSelect;
export type Org = typeof orgs.$inferSelect;
export type Request = typeof requests.$inferSelect;
export type Response = typeof responses.$inferSelect;
export type Update = typeof updates.$inferSelect;
export type SaintMeeting = typeof saintMeetings.$inferSelect;
