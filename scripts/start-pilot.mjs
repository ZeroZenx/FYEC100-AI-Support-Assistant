import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const configuredPort = Number(process.env.PORT ?? 4100);
const port =
  Number.isInteger(configuredPort) && configuredPort > 0 && configuredPort < 65536
    ? configuredPort
    : 4100;
const host = process.env.HOST ?? "127.0.0.1";
const nextBin = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url)
);
const child = spawn(
  process.execPath,
  [nextBin, "start", "-H", host, "-p", String(port)],
  { stdio: "inherit" }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
