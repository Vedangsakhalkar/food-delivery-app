import { describe, expect, it } from "vitest";
import { decodeCursor, encodeCursor } from "@/lib/pagination";

describe("cursor", () => {
  it("round-trips offsets", () => {
    expect(decodeCursor(encodeCursor(24))).toBe(24);
  });
  it("treats missing or tampered cursors as the first page", () => {
    expect(decodeCursor(undefined)).toBe(0);
    expect(decodeCursor("not-base64-json")).toBe(0);
    expect(decodeCursor(Buffer.from('{"o":-5}').toString("base64url"))).toBe(0);
    expect(decodeCursor(Buffer.from('{"o":"x"}').toString("base64url"))).toBe(0);
  });
});
