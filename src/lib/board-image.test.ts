import { describe, expect, it } from "vitest";
import { centeredImageBounds } from "./board-image";

describe("Original mushaf image placement", () => {
  it("centers the entire image in the viewport after zoom and pan", () => {
    const bounds = centeredImageBounds({ width: 976, height: 1580 }, { width: 1280, height: 900 }, 2, { x: 100, y: -40 });
    expect((bounds.x + bounds.w / 2) * 2 + 100).toBe(640);
    expect((bounds.y + bounds.h / 2) * 2 - 40).toBe(450);
  });

  it("preserves the full original aspect ratio and fits without cropping", () => {
    const original = { width: 976, height: 1580 };
    const bounds = centeredImageBounds(original, { width: 390, height: 844 }, 1, { x: 0, y: 0 });
    expect(bounds.w / bounds.h).toBeCloseTo(976 / 1580);
    expect(bounds.w).toBeLessThanOrEqual(390 * 0.7);
    expect(bounds.h).toBeLessThanOrEqual(844 * 0.65);
    expect(original).toEqual({ width: 976, height: 1580 });
  });
});