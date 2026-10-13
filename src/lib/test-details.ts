// Verified section IDs in TestsExperience; never infer anchors from new titles.
const sections: Record<string, string> = {
  "codes-abcd": "codes",
  etho: "etho",
  mindsets: "mindsets",
  "geometric-spectra": "spectra",
  "triple-test": "behavioral-inclinations",
};

export function testDetailsHref(id: string) {
  return sections[id] ? `/tests#${sections[id]}` : undefined;
}
