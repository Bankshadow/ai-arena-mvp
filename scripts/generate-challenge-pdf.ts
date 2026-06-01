/**
 * Writes a minimal placeholder PDF for local dev / CI until the real 20-page report is added.
 * Replace public/challenges/executive-summary-battle.pdf with the production file when ready.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "challenges");
const OUT_FILE = path.join(OUT_DIR, "executive-summary-battle.pdf");

/** Minimal valid PDF 1.4 with one line of text (Helvetica). */
function buildPlaceholderPdf(): Buffer {
  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  add("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  add("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  add(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
  );

  const stream =
    "BT /F1 14 Tf 72 720 Td (AI ARENA - Placeholder challenge input) Tj " +
    "0 -24 Td (Replace with the real 20-page board report PDF.) Tj ET";
  add(`4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
  add("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj;
  }

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(pdf, "utf8");
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, buildPlaceholderPdf());
  console.log(`Wrote placeholder PDF: ${path.relative(process.cwd(), OUT_FILE)}`);
  console.log("Swap this file with the real challenge input before production launch.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
