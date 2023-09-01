import createCli from "./createCli.js";

export default function (args) {
  const program = createCli();

  // // 创建init子命令
  // createInitCommand(program);

  // 传递命令行参数
  program.parse(process.argv);
}
