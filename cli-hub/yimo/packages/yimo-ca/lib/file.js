import glob from "glob";
import path from "path";

// 扫描TS文件
export const scanFileTs = function (scanPath) {
  const tsFiles = glob.sync(path.join(process.cwd(), `${scanPath}/**/*.ts`));
  const tsxFiles = glob.sync(path.join(process.cwd(), `${scanPath}/**/*.tsx`));
  return tsFiles.concat(tsxFiles);
};
