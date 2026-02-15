import { DBUsers } from "@av-stack/db/services/users";
import { auth } from "@/lib/auth";

function parseArgs() {
  const args = process.argv.slice(2);
  let email: string | undefined;
  let password: string | undefined;
  let name: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--password" || arg === "-p") {
      password = args[++i];
    } else if (arg === "--name" || arg === "-n") {
      name = args[++i];
    } else if (!email) {
      email = arg;
    }
  }

  if (!email) {
    throw new Error(
      "Usage: pnpm --filter @av-stack/web setup:superuser -- <email> [--password <pass>] [--name <name>]",
    );
  }

  return { email, password, name };
}

async function main() {
  const { email, password, name } = parseArgs();

  let existing = await DBUsers.getByEmail(email);

  if (!existing) {
    if (!password) {
      throw new Error(
        `User with email ${email} not found. Provide --password to create a new account:\n` +
          `  pnpm --filter @av-stack/web setup:superuser -- ${email} --password <pass>`,
      );
    }

    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name ?? email.split("@")[0],
      },
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
