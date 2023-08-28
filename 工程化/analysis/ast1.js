const tsCompiler = require("typescript");

const tsCode = `import { app } from "framework";

const dataLen = 3;
let name = "iceman";

if (app) {
  console.log(name);
}

function getInfos(info: string) {
  const result = app.get(info);
  return result;
}`;

// 通过程序的方式从代码片段中找出app这个API被导入后是否有调用，以及调用次数，代码行分布？

//1、将待分析的代码解析为AST
const ast = tsCompiler.createSourceFile(
  "xxx",
  tsCode,
  tsCompiler.ScriptTarget.Latest,
  true
);

// console.log(ast);

// 2、观察代码的AST结构及特征  AST explorer

// 3、遍历分析AST各级节点
const apiMap = {};
function walk(node) {
  // forEachChild 实现对AST各层级节点的深度遍历
  tsCompiler.forEachChild(node, walk);
  // 获取节点所在行
  const line = ast.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  //   判断isIdentifier节点名称是否为app
  if (
    tsCompiler.isIdentifier(node) &&
    node.escapedText === "app" &&
    line != 1
  ) {
    if (Object.keys(apiMap).includes(node.escapedText)) {
      apiMap[node.escapedText].callNum++;
      apiMap[node.escapedText].callLines.push(line);
    } else {
      apiMap[node.escapedText] = {};
      apiMap[node.escapedText].callNum = 1;
      apiMap[node.escapedText].callLines = [];
      apiMap[node.escapedText].callLines.push(line);
    }
  }
  //   console.log(node);
}

walk(ast);

console.log(apiMap);

// 针对代码分析工具的架构设计与分析范式
