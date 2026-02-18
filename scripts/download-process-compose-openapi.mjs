import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

const port = process.env.PC_PORT ?? "19081";
const openapiUrl = process.env.PC_OPENAPI_DOWNLOAD_URL ?? `http://localhost:${port}/swagger/doc.json`;
const outputDir = process.env.PC_OPENAPI_OUTPUT_DIR ?? path.resolve("openapi", "process-compose");
const requestTimeoutMs = 10_000;

function getProcessComposeVersion() {
  try {
    const output = execFileSync("process-compose", ["version"], { encoding: "utf8" });
    const match = output.match(/Version:\s*([^\s]+)/);
    return match?.[1] ?? "unknown";
  } catch {
    return "unknown";
  }
}

function sanitize(value) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function downloadOpenApi() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(openapiUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Failed to download OpenAPI: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Downloaded response is not valid JSON: ${openapiUrl}`);
    }

    if (!json || typeof json !== "object" || typeof json.paths !== "object") {
      throw new Error(`Downloaded JSON does not look like an OpenAPI spec (missing 'paths'): ${openapiUrl}`);
    }

    await mkdir(outputDir, { recursive: true });

    const processComposeVersion = sanitize(getProcessComposeVersion());
    const downloadedAt = new Date().toISOString();
    const stamp = downloadedAt.replace(/[:.]/g, "-");
    const versionedFile = path.join(outputDir, `swagger-doc.${processComposeVersion}.${stamp}.json`);
    const latestFile = path.join(outputDir, "swagger-doc.latest.json");
    const versionedYamlFile = path.join(outputDir, `swagger-doc.${processComposeVersion}.${stamp}.yaml`);
    const latestYamlFile = path.join(outputDir, "swagger-doc.latest.yaml");
    const metaFile = path.join(outputDir, "download-meta.json");
    const content = `${JSON.stringify(json, null, 2)}\n`;
    const yamlContent = `${YAML.stringify(json)}\n`;

    await writeFile(versionedFile, content, "utf8");
    await writeFile(latestFile, content, "utf8");
    await writeFile(versionedYamlFile, yamlContent, "utf8");
    await writeFile(latestYamlFile, yamlContent, "utf8");
    await writeFile(
      metaFile,
      `${JSON.stringify(
        {
          downloadedAt,
          openapiUrl,
          processComposeVersion,
          latestFile,
          versionedFile,
          latestYamlFile,
          versionedYamlFile,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    console.log(`Downloaded OpenAPI spec from ${openapiUrl}`);
    console.log(`Latest: ${latestFile}`);
    console.log(`Latest YAML: ${latestYamlFile}`);
    console.log(`Versioned snapshot: ${versionedFile}`);
    console.log(`Versioned YAML snapshot: ${versionedYamlFile}`);
  } finally {
    clearTimeout(timeout);
  }
}

downloadOpenApi().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
