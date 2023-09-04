import inquirer from "inquirer";

const make = ({
  choices,
  defaultValue,
  message = "请选择",
  type = "list",
  require = true,
  mask = "*",
  validate,
  pageSize,
  loop,
}) => {
  const options = {
    name: "name",
    default: defaultValue,
    message,
    type,
    require,
    mask,
    validate,
    pageSize,
    loop,
  };
  if (type === "list") {
    options.choices = choices;
  }
  return inquirer.prompt(options).then((anaswer) => anaswer.name);
};

const Inquirer = {
  makeList: (params) => {
    return make({ ...params });
  },
  makeInput: (params) => {
    return make({
      type: "input",
      ...params,
    });
  },
  makePassword: (params) => {
    return make({
      type: "password",
      ...params,
    });
  },
};

export default Inquirer;
