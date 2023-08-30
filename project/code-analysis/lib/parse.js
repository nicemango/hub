const path = require("path");
const tsCompiler = require("typescript");

exports.parseTs = function (fileName) {
  // 将ts代码转换为ast
  const program = tsCompiler.createProgram([fileName], {});
  const ast = program.getSourceFile(fileName);
  const checker = program.getTypeChecker();
  return { ast, checker };
};
