/** Friendly placeholder for empty and error states (mock S1). */
export function EmptyState({
  children,
  tone = "empty",
  icon,
}: {
  children: React.ReactNode;
  tone?: "empty" | "error";
  icon?: string;
}) {
  const emoji = icon ?? (tone === "error" ? "😕" : "🍽️");
  return (
    <div
      className={`animate-in rounded-2xl border-2 border-dashed bg-white p-10 text-center text-muted-foreground fade-in duration-300 ${
        tone === "error" ? "border-primary/60" : ""
      }`}
    >
      <div aria-hidden className="mb-3 text-5xl">
        {emoji}
      </div>
      {children}
    </div>
  );
}
