import {
  parseCmsPostIds,
  parseCmsPostSlugs,
} from "@/lib/cms-post-selectors";

describe("cms post selectors", () => {
  it("parses cms post ids with comma-separated values, numeric ranges, and trimming", () => {
    expect(parseCmsPostIds(" 1, 2 , 1-3 , 7-9 , 11, 12, 13 ")).toEqual([
      "1",
      "2",
      "3",
      "7",
      "8",
      "9",
      "11",
      "12",
      "13",
    ]);
  });

  it("suppresses duplicate cms post ids from repeated values and overlapping ranges", () => {
    expect(parseCmsPostIds("1-3, 2, 3, 4, 4")).toEqual(["1", "2", "3", "4"]);
  });

  it("leaves reverse cms post id ranges unexpanded", () => {
    expect(parseCmsPostIds("4-1, 7-9")).toEqual(["4-1", "7", "8", "9"]);
  });

  it("parses cms post slugs with comma-separated values and trimming", () => {
    expect(parseCmsPostSlugs(" first-post, second-post , third-post ")).toEqual(
      ["first-post", "second-post", "third-post"],
    );
  });

  it("suppresses duplicate cms post slugs", () => {
    expect(parseCmsPostSlugs("news, feature, news, update, feature")).toEqual([
      "news",
      "feature",
      "update",
    ]);
  });
});
