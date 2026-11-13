export const metadata = { title: "Privacy policy | Tadka" };

/** Mock S3 privacy page. Placeholder text for legal review before launch. */
export default function PrivacyPage() {
  return (
    <article className="mx-auto flex max-w-[720px] flex-col gap-3">
      <h1 className="text-2xl font-semibold">Privacy policy</h1>
      <p className="text-muted-foreground">
        Placeholder content for review. Last updated: 8 Nov 2026.
      </p>
      <h2 className="mt-2 text-lg font-semibold">What we collect</h2>
      <p>Name, email, phone, delivery addresses and order history.</p>
      <h2 className="mt-2 text-lg font-semibold">How we use it</h2>
      <p>To process orders, send order emails, and run the service.</p>
      <h2 className="mt-2 text-lg font-semibold">Sharing</h2>
      <p>
        Order details are shared with the restaurant you order from. We don&apos;t sell your data.
      </p>
      <h2 className="mt-2 text-lg font-semibold">Contact</h2>
      <p>support@tadka.example</p>
    </article>
  );
}
