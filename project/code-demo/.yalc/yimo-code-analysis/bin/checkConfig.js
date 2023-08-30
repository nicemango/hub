/**
 * 配置文件校验
 */
const CheckConfig = async (config) => {
  const configPath = path.join(process.cwd(), "./analysis.config.js");
  const isConfig = fs.existsSync(configPath);
  let errReport = {
    msg: "",
  };
  if (isConfig) {
    const configModule = await import(configPath);
    const config = configModule.default;
    if (
      config.scanSource &&
      Array.isArray(config.scanSource) &&
      config.scanSource.length > 0
    ) {
      config.scanSource.forEach((element) => {
        // 名称校验
        if (!element.name) {
          errReport.msg = "name参数必填";
        }
        // path代码扫描路径校验
        const path = element.path;
        if (!path || !Array.isArray(path) || path.length == 0) {
          errReport.msg = "path路径配置错误";
        }
        path.forEach((item) => {
          const tempPath = path.join(process.cwd(), item);
          if (!fs.existsSync(tempPath)) {
            errReport.msg = `配置的代码扫描文件目录不存在:${tempPath}`;
          }
        });
      });
    } else {
      errReport.msg = "配置文件中必填配置项scanSource不能为空";
    }
    // 校验分析的目标依赖名
    if (!config.analysisTarget) {
      errReport.msg = "未配置待分析的目标依赖名";
    }
  } else {
    errReport.msg = "缺少analysis.config.js配置文件";
  }
  if (errReport.msg) {
    console.log(chalk.red(`error: ${errReport.msg}`));
  } else {
    console.log(chalk.yellow("配置文件检测通过✅"));
    return true;
  }
};

export default CheckConfig;
