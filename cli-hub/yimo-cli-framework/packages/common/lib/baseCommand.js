export default class BaseCommand {
  constructor(instance) {
    if (!instance) {
      throw new Error("command instance must not be null");
    }
    this.program = instance;
    const cmd = this.program.command(this.command);
    cmd.description(this.description);
    cmd.hook("preAction", () => {
      this.preAction();
    });
    cmd.hook("postAction", () => {
      this.postAction();
    });
    if (this.options.length > 0) {
      this.options.forEach((option) => {
        cmd.option(...option);
      });
    }
    cmd.action((...parmas) => {
      this.action(parmas);
    });
  }

  get command() {
    throw new Error("command must be implements");
  }

  get description() {
    throw new Error("description must be implements");
  }

  get options() {
    return [];
  }

  get action() {
    throw new Error("action must be implements");
  }

  preAction() {}

  postAction() {}
}
