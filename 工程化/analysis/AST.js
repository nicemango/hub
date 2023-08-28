// TS编译器
const tsCompiler = require("typescript");

// 待分析的代码片段字符串
const tsCode = `import { app } from 'framework';                                

const dataLen = 3;
let name = 'iceman';

if(app){
    console.log(name);
}

function getInfos (info: string) {
    const result = app.get(info);
    return result;
}`;

// Parsing解析
// Traversiong 遍历
// Transforming 修改
// Printing 输出

// createSourceFile  根据TypeScript代码字符串生成AST对象
const ast = tsCompiler.createSourceFile(
  "xxx", // 命名，可以随意填
  tsCode, // 需要生成AST的源代码字符串
  tsCompiler.ScriptTarget.Latest, //TS编译器版本
  true //是否添加parent节点信息
);

// createProgram、getSourceFile
// 创建Program对象，用于分析整个工程的源代码
const program = tsCompiler.createProgram(fileNames, options);
// 从Program中获取某个文件的SourceFile对象
const astWithProgram = program.getSourceFile(fileName);
// 以上能获取编译上下文信息，能实现更细致的分析场景

console.log(ast);

// AST重点知识了解
// 1.了解AST及常见节点类型
// 2、代码的含义可以通过AST对象来表述，所以通过程序代码对其进行处理，就可以实现代码分析处理的目的
// 3、AST是开发各种代码处理工具的前提，
// 4、获取AST对象需要学习对应语言的编译器Parser，可以通过TS Parser的CompilerAPI来获取TS/JS的AST对象
