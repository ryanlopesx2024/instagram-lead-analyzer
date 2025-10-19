import { db } from "./db";
import { analysisHistory, profileCache, type AnalysisHistory, type InsertAnalysisHistory, type ProfileCache, type InsertProfileCache } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Analysis History
  saveAnalysis(data: InsertAnalysisHistory): Promise<AnalysisHistory>;
  getRecentAnalyses(limit?: number): Promise<AnalysisHistory[]>;
  getAnalysisById(id: number): Promise<AnalysisHistory | undefined>;
  
  // Profile Cache
  getCachedProfile(username: string): Promise<ProfileCache | undefined>;
  setCachedProfile(data: InsertProfileCache): Promise<ProfileCache>;
  clearExpiredCache(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async saveAnalysis(data: InsertAnalysisHistory): Promise<AnalysisHistory> {
    const [analysis] = await db
      .insert(analysisHistory)
      .values(data as any)
      .returning();
    return analysis;
  }

  async getRecentAnalyses(limit: number = 10): Promise<AnalysisHistory[]> {
    return await db
      .select()
      .from(analysisHistory)
      .orderBy(desc(analysisHistory.createdAt))
      .limit(limit);
  }

  async getAnalysisById(id: number): Promise<AnalysisHistory | undefined> {
    const [analysis] = await db
      .select()
      .from(analysisHistory)
      .where(eq(analysisHistory.id, id));
    return analysis || undefined;
  }

  async getCachedProfile(username: string): Promise<ProfileCache | undefined> {
    const [cached] = await db
      .select()
      .from(profileCache)
      .where(eq(profileCache.username, username));
    
    if (!cached) return undefined;
    
    // Check if expired
    if (new Date() > cached.expiresAt) {
      await db.delete(profileCache).where(eq(profileCache.username, username));
      return undefined;
    }
    
    return cached;
  }

  async setCachedProfile(data: InsertProfileCache): Promise<ProfileCache> {
    // Upsert: delete old cache and insert new
    await db.delete(profileCache).where(eq(profileCache.username, (data as any).username));
    
    const [cached] = await db
      .insert(profileCache)
      .values(data as any)
      .returning();
    return cached;
  }

  async clearExpiredCache(): Promise<void> {
    await db
      .delete(profileCache)
      .where(eq(profileCache.expiresAt, new Date()));
  }
}

export const storage = new DatabaseStorage();
