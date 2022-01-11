const { GoogleSpreadsheet } = require('google-spreadsheet');
import type {
  GoogleSpreadsheetWorksheet as GoogleSpreadsheetWorksheetType,
  GoogleSpreadsheet as GoogleSpreadsheetType,
  GoogleSpreadsheetRow
} from 'google-spreadsheet';
require('dotenv').config();

const doc: GoogleSpreadsheetType = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

// スプレッドシートのヘッダーからkeyを作成する
const extractKeys = (headers: string[]): string[] => {
  const keys: string[] = [];
  headers.forEach((header) => {
    const key: string = header.indexOf("−") === -1 ? header : header.substring(0, header.indexOf("−"));
    if (keys.includes(key)) {
      return;
    } else {
      keys.push(key);
    }
  })
  return keys;
}

(async (): Promise<void> => {
  await doc.useServiceAccountAuth(require('./credentials.json'));

  await doc.loadInfo();
  const frameSheet: GoogleSpreadsheetWorksheetType = await doc.sheetsById["0"];
  const frameRows: GoogleSpreadsheetRow[] = await frameSheet.getRows();
  const temp = frameRows.map((row: {[s: string]: string}) => {
    return row['ファイター'];
  })
  /* console.log(frameSheet.title);
  console.log(frameRows);
  console.log(extractKeys(frameSheet.headerValues));
  console.log(temp) */
})().catch(e => {
  console.log(e);
});

// シートを受け取ってオブジェクトを返す
/* const hoge = (sheet: GoogleSpreadsheetWorksheetType): Promise<string> => {
  const rows: Promise<any> = await sheet.getRows();
  const keys: string[] = extractKeys(sheet.headerValues);
  keys.forEach((key: string) => {
    if ((key === 'No') || (key === 'キャラクター')) {
      return;
    }
  })
  rows.forEach((row) => {
    console.log(row);
  })
  return new Promise(resolve => resolve('foo'));
} */
