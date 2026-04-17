const DOUBLE_QUOTE = /"/g;

function escapeCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized = typeof value === "string" ? value : String(value);
  if (normalized.includes(",") || normalized.includes('"') || normalized.includes("\n")) {
    return `"${normalized.replace(DOUBLE_QUOTE, '""')}"`;
  }
  return normalized;
}

export function toCsv(headers: string[], rows: Array<Array<string | number | boolean | null | undefined>>): string {
  const headerRow = headers.map(escapeCell).join(",");
  const body = rows
    .map((row) => row.map((cell) => escapeCell(cell)).join(","))
    .join("\r\n");
  return [headerRow, body].filter((section) => section.length > 0).join("\r\n");
}
