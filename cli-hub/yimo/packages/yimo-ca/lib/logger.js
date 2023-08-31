import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.extname(__filename);
const rootDir = path.resolve(__dirname, ".."); // 获取项目根目录的路径

const LOG_PATH = path.join(rootDir, "./log/local.json");
console.log("LOG_PATH", LOG_PATH);
const Logger = {
  local: (content) => {
    fs.writeFileSync(LOG_PATH, content);
  },
};

export default Logger;
