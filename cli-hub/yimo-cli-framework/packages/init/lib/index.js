import { BaseCommand } from "@yimocli/common";
import { log } from "@yimocli/common";
import createTemplate from "./createTemplate.js";
import downloadTemplate from "./downloadAddTemplate.js";
import installTemplate from "./installTemplate.js";

class InitCommand extends BaseCommand {
  get command() {
    return "init [name]";
  }

  get description() {
    return "init project";
  }

  get options() {
    return [
      ["-f,--force", "是否强制更新", false],
      ["-t, --type <type>", "项目类型(值：project/page)"],
      ["-tp, --template <template>", "模板名称"],
    ];
  }

  async action([name, opts]) {
    log.verbose("init", name, opts);
    // 选择项目模板，生成项目信息
    const selectedTemplate = await createTemplate(name, opts);
    // log.verbose("获取创建的项目信息", selectedTemplate);

    // 下载项目模板至缓存目录
    await downloadTemplate(selectedTemplate);

    // 安装项目模板至项目目录
    await installTemplate(selectedTemplate);
  }
}

const Init = (instance) => {
  return new InitCommand(instance);
};

export default Init;
