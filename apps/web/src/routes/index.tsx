import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc";
import { StackDemo } from "@/components/stack-demo";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const trpc = useTRPC();
  const stackQuery = useQuery(trpc.stack.queryOptions());
  const helloQuery = useQuery(trpc.hello.queryOptions({ name: "AV Stack" }));

  return (
    <div className="min-h-screen">
      <StackDemo
        greeting={helloQuery.data?.greeting}
        stackItems={stackQuery.data?.items}
        isLoading={stackQuery.isLoading || helloQuery.isLoading}
      />
    </div>
  );
}
