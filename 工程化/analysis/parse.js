const tsCompiler = require("typescript");

// 解析ts文件代码，获取ast、checker
exports.parseTs = function (fileName) {
  // 将ts代码转化成AST
  const program = tsCompiler.createProgram([fileName], {});
  const ast = program.getSourceFile(fileName);
  // Checker控制器，用来类型检查、语义检查
  const checker = program.getTypeChecker();
  return { ast, checker };
};
