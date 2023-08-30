const path = require("path");
const CodeAnalysis = require("../lib/analysis");
const file = require(path.join(__dirname, "../lib/file.js"));
const { parseTs } = require(path.join(__dirname, "../lib/parse.js"));

// console.log(__dirname);

const tsFiles = file.scanFileTs("test");
const codeAnalysis = new CodeAnalysis();
tsFiles.forEach((file) => {
  const { ast } = parseTs(file);
  const importItems = codeAnalysis._findImportItems(ast, file);
  console.log(importItems);
});

codeAnalysis.log();
