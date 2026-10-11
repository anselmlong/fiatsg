// Pulls the saints (name, feast, image) straight from the app's roster, so the film can't misname
// anyone, and draws the QR code for the check-in ticket.
import { readFileSync, writeFileSync } from "node:fs";
import QRCode from "qrcode";

const src = readFileSync(new URL("../src/lib/saint-roster.ts", import.meta.url), "utf8");
const saints = [];
const re = /"?id"?:\s*"([^"]+)",\s*"?name"?:\s*"([^"]+)",\s*"?feast"?:\s*"([^"]+)"/g;
for (const m of src.matchAll(re)) saints.push({ id: m[1], name: m[2], feast: m[3], image: `/public/saints/${m[1]}.jpg` });
if (saints.length !== 28) throw new Error(`Expected 28 saints in the roster, found ${saints.length}`);
writeFileSync(new URL("./assets/saints.json", import.meta.url), JSON.stringify(saints, null, 2));

const svg = await QRCode.toString("https://fiat.anselmlong.com", { type: "svg", margin: 0, color: { dark: "#2b1a3fff", light: "#00000000" } });
writeFileSync(new URL("./assets/qr.svg", import.meta.url), svg);
console.log(`prep: ${saints.length} saints, qr.svg`);
