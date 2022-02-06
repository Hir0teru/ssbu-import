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
Object.defineProperty(exports, "__esModule", { value: true });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = __importStar(require("fs"));
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
// jsonファイルを出力する
const outputJSONFile = (path, jsonData) => {
    fs.writeFile(`${path}/import.json`, jsonData, function (err) {
        if (err)
            throw err;
        console.log('success');
    });
};
const makeDictionary = ((prop, entries) => {
    const dictionary = {};
    entries.forEach((entry) => {
        //const temp: string = entry[prop]
        //dictionary[temp] = entry;
    });
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield doc.useServiceAccountAuth(require('./credentials.json'));
    yield doc.loadInfo();
    const test = ["0", "762307127"];
    let dictionary = {};
    for (const t of test) {
        const frameSheet = yield doc.sheetsById[t];
        const frameRows = yield frameSheet.getRows();
        const keyCollection = createKeyCollection(frameSheet.headerValues, frameSheet.title);
        const title = Object.keys(keyCollection)[0];
        const keys = Object.keys(keyCollection[title]);
        let fighters = [];
        frameRows.forEach((row) => {
            const fighter = { [title]: {} };
            keys.forEach((key) => {
                keyCollection[title][key].forEach((header) => {
                    if ((key === 'id') || (key === 'name')) {
                        fighter[key] = row[header];
                    }
                    else {
                        // 横スマッシュ-発生→発生のように文字列を編集してからkeyとする
                        fighter[title][key] = Object.assign(Object.assign({}, fighter[title][key]), { [header.includes("−") ? header.substring(header.indexOf("−") + 1) : header]: row[header] });
                    }
                });
            });
        });
        let dict = {};
        fighters.forEach((fighter) => {
            const d = {};
            if (fighter.id !== undefined) {
                d[fighter.id] = fighter;
            }
            dict = Object.assign(Object.assign({}, dict), d);
        });
        const key = Object.keys(dict);
        key.forEach((k) => {
            dictionary[k] = Object.assign(Object.assign({}, dictionary[k]), dict[k]);
        });
    }
    outputJSONFile(process.env.JSON_FILE_PAHT, JSON.stringify(dictionary));
}))().catch(e => {
    console.log(e);
});
