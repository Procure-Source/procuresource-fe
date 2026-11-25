/* Google Apps Script for the supplier onboarding Google Sheet.
   Setup steps are in the PR / chat; paste this into Extensions > Apps Script.
   Keep SECRET identical to ONBOARDING_SHEET_SECRET in Vercel. */

const SECRET = "PASTE_A_LONG_RANDOM_STRING_HERE";
const COLUMNS = [
  "created_at", "type", "source", "full_name", "company_name",
  "mobile", "email", "designation", "region", "notes",
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.secret !== SECRET) return reply({ ok: false, error: "unauthorized" });

    const sheet = SpreadsheetApp.getActiveSheet();
    if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);

    /* Plain-text format so "+971 50…" stays text and nothing is read as a formula. */
    const range = sheet.getRange(sheet.getLastRow() + 1, 1, 1, COLUMNS.length);
    range.setNumberFormat("@");
    range.setValues([COLUMNS.map((c) => String(data[c] ?? ""))]);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
