// POST /api/lead
// Validates a lead magnet submission and forwards it to the Google Apps Script
// web app that writes it to the Sheet. The script URL and shared secret live in
// env vars (SHEET_WEBHOOK_URL, SHEET_SECRET), never in the browser.
//
// Two actions:
//   create   the questionnaire answers. Returns { ok, id }.
//   website  attaches a site URL to an existing submission by id.

import { randomUUID } from "node:crypto";

const BUSINESS = [
  "Therapist or counselor",
  "Nutritionist or dietitian",
  "Dentist",
  "Med spa or salon",
  "Home services (HVAC, plumbing, contractor)",
  "Gym or fitness",
  "Restaurant",
  "Law firm",
  "Other",
];
const STRUGGLE = [
  "I depend on referrals and slow months hurt",
  "People visit my website but don't call or book",
  "People can't find me on Google",
  "I've paid for ads that didn't work",
  "I don't have time to deal with marketing",
  "Other",
];
const COMPLAINT = [
  "They promised a lot and delivered little",
  "They locked me into a long contract",
  "I never understood what I was paying for",
  "They disappeared or were slow to reply",
  "They kept control of my website or accounts",
  "I've never hired one, and I'm not sure who to trust",
  "Other",
];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Trim, cap the length, and stop Sheets from treating the value as a formula.
function clean(value, max = 200) {
  const text = String(value ?? "").trim().slice(0, max);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

// Vercel parses JSON bodies for us. The local dev server doesn't, so read the stream.
async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body);
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

function validateLead(body) {
  const errors = {};
  const pick = (field, options, otherField) => {
    if (!options.includes(body[field])) errors[field] = "required";
    else if (body[field] === "Other" && !String(body[otherField] ?? "").trim()) errors[otherField] = "required";
  };
  pick("businessType", BUSINESS, "businessOther");
  pick("struggle", STRUGGLE, "struggleOther");
  pick("complaint", COMPLAINT, "complaintOther");
  if (!String(body.firstName ?? "").trim()) errors.firstName = "required";
  if (!EMAIL.test(String(body.email ?? "").trim())) errors.email = "invalid";
  return errors;
}

async function forward(payload) {
  const response = await fetch(process.env.SHEET_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, secret: process.env.SHEET_SECRET }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || `Sheet responded ${response.status}`);
  return data;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { ok: false, error: "method_not_allowed" });
  }
  if (!process.env.SHEET_WEBHOOK_URL || !process.env.SHEET_SECRET) {
    console.error("lead: SHEET_WEBHOOK_URL or SHEET_SECRET is not set");
    return send(res, 500, { ok: false, error: "not_configured" });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return send(res, 400, { ok: false, error: "bad_json" });
  }

  // Honeypot: real visitors never see this field. Pretend it worked.
  if (body.company) return send(res, 200, { ok: true, id: randomUUID() });

  try {
    if (body.action === "website") {
      if (!UUID.test(String(body.id ?? ""))) return send(res, 400, { ok: false, error: "bad_id" });
      const website = clean(body.website, 300);
      if (!website) return send(res, 400, { ok: false, errors: { website: "required" } });
      await forward({ action: "website", id: body.id, website });
      return send(res, 200, { ok: true });
    }

    const errors = validateLead(body);
    if (Object.keys(errors).length) return send(res, 400, { ok: false, errors });

    const id = randomUUID();
    const isOther = (field) => body[field] === "Other";
    await forward({
      action: "create",
      id,
      timestamp: new Date().toISOString(),
      firstName: clean(body.firstName, 80),
      email: clean(body.email, 200).toLowerCase(),
      businessType: body.businessType,
      businessOther: isOther("businessType") ? clean(body.businessOther) : "",
      struggle: body.struggle,
      struggleOther: isOther("struggle") ? clean(body.struggleOther) : "",
      complaint: body.complaint,
      complaintOther: isOther("complaint") ? clean(body.complaintOther) : "",
      pageUrl: clean(body.pageUrl, 500),
      utmSource: clean(body.utmSource, 100),
      utmMedium: clean(body.utmMedium, 100),
      utmCampaign: clean(body.utmCampaign, 100),
    });
    return send(res, 200, { ok: true, id });
  } catch (error) {
    console.error("lead:", error);
    return send(res, 502, { ok: false, error: "sheet_failed" });
  }
}
