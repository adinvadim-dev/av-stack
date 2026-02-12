import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminProfile } from "@/components/admin-profile";
import { useTRPC } from "@/lib/trpc";

export const Route = createFileRoute("/admin/profile")({
  component: AdminProfilePage,
});

function AdminProfilePage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const profileQueryOptions = trpc.account.profile.queryOptions();
  const profileQuery = useQuery(profileQueryOptions);
  const profileUser = profileQuery.data?.user;

  const updateProfileMutation = useMutation(
    trpc.account.updateProfile.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: profileQueryOptions.queryKey }),
          queryClient.invalidateQueries({ queryKey: trpc.me.queryKey() }),
        ]);
      },
    }),
  );

  const saveProfile = async (input: { name: string; email: string }) => {
    await toast.promise(updateProfileMutation.mutateAsync(input), {
      loading: "Saving profile...",
      success: "Profile updated",
      error: "Failed to update profile",
    });
  };

  return (
    <AdminProfile
      user={profileUser}
      onSaveProfile={saveProfile}
      isSaving={updateProfileMutation.isPending}
    />
  );
}
