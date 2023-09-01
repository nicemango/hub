import { BaseCommand } from "@yimocli/common";
import { log } from "@yimocli/common";

class InitCommand extends BaseCommand {
  get command() {
    return "init [name]";
  }

  get description() {
    return "init project";
  }

  get options() {
    return ["-f,--foce", "是否强制更新", false];
  }

  async action([name, opts]) {
    log.verbose("init", name, opts);
  }
}

const Init = (instance) => {
  return new InitCommand(instance);
};

export default Init;
