// Reads and checks the request form, shared by organisations and the Catholic Foundation.
import { int, list, str, strOrNull } from "./forms";
import { parseMedia } from "./media";
import { defaultTier, isCategory } from "./saints";
import { AREAS, isSkill, WEEKDAYS } from "./skills";

export function readRequest(fd: FormData) {
  const kind = str(fd, "kind") === "regular" ? "regular" : "one_off";
  const remote = str(fd, "area") === "Online";
  const values = {
    title: str(fd, "title"),
    summary: str(fd, "summary"),
    story: str(fd, "story"),
    coverUrl: strOrNull(fd, "coverUrl"),
    media: parseMedia(str(fd, "media")),
    skills: list(fd, "skills").filter(isSkill),
    volunteersNeeded: Math.max(1, int(fd, "volunteersNeeded") ?? 1),
    kind: kind as "one_off" | "regular",
    startDate: str(fd, "startDate"),
    endDate: kind === "regular" ? strOrNull(fd, "endDate") : null,
    weekdays: kind === "regular" ? list(fd, "weekdays").filter((d) => (WEEKDAYS as readonly string[]).includes(d)) : [],
    startTime: str(fd, "startTime"),
    endTime: str(fd, "endTime"),
    area: (AREAS as readonly string[]).includes(str(fd, "area")) ? str(fd, "area") : "Central",
    address: remote ? null : strOrNull(fd, "address"),
    volunteerNotes: strOrNull(fd, "volunteerNotes"),
    ageGroup: str(fd, "ageGroup") || "all",
    category: isCategory(str(fd, "category")) ? str(fd, "category") : null,
    tier: defaultTier(kind),
  };
  let error: string | undefined;
  if (!values.title) error = "Please give your request a title.";
  else if (!values.summary) error = "Please add a one-line summary.";
  else if (values.story.length < 30) error = "Please tell volunteers a little more about why this matters (a few sentences).";
  else if (!values.skills.length) error = "Please choose at least one gift you need.";
  else if (!values.startDate) error = kind === "regular" ? "Please choose a start date." : "Please choose a date.";
  else if (values.endDate && values.endDate < values.startDate) error = "The end date can't be before the start date.";
  else if (kind === "regular" && !values.weekdays.length) error = "Please choose which day(s) of the week.";
  else if (!values.startTime || !values.endTime) error = "Please set a start and end time.";
  else if (values.endTime <= values.startTime) error = "The end time needs to be after the start time.";
  return { values, error };
}
