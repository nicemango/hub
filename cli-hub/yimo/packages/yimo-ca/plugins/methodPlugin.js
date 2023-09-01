const methodPlugin = () => {
  const mapName = "methodMap";

  const isMethodCheck = () => {};

  // 返回分析Node节点的函数
  return {
    mapName: mapName,
    checkFunc: isMethodCheck,
    afterHook: null,
  };
};

export default methodPlugin;
