import { DBUsers } from "@av-stack/db/services/users";
import { auth } from "@/lib/auth";

const DEFAULT_EMAIL = "admin@dev.local";
const DEFAULT_PASSWORD = "admin123";
const DEFAULT_NAME = "Admin";

function printHelp() {
  console.log(`Usage: pnpm --filter @av-stack/web setup:superuser [-- <email> <password> [name]]

Creates a superuser account. If the user already exists, promotes to superuser.

Arguments:
  email       Account email    (default: ${DEFAULT_EMAIL})
  password    Account password  (default: ${DEFAULT_PASSWORD})
  name        Display name      (default: ${DEFAULT_NAME})

Examples:
  pnpm --filter @av-stack/web setup:superuser
  pnpm --filter @av-stack/web setup:superuser -- me@example.com secret123
  pnpm --filter @av-stack/web setup:superuser -- me@example.com secret123 "My Name"`);
}

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  return {
    email: args[0] ?? DEFAULT_EMAIL,
    password: args[1] ?? DEFAULT_PASSWORD,
    name: args[2] ?? DEFAULT_NAME,
  };
}

async function main() {
  const { email, password, name } = parseArgs();

  let existing = await DBUsers.getByEmail(email);

  if (!existing) {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    });

    if (!result.user) {
      throw new Error("Failed to create user account");
    }

    console.log(`Created account: ${result.user.email}`);
    existing = await DBUsers.getByEmail(email);

    if (!existing) {
      throw new Error("User was created but could not be found");
    }
  }

  if (existing.role === "superuser") {
    console.log(`Already a superuser: ${existing.email} (${existing.id})`);
    return;
  }

  const user = await DBUsers.setRole(existing.id, "superuser");
  console.log(`Superuser granted: ${user.email} (${user.id})`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Failed to setup superuser: ${message}`);
  process.exit(1);
});
