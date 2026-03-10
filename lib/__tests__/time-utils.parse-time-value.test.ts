import { parseTimeValue } from "@/lib/time-utils";

describe("parseTimeValue strict format", () => {
  it("accepts HH:mm with valid range", () => {
    expect(parseTimeValue("09:30")).toEqual({ hours: 9, minutes: 30 });
  });

  it("rejects extra segment", () => {
    expect(parseTimeValue("09:30:15")).toBeNull();
  });

  it("rejects missing minutes", () => {
    expect(parseTimeValue("09:")).toBeNull();
  });

  it("rejects decimal minutes", () => {
    expect(parseTimeValue("09:30.5")).toBeNull();
  });

  it("rejects malformed alpha time", () => {
    expect(parseTimeValue("9am")).toBeNull();
  });
});
