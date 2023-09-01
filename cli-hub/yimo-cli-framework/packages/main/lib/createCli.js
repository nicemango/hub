import { dirname } from "dirname-filename-esm";
import fse from "fs-extra";
import path from "path";
import { program } from "commander";
import semver from "semver";
import chalk from "chalk";

import { log } from "@yimocli/common";

const __dirname = dirname(import.meta);
const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = fse.readJSONSync(pkgPath);

const checkNodeVersion = () => {
  log.verbose("node version", process.version);
  const LOWEST_NODE_VERSION = "14.0.0";
  if (!semver.gte(process.version, LOWEST_NODE_VERSION)) {
    throw new Error(
      chalk.red(`yimocli 需要安装 ${LOWEST_NODE_VERSION} 以上版本的Node.js`)
    );
  }
};
const preAction = () => {
  // 检查Node版本
  checkNodeVersion();
};

const createCli = () => {
  log.info("version", pkg.version);
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d,--debug", "是否开启调试模式", false)
    .hook("preAction", preAction);

  //事件处理：当用户命令行传递了--debug 选项
  program.on("option:debug", function () {
    log.verbose("开启调试模式");
  });

  //事件处理：当用户输入了未知命令
  program.on("command:*", function (obj) {
    log.error("未知的命令：" + obj[0]);
  });
  return program;
};

export default createCli;
