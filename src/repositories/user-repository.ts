import { query } from "@/lib/db";
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
};
