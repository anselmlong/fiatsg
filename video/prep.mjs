// Pulls the saints (name, feast, image) straight from the app's roster, so the film can't misname
// anyone, and copies the app's saint images into Remotion's public folder.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";

const src = readFileSync(new URL("../src/lib/saint-roster.ts", import.meta.url), "utf8");
const saints = [];
const re = /"?id"?:\s*"([^"]+)",\s*"?name"?:\s*"([^"]+)",\s*"?feast"?:\s*"([^"]+)"/g;
for (const m of src.matchAll(re)) saints.push({ id: m[1], name: m[2], feast: m[3], image: `saints/${m[1]}.jpg` });
if (saints.length !== 28) throw new Error(`Expected 28 saints in the roster, found ${saints.length}`);
writeFileSync(new URL("./src/saints.json", import.meta.url), JSON.stringify(saints, null, 2) + "\n");

mkdirSync(new URL("./public/saints", import.meta.url), { recursive: true });
for (const s of saints) copyFileSync(new URL(`../public/saints/${s.id}.jpg`, import.meta.url), new URL(`./public/saints/${s.id}.jpg`, import.meta.url));
console.log(`prep: ${saints.length} saints`);
