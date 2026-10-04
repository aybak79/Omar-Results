// Tailor the coming-soon page to the nav link that brought the visitor here (?p=...).
const sections = {
  swipes: {
    name: "Swipes",
    line: "You clicked Swipes. Good instinct. My swipe file is getting a final edit, and only the ads and emails that actually converted make the cut.",
  },
  "case-studies": {
    name: "Case studies",
    line: "You clicked Case studies. More case files are being written up right now. Real numbers only, so they take a little longer.",
  },
  referral: {
    name: "Referral program",
    line: "You clicked Referral program. It's being built as we speak. Short version: send a business my way, and you'll be glad you did.",
  },
  resources: {
    name: "Resources",
    line: "You clicked Resources. Free guides and templates are on the way. Useful ones, not 40-page PDFs nobody finishes.",
  },
  newsletter: {
    name: "Newsletter",
    line: "You clicked Newsletter. It's warming up. No spam, no fluff, just one useful idea at a time.",
  },
};

const section = sections[new URLSearchParams(location.search).get("p")];
if (section) {
  document.querySelector("[data-soon-line]").textContent = section.line;
  document.querySelector("[data-soon-name]").textContent = section.name;
  document.title = `${section.name}: still in the lab | Omar Results`;
}
