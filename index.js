"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = __importStar(require("fs"));
const ts_deepmerge_1 = __importDefault(require("ts-deepmerge"));
require('dotenv').config();
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
// スプレッドシートのヘッダーからkeyを作成する
const createKeyCollection = (headers, title) => {
    const keys = [];
    const keyCollection = { [title]: {} };
    headers.forEach((header) => {
        const key = header.includes("−") ? header.substring(0, header.indexOf("−")) : header;
        if (!keys.includes(key))
            keys.push(key);
        keyCollection[title][key] === undefined ? keyCollection[title][key] = [header] : keyCollection[title][key] = [...keyCollection[title][key], header];
    });
    return keyCollection;
};
// ファイター一覧作成
const generateFightersAsJson = (sheetsId) => __awaiter(void 0, void 0, void 0, function* () {
    const sheet = yield doc.sheetsById[sheetsId];
    const rows = yield sheet.getRows();
    const fighters = rows.reduce((previousValue, row) => {
        return Object.assign(Object.assign({}, previousValue), { [row.id]: row.name });
    }, {});
    return JSON.stringify({ fighters });
});
// ファイターの翻訳ファイル作成
const generateFightersi18AsJson = (sheetsId, options) => __awaiter(void 0, void 0, void 0, function* () {
    const sheet = yield doc.sheetsById[sheetsId];
    const rows = yield sheet.getRows();
    const i18 = rows.reduce((previousValue, row) => {
        return Object.assign(Object.assign({}, previousValue), { [row['name']]: row[options] });
    }, {});
    return i18;
});
// jsonファイルを出力する
const outputJSONFile = (path, jsonData) => {
    fs.writeFile(`${path}/import.json`, jsonData, function (err) {
        if (err)
            throw err;
        console.log('success');
    });
};
/*
const ttt: Promise<void> = (async (): Promise<void> => {
  await doc.useServiceAccountAuth(require('./credentials.json'));
  await doc.loadInfo();
  const test: string[] = ["0", "458223600", "1735187996", "951521899", "1246264536", "434496018", "762307127"];
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
      return fighter;
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
  //const jsondata: string = await generateFightersAsJson('1848046085');
  //outputJSONFile(process.env.JSON_FILE_PAHT, jsondata);
  await generateFightersi18AsJson('1848046085', 'en')
  await generateFightersi18AsJson('1848046085', 'ja')
})().catch(e => {
  console.log(e);
}); */
const createDictionary = (rows, keyCollection) => {
    const title = Object.keys(keyCollection)[0];
    const keys = Object.keys(keyCollection[title]);
    return rows.reduce((previousValue, row) => {
        const fighter = Object.assign(Object.assign({}, keys.reduce((previousValue, key) => {
            return (key === 'name' || key === 'id') ? Object.assign(Object.assign({}, previousValue), { [key]: row[key] }) : previousValue;
        }, {})), { [title]: Object.assign({}, keys.reduce((pr, key) => {
                if (key === 'name' || key === 'id')
                    return pr;
                const move = {
                    [key]: Object.assign({}, keyCollection[title][key].reduce((pr, detail) => {
                        return Object.assign(Object.assign({}, pr), { [detail.includes("−") ? detail.substring(detail.indexOf("−") + 1) : detail]: row[detail] });
                    }, {}))
                };
                return Object.assign(Object.assign({}, pr), move);
            }, {})) });
        return Object.assign(Object.assign({}, previousValue), { [row.id]: fighter });
    }, {});
};
/* const makeDictionary = ((prop: string, entries: Fighter[]) => {
  const dictionary: {[key: string]: Fighter} = {};
  entries.forEach((entry: Fighter) => {
    //const temp: string = entry[prop]
    //dictionary[temp] = entry;
  })
}); */
const generateFrameData = (() => __awaiter(void 0, void 0, void 0, function* () {
    yield doc.useServiceAccountAuth(require('./credentials.json'));
    yield doc.loadInfo();
    // TODO:スプレッドシートのIdも環境変数化する
    const sheetIds = ['434496018', '0', '458223600'];
    let dictionary = {};
    // arrayメソッド内で非同期処理を呼び出せないためfor文で記載
    for (const sheetId of sheetIds) {
        const frameSheet = yield doc.sheetsById[sheetId];
        const frameRows = yield frameSheet.getRows();
        const keyCollection = createKeyCollection(frameSheet.headerValues, frameSheet.title);
        dictionary = (0, ts_deepmerge_1.default)(dictionary, createDictionary(frameRows, keyCollection));
    }
    return dictionary;
}))().catch(e => {
    console.log(e);
    return {};
});
// 必殺技のjsonファイル作成用
// 必殺技は仕様の複雑さにより横必殺、上必殺、下必殺ごとにシートを作成している
const generateSpecialFrameData = (() => __awaiter(void 0, void 0, void 0, function* () {
    yield doc.useServiceAccountAuth(require('./credentials.json'));
    yield doc.loadInfo();
    // TODO:スプレッドシートのIdも環境変数化する
    const sheetIds = ['357601440', '389944443', '1193956322'];
    let dictionary = {};
    // arrayメソッド内で非同期処理を呼び出せないためfor文で記載
    for (const sheetId of sheetIds) {
        const frameSheet = yield doc.sheetsById[sheetId];
        const frameRows = yield frameSheet.getRows();
        const keyCollection = createKeyCollection(frameSheet.headerValues, 'Special');
        dictionary = (0, ts_deepmerge_1.default)(dictionary, createDictionary(frameRows, keyCollection));
    }
    return dictionary;
}))().catch(e => {
    console.log(e);
    return {};
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    const others = yield generateFrameData;
    const specials = yield generateSpecialFrameData;
    outputJSONFile(process.env.JSON_FILE_PAHT, JSON.stringify((0, ts_deepmerge_1.default)(others, specials)));
    /* await doc.useServiceAccountAuth(require('./credentials.json'));
    await doc.loadInfo();
    const hoge: string = await generateFightersAsJson('1848046085')
    console.log(hoge)
    const test = await generateFightersi18AsJson('1848046085', 'ja')
    console.log(test) */
}))().catch(e => {
    console.log(e);
});
