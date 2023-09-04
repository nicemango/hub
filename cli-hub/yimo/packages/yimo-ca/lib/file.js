import glob from "glob";
import path from "path";
import Constant from "./constant.js";

export const scanFile = (itemScanPath, type) => {
  let files = [];
  if (type === Constant.CODE_FILE_TYPE.TS) {
    files = scanFileTs(itemScanPath);
  } else if (type === Constant.CODE_FILE_TYPE.JS) {
    files = scanFileJS(itemScanPath);
  }
  return files;
};
// 扫描TS文件
export const scanFileTs = function (scanPath) {
  const jsFiles = glob.sync(path.join(process.cwd(), `${scanPath}/**/*.js`));
  const tsFiles = glob.sync(path.join(process.cwd(), `${scanPath}/**/*.ts`));
  const tsxFiles = glob.sync(path.join(process.cwd(), `${scanPath}/**/*.tsx`));
  return tsFiles.concat(tsxFiles).concat(jsFiles);
};

// 扫描JS文件
export const scanFileJS = function (scanPath) {
  const jsFiles = glob.sync(path.join(process.cwd(), `${scanPath}/**/*.js`));
  return jsFiles;
};
