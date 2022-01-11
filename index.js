"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { GoogleSpreadsheet } = require('google-spreadsheet');
require('dotenv').config();
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
// スプレッドシートのヘッダーからkeyを作成する
const extractKeys = (headers) => {
    const keys = [];
    headers.forEach((header) => {
        const key = header.indexOf("−") === -1 ? header : header.substring(0, header.indexOf("−"));
        if (keys.includes(key)) {
            return;
        }
        else {
            keys.push(key);
        }
    });
    return keys;
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield doc.useServiceAccountAuth(require('./credentials.json'));
    yield doc.loadInfo();
    const frameSheet = yield doc.sheetsById["0"];
    console.log(frameSheet.title);
    const frameRows = yield frameSheet.getRows();
    console.log(frameRows);
    console.log(extractKeys(frameSheet.headerValues));
    const temp = frameRows.map((row) => {
        return row['ファイター'];
    });
    console.log(temp);
}))().catch(e => {
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
