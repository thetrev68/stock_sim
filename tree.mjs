// Save as tree.mjs and run: node tree.mjs

import fs from "fs/promises";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const EXCLUDES = new Set(["node_modules", ".git", "docs", ".github", "public"]);

const outputLines = [];

async function countLines(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    // Count non-empty lines (you can change this to count all lines by using content.split('\n').length)
    return content.split("\n").filter(line => line.trim().length > 0).length;
  } catch (_error) {
    return 0;
  }
}

async function printTree(dir, prefix = "") {
  const items = await fs.readdir(dir);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (EXCLUDES.has(item)) continue;

    const isLast = i === items.length - 1;
    const pointer = isLast ? "└── " : "├── ";
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      outputLines.push(prefix + pointer + item);
      await printTree(fullPath, prefix + (isLast ? "    " : "│   "));
    } else {
      // Check if it's a Dart file and add line count
      if (item.endsWith(".dart")) {
        const lineCount = await countLines(fullPath);
        outputLines.push(prefix + pointer + item + ` (${lineCount} lines)`);
      } else {
        outputLines.push(prefix + pointer + item);
      }
    }
  }
}

(async () => {
  await printTree(__dirname);
  await fs.writeFile("tree.txt", outputLines.join("\n"), "utf8");

  console.log("Directory tree written to tree.txt");
  console.log("Dart files now include line counts for refactoring reference!");
})();