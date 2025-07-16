// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginImport from "eslint-plugin-import";
import pluginUnusedImports from "eslint-plugin-unused-imports";
// If you use TypeScript, you'll need:
// import tseslint from "typescript-eslint";

export default [
  {
    // Global ignores are now done at the top level or via an "ignores" property
    // For simplicity, consider a .eslintignore file or add "ignores: []" here if needed.
    // Example: ignores: ["node_modules/", "dist/"],
  },
  pluginJs.configs.recommended, // Equivalent to "eslint:recommended"
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2020, // Or whatever ES version matches your ecmaVersion
        ...globals.browser,
      },
      // If using TypeScript:
      // parser: tseslint.parser,
      // parserOptions: {
      //   project: './tsconfig.json',
      //   // ... other parser options you had
      // }
    },
    plugins: {
      import: pluginImport, // Reference the imported plugin object
      "unused-imports": pluginUnusedImports, // Reference the imported plugin object
      // If using TypeScript:
      // "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Base ESLint rules (your existing ones)
      "no-restricted-globals": ["error", "name", "length"],
      "prefer-arrow-callback": "error",
      "quotes": ["error", "double", {"allowTemplateLiterals": true}],

      // Import-related rules from eslint-plugin-import
      // Note: Many plugin rules don't need 'pluginImport.configs.recommended' directly if
      // you're just picking specific rules.
      "import/no-unresolved": ["error", {"commonjs": true, "amd": true}],
      "import/named": "error",
      "import/default": "error",
      "import/namespace": "error",

      // Unused import rules from eslint-plugin-unused-imports
      "no-unused-vars": "off", // Turn off the base ESLint rule
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {"vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_"},
      ],
      // Original max-len disable is handled by not having that rule
      // in the config, or configuring it here if you need it.
    },
    settings: {
      "import/resolver": {
        "node": {
          "extensions": [".js", ".jsx", ".json", ".mjs"],
        },
        // If using TypeScript:
        // "typescript": {
        //   "alwaysTryTypes": true,
        //   "project": "./tsconfig.json"
        // }
      },
    },
  },
  // Overrides are now separate configuration objects in the array
  {
    files: ["**/*.spec.*", "**/*.test.*"],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.jest,
      },
    },
    rules: {
      // "no-unused-expressions": "off", // Example
    },
  },
  // If you were using "google" config, you'll need to find its flat config equivalent.
  // Often, this means manually adding its rules or checking if `eslint-config-google`
  // has a flat config export (it might not directly, yet).
  // For now, I've left it out as it's not a direct `extends` in flat config.
  // You'll need to install: `@eslint/js` for `pluginJs.configs.recommended`.
];