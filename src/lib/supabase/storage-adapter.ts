import "server-only";
import { getEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createStorageService, type StorageAdapter } from "@/services/storage-service";

const adapter: StorageAdapter = {
  async upload(path, bytes, contentType) {
    const { error } = await createSupabaseAdminClient()
      .storage.from(getEnv().SUPABASE_STORAGE_BUCKET)
      .upload(path, bytes, { contentType, upsert: false });
    if (error) throw new Error(`Storage upload failed: ${error.message}`);
  },
  async remove(path) {
    const { error } = await createSupabaseAdminClient()
      .storage.from(getEnv().SUPABASE_STORAGE_BUCKET)
      .remove([path]);
    if (error) {
      logger.warn("storage remove failed", { path, message: error.message });
      throw new Error(error.message);
    }
  },
  publicUrl(path) {
    const { data } = createSupabaseAdminClient()
      .storage.from(getEnv().SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(path);
    return data.publicUrl;
  },
};

export const storageService = createStorageService(adapter);
