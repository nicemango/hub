#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import Constant from "../lib/constant.js";
import CodeAnalysisEntry from "../lib/index.js";
import CheckConfig from "../lib/checkConfig.js";

program
  .command("analysis")
  .description("代码分析")
  .action(async (a, b) => {
    try {
      const checkConfigResult = await CheckConfig();
      // 配置文件校验
      if (checkConfigResult.isSuccess) {
        // 如果分析报告已经存在，则先删除目录
        // vue文件处理
        // 如果temp目录已经存在，则先删除目录
        // 如果需要扫描vue文件

        // 分析代码
        CodeAnalysisEntry(checkConfigResult.config);
      }
    } catch (error) {
      console.log(chalk.red("error" + error));
    }
  });

program.parse(process.argv);
