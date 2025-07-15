import {
  users,
  files,
  fileAccessLogs,
  userSettings,
  type User,
  type UpsertUser,
  type File,
  type InsertFile,
  type InsertFileAccessLog,
  type FileAccessLog,
  type UserSettings,
  type InsertUserSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, desc, asc, lt } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // File operations
  createFile(file: InsertFile): Promise<File>;
  getFile(id: string): Promise<File | undefined>;
  getFilesByUser(userId: string): Promise<File[]>;
  updateFile(id: string, updates: Partial<File>): Promise<File | undefined>;
  deleteFile(id: string): Promise<boolean>;
  getExpiredFiles(): Promise<File[]>;
  
  // File access logs
  createFileAccessLog(log: InsertFileAccessLog): Promise<FileAccessLog>;
  getFileAccessLogs(fileId: string): Promise<FileAccessLog[]>;
  
  // User settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
}

export class DatabaseStorage implements IStorage {
  // File operations
  async createFile(file: InsertFile): Promise<File> {
    const fileId = nanoid();
    const [newFile] = await db.insert(files).values({
      ...file,
      id: fileId
    }).returning();
    return newFile;
  }

  async getFile(id: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async getFilesByUser(userId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(files.createdAt));
  }

  async updateFile(id: string, updates: Partial<File>): Promise<File | undefined> {
    const [updatedFile] = await db
      .update(files)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return updatedFile;
  }

  async deleteFile(id: string): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getExpiredFiles(): Promise<File[]> {
    const now = new Date();
    return await db
      .select()
      .from(files)
      .where(
        and(
          lt(files.expiryDate, now),
          eq(files.isExpired, false)
        )
      );
  }

  // File access logs
  async createFileAccessLog(log: InsertFileAccessLog): Promise<FileAccessLog> {
    const logId = nanoid();
    const [newLog] = await db.insert(fileAccessLogs).values({
      ...log,
      id: logId
    }).returning();
    return newLog;
  }

  async getFileAccessLogs(fileId: string): Promise<FileAccessLog[]> {
    return await db
      .select()
      .from(fileAccessLogs)
      .where(eq(fileAccessLogs.fileId, fileId))
      .orderBy(desc(fileAccessLogs.accessedAt));
  }

  // User settings
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings;
  }

  async upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [userSetting] = await db
      .insert(userSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return userSetting;
  }
}

export const storage = new DatabaseStorage();
