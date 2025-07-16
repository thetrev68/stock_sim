import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_ROOT = path.join(__dirname, "src");

const fileIndex = [];
const importGraph = [];
const classToFileMap = new Map();

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith(".js")) indexFile(fullPath);
  }
}

function indexFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const lines = code.split("\n");
  const relPath = path.relative(SRC_ROOT, filePath).replace(/\\/g, "/");

  const functions = [];
  const classes = [];
  const imports = [];
  const exports = [];

  let currentClass = null;
  let insideClass = false;
  let braceDepth = 0;

  lines.forEach((line, i) => {
    const ln = i + 1;
    const trimmed = line.trim();

    // Imports
    if (trimmed.startsWith("import ")) {
      const match = trimmed.match(/from\s+['"](.+)['"]/);
      if (match) imports.push(match[1]);
    }

    // Exports
    if (trimmed.startsWith("export ")) exports.push(trimmed);

    // Top-level functions
    if (!insideClass && /^function\s+(\w+)/.test(trimmed)) {
      const name = trimmed.match(/^function\s+(\w+)/)[1];
      functions.push(name);
    }

    // Arrow functions
    if (!insideClass && /^(const|let|var)\s+(\w+)\s*=\s*\(?.*\)?\s*=>/.test(trimmed)) {
      const name = trimmed.match(/^(const|let|var)\s+(\w+)/)[2];
      functions.push(name);
    }

    // Class start
    if (/^class\s+(\w+)/.test(trimmed)) {
      const name = trimmed.match(/^class\s+(\w+)/)[1];
      currentClass = { name, line: ln, methods: [] };
      classToFileMap.set(name, relPath);
      insideClass = true;
      braceDepth = (trimmed.match(/{/g) || []).length - (trimmed.match(/}/g) || []).length;
    } else if (insideClass) {
      // Update brace depth
      braceDepth += (trimmed.match(/{/g) || []).length;
      braceDepth -= (trimmed.match(/}/g) || []).length;

      // Method patterns
      const validMethod =
        /^((async\s+)?\w+)\s*\(.*\)\s*{/.test(trimmed) && !/^(if|for|while|switch|catch)\s*\(/.test(trimmed);
      const getSetMethod = /^(get|set)\s+(\w+)\s*\(?.*\)?\s*{/.exec(trimmed);

      if (validMethod) {
        const name = trimmed.match(/^((async\s+)?(\w+))\s*\(/)[3];
        currentClass.methods.push(name);
      } else if (getSetMethod) {
        currentClass.methods.push(`${getSetMethod[1]} ${getSetMethod[2]}`);
      } else if (/^constructor\s*\(/.test(trimmed)) {
        currentClass.methods.push("constructor");
      }

      if (braceDepth <= 0) {
        classes.push(currentClass);
        currentClass = null;
        insideClass = false;
      }
    }
  });

  fileIndex.push({
    file: relPath,
    lines: lines.length,
    imports,
    exports,
    functions,
    classes,
  });

  for (const imp of imports) {
    if (imp.startsWith(".")) {
      importGraph.push({ from: relPath, to: imp });
    }
  }
}

function writeJSON() {
  fs.writeFileSync("project-index.json", JSON.stringify(fileIndex, null, 2));
}

function writeMarkdown() {
  const lines = ["# Project Outline\n"];

  for (const file of fileIndex) {
    lines.push(`## ${file.file}`);
    lines.push(`- Lines: ${file.lines}`);

    if (file.classes.length) {
      for (const cls of file.classes) {
        lines.push(`- Class: ${cls.name}`);
        if (cls.methods.length) lines.push(`  - Methods: ${cls.methods.join(", ")}`);
      }
    }

    if (file.functions.length) {
      lines.push(`- Functions: ${file.functions.join(", ")}`);
    }

    if (file.exports.length) lines.push(`- Exports: ${file.exports.length}`);
    if (file.imports.length) lines.push(`- Imports: ${file.imports.join(", ")}`);
    lines.push("");
  }

  fs.writeFileSync("project-outline.md", lines.join("\n"));
}

function writeMermaid() {
  const graphLines = ["```mermaid", "graph TD"];
  const classLines = ["```mermaid", "classDiagram"];

  // --- Module import edges ---
  for (const { from, to } of importGraph) {
    const normalizedFrom = from.replace(/\.js$/, "");
    const normalizedTo = path
      .normalize(path.join(path.dirname(from), to))
      .replace(/\\/g, "/")
      .replace(/^src\//, "")
      .replace(/\.js$/, "");

    graphLines.push(`  ${quote(normalizedFrom)} --> ${quote(normalizedTo)}`);
  }

  // --- Class-to-file links ---
  for (const [cls, file] of classToFileMap.entries()) {
    const fileNode = quote(file.replace(/\.js$/, ""));
    graphLines.push(`  ${cls} --> ${fileNode}`);
  }

  // --- Class details ---
  for (const file of fileIndex) {
    for (const cls of file.classes) {
      classLines.push(`  class ${cls.name} {`);
      for (const method of cls.methods) {
        classLines.push(`    + ${method}()`);
      }
      classLines.push("  }");
    }
  }

  graphLines.push("```");
  classLines.push("```");

  fs.writeFileSync("project-graph.mmd", graphLines.join("\n") + "\n\n" + classLines.join("\n"));
}

function quote(s) {
  return s.replace(/[^a-zA-Z0-9_]/g, "_");
}

// --- RUN ---
walk(SRC_ROOT);
writeJSON();
writeMarkdown();
writeMermaid();
console.log("✅ project-index.json, project-outline.md, and project-graph.mmd generated.");
