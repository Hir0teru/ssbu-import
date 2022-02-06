const { GoogleSpreadsheet } = require('google-spreadsheet');
import * as fs from 'fs';
import type {
  GoogleSpreadsheetWorksheet as GoogleSpreadsheetWorksheetType,
  GoogleSpreadsheet as GoogleSpreadsheetType,
  GoogleSpreadsheetRow
} from 'google-spreadsheet';
require('dotenv').config();

type KeyCollection = {
  [title: string]: {
    [key: string]: string[]
  };
};

type Frames = {
  [title: string]: {
    [move: string] : {
      [data: string]: string
    }
  }
}

type IdAndName = {
  id?: string
  name?: string
}

type Fighter =  IdAndName & Frames;

const doc: GoogleSpreadsheetType = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

// スプレッドシートのヘッダーからkeyを作成する
const createKeyCollection = (headers: string[], title: string): KeyCollection => {
  const keys: string[] = [];
  const keyCollection : KeyCollection = {[title]: {}};
  headers.forEach((header) => {
    const key: string = header.includes("−") ? header.substring(0, header.indexOf("−")) : header;
    if (!keys.includes(key)) keys.push(key);
    keyCollection[title][key] === undefined ? keyCollection[title][key] = [header] : keyCollection[title][key] = [...keyCollection[title][key], header]
  })
  return keyCollection;
}

// jsonファイルを出力する
const outputJSONFile = (path: string | undefined, jsonData: string): void => {
  fs.writeFile(`${path}/import.json`, jsonData, function (err: any) {
    if (err) throw err;
    console.log('success');
  });
}

(async (): Promise<void> => {
  await doc.useServiceAccountAuth(require('./credentials.json'));
  await doc.loadInfo();
  const test: string[] = ["0", "762307127"];
  let dictionary: {[id: string] : Fighter} = {};
  for (const t of test) {
    const frameSheet: GoogleSpreadsheetWorksheetType = await doc.sheetsById[t];
    const frameRows: GoogleSpreadsheetRow[] = await frameSheet.getRows();
    const keyCollection = createKeyCollection(frameSheet.headerValues, frameSheet.title);
    const title: string = Object.keys(keyCollection)[0];
    const keys: string[] = Object.keys(keyCollection[title]);
    let fighters: Fighter[] = [];
    frameRows.forEach((row: {[key: string]: string}) => {
      const fighter: Fighter = {[title]: {}};
      keys.forEach((key: string) => {
        keyCollection[title][key].forEach((header) => {
          if ((key === 'id') || (key === 'name')){
            fighter[key] = row[header]
          } else {
            // 横スマッシュ-発生→発生のように文字列を編集してからkeyとする
            fighter[title][key]= {...fighter[title][key], [header.includes("−") ? header.substring(header.indexOf("−") + 1) : header]: row[header] };
          }
        })
      })
    })
    let dict: {[id: string] : Fighter} = {};
    fighters.forEach((fighter: Fighter) => {
      const d : {[id: string] : Fighter} = {};
      if (fighter.id !== undefined) {
        d[fighter.id] = fighter;
      }
      dict = {...dict, ...d};
    })
    const key: string[] = Object.keys(dict);
    key.forEach((k) => {
      dictionary[k] = {...dictionary[k], ...dict[k]}
    })
  }
  outputJSONFile(process.env.JSON_FILE_PAHT, JSON.stringify(dictionary));
})().catch(e => {
  console.log(e);
});

/* const makeDictionary = ((prop: string, entries: Fighter[]) => {
  const dictionary: {[key: string]: Fighter} = {};
  entries.forEach((entry: Fighter) => {
    //const temp: string = entry[prop]
    //dictionary[temp] = entry;
  })
}); */

