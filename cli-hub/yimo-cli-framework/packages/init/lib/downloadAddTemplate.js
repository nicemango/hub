import fse from "fs-extra";
import ora from "ora";
import execa from "execa";
import { log } from "@yimocli/common";
import path from "path";

const downloadAddTemplate = async (targetPath, selectedTemplate) => {
  try {
    const { npmName, version } = selectedTemplate;
    const cwd = targetPath;
    const installCommand = "npm";
    const installArgs = ["install", `${npmName}@${version}`];
    log.verbose("installArgs", installArgs);
    log.verbose("cwd", cwd);
    await execa(installCommand, installArgs, { cwd });
  } catch (error) {
    log.error("安装失败", error);
  }
};

const makeCacheDir = (targetPath) => {
  const cacheDir = path.resolve(targetPath, "node_modules");
  fse.ensureDirSync(cacheDir);
  //   if (!fse.existsSync(cacheDir)) {
  //     fse.mkdirpSync(cacheDir);
  //   }
};

export default async function downloadTemplate(selectedTemplate) {
  const { targetPath, template } = selectedTemplate;
  makeCacheDir(targetPath);
  const spinner = ora("正在下载模板...").start();
  try {
    await downloadAddTemplate(targetPath, template);
    spinner.stop();
    log.success("下载模板成功");
  } catch (error) {
    log.error("下载失败", error);
    spinner.stop();
  }
}
