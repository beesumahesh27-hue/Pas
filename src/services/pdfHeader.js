// Shared report-header helpers — keeps every module's PDF and CSV export looking the same.

// PDF: title centered on the page, then user / email / generated lines left-aligned below.
// Returns the Y position where the caller should start the table body.
const LEFT_MARGIN = 14;

export const drawPdfHeader = (doc, moduleName, user) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const cx        = pageWidth / 2;

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(moduleName || '', cx, 14, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const lines = [
    `User: ${user?.name || '—'}`,
    `Email: ${user?.email || '—'}`,
    `Generated: ${new Date().toLocaleString()}`,
  ];
  let y = 22;
  lines.forEach((line) => {
    doc.text(line, LEFT_MARGIN, y);
    y += 5;
  });

  // Small breathing room before the table headers (was +3 → felt loose).
  return y - 2;
};

// CSV: preamble rows with the same fields, then a blank row before the table.
// Returns a string (with trailing newline) ready to prepend to the CSV body.
// Each value is double-quoted and inner quotes are escaped, so it stays safe for Excel/Sheets.
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

// Excel auto-converts ISO date strings ("2026-05-28") into date serials, which then
// display as ######## in a narrow column. This escaper detects those formats and
// emits =\"value\" so Excel keeps the cell as literal text. Other shapes go through
// the standard CSV escape.
const DATE_RE     = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?/;

export const escapeCsvCell = (v) => {
  if (v === null || v === undefined) return '""';
  const s = String(v);
  if (DATE_RE.test(s) || DATETIME_RE.test(s)) {
    return `="${s.replace(/"/g, '""')}"`;
  }
  return csvCell(s);
};

export const buildCsvHeader = (moduleName, user) => {
  // Each line is a single cell — Excel will not try to auto-convert a sentence
  // like "Generated: 28/5/2026, 3:31:00 PM" into a date serial (which is what
  // shows up as ######## when the column is narrow).
  const rows = [
    [moduleName || ''],
    [`User: ${user?.name || '—'}`],
    [`Email: ${user?.email || '—'}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
  ];
  return rows.map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
};
