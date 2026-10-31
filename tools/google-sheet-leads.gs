/** @OnlyCurrentDoc */
/**
 * Glabol Vietnam landing page (vietnam-trip.glabol.com) → Google Sheet
 * Every enquiry becomes a row in the "Leads" tab, and the sheet owner gets an email alert.
 *
 * SETUP (once)
 *  1. In the "Glabol Vietnam Leads" sheet: Extensions → Apps Script, paste this file, Save.
 *  2. Pick "setup" in the function list and click Run, then allow the permissions Google asks for.
 *  3. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone. Deploy.
 *  4. Put the Web app URL (ends in /exec) in SHEET_URL in index.html.
 *
 * CHANGING THIS SCRIPT LATER: paste the new version, Save, then Deploy → Manage deployments →
 * pencil → Version: New version → Deploy. The URL stays the same. ("New deployment" makes a new URL.)
 */

const SHEET_NAME = "Leads";
const EXTRA_ALERT_EMAILS = "";   // more people to alert, comma-separated
const EMAIL_ALERTS = true;
const AS_TEXT = ["travel_month", "travellers", "call_time"];   // stop Sheets turning these into dates or numbers

// Sheet header → field sent by the page. Columns are matched by header, so you can reorder them
// or add your own (Status, Notes). A missing one is added next to the column listed before it:
// hide columns you don't want, don't delete them.
const COLUMNS = [
  ["Timestamp", "timestamp"],
  ["Name", "name"],
  ["Phone", "phone"],
  ["Lead score", "lead_score"],
  ["CRM", "crm_status"],
  ["Travel month", "travel_month"],
  ["Travellers", "travellers"],
  ["Budget per person", "budget"],
  ["Passport", "passport"],
  ["Booking", "booking"],
  ["Flying from", "flying_from"],
  ["Best time to call", "call_time"],
  ["Ad", "ad"],
  ["Source", "utm_source"],
  ["Medium", "utm_medium"],
  ["Campaign", "utm_campaign"],
  ["Content", "utm_content"],
  ["Campaign ID", "campaign_id"],
  ["Adset ID", "adset_id"],
  ["Ad ID", "ad_id"],
  ["fbclid", "fbclid"],
  ["fbc", "fbc"],
  ["fbp", "fbp"],
  ["Event ID", "event_id"],
  ["Page", "page_url"]
];

function setup() {
  getSheet_();
  MailApp.getRemainingDailyQuota();   // asks for the email permission now, not on the first lead
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  const name = clean_(p.name).slice(0, 80);
  const digits = String(p.phone || "").replace(/\D/g, "").slice(-10);
  if (!name || !/^[6-9]\d{9}$/.test(digits)) return json_({ ok: false, error: "name or phone missing" });

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = getSheet_();
    const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const byHeader = {};
    COLUMNS.forEach(function (c) { byHeader[c[0]] = c[1]; });
    const row = head.map(function (h) {
      const key = byHeader[h];
      if (!key) return "";
      if (key === "timestamp") return new Date();
      if (key === "name") return safe_(name);
      if (key === "phone") return "'+91" + digits;
      const v = clean_(p[key]).slice(0, 500);
      if (AS_TEXT.indexOf(key) > -1 && v) return "'" + v;   // keep "Dec 2026" and "2" as typed
      return safe_(v);
    });
    sh.appendRow(row);
  } finally {
    lock.releaseLock();
  }
  if (EMAIL_ALERTS) alert_(p, name, digits);
  return json_({ ok: true });
}

function doGet() {
  return json_({ ok: true, service: "Glabol Vietnam leads" });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  const last = sh.getLastColumn();
  const head = last ? sh.getRange(1, 1, 1, last).getValues()[0] : [];
  COLUMNS.forEach(function (c, i) {
    if (head.indexOf(c[0]) > -1) return;
    const prev = i > 0 ? head.indexOf(COLUMNS[i - 1][0]) : -1;   // 0-based, -1 if not there
    if (prev > -1 && prev < head.length - 1) {
      sh.insertColumnAfter(prev + 1);
      head.splice(prev + 1, 0, c[0]);
      sh.getRange(1, prev + 2).setValue(c[0]).setFontWeight("bold");
    } else {
      head.push(c[0]);
      sh.getRange(1, head.length).setValue(c[0]).setFontWeight("bold");
    }
  });
  sh.setFrozenRows(1);
  return sh;
}

function alert_(p, name, digits) {
  try {
    const to = [Session.getEffectiveUser().getEmail(), EXTRA_ALERT_EMAILS].filter(String).join(",");
    if (!to) return;
    const wa = "https://wa.me/91" + digits;
    const lines = [
      "New Vietnam 5N/6D lead from vietnam-trip.glabol.com",
      "",
      "Name: " + name,
      "Phone: +91 " + digits + "   WhatsApp: " + wa,
      "Lead score: " + clean_(p.lead_score),
      "CRM: " + (clean_(p.crm_status) || "-"),
      "Travel month: " + clean_(p.travel_month) + "   Travellers: " + clean_(p.travellers),
      "Budget per person: " + clean_(p.budget),
      "Passport: " + clean_(p.passport) + "   Booking: " + clean_(p.booking),
      "Flying from: " + clean_(p.flying_from) + "   Best time to call: " + clean_(p.call_time),
      "Ad: " + clean_(p.ad) + "   Source: " + clean_(p.utm_source) + " / " + clean_(p.utm_medium),
      "",
      "All leads: " + SpreadsheetApp.getActiveSpreadsheet().getUrl()
    ];
    MailApp.sendEmail({
      to: to,
      subject: (/^NOT ADDED/.test(clean_(p.crm_status)) ? "[Not in CRM] " : "") +
        "New Vietnam lead: " + name + " (" + clean_(p.travel_month) + ", " + clean_(p.lead_score) + ")",
      body: lines.join("\n"),
      name: "Glabol leads"
    });
  } catch (err) {
    console.error(err);
  }
}

function clean_(v) { return String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").trim(); }
// Stop text that starts with = + - @ being read as a formula
function safe_(v) { return /^[=+\-@]/.test(v) ? "'" + v : v; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
