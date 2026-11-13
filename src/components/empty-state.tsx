/** Dashed placeholder used for empty and error states (mock S1). */
export function EmptyState({
  children,
  tone = "empty",
}: {
  children: React.ReactNode;
  tone?: "empty" | "error";
}) {
  return (
    <div
      className={`rounded-xl border-2 border-dashed bg-white p-8 text-center text-muted-foreground ${
        tone === "error" ? "border-primary" : ""
      }`}
    >
      {children}
    </div>
  );
}
