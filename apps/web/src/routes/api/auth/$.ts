import { createFileRoute } from "@tanstack/react-router";
import { DBInvites } from "@av-stack/db/services/invites";
import { DBSettings } from "@av-stack/db/services/settings";
import { DBUsers } from "@av-stack/db/services/users";
import { auth } from "@/lib/auth";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

async function isSuccessfulAuthResponse(response: Response) {
  if (!response.ok) {
    return false;
  }

  try {
    const body = (await response.clone().json()) as { error?: unknown };
    return !body.error;
  } catch {
    return true;
  }
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return await auth.handler(request);
      },
      POST: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const isSignUpEmail = url.pathname.endsWith("/sign-up/email");

        if (!isSignUpEmail) {
          return await auth.handler(request);
        }

        const body = (await request.clone().json().catch(() => null)) as {
          email?: unknown;
          inviteToken?: unknown;
        } | null;
        const submittedEmail = typeof body?.email === "string" ? normalizeEmail(body.email) : "";

        const allowSelfRegistration = await DBSettings.getBoolean("auth.allow_self_registration", true);
        const inviteToken =
          typeof body?.inviteToken === "string"
            ? body.inviteToken.trim()
            : (request.headers.get("x-invite-token")?.trim() ?? "");

        let inviteEmail = "";
        if (!allowSelfRegistration) {
          if (!inviteToken) {
            return Response.json({ message: "Registration is available only by invite link" }, { status: 403 });
          }

          const invite = await DBInvites.getValidByToken(inviteToken);
          if (!invite) {
            return Response.json({ message: "Invite link is invalid or expired" }, { status: 403 });
          }

          inviteEmail = normalizeEmail(invite.email);
          if (!submittedEmail || submittedEmail !== inviteEmail) {
            return Response.json({ message: "Invite link is bound to a different email" }, { status: 403 });
          }
        }

        const response = await auth.handler(request);

        if (!allowSelfRegistration && inviteToken && submittedEmail && (await isSuccessfulAuthResponse(response))) {
          try {
            const createdUser = await DBUsers.getByEmail(submittedEmail);
            await DBInvites.consumeByToken({
              token: inviteToken,
              usedByUserId: createdUser?.id,
              usedByEmail: inviteEmail || submittedEmail,
            });
          } catch {
            return response;
          }
        }

        return response;
      },
    },
  },
});
