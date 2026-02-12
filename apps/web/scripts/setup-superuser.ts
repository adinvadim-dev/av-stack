import { DBUsers } from "@av-stack/db/services/users";

function getTargetEmail() {
  const email = process.argv[2];

  if (!email) {
    throw new Error("Usage: pnpm --filter @av-stack/web setup:superuser -- <email>");
  }

  return email;
}

async function main() {
  const email = getTargetEmail();
  const user = await DBUsers.promoteToSuperuserByEmail(email);
  console.log(`Superuser granted: ${user.email} (${user.id})`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Failed to setup superuser: ${message}`);
  process.exit(1);
});
