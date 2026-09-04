import QRCode from "qrcode";
import { ExternalLink } from "lucide-react";
import { getBusinessSettings } from "@/lib/settings";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { CopyLink } from "@/components/dashboard/copy-link";

export const dynamic = "force-dynamic";

export default async function AdminCardPage() {
  const business = await getBusinessSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const cardUrl = `${siteUrl}/card`;
  const qr = await QRCode.toDataURL(cardUrl, { margin: 1, width: 400 }).catch(() => "");

  return (
    <div>
      <PageHeader
        title="Digital Business Card"
        description="Share your business instantly with a link and QR code."
        action={<a href="/card" target="_blank" className="btn-primary btn-md"><ExternalLink className="h-4 w-4" /> Open card</a>}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Shareable link</h2>
          <CopyLink url={cardUrl} />
          <p className="mt-4 text-sm text-muted">
            Add this link to your Instagram bio, WhatsApp status, or business signage. Anyone who opens it can call you,
            message you on WhatsApp, get directions, save your contact, and shop your store.
          </p>
          <p className="mt-3 text-sm text-muted">
            The card automatically uses your current business settings — update them in{" "}
            <a href="/admin/settings" className="text-brand hover:underline">Business Settings</a>.
          </p>
        </Card>
        <Card className="flex flex-col items-center justify-center">
          <h2 className="mb-3 self-start font-semibold">QR code</h2>
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="Business card QR" className="h-56 w-56" />
          ) : null}
          <a href={qr} download={`${business.name}-qr.png`} className="btn-outline btn-sm mt-4">Download QR (PNG)</a>
        </Card>
      </div>
    </div>
  );
}
