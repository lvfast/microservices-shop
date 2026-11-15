import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const app of ["storefront", "backoffice"]) {
  const folder = join(root, "apps", app);
  const destination = join(folder, ".env.local");
  if (existsSync(destination)) continue;
  const example = readFileSync(join(folder, ".env.example"), "utf8");
  const secret = randomBytes(32).toString("base64");
  writeFileSync(destination, example.replace("replace-with-a-random-32-byte-value", secret), { mode: 0o600 });
  process.stdout.write(`Created local auth configuration for ${app}\n`);
}
