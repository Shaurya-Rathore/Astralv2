import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { readFileSync } from "fs";

const filePath = process.argv[2];
if (!filePath) {
  process.stderr.write("Usage: node extract-pdf-text.mjs <path>\n");
  process.exit(1);
}

const buf = readFileSync(filePath);
const uint8 = new Uint8Array(buf);
const doc = await getDocument({ data: uint8, useSystemFonts: true }).promise;
const pages = [];
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  pages.push(content.items.map((item) => item.str).join(" "));
}
process.stdout.write(pages.join("\n"));
