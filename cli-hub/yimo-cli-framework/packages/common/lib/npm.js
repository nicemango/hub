import urlJoin from "url-join";
import axios from "axios";
import log from "./log.js";

const getNpmInfo = async (npmName) => {
  const registry = "https://registry.npmjs.org/";
  const url = urlJoin(registry, npmName);
  const response = await axios.get(url);
  return response.data;
};

const NpmInfo = {
  getLatestVersion: async (npmName) => {
    const data = await getNpmInfo(npmName);

    if (!data["dist-tags"] || !data["dist-tags"].latest) {
      log.error("没有latest版本号");
    }
    let latestVersion = data["dist-tags"].latest;

    return latestVersion;
  },
};

export default NpmInfo;
