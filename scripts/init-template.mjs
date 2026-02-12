#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , appNameArg, packageScopeArg] = process.argv;

if (!appNameArg || !packageScopeArg) {
  console.error("Usage: node scripts/init-template.mjs <app-name> <package-scope>");
  process.exit(1);
}

const root = resolve(process.cwd());

const replacements = [
  { from: /TypeScript Starter/g, to: appNameArg },
  { from: /@av-stack/g, to: packageScopeArg },
  { from: /av-stack/g, to: appNameArg.toLowerCase().replace(/\s+/g, "-") },
  { from: /av_stack/g, to: appNameArg.toLowerCase().replace(/\s+/g, "_") },
  { from: /your-org\/your-repo/g, to: "your-org/your-repo" },
];

const files = [
  "README.md",
  "package.json",
  "apps/web/package.json",
  "packages/db/package.json",
  "packages/typescript-config/package.json",
  "apps/web/src/components/stack-demo.tsx",
  "apps/web/src/routes/__root.tsx",
  "apps/web/src/lib/system-settings.ts",
  "apps/web/.env.example",
  "packages/db/drizzle.config.ts",
  "packages/db/src/index.ts",
  "docker-compose.yml",
];

for (const relativePath of files) {
  const absolutePath = resolve(root, relativePath);
  let content = readFileSync(absolutePath, "utf8");

  for (const replacement of replacements) {
    content = content.replace(replacement.from, replacement.to);
  }

  writeFileSync(absolutePath, content, "utf8");
}

console.log("Template initialized successfully.");
