import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';
import catalogue from '../lib/catalogue.json' with { type: 'json' };

const outputDir = new URL('../outputs/missing-code2/', import.meta.url);
const outputPath = new URL('duuny-kod-2-baihgui.xlsx', outputDir);

function codes(song, field) {
  return [...new Set([song[field], ...(song.alternateCodes?.[field] ?? [])].filter(Boolean))];
}

const missing = catalogue
  .filter(song => codes(song, 'code1').length === 0)
  .map((song, index) => [index + 1, song.title, song.artist, codes(song, 'code2').join(', '), 'Байхгүй']);

const workbook = Workbook.create();
const sheet = workbook.worksheets.add('Код 2 байхгүй');
sheet.showGridLines = false;
sheet.tabColor = '#7C3AED';

sheet.getRange('A2:E2').merge();
sheet.getRange('A2').values = [['Код 2 байхгүй дуунууд']];
sheet.getRange('A3:E3').merge();
sheet.getRange('A3').values = [[`Нийт ${missing.length.toLocaleString('mn-MN')} дуу · Каталогийн одоогийн мэдээллээр`]];
sheet.getRange('A5:E5').values = [['№', 'Дууны нэр', 'Дуучин', 'Код 1', 'Код 2']];
sheet.getRange(`A6:E${missing.length + 5}`).values = missing;

sheet.getRange('A2:E2').format = {
  font: { name: 'Arial', size: 16, bold: true, color: '#1F2937' },
  verticalAlignment: 'center'
};
sheet.getRange('A3:E3').format = {
  font: { name: 'Arial', size: 10, italic: true, color: '#64748B' },
  verticalAlignment: 'center'
};
sheet.getRange('A5:E5').format = {
  fill: '#312E81',
  font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
  borders: { preset: 'all', style: 'thin', color: '#C7D2FE' }
};
sheet.getRange(`A6:E${missing.length + 5}`).format = {
  font: { name: 'Arial', size: 10, color: '#1F2937' },
  verticalAlignment: 'center',
  borders: { preset: 'insideHorizontal', style: 'thin', color: '#E2E8F0' }
};
sheet.getRange(`A6:A${missing.length + 5}`).format.horizontalAlignment = 'center';
sheet.getRange(`D6:E${missing.length + 5}`).format.horizontalAlignment = 'center';
sheet.getRange(`E6:E${missing.length + 5}`).format.font = { name: 'Arial', size: 10, bold: true, color: '#B91C1C' };

sheet.getRange('A:A').format.columnWidth = 7;
sheet.getRange('B:B').format.columnWidth = 34;
sheet.getRange('C:C').format.columnWidth = 34;
sheet.getRange('D:D').format.columnWidth = 18;
sheet.getRange('E:E').format.columnWidth = 16;
sheet.getRange('A2:E2').format.rowHeight = 28;
sheet.getRange('A3:E3').format.rowHeight = 20;
sheet.getRange('A5:E5').format.rowHeight = 22;
sheet.freezePanes.freezeRows(5);
sheet.tables.add(`A5:E${missing.length + 5}`, true, 'MissingCode2Songs');

workbook.recalculate();
const inspect = await workbook.inspect({
  kind: 'table',
  range: 'Код 2 байхгүй!A2:E12',
  include: 'values,formulas',
  tableMaxRows: 12,
  tableMaxCols: 5
});
console.log(inspect.ndjson);
const preview = await workbook.render({ sheetName: 'Код 2 байхгүй', range: 'A2:E20', scale: 1.5, format: 'png' });
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(new URL('preview.png', outputDir), new Uint8Array(await preview.arrayBuffer()));
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`Saved ${outputPath.pathname}`);
