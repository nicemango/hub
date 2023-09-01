import path from "path";
import tsCompiler from "typescript";

export const parseTs =  (fileName)=> {
  // 将ts代码转换为ast
  const program = tsCompiler.createProgram([fileName], {});
  const ast = program.getSourceFile(fileName);
  const checker = program.getTypeChecker();
  return { ast, checker };
};
