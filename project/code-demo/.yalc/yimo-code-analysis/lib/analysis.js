/**
 * 代码分析基础类
 * 1. 配置项及关键参数校验，分析环境预处理
 * 2. 初始化analysis class实例，安装相关分析插件
 * 3. 扫码指定目录，找到需要分析的代码文件
 * 4. 依次读取/拆分文件内容，parse生成AST对象
 * 5. 遍历AST，分析import节点，找到导入API，遍历AST，找到命中API调用规则的基础节点，依次执行分析插件，记录数据
 * （1）遍历其所有import节点，分析并记录从目标依赖中导入的API信息，排除非目标依赖性的干扰
 * （2）判定导入的API在具体代码中是否有调用，过程中还需要排除局部同名变量等一系列干扰
 * （3）根据分析指标如用途识别（类型、属性、方法）等对该API调用进行指标判定分析，命中则记录到指定Map中
 * 6. 遍历结束，依次执行插件队列中的后置Hook
 * 7. 所有文件分析结束后标记黑名单API，整理并返回分析结果
 */
const tsCompiler = require("typescript");
import tsCompiler from "typescript";

export default class CodeAnalysis {
  constructor(options) {
    // 私有属性

    // 公共属性
    this.importItemMap = {}; //importItem统计Mao
  }

  /**
   * 分析import引入
   * 分析是为了获取代码文件从目标依赖中导入的API信息，后续的分析依赖这些API信息
   * @param {*} ast
   * @param {*} filePath
   * @param {*} baseLine
   * @returns
   */
  _findImportItems(ast, filePath, baseLine = 0) {
    let importItems = {};
    let that = this;

    // 处理imports相关map
    function dealImports(temp) {
      importItems[temp.name] = temp;
      importItems[temp.name].origin = temp.origin;
      importItems[temp.name].symbolPos = temp.symbolPos;
      importItems[temp.name].symbolEnd = temp.symbolEnd;
      importItems[temp.name].identifierPos = temp.identifierPos;
      importItems[temp.name].identifierEnd = temp.identifierEnd;
      if (!that.importItemMap[temp.name]) {
        that.importItemMap[temp.name] = {};
        that.importItemMap[temp.name].callOrigin = temp.origin;
        that.importItemMap[temp.name].callFiles = [];
        that.importItemMap[temp.name].callFiles.push(filePath);
      } else {
        that.importItemMap[temp.name].callFiles.push(filePath);
      }
    }

    // 遍历AST寻找import节点
    function walk(node) {
      tsCompiler.forEachChild(node, walk);
      const line =
        ast.getLineAndCharacterOfPosition(node.getStart()).line + baseLine + 1;
      // 分析引入情况
      if (tsCompiler.isImportDeclaration(node)) {
        // 存在导入项
        if (node.importClause) {
          // default直接引入场景
          if (node.importClause.name) {
            let temp = {
              name: node.importClause.name.escapedText,
              origin: null,
              symbolPos: node.importClause.pos,
              symbolEnd: node.importClause.end,
              identifierPos: node.importClause.name.pos,
              identifierEnd: node.importClause.name.end,
              line: line,
            };
            dealImports(temp);
          }
          if (node.importClause.namedBindings) {
            // 拓展引入场景，包括as情况
            if (tsCompiler.isNamedImports(node.importClause.namedBindings)) {
              if (
                node.importClause.namedBindings.elements &&
                node.importClause.namedBindings.elements.length > 0
              ) {
                // console.log(node.importClause.namedBindings.elements);
                const tempArr = node.importClause.namedBindings.elements;
                tempArr.forEach((element) => {
                  if (tsCompiler.isImportSpecifier(element)) {
                    let temp = {
                      name: element.name.escapedText,
                      origin: element.propertyName
                        ? element.propertyName.escapedText
                        : null,
                      symbolPos: element.pos,
                      symbolEnd: element.end,
                      identifierPos: element.name.pos,
                      identifierEnd: element.name.end,
                      line: line,
                    };
                    dealImports(temp);
                  }
                });
              }
            }

            // *全量导入as场景
            if (
              tsCompiler.isNamespaceImport(node.importClause.namedBindings) &&
              node.importClause.namedBindings.name
            ) {
              let temp = {
                name: node.importClause.namedBindings.name.escapedText,
                origin: "*",
                symbolPos: node.importClause.namedBindings.pos,
                symbolEnd: node.importClause.namedBindings.end,
                identifierPos: node.importClause.namedBindings.name.pos,
                identifierEnd: node.importClause.namedBindings.name.end,
                line: line,
              };
              dealImports(temp);
            }
          }
        }
      }
    }
    walk(ast);
    return importItems;
  }

