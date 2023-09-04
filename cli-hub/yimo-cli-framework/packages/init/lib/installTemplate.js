import { log } from "@yimocli/common";
import fse from "fs-extra";
import ora from "ora";
import path from "path";

const getCacheFilePath = (targetPath, template) => {
  return path.resolve(targetPath, "node_modules", template.npmName, "template");
};

const copyFile = (targetPath, template, installDir) => {
  const originFile = getCacheFilePath(targetPath, template);
  const fileList = fse.readdirSync(originFile);
  const spinner = ora("正在拷贝模板文件...").start();
  fileList.map((file) => {
    fse.copySync(`${originFile}/${file}`, `${installDir}/${file}`);
  });
  spinner.stop();
  log.success("模板拷贝成功");
};

export default async function installTemplate(selectedTemplate) {
  const { targetPath, name, template } = selectedTemplate;

  //   fse.ensureDirSync(targetPath);

  const rootDir = process.cwd();
  const installDir = path.resolve(`${rootDir}/${name}`);
  if (fse.existsSync(installDir)) {
    fse.removeSync(installDir);
    fse.ensureDirSync(installDir);
  }
  copyFile(targetPath, template, installDir);
}
