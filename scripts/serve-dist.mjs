#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || "4174";
const serveBin = path.join(__dirname, "..", "node_modules", "serve", "build", "main.js");

const child = spawn(
  process.execPath,
  [serveBin, "-s", "dist", "-l", `tcp://0.0.0.0:${port}`],
  { stdio: "inherit" },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
