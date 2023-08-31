const AnalysisConfig = {
  // 必须，待扫描源码的配置信息
  scanSource: [
    {
      name: "yimo-demo", //必填，项目名称
      path: ["src"], //必填，需要扫描的文件路径（基准路径为配置文件所在路径）
      packageFile: "package.json",
      format: null,
      httpRep: null,
    },
  ],
  // 必填  要分析的目标依赖名
  analysisTarget: "framework",
  // 可选，生成代码分析报告的目录，默认report
  reportDir: "report",

};
export default AnalysisConfig;
