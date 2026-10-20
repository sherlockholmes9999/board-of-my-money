import { createFileRoute, Link } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/fat/PlaceholderPage";
import { FmdAreaPage, FmdDashboard, FmdNav } from "@/components/fmd/FmdPages";
import { MasterTablePage } from "@/components/fmd/MasterTablePage";
import { MasterTreePage } from "@/components/fmd/MasterTreePage";
import { APP_NAME, getNode, trail } from "@/lib/fat/tree";
import { views } from "@/lib/fmd/views";

export const Route = createFileRoute("/$")({
  validateSearch: (s: Record<string, unknown>): { selected?: string } =>
    typeof s.selected === "string" ? { selected: s.selected } : {},
  head: ({ params }) => {
    const node = getNode(`/${params._splat ?? ""}`.replace(/\/$/, ""));
    const title = node ? `${trail(node.path).map((n) => n.name).reverse().join(" · ")} — ${APP_NAME}` : `Not found — ${APP_NAME}`;
    const description = node
      ? `${node.name}: ${node.implemented ? "Financial Master Data interface" : "planned capability"} in the ${APP_NAME} application.`
      : "This page is not part of the application tree.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: NodePage,
});

function NodePage() {
  const { _splat } = Route.useParams();
  const path = `/${_splat ?? ""}`.replace(/\/$/, "");
  const node = getNode(path);

  if (!node) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">This path is not part of the canonical tree.</p>
        <Link to="/map" className="mt-4 inline-block text-sm text-primary underline">
          Open the Global Finance Map
        </Link>
      </div>
    );
  }

  if (!node.implemented) return <PlaceholderPage node={node} />;

  const view = views[node.path];
  let content;
  if (node.type === "module") content = <FmdDashboard node={node} />;
  else if (!view) content = <FmdAreaPage node={node} />;
  else if (view.kind === "tree") content = <MasterTreePage key={node.path} node={node} view={view} />;
  else content = <MasterTablePage key={node.path} node={node} view={view} />;

  return (
    <div className="flex min-h-[calc(100vh-3rem)]">
      <FmdNav activePath={node.path} />
      <div className="min-w-0 flex-1">{content}</div>
    </div>
  );
}
