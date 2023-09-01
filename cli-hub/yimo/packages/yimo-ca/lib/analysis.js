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
import tsCompiler from "typescript";
import Constant from "./constant.js";
import { scanFileTs } from "./file.js";
import Logger from "./logger.js";
import { parseTs } from "./parse.js";
import methodPlugin from "../plugins/methodPlugin.js";

export default class CodeAnalysis {
  constructor(config) {
    // 私有属性
    this._configScanSource = config.scanSource;
    this._configAnalysisPlugins = config.analysisPlugins || []; //代码分析插件配置

    // 公共属性
    this.pluginsQueue = []; //Target分析插件队列
    this.importItemMap = {}; //importItem统计Mao
  }

  //注册插件
  _installPlugins(configAnalysisPlugins) {
    if (configAnalysisPlugins.length > 0) {
      configAnalysisPlugins.forEach((item) => {
        this.pluginsQueue.push(item(this));
      });
    }

    this.pluginsQueue.push(methodPlugin(this)); //安装method判断插件
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
      apiName = apiName + node.escapedText;
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

  //执行Target分析插件队列中的checkFun函数
  _runAnalysisPlugins(
    tsCompiler,
    baseNode,
    depth,
    apiName,
    matchImportItem,
    filePath,
    projectName,
    httpRepo,
    line
  ) {
    if (this.pluginsQueue.length > 0) {
      this.pluginsQueue.forEach((item) => {
        const checkFun = item.checkFun;
        if (
          checkFun({
            ctx: this,
            tsCompiler,
            baseNode,
            depth,
            apiName,
            matchImportItem,
            filePath,
            projectName,
            httpRepo,
            line,
          })
        ) {
        }
      });
    }
  }

  /**
   * AST分析
   * @param {*} importItems  Import节点分析的结果Map
   * @param {*} ast  代码文件解析后的ast
   * @param {*} checker  编译代码文件时创建的checker
   * @param {*} filePath
   * @param {*} projectName
   * @param {*} httpRepo
   * @param {*} baseLine
   */
  _dealAST(
    importItems,
    ast,
    checker,
    filePath,
    projectName,
    httpRepo,
    baseLine = 0
  ) {
    let that = this;
    // 获取所有API信息名称
    const ImportItemsNames = Object.keys(importItems);

    // 遍历AST
    function walk(node) {
      tsCompiler.forEachChild(node, walk);
      const line =
        ast.getLineAndCharacterOfPosition(node.getStart()).line + baseLine + 1;

      // 判定当前遍历的节点是否为isIdentifier类型节点
      // 判断从Import导入的API中是否存在与当前遍历节点名称相同的API
      if (
        tsCompiler.isIdentifier(node) &&
        node.escapedText &&
        ImportItemsNames.length > 0 &&
        ImportItemsNames.includes(node.escapedText)
      ) {
        // 过滤掉不相干的Identifier节点后
        const matchImportItem = importItems[node.escapedText];
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
                //执行分析插件
                that._runAn;
                console.log({ depth, apiName });
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
   * @param {*} configScanSource 配置  待扫描源码信息
   * @param {*} type 代码文件类型
   */
  _scanFiles(configScanSource, type) {
    let entrys = [];
    configScanSource.forEach((item) => {
      const entryObj = {
        name: item.name,
        httpRepo: item.httpRepo,
        parse: [],
      };
      const scanPathArr = item.path;
      let parse = [];
      scanPathArr.forEach((itemScanPath) => {
        let fileTs = [];
        if (type === Constant.CODE_FILE_TYPE.TS) {
          fileTs = scanFileTs(itemScanPath);
        }
        parse = parse.concat(fileTs);
      });
      entryObj.parse = parse;

      entrys.push(entryObj);
    });

    return entrys;
  }

  /**
   * 扫描文件，分析代码
   * @param {*} configScanSource  配置  待扫描源码信息
   * @param {*} type  代码文件类型
   */
  _scanCode(configScanSource, type) {
    // 扫描所有需要分析的代码文件
    const entrys = this._scanFiles(configScanSource, type);

    entrys.forEach((item) => {
      const parseFileArr = item.parse;
      if (parseFileArr.length > 0) {
        parseFileArr.forEach((element, index) => {
          const showPath = item.name + "&" + element;
          try {
            if (type === Constant.CODE_FILE_TYPE.TS) {
              const { ast, checker } = parseTs(element);

              const importItems = this._findImportItems(ast, showPath);

              if (Object.keys(importItems).length > 0) {
                this._dealAST(
                  importItems,
                  ast,
                  checker,
                  showPath,
                  item.name,
                  item.httpRepo
                );
              }
            }
          } catch (error) {
            console.log("解析错误", error);
          }
        });
      }
    });

    fs.writeFile();
  }

  // 入口函数
  analysis() {
    // 注册插件
    this._installPlugins(_configAnalysisPlugins);

    // 扫描分析vue

    // 扫描分析TS
    this._scanCode(this._configScanSource, Constant.CODE_FILE_TYPE.TS);
  }

  log() {
    console.log(this.importItemMap);
  }
}
