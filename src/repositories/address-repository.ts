import { query, withTransaction } from "@/lib/db";
import type { Address } from "@/models/address";
import type { AddressInput } from "@/validators/address";

interface Row {
  id: string;
  user_id: string;
  label: string;
  line1: string;
  city: string;
  pincode: string;
  is_default: boolean;
}

const COLS = "id, user_id, label, line1, city, pincode, is_default";
const toAddress = (r: Row): Address => ({
  id: r.id,
  userId: r.user_id,
  label: r.label,
  line1: r.line1,
  city: r.city,
  pincode: r.pincode,
  isDefault: r.is_default,
});

export interface AddressRepository {
  list(userId: string): Promise<Address[]>;
  find(id: string, userId: string): Promise<Address | null>;
  /** Inserts; when makeDefault, the user's previous default is cleared in the same transaction. */
  insert(userId: string, input: AddressInput, makeDefault: boolean): Promise<Address>;
  update(
    id: string,
    userId: string,
    input: AddressInput,
    makeDefault: boolean,
  ): Promise<Address | null>;
  /** Deletes and, if it was the default, promotes the newest remaining address. */
  remove(id: string, userId: string): Promise<boolean>;
}

export const addressRepository: AddressRepository = {
  async list(userId) {
    const res = await query<Row>(
      `select ${COLS} from addresses where user_id = $1 order by is_default desc, created_at`,
      [userId],
    );
    return res.rows.map(toAddress);
  },

  async find(id, userId) {
    const res = await query<Row>(`select ${COLS} from addresses where id = $1 and user_id = $2`, [
      id,
      userId,
    ]);
    return res.rows[0] ? toAddress(res.rows[0]) : null;
  },

  async insert(userId, i, makeDefault) {
    return withTransaction(async (c) => {
      if (makeDefault)
        await c.query("update addresses set is_default = false where user_id = $1", [userId]);
      const res = await c.query<Row>(
        `insert into addresses (user_id, label, line1, city, pincode, is_default)
         values ($1, $2, $3, $4, $5, $6) returning ${COLS}`,
        [userId, i.label, i.line1, i.city, i.pincode, makeDefault],
      );
      return toAddress(res.rows[0]);
    });
  },

  async update(id, userId, i, makeDefault) {
    return withTransaction(async (c) => {
      if (makeDefault) {
        await c.query("update addresses set is_default = false where user_id = $1 and id <> $2", [
          userId,
          id,
        ]);
      }
      const res = await c.query<Row>(
        `update addresses set label = $3, line1 = $4, city = $5, pincode = $6,
           is_default = is_default or $7
         where id = $1 and user_id = $2 returning ${COLS}`,
        [id, userId, i.label, i.line1, i.city, i.pincode, makeDefault],
      );
      return res.rows[0] ? toAddress(res.rows[0]) : null;
    });
  },

  async remove(id, userId) {
    return withTransaction(async (c) => {
      const del = await c.query<{ is_default: boolean }>(
        "delete from addresses where id = $1 and user_id = $2 returning is_default",
        [id, userId],
      );
      if (!del.rows[0]) return false;
      if (del.rows[0].is_default) {
        await c.query(
          `update addresses set is_default = true where id = (
             select id from addresses where user_id = $1 order by created_at desc limit 1)`,
          [userId],
        );
      }
      return true;
    });
  },
};
