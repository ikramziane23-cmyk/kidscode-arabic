import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { AVAILABLE_PAGES, TOTAL_PAGES, adjacentPage, availablePage, mushafPageUrl } from "./mushaf-data";

describe("Uploaded colored Warsh continuation", () => {
  it("keeps all 268 scans in printed-page order with no duplicate pages", () => {
    const files = readdirSync("public/mushaf/warsh").map(name => Number(name.replace(".jpg", ""))).sort((a, b) => a - b);
    expect(AVAILABLE_PAGES).toEqual(files);
    expect(AVAILABLE_PAGES).toHaveLength(268);
    expect(new Set(AVAILABLE_PAGES).size).toBe(268);
    expect(TOTAL_PAGES).toBe(307);
    for (const page of AVAILABLE_PAGES) {
      expect([...readFileSync(`public${mushafPageUrl(page)}`).subarray(0, 2)]).toEqual([255, 216]);
    }
  });

  it("continues directly from the previous batch to printed page 148", () => {
    expect(adjacentPage(147, 1)).toBe(148);
    expect(adjacentPage(148, -1)).toBe(147);
    expect(mushafPageUrl(148)).toBe("/mushaf/warsh/148.jpg");
  });

  it("skips absent scans without renumbering the printed pages", () => {
    expect(adjacentPage(207, 1)).toBe(210);
    expect(adjacentPage(210, -1)).toBe(207);
    expect(availablePage(208)).toBe(210);
    expect(adjacentPage(307, 1)).toBe(307);
    expect(availablePage(604)).toBe(307);
  });
});