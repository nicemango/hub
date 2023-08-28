/**
 * File模块
 * 代码文件的方法
 */

const glob = require("glob");

// 扫描TS文件
exports.scanFileTs = function (scanPath) {
  const tsFiles = glob.sync(path.join(process.cwd(), `${scanPath}/**/*.ts`));
  const tsxFiles = glob.sync(path.join(process.cwd(), `${scanPath}/**/*.tsx`));
  return tsFiles.concat(tsxFiles);
};
