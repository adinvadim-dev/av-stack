import { auth } from "../src/lib/auth";
import { DBUsers } from "@av-stack/db/services/users";

function parseArgs() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    throw new Error(
      "Usage: pnpm setup:superuser <email> <password>",
    );
  }

  return { email, password };
}

async function main() {
  const { email, password } = parseArgs();

  const existing = await DBUsers.getByEmail(email);

  if (existing) {
    const promoted = await DBUsers.setRole(existing.id, "superuser");
    console.log(`User already exists. Superuser granted: ${promoted.email} (${promoted.id})`);
    return;
  }

  const result = await auth.api.signUpEmail({
    body: { name: "Superuser", email, password },
  });

  if (!result.user) {
    throw new Error("Failed to create user");
  }

  const promoted = await DBUsers.setRole(result.user.id, "superuser");
  console.log(`User created and superuser granted: ${promoted.email} (${promoted.id})`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Failed to setup superuser: ${message}`);
  process.exit(1);
});
