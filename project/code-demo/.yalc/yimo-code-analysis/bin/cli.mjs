#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import path from "path";
import fs from "fs";

program
  .command("analysis")
  .description("代码分析")
  .action((a, b) => {
    const configPath = path.join(process.cwd(), "./analysis.config.js");
    const isConfig = fs.existsSync(configPath);
    if (isConfig) {
      let config = fs.readFileSync(configPath, "utf8");
      console.log("有配置文件", config.scanSource);
    } else {
      console.log(chalk.red("error:缺少analysis.config.js配置文件"));
    }
  });

program.parse(process.argv);
