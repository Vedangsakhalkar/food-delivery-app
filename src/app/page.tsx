import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-4xl font-bold">Dabba</h1>
      <p className="text-muted-foreground">Food delivery, made simple.</p>
      <Button>Get started</Button>
    </div>
  );
}
