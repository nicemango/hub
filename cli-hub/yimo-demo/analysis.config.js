const AnalysisConfig = {
  // 扫描源配置信息[必填]
  scanSource: [
    {
      name: "main-project", //必填，项目名称
      path: ["src"], //必填，需要扫描的文件路径（基准路径为配置文件所在路径）
      packageFile: "package.json",
      format: null,
      httpRep: null,
    },
  ],
  // 要分析的目标依赖名 [必填]
  analysisTarget: "framework",
  // 配置代码分析插件，可按需配置、动态加载
  analysisPlugins: [],
  // 配置需要标记的黑名单API
  blackList: ["app.localStorage.set"],
  // 配置需要分析的Browser Api
  browserApis: ["window", "document", "history", "location"],
  // 生成代码分析报告的目录
  reportDir: "report",
  // 是否扫描Vue代码中的TS代码
  isScanVue: true,
  // 代码评分插件
  scorePlugin: "default",
  // 配置是否开启代码告警及告警阈值【0~100】，默认null关闭告警逻辑
  alarmThreshold: 90,
};
export default AnalysisConfig;
