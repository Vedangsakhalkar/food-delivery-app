import { query } from "@/lib/db";

export const healthRepository = {
  async ping(): Promise<boolean> {
    const result = await query<{ ok: number }>("select 1 as ok");
    return result.rows[0]?.ok === 1;
  },
};
