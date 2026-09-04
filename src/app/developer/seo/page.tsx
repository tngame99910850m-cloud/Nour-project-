import { getSystemSettings } from "@/lib/settings";
import { updateSeo } from "../actions";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { SaveBar } from "@/components/dashboard/save-bar";

export const dynamic = "force-dynamic";

export default async function SeoPage() {
  const system = await getSystemSettings();
  const s = system.seo;
  return (
    <div>
      <PageHeader title="SEO Settings" description="Control how your site appears in search engines and when shared." />
      <form action={updateSeo} className="space-y-6">
        <Card>
          <div className="grid gap-4">
            <div><label className="label">Default page title</label><input name="defaultTitle" defaultValue={s.defaultTitle} className="input" /></div>
            <div><label className="label">Title template</label><input name="titleTemplate" defaultValue={s.titleTemplate} className="input" /><p className="mt-1 text-xs text-muted">Use %s for the page name, e.g. “%s | Nour Boutique”.</p></div>
            <div><label className="label">Default meta description</label><textarea name="defaultDescription" rows={2} defaultValue={s.defaultDescription} className="input" /></div>
            <div><label className="label">Keywords (comma separated)</label><input name="keywords" defaultValue={s.keywords} className="input" /></div>
            <div><label className="label">Open Graph image URL</label><input name="ogImage" defaultValue={s.ogImage} className="input" /></div>
            <div>
              <label className="label">Robots</label>
              <select name="robots" defaultValue={s.robots} className="input">
                <option value="index, follow">index, follow (public)</option>
                <option value="noindex, nofollow">noindex, nofollow (hidden)</option>
              </select>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold">Automatic SEO features</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            <li>✓ SEO-friendly product URLs (/products/product-name)</li>
            <li>✓ Per-product meta titles &amp; descriptions</li>
            <li>✓ Product structured data (JSON-LD)</li>
            <li>✓ Sitemap at <a href="/sitemap.xml" target="_blank" className="text-emerald-600 hover:underline">/sitemap.xml</a></li>
            <li>✓ Robots at <a href="/robots.txt" target="_blank" className="text-emerald-600 hover:underline">/robots.txt</a></li>
            <li>✓ Open Graph &amp; Twitter cards</li>
          </ul>
        </Card>
        <SaveBar />
      </form>
    </div>
  );
}
