import { isDebug, log } from "@yimocli/common";

const printError = (e, type) => {
  if (isDebug()) {
    log.error(type, e);
  } else {
    log.error(type, e.message);
  }
};

process.on("uncaughtException", (e) => printError(e, "error"));

process.on("unhandledRejection", (e) => printError(e, "promise"));
