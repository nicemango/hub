import { app, loader } from "framwork";
import { history as router } from "framwork";
import { responseType } from "framwork";
import utilFun from "iceman-ui";

const dataLen = 3;
let name = "iceman";

if (app.isShowFlag === "show") {
  loader(name);
}

app.localstorage.setItem("store", dataLen);

function getInfos(name: string) {
  const app = "nice" + name;
  return app;
}

getInfos("job");

function deal(data: responseType) {
  if (data.show > 2) {
    utilFun.getUser(data);
  } else {
    router.push("/home");
  }
}
