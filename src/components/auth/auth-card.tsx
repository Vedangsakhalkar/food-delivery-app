import { Card, CardContent } from "@/components/ui/card";

/** Narrow centered card used by all auth screens (mocks A1-A3), with a friendly header. */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[440px] animate-in py-6 fade-in slide-in-from-bottom-2 duration-300">
      <Card className="overflow-hidden shadow-md">
        <div
          aria-hidden
          className="flex items-center justify-center gap-3 bg-gradient-to-br from-[#db3542] to-[#8f1d2c] py-5 text-4xl"
        >
          <span>🍛</span>
          <span>🥟</span>
          <span>🍕</span>
        </div>
        <CardContent className="flex flex-col gap-4 pt-2">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
