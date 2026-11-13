import { query } from "@/lib/db";
import { likePattern } from "@/lib/like";
import type { Role, User } from "@/models/user";

interface UserRow {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  created_at: Date;
}

const toUser = (r: UserRow): User => ({
  id: r.id,
  email: r.email,
  name: r.name,
  phone: r.phone,
  role: r.role,
  createdAt: r.created_at,
});

export interface NewUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  /** Inserts the user; if the id already exists returns the existing row (race safe). */
  insertIfMissing(user: NewUser): Promise<User>;
  updateProfile(id: string, fields: { name: string; phone: string }): Promise<User>;
  /** All users for the admin, newest first; optional role filter and email/name search. */
  list(opts: { role?: Role; q?: string; limit: number; offset: number }): Promise<User[]>;
}

export const userRepository: UserRepository = {
  async findById(id) {
    const res = await query<UserRow>("select * from users where id = $1", [id]);
    return res.rows[0] ? toUser(res.rows[0]) : null;
  },

  async insertIfMissing(u) {
    await query(
      `insert into users (id, email, name, phone, role) values ($1, $2, $3, $4, $5)
       on conflict (id) do nothing`,
      [u.id, u.email, u.name, u.phone, u.role],
    );
    const res = await query<UserRow>("select * from users where id = $1", [u.id]);
    return toUser(res.rows[0]);
  },

  async list({ role, q, limit, offset }) {
    const res = await query<UserRow>(
      `select * from users
       where ($1::text is null or role = $1)
         and ($2::text is null or lower(email) like $2 or lower(name) like $2)
       order by created_at desc, id limit $3 offset $4`,
      [role ?? null, q ? likePattern(q) : null, limit, offset],
    );
    return res.rows.map(toUser);
  },

  async updateProfile(id, fields) {
    const res = await query<UserRow>(
      "update users set name = $2, phone = $3 where id = $1 returning *",
      [id, fields.name, fields.phone],
    );
    return toUser(res.rows[0]);
  },
};
