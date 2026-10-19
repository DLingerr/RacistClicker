import { describe, it, expect } from "vitest";
import { compareVersions, parseChangelog } from "../changelog";

const sample = `# v1.0.2 - 14.08.2026 (d.m.y)

## New
- Added a preview button

## Fixed
- Fixed a crash on exit

# v1.0.1 - 21.07.2026 (d.m.y)

## Changed
- Faster click scheduling

# v1.0.0 - 01.01.2026 (d.m.y)

## Info

1. First release
2. Second bullet
`;

describe("parseChangelog", () => {
  it("parses versions and dates", () => {
    const entries = parseChangelog(sample);
    expect(entries.map((e) => e.version)).toEqual(["1.0.2", "1.0.1", "1.0.0"]);
    expect(entries[0].date).toBe("14.08.2026 (d.m.y)");
  });

  it("parses sections and items", () => {
    const [entry] = parseChangelog(sample);
    expect(entry.sections.map((s) => s.heading)).toEqual(["New", "Fixed"]);
    expect(entry.sections[0].items).toEqual(["Added a preview button"]);
  });

  it("parses numbered items", () => {
    const entry = parseChangelog(sample)[2];
    expect(entry.sections[0].items).toEqual(["First release", "Second bullet"]);
  });

  it("drops sections with no matching items", () => {
    const empty = "# v1.0.0 - 01.01.2026\n\n## Info\n(no bullet here)\n";
    const entries = parseChangelog(empty);
    expect(entries[0].sections).toEqual([]);
  });
});

describe("compareVersions", () => {
  it("compares simple versions", () => {
    expect(compareVersions("1.0.0", "1.0.2")).toBe(-1);
    expect(compareVersions("1.0.2", "1.0.0")).toBe(1);
    expect(compareVersions("1.0.2", "1.0.2")).toBe(0);
  });

  it("ignores leading v", () => {
    expect(compareVersions("v1.0.2", "1.0.1")).toBe(1);
    expect(compareVersions("1.0.1", "v1.0.2")).toBe(-1);
  });

  it("compares across segment lengths", () => {
    expect(compareVersions("1.0", "1.0.2")).toBe(-1);
    expect(compareVersions("1.0.2", "1.0")).toBe(1);
    expect(compareVersions("1", "1.0.0")).toBe(0);
  });

  it("handles non-numeric segments as zero", () => {
    expect(compareVersions("1.0.x", "1.0.2")).toBe(-1);
  });
});
