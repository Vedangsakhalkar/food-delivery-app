import { Card, CardContent } from "@/components/ui/card";

/** Centered card used by 404, access-denied and error screens (mock S4). */
export function MessageCard({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[440px] py-10">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{message}</p>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
