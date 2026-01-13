import { boolean, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  username: text().notNull().unique(),
  admin: boolean().notNull().default(false),
  hwid: text(), // Not required
  password: text().notNull(),
});
