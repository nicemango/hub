import CodeAnalysis from "./analysis.js";

/**
 * 初始化codeAnalysis实例
 */
const CodeAnalysisEntry = (config) => {
  try {
    // 新建分析实例
    const codeAnalysis = new CodeAnalysis(config);
    // 执行代码分析
    codeAnalysis.analysis();

    // 生成报告内容
  } catch (error) {}
};

export default CodeAnalysisEntry;
