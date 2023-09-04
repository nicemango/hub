import { Inquirer, NpmInfo, log } from "@yimocli/common";
import path from "path";
import { homedir } from "os";

const TEMP_HOME = ".yimocli";

const ADD_TEMPLATE = [
  {
    name: "react",
    value: "1",
    npmName: "@yimocli/template-react18",
    version: "1.0.0",
  },
  {
    name: "vue",
    value: "2",
    npmName: "@yimocli/template-vue3",
    version: "1.0.0",
  },
  {
    name: "vue-admin",
    value: "3",
    npmName: "@yimocli/template-vue-element-admin",
    version: "1.0.0",
  },
];

const ADD_TYPE_PROJECT = "project";
const ADD_TYPE_PAGE = "page";
const ADD_TYPE = [
  {
    name: "项目",
    value: ADD_TYPE_PROJECT,
  },
  {
    name: "页面",
    value: ADD_TYPE_PAGE,
  },
];

// 获取创建类型
const getAddType = () => {
  return Inquirer.makeList({
    choices: ADD_TYPE,
    message: "请选择初始化类型",
    defaultValue: ADD_TYPE_PROJECT,
  });
};

// 获取项目名称
const getAddName = () => {
  return Inquirer.makeInput({
    message: "请输入项目名称",
    defaultValue: "",
    validate: (v) => {
      if (v.length > 0) return true;
      return "项目名称必须输入";
    },
  });
};

// 获取项目模板
const getAddTemplate = (addTemplate) => {
  return Inquirer.makeList({
    choices: addTemplate,
    message: "请选择项目模板",
  });
};
export default async function createTemplate(name, opts) {
  log.verbose("开始创建模板", name, opts);
  const addTemplate = ADD_TEMPLATE;
  if (!addTemplate) {
    log.error("项目文件不存在");
  }
  const { type = null, template = null } = opts;

  let addType; //创建项目类型
  let addName; //创建项目名称
  let selectedTemplate; //项目模板
  //   addType = await getAddType();
  //   log.verbose("创建项目类型", addType);

  addName = await getAddName();

  const addTemplateValue = await getAddTemplate(addTemplate);
  selectedTemplate = ADD_TEMPLATE.find((_) => _.value === addTemplateValue);

  // 获取最新的模板版本号
  const latestVersion = await NpmInfo.getLatestVersion(
    selectedTemplate.npmName
  );
  selectedTemplate.version = latestVersion;

  const targetPath = path.resolve(`${homedir()}/${TEMP_HOME}`, "addTemplate");
  console.log("targetPath", targetPath);

  const templateInfo = {
    name: addName,
    template: selectedTemplate,
    targetPath,
  };

  return templateInfo;
}
