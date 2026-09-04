import { getSystemSettings } from "@/lib/settings";
import { PageHeader } from "@/components/dashboard/ui";
import { HomepageBuilder } from "@/components/dashboard/homepage-builder";

export const dynamic = "force-dynamic";

export default async function HomepageBuilderPage() {
  const system = await getSystemSettings();
  const sections = [...system.homepageSections].sort((a, b) => a.order - b.order);
  return (
    <div>
      <PageHeader title="Homepage Builder" description="Enable, disable, and reorder the sections shown on your homepage." />
      <HomepageBuilder initial={sections} />
    </div>
  );
}
