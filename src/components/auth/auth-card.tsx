import { Card, CardContent } from "@/components/ui/card";

/** Narrow centered card used by all auth screens (mocks A1-A3). */
export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[440px] py-6">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