  /**
   * 链式调用检查，找出链路顶点node
   * @param {*} node
   * @param {*} index
   * @param {*} apiName
   */
  _checkPropertyAccess(node, index = 0, apiName = "") {
    if (index > 0) {
      apiName = apiName + "." + node.name.escapedText;
    } else {
      apiName = apiName + node.name.escapedText;
    }
    if (tsCompiler.isPropertyAccessExpression(node)) {
      index++;
      return this._checkPropertyAccess(node.expression, index, apiName);
    } else {
      return {
        baseNode: node,
        depth: index,
        apiName: apiName,
      };
    }
  }

  /**
   *
   * @param {*} ImportItems  Import节点分析的结果Map
   * @param {*} ast 代码文件解析后的ast
   * @param {*} checker 编译代码文件时创建的checker
   * @param {*} baseLine
   */
  _dealAST(ImportItems, ast, checker, baseLine = 0) {
    // 获取所有API信息名称
    const ImportItemsNames = Object.keys(ImportItems);

    // 遍历AST
    function walk(node) {
      tsCompiler.forEachChild(node, walk);

      // 判定当前遍历的节点是否为isIdentifier类型节点
      // 判断从Import导入的API中是否存在与当前遍历节点名称相同的API
      if (
        tsCompiler.isIdentifier(node) &&
        node.escapedText &&
        ImportItemsNames.length > 0 &&
        ImportItemsNames.includes(node.escapedText)
      ) {
        // 过滤掉不相干的Identifier节点后
        const matchImportItem = ImportItems[node.escapedText];
        if (
          node.pos != matchImportItem.identifierPos &&
          node.end != matchImportItem.identifierEnd
        ) {
          // 排除Import中同名节点干扰
          const symbol = checker.getSymbolAtLocation(node);
          if (symbol && symbol.declarations && symbol.declarations.length > 0) {
            // 存在声明
            const nodeSymbol = symbol.declarations[0];
            if (
              matchImportItem.symbolPos == nodeSymbol.pos &&
              matchImportItem.symbolEnd == nodeSymbol.end
            ) {
              // 语义上下文声明从Import导入的API一致，属于导入API声明
              if (node.parent) {
                // 获取基础分析节点信息
                const { baseNode, depth, apiName } =
                  that._checkPropertyAccess(node);
              } else {
                // Identifier节点没有父节点，说明AST节点语义异常，不存在分析意义
              }
            } else {
              // 同名Identifier节点，但语义上下文声明不一致，属于局部变量
            }
          }
        }
      }
    }
    walk(ast);
  }

  /**
   * 扫描文件
   * @param {*} scanSource
   * @param {*} type
   */
  _scanFiles(scanSource, type) {}

  /**
   * 扫描文件，分析代码
   * @param {*} scanSource
   * @param {*} type
   */
  _scanCode(scanSource, type) {
    // 扫描所有需要分析的代码文件
    const entrys = this._scanFiles();
  }

  // 入口函数
  analysis() {
    // 扫码分析TS
  }

  log() {
    console.log(this.importItemMap);
  }
}
