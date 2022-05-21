const { GoogleSpreadsheet } = require('google-spreadsheet');
import * as fs from 'fs';
import type {
  GoogleSpreadsheetWorksheet as GoogleSpreadsheetWorksheetType,
  GoogleSpreadsheet as GoogleSpreadsheetType,
  GoogleSpreadsheetRow
} from 'google-spreadsheet';
import merge from "ts-deepmerge";
require('dotenv').config();

type KeyCollection = {
  [title: string]: {
    [key: string]: string[]
  };
};

type Frames = {
  [title: string]: {
    [move: string] : {
      [detail: string]: string
    }
  }
}

type IdAndName = {
  id?: string
  name?: string
}

type Fighter =  IdAndName | Frames;

type Dictionary = {
  [id: string] : Fighter
};

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

// ファイター一覧作成
const generateFightersAsJson = async(sheetsId: string): Promise<string> => {
  const sheet: GoogleSpreadsheetWorksheetType = await doc.sheetsById[sheetsId];
  const rows: GoogleSpreadsheetRow[] = await sheet.getRows();
  const fighters: {[key: string]: string} = rows.reduce((previousValue: {[key: string]: string}, row: GoogleSpreadsheetRow): {[key: string]: string} => {
    return {...previousValue, ...{[row.id]: row.name}};
  }, {})
  return JSON.stringify({fighters});
}

// ファイターの翻訳ファイル作成
const generateFightersi18AsJson = async(sheetsId: string, options: string): Promise<{[key: string]: string}> => {
  const sheet: GoogleSpreadsheetWorksheetType = await doc.sheetsById[sheetsId];
  const rows: GoogleSpreadsheetRow[] = await sheet.getRows();
  const i18: {[key: string]: string} = rows.reduce((previousValue: {[key: string]: string}, row: GoogleSpreadsheetRow): {[key: string]: string} => {
    return {...previousValue, ...{[row['name']]: row[options]}};
  }, {});
  return i18;
}

// jsonファイルを出力する
const outputJSONFile = (path: string | undefined, jsonData: string): void => {
  fs.writeFile(`${path}/import.json`, jsonData, function (err: any) {
    if (err) throw err;
    console.log('success');
  });
}

const createDictionary = (rows: GoogleSpreadsheetRow[], keyCollection: KeyCollection): Dictionary => {
  const title: string = Object.keys(keyCollection)[0];
  const keys: string[] = Object.keys(keyCollection[title]);
  return rows.reduce((previousValue: Dictionary, row: GoogleSpreadsheetRow): Dictionary => {
    const fighter: Fighter = {
      ...keys.reduce((previousValue: IdAndName, key: string): IdAndName => {
        return (key === 'name' || key === 'id') ? {...previousValue, ...{ [key]: row[key]}}: previousValue
      }, {}),
      [title]: {
        ...keys.reduce((pr: {[move: string] : {[detail: string]: string}}, key: string): {[move: string] : {[detail: string]: string}} => {
          if (key === 'name' || key === 'id') return pr;
          const move: {[move: string] : {[detail: string]: string}} = {
            [key]: {
              ...keyCollection[title][key].reduce((pr: {[detail: string]: string}, detail: string): {[detail: string]: string} => {
                return { ...pr, [detail.includes("−") ? detail.substring(detail.indexOf("−") + 1) : detail]: row[detail] };
              }, {}),
            }
          }
          return {...pr, ...move};
        }, {}),
      }
    }
    return {...previousValue, ...{[row.id]: fighter}}
  }, {});
}

const generateFrameData: Promise<Dictionary> = (async (): Promise<Dictionary> => {
  await doc.useServiceAccountAuth(require('./credentials.json'));
  await doc.loadInfo();
  // TODO:スプレッドシートのIdも環境変数化する
  const sheetIds: string[] = ['434496018', '0', '458223600'];
  let dictionary: Dictionary = {};
  // arrayメソッド内で非同期処理を呼び出せないためfor文で記載
  for (const sheetId of sheetIds) {
    const frameSheet: GoogleSpreadsheetWorksheetType = await doc.sheetsById[sheetId];
    const frameRows: GoogleSpreadsheetRow[] = await frameSheet.getRows();
    const keyCollection: KeyCollection = createKeyCollection(frameSheet.headerValues, frameSheet.title);
    dictionary = merge(dictionary, createDictionary(frameRows, keyCollection));
  }
  return dictionary;
})().catch(e => {
  console.log(e);
  return {};
});

// 必殺技のjsonファイル作成用
// 必殺技は仕様の複雑さにより横必殺、上必殺、下必殺ごとにシートを作成している
const generateSpecialFrameData: Promise<Dictionary> = (async (): Promise<Dictionary> => {
  await doc.useServiceAccountAuth(require('./credentials.json'));
  await doc.loadInfo();
  // TODO:スプレッドシートのIdも環境変数化する
  const sheetIds: string[] = ['357601440', '389944443', '1193956322'];
  let dictionary: Dictionary = {};
  // arrayメソッド内で非同期処理を呼び出せないためfor文で記載
  for (const sheetId of sheetIds) {
    const frameSheet: GoogleSpreadsheetWorksheetType = await doc.sheetsById[sheetId];
    const frameRows: GoogleSpreadsheetRow[] = await frameSheet.getRows();
    const keyCollection: KeyCollection = createKeyCollection(frameSheet.headerValues, 'Special');
    dictionary = merge(dictionary, createDictionary(frameRows, keyCollection));
  }
  return dictionary;
})().catch(e => {
  console.log(e);
  return {};
});

(async (): Promise<void> => {
  const others: Dictionary = await generateFrameData;
  const specials: Dictionary = await generateSpecialFrameData;
  outputJSONFile(process.env.JSON_FILE_PAHT, JSON.stringify(merge(others, specials)));
})().catch(e => {
  console.log(e);
});
