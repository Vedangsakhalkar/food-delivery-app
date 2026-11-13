import { healthRepository } from "@/repositories/health-repository";
import { logger, serializeError } from "@/lib/logger";

export type HealthStatus = { status: "ok" | "degraded"; db: "up" | "down" };

export function createHealthService(repo: Pick<typeof healthRepository, "ping">) {
  return {
    async check(): Promise<HealthStatus> {
      try {
        const up = await repo.ping();
        return { status: up ? "ok" : "degraded", db: up ? "up" : "down" };
      } catch (err) {
        logger.error("health check: database unreachable", serializeError(err));
        return { status: "degraded", db: "down" };
      }
    },
  };
}

export const healthService = createHealthService(healthRepository);
