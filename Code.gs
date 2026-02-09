
/**
 * PIGFARM AUDIT PRO - BACKEND ENGINE
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();
const SHEET_RESULTS = "AuditResults"; 
const SHEET_SUMMARIES = "AuditSummaries";
const SHEET_CHECKLIST = "Checklist";

function doGet(e) {
  var action = (e.parameter && e.parameter.action) || "";
  action = action.toString().toLowerCase().trim();
  
  try {
    if (action === "dashboard") {
      return jsonResponse_(getAdvancedDashboardData_());
    }
    
    if (action === "checklist") {
      const farm = e.parameter.farm || "ALL";
      const role = e.parameter.role || "ALL";
      return jsonResponse_(getChecklist_(farm, role));
    }
    
    return jsonResponse_({ ok: false, error: "Action not supported" });
  } catch (err) {
    return jsonResponse_({ ok: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = (data.action || "").toString().toLowerCase().trim();
    if (action === "saveaudit") return jsonResponse_(saveAudit_(data));
    if (action === "uploadphotos") return jsonResponse_(uploadPhotos_(data));
    return jsonResponse_({ ok: false, error: "Action not supported" });
  } catch (err) {
    return jsonResponse_({ ok: false, error: err.toString() });
  }
}

function getAdvancedDashboardData_() {
  const sumSheet = SS.getSheetByName(SHEET_SUMMARIES);
  const resSheet = SS.getSheetByName(SHEET_RESULTS);
  
  const result = {
    ok: true,
    summary: { compliance: 0, auditsToday: 0, criticalFails: 0, totalPhotos: 0, totalAudits: 0 },
    farmRanking: [],
    trend: [],
    topFails: [],
    recentAudits: []
  };

  if (!sumSheet || sumSheet.getLastRow() < 2) return result;

  const sumData = sumSheet.getDataRange().getValues();
  const sumHeaders = sumData.shift();
  
  const idxFarm = sumHeaders.findIndex(h => h.toString().toLowerCase().includes("farm"));
  const idxScore = sumHeaders.findIndex(h => h.toString().toLowerCase().includes("score"));
  const idxTime = sumHeaders.findIndex(h => h.toString().toLowerCase().includes("timestamp"));
  const idxPhotos = sumHeaders.findIndex(h => h.toString().toLowerCase().includes("photos"));
  const idxAuditor = sumHeaders.findIndex(h => h.toString().toLowerCase().includes("auditor"));
  const idxCritical = sumHeaders.findIndex(h => h.toString().toLowerCase().includes("critical"));

  const todayStr = new Date().toDateString();
  let totalScoreSum = 0;
  let farmMap = {};
  let trendMap = {};

  sumData.forEach(row => {
    const ts = new Date(row[idxTime]);
    const score = Number(row[idxScore] || 0);
    const farm = row[idxFarm] || "N/A";
    const critical = row[idxCritical] === true || row[idxCritical] === "TRUE";

    totalScoreSum += score;
    result.summary.totalAudits++;
    result.summary.totalPhotos += Number(row[idxPhotos] || 0);
    if (ts.toDateString() === todayStr) result.summary.auditsToday++;
    if (critical) result.summary.criticalFails++;

    if (!farmMap[farm]) farmMap[farm] = { sum: 0, count: 0 };
    farmMap[farm].sum += score;
    farmMap[farm].count++;

    const dLabel = ts.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    if (!trendMap[dLabel]) trendMap[dLabel] = { sum: 0, count: 0 };
    trendMap[dLabel].sum += score;
    trendMap[dLabel].count++;
  });

  result.summary.compliance = sumData.length > 0 ? Math.round(totalScoreSum / sumData.length) : 0;
  result.farmRanking = Object.keys(farmMap).map(f => ({ farm: f, score: Math.round(farmMap[f].sum / farmMap[f].count) })).sort((a,b) => b.score - a.score);
  result.trend = Object.keys(trendMap).map(d => ({ date: d, score: Math.round(trendMap[d].sum / trendMap[d].count) })).slice(-14);

  // TOP FAILS JOIN LOGIC
  if (resSheet && resSheet.getLastRow() > 1) {
    const checklist = getChecklist_("ALL", "ALL").data;
    const clMap = {};
    checklist.forEach(item => { clMap[item.id] = item; });

    const rData = resSheet.getDataRange().getValues();
    const rHeaders = rData.shift();
    const idxRTime = 0;
    const idxRId = 3;
    const idxRStatus = 4;

    const failStats = {};
    rData.forEach(r => {
      const status = (r[idxRStatus] || "").toString().toUpperCase();
      if (status === "FAIL" || status === "KHÔNG ĐẠT" || status === "HỎNG") {
        const id = r[idxRId];
        if (!failStats[id]) failStats[id] = { count: 0, lastTS: null };
        failStats[id].count++;
        const ts = new Date(r[idxRTime]);
        if (!failStats[id].lastTS || ts > failStats[id].lastTS) failStats[id].lastTS = ts;
      }
    });

    result.topFails = Object.keys(failStats).map(id => {
      const meta = clMap[id] || { title: id, module: "Khác", risk: "LOW", description: "" };
      return {
        item_id: id,
        module: meta.module,
        title: meta.title,
        description: meta.description,
        risk: meta.risk,
        fails: failStats[id].count,
        lastFail: failStats[id].lastTS ? Utilities.formatDate(failStats[id].lastTS, "GMT+7", "dd/MM/yyyy HH:mm") : "N/A"
      };
    }).sort((a,b) => b.fails - a.fails).slice(0, 8);
  }

  return result;
}

function getChecklist_(farm, role) {
  const sheet = SS.getSheetByName(SHEET_CHECKLIST);
  if (!sheet) return { ok: false, data: [] };
  const data = sheet.getDataRange().getValues();
  data.shift();
  const items = data.map(row => ({
    id: String(row[0]),
    module: row[1],
    title: row[2],
    description: row[3],
    risk: row[4],
    weight: Number(row[5] || 0)
  })).filter(i => i.id);
  return { ok: true, data: items };
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function saveAudit_(data) {
  const sumSheet = SS.getSheetByName(SHEET_SUMMARIES);
  const resSheet = SS.getSheetByName(SHEET_RESULTS);
  const timestamp = new Date();
  sumSheet.appendRow([timestamp, data.farm, data.auditor, data.finalScore, data.criticalFail, data.rows.reduce((acc, r) => acc + (r.photo_urls ? r.photo_urls.split('|').length : 0), 0)]);
  data.rows.forEach(r => { resSheet.appendRow([timestamp, data.farm, data.auditor, r.item_id, r.status, r.score, r.reason, r.photo_urls]); });
  return { ok: true };
}

function uploadPhotos_(data) {
  const folder = DriveApp.getFolderById("1VnTe7O7Ho3-ZC2RI7g5RpOtAzEmEag4x");
  const photo_ids = []; const urls = [];
  data.files.forEach(f => {
    const blob = Utilities.newBlob(Utilities.base64Decode(f.base64), f.type, f.name);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    photo_ids.push(file.getId()); urls.push(file.getUrl());
  });
  return { ok: true, photo_ids, urls };
}
