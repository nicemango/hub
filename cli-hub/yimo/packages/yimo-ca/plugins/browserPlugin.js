const browserPlugin = (analysisContext) => {
  const mapName = "browserMap";
  analysisContext[mapName] = {};

  const checkFun = (params) => {
    const {
      context,
      tsCompiler,
      node,
      depth,
      apiName,
      matchImportItem,
      filePath,
      projectName,
      httpRepo,
      line,
    } = params;
    try {
      console.log("zzzzzz", context[mapName]);
      if (!context[mapName][apiName]) {
        context[mapName][apiName] = {};
        context[mapName][apiName].callNum = 1;
        context[mapName][apiName].callOrigin = null;
        context[mapName][apiName].callFiles = {};
        context[mapName][apiName].callFiles[filePath] = {};
        context[mapName][apiName].callFiles[filePath].projectName = projectName;
        context[mapName][apiName].callFiles[filePath].httpRepo = httpRepo;
        context[mapName][apiName].callFiles[filePath].lines = [];
        context[mapName][apiName].callFiles[filePath].lines.push(line);
      } else {
        context[mapName][apiName].callNum++;
        if (
          !Object.keys(context[mapName][apiName].callFiles).includes(filePath)
        ) {
          context[mapName][apiName].callFiles[filePath] = {};
          context[mapName][apiName].callFiles[filePath].projectName =
            projectName;
          context[mapName][apiName].callFiles[filePath].httpRepo = httpRepo;
          context[mapName][apiName].callFiles[filePath].lines = [];
          context[mapName][apiName].callFiles[filePath].lines.push(line);
        } else {
          context[mapName][apiName].callFiles[filePath].lines.push(line);
        }
      }

      return true; // true: 命中规则, 终止执行后序插件
    } catch (e) {
      console.log("报错了", e.message);
      const info = {
        projectName: projectName,
        apiName: apiName,
        httpRepo: httpRepo + filePath.split("&")[1] + "#L" + line,
        file: filePath.split("&")[1],
        line: line,
        stack: e.stack,
      };
      context.addDiagnosisInfo(info);
      return false; // false: 插件执行报错, 继续执行后序插件
    }
  };

  // console.log("zzh context[mapName]", context[mapName]);
  // 返回分析Node节点的函数
  return {
    mapName: mapName,
    checkFun,
    afterHook: (ctx) => {
      console.log("打印:", ctx[mapName]);
    },
  };
};

export default browserPlugin;
