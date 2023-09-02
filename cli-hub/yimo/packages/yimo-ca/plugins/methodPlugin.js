const methodPlugin = (analysisContext) => {
  const mapName = "methodMap";

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
      if (node.parent && tsCompiler.isCallExpression(node.parent)) {
        if (
          node.parent.expression.pos === node.pos &&
          node.parent.expression.end === node.end
        ) {
          if (!context[mapName][apiName]) {
            context[mapName][apiName] = {};
            context[mapName][apiName].callNum = 1;
            context[mapName][apiName].callOrigin = matchImportItem.origin;
            context[mapName][apiName].callFiles = {};
            context[mapName][apiName].callFiles[filePath] = {};
            context[mapName][apiName].callFiles[filePath].projectName =
              projectName;
            context[mapName][apiName].callFiles[filePath].httpRepo = httpRepo;
            context[mapName][apiName].callFiles[filePath].lines = [];
            context[mapName][apiName].callFiles[filePath].lines.push(line);
          } else {
            context[mapName][apiName].callNum++;
            if (
              !Object.keys(context[mapName][apiName].callFiles).includes(
                filePath
              )
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
          return true;
        } else {
          return false;
        }
      }
      return false;
    } catch (error) {
      const info = {
        projectName: projectName,
        matchImportItem: matchImportItem,
        apiName: apiName,
        httpRepo: httpRepo + filePath.split("&")[1] + "#L" + line,
        file: filePath.split("&")[1],
        line: line,
        stack: e.stack,
      };
      context.addDiagnosisInfo(info);
      return false;
    }
  };

  // console.log("zzh context[mapName]", context[mapName]);
  // 返回分析Node节点的函数
  return {
    mapName: mapName,
    checkFun,
    afterHook: null,
  };
};

export default methodPlugin;
