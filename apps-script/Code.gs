/**
 * Lead magnet sheet for omar-results.vercel.app/resources
 *
 * Paste this into Extensions > Apps Script on your Google Sheet, then deploy it
 * as a web app (Execute as: Me, Who has access: Anyone). Set a Script Property
 * called SECRET to the same value as SHEET_SECRET in Vercel.
 *
 * Only the Vercel function at /api/lead calls this. It checks the secret first,
 * so posting to the URL directly does nothing.
 */

var SHEET_NAME = "Leads";
var HEADERS = [
  "ID", "Timestamp", "First name", "Email",
  "Business type", "Business (other)",
  "Struggle", "Struggle (other)",
  "Marketer complaint", "Complaint (other)",
  "Page URL", "utm_source", "utm_medium", "utm_campaign",
  "Website",
];
var WEBSITE_COL = HEADERS.indexOf("Website") + 1;

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (!secret || data.secret !== secret) return json({ ok: false, error: "unauthorized" });

    lock.waitLock(10000);
    var sheet = getSheet();

    if (data.action === "create") {
      sheet.appendRow([
        data.id, data.timestamp, data.firstName, data.email,
        data.businessType, data.businessOther,
        data.struggle, data.struggleOther,
        data.complaint, data.complaintOther,
        data.pageUrl, data.utmSource, data.utmMedium, data.utmCampaign,
        "",
      ]);
      return json({ ok: true });
    }

    if (data.action === "website") {
      var match = sheet.getRange("A:A").createTextFinder(data.id).matchEntireCell(true).findNext();
      if (!match) return json({ ok: false, error: "not_found" });
      var cell = sheet.getRange(match.getRow(), WEBSITE_COL);
      if (!cell.getValue()) cell.setValue(data.website);
      return json({ ok: true });
    }

    return json({ ok: false, error: "unknown_action" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
