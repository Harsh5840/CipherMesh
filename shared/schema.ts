import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  bigint,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Files table for secure file sharing
export const files = pgTable("files", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").references(() => users.id),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  mimeType: varchar("mime_type").notNull(),
  encryptedPath: varchar("encrypted_path").notNull(),
  publicKey: text("public_key").notNull(),
  iv: text("iv").notNull(),
  uploadDate: timestamp("upload_date").defaultNow(),
  expiryDate: timestamp("expiry_date").notNull(),
  downloadCount: integer("download_count").default(0),
  maxDownloads: integer("max_downloads").default(1),
  isExpired: boolean("is_expired").default(false),
  passwordHash: varchar("password_hash"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// File access logs for audit trail
export const fileAccessLogs = pgTable("file_access_logs", {
  id: varchar("id").primaryKey().notNull(),
  fileId: varchar("file_id").references(() => files.id),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  accessType: varchar("access_type"), // 'download', 'view', 'share'
  accessedAt: timestamp("accessed_at").defaultNow(),
});

// User settings
export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").references(() => users.id),
  defaultExpiration: varchar("default_expiration").default("24h"),
  defaultMaxDownloads: integer("default_max_downloads").default(1),
  passwordProtectionDefault: boolean("password_protection_default").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  loginNotifications: boolean("login_notifications").default(true),
  activityLogs: boolean("activity_logs").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileAccessLogSchema = createInsertSchema(fileAccessLogs).omit({
  id: true,
  accessedAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
export type InsertFileAccessLog = z.infer<typeof insertFileAccessLogSchema>;
export type FileAccessLog = typeof fileAccessLogs.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
