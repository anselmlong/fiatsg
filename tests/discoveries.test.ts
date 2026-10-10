import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { BONUS_SAINTS, bonusForDiscovery } from "../src/lib/bonus-saints";
import { CATEGORIES, SAINTS, causePool, saint, type Tier } from "../src/lib/saints";
import { SAINT_SOURCES } from "../src/lib/saint-sources";

test("bonus cards resolve for reveals but never enter the normal collection or cause pools", () => {
  const bonusIds = new Set(BONUS_SAINTS.map((s) => s.id));
  assert.equal(bonusIds.size, 3);
  assert.ok(SAINTS.every((s) => !bonusIds.has(s.id)));
  for (const s of BONUS_SAINTS) assert.equal(saint(s.id), s);
  for (const category of CATEGORIES) {
    for (const tier of [1, 2, 3] as Tier[]) {
      assert.ok(causePool(category.id, tier).every((s) => !bonusIds.has(s.id)));
    }
  }
});

test("only the three discovery keys map to rewards", () => {
  assert.equal(bonusForDiscovery("lost-key")?.id, "bonus-anthony");
  assert.equal(bonusForDiscovery("sources")?.id, "bonus-thomas");
  assert.equal(bonusForDiscovery("bird")?.id, "bonus-francis");
  for (const invalid of ["", "monica", "bonus-anthony", "__proto__", "constructor"]) {
    assert.equal(bonusForDiscovery(invalid), undefined);
  }
});

test("every story offers reading references and every bonus has a real portrait", () => {
  for (const s of SAINTS) assert.ok(SAINT_SOURCES[s.id]?.length, s.id);
  for (const s of BONUS_SAINTS) {
    assert.ok(s.sources.length);
    assert.ok(existsSync(`public${s.image}`), s.image);
  }
  for (const sources of [...Object.values(SAINT_SOURCES), ...BONUS_SAINTS.map((s) => s.sources)]) {
    for (const source of sources) assert.equal(new URL(source.url).protocol, "https:");
  }
});
