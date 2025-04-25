const colors = {
  white: "\x1b[97m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",

  bg_white: "\x1b[107m",
  bg_red: "\x1b[41m",
  bg_green: "\x1b[42m",
  bg_yellow: "\x1b[43m",
  bg_blue: "\x1b[44m",

  bold: "\x1b[1m",
  underline: "\x1b[4m",

  reset: "\x1b[0m",
};

export function format(str: string, formating: Array<keyof typeof colors>) {
  if (formating.length === 0) return str;

  let prefix = "";
  for (const color of formating) {
    prefix = prefix.concat(colors[color]);
  }

  return prefix + str + colors.reset;
}

export function infoLog(...msg: unknown[]) {
  console.log(`[ ${format("INFO", ["bold", "green"])} ]:`, ...msg);
}

export function warningLog(...msg: unknown[]) {
  console.log(
    `[ ${format("WARNING", ["bold", "white", "bg_yellow"])} ]:`,
    ...msg,
  );
}

export function errorLog(...msg: unknown[]) {
  console.log(`[ ${format("ERROR", ["bold", "white", "bg_red"])} ]:`, ...msg);
}
