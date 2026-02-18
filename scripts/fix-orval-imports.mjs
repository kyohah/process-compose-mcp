import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const target = path.resolve("src/generated/processCompose.ts");

async function main() {
  const original = await readFile(target, "utf8");
  const updated = original.replace(/from ['"]\.\.\/orval\/pcMutator['"]/g, "from '../orval/pcMutator.js'");

  if (updated !== original) {
    await writeFile(target, updated, "utf8");
    console.log(`Patched ESM import extension in ${target}`);
  } else {
    console.log(`No import patch needed in ${target}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
