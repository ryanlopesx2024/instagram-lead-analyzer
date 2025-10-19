import { z } from "zod";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

// Instagram Post Schema
export const instagramPostSchema = z.object({
  imageUrl: z.string(),
  caption: z.string(),
  likes: z.number().optional(),
  timestamp: z.string().optional(),
  ocrText: z.string().optional(),
});

export type InstagramPost = z.infer<typeof instagramPostSchema>;

// Instagram Profile Schema
export const instagramProfileSchema = z.object({
  username: z.string(),
  fullName: z.string().optional(),
  bio: z.string().optional(),
  profilePicUrl: z.string().optional(),
  followers: z.number().optional(),
  following: z.number().optional(),
  postsCount: z.number().optional(),
  isPrivate: z.boolean().default(false),
  posts: z.array(instagramPostSchema).optional(),
});

export type InstagramProfile = z.infer<typeof instagramProfileSchema>;

// Lead Quality Score Schema
export const leadQualityScoreSchema = z.object({
  score: z.number().min(0).max(100),
  intencao: z.number().min(0).max(100),
  prova_social: z.number().min(0).max(100),
});

export type LeadQualityScore = z.infer<typeof leadQualityScoreSchema>;

// Persona Types
export const personaSchema = z.enum(["curioso", "prospecto", "cliente", "influenciador"]);
export type Persona = z.infer<typeof personaSchema>;

// Predictive Insights Schema
export const predictiveInsightsSchema = z.object({
  por_que_esta_persona: z.string(),
  como_elevar_lqs: z.string(),
});

export type PredictiveInsights = z.infer<typeof predictiveInsightsSchema>;

// 1. Identificação do Perfil
export const identificacaoPerfilSchema = z.object({
  nome_completo: z.string().optional(),
  localizacao: z.string().optional(),
  idade_aparente: z.string().optional(),
  tempo_formacao_estimado: z.string().optional(),
  situacao_profissional: z.string().optional(),
});

export type IdentificacaoPerfil = z.infer<typeof identificacaoPerfilSchema>;

// 2. Análise Geral de Compatibilidade
export const categoriaCompatibilidadeSchema = z.object({
  categoria: z.string(),
  pontuacao: z.number().min(0).max(10),
  observacoes: z.string(),
});

export const analiseCompatibilidadeSchema = z.object({
  categorias: z.array(categoriaCompatibilidadeSchema),
  score_final: z.number().min(0).max(100),
  classificacao: z.string(),
});

export type CategoriaCompatibilidade = z.infer<typeof categoriaCompatibilidadeSchema>;
export type AnaliseCompatibilidade = z.infer<typeof analiseCompatibilidadeSchema>;

// 3. Diagnóstico Emocional e Profissional
export const diagnosticoEmocionalSchema = z.object({
  estado_emocional_atual: z.array(z.string()),
  emocao_aspiracional_dominante: z.string(),
  discurso_predominante: z.array(z.string()),
  nivel_consciencia: z.string(),
});

export type DiagnosticoEmocional = z.infer<typeof diagnosticoEmocionalSchema>;

// 4. Sinais Técnicos e de Mercado
export const indicadorTecnicoSchema = z.object({
  indicador: z.string(),
  status: z.string(), // "Presente", "Sim", "Não", "Parcial", "Média", "Alta", "Baixa"
  interpretacao: z.string(),
});

export const sinaisTecnicosSchema = z.object({
  indicadores: z.array(indicadorTecnicoSchema),
});

export type IndicadorTecnico = z.infer<typeof indicadorTecnicoSchema>;
export type SinaisTecnicos = z.infer<typeof sinaisTecnicosSchema>;

// 5. Nível de Prontidão para Conversão
export const prontidaoConversaoSchema = z.object({
  nivel: z.enum(["Alta", "Média", "Baixa", "Não qualificado"]),
  score: z.number().min(0).max(100),
  descricao: z.string(),
  acao_recomendada: z.string(),
  enfase_abordagem: z.string(),
});

export type ProntidaoConversao = z.infer<typeof prontidaoConversaoSchema>;

// 6. Insights Estratégicos
export const insightsEstrategicosSchema = z.object({
  mensagem_conexao_ideal: z.string(),
  tom_ideal_abordagem: z.string(),
  proposta_mais_converte: z.string(),
});

export type InsightsEstrategicos = z.infer<typeof insightsEstrategicosSchema>;

// 7. Resumo Rápido
export const resumoRapidoSchema = z.object({
  nome: z.string(),
  score: z.number().min(0).max(100),
  classificacao: z.string(),
  nivel_consciencia: z.string(),
  emocao_predominante: z.string(),
  motivador_compra: z.string(),
  melhor_abordagem: z.string(),
  acao_imediata: z.string(),
});

export type ResumoRapido = z.infer<typeof resumoRapidoSchema>;

// AI Analysis Schema (modelo completo de qualificação)
export const aiAnalysisSchema = z.object({
  // Original fields (mantidos para compatibilidade)
  summary: z.string(),
  keyInsights: z.array(z.string()),
  contentThemes: z.array(z.string()),
  audienceProfile: z.string().optional(),
  engagementPattern: z.string().optional(),
  recommendations: z.array(z.string()).optional(),
  analyzedAt: z.string(),
  
  // Predictive metrics (mantidos)
  autoridade: z.number().min(0).max(100).optional(),
  afinidade_de_tema: z.number().min(0).max(100).optional(),
  risco_bot: z.string().optional(),
  lead_quality_score: leadQualityScoreSchema.optional(),
  persona: personaSchema.optional(),
  insights: predictiveInsightsSchema.optional(),
  
  // Novo modelo completo de qualificação
  identificacao_perfil: identificacaoPerfilSchema.optional(),
  analise_compatibilidade: analiseCompatibilidadeSchema.optional(),
  diagnostico_emocional: diagnosticoEmocionalSchema.optional(),
  sinais_tecnicos: sinaisTecnicosSchema.optional(),
  prontidao_conversao: prontidaoConversaoSchema.optional(),
  insights_estrategicos: insightsEstrategicosSchema.optional(),
  resumo_rapido: resumoRapidoSchema.optional(),
});

export type AIAnalysis = z.infer<typeof aiAnalysisSchema>;

// Complete Analysis Result
export const analysisResultSchema = z.object({
  profile: instagramProfileSchema,
  analysis: aiAnalysisSchema,
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

// Analysis Filters Schema
export const analysisFiltersSchema = z.object({
  dateRange: z.enum(["all", "week", "month", "3months"]).default("all"),
  minEngagement: z.number().min(0).default(0),
});

export type AnalysisFilters = z.infer<typeof analysisFiltersSchema>;

// API Request Schema
export const analyzeProfileRequestSchema = z.object({
  username: z.string().min(1, "Username é obrigatório").regex(/^[a-zA-Z0-9._]+$/, "Username inválido"),
  filters: analysisFiltersSchema.optional(),
  personaAlvo: z.enum(["curioso", "prospecto", "cliente", "influenciador", "nenhuma"]).optional(),
  briefing: z.string().min(10, "Briefing é obrigatório e deve ter pelo menos 10 caracteres"),
});

export type AnalyzeProfileRequest = z.infer<typeof analyzeProfileRequestSchema>;

// API Response Schema
export const analyzeProfileResponseSchema = z.object({
  success: z.boolean(),
  data: analysisResultSchema.optional(),
  error: z.string().optional(),
});

export type AnalyzeProfileResponse = z.infer<typeof analyzeProfileResponseSchema>;

// Batch Analysis Schemas
export const analyzeBatchRequestSchema = z.object({
  usernames: z.array(z.string().min(1).regex(/^[a-zA-Z0-9._]+$/)).min(1, "Pelo menos um username é obrigatório").max(50, "Máximo de 50 usernames por lote"),
  personaAlvo: z.enum(["curioso", "prospecto", "cliente", "influenciador", "nenhuma"]).optional(),
  briefing: z.string().min(10, "Briefing é obrigatório e deve ter pelo menos 10 caracteres"),
});

export type AnalyzeBatchRequest = z.infer<typeof analyzeBatchRequestSchema>;

export const batchAnalysisItemSchema = z.object({
  username: z.string(),
  success: z.boolean(),
  data: analysisResultSchema.optional(),
  error: z.string().optional(),
});

export type BatchAnalysisItem = z.infer<typeof batchAnalysisItemSchema>;

export const analyzeBatchResponseSchema = z.object({
  success: z.boolean(),
  total: z.number(),
  completed: z.number(),
  failed: z.number(),
  results: z.array(batchAnalysisItemSchema),
});

export type AnalyzeBatchResponse = z.infer<typeof analyzeBatchResponseSchema>;

// Database Tables

// Analysis History Table
export const analysisHistory = pgTable("analysis_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: varchar("username", { length: 255 }).notNull(),
  profileData: jsonb("profile_data").notNull(),
  analysisData: jsonb("analysis_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnalysisHistorySchema = createInsertSchema(analysisHistory, {
  profileData: z.any(),
  analysisData: z.any(),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalysisHistory = z.infer<typeof insertAnalysisHistorySchema>;
export type AnalysisHistory = typeof analysisHistory.$inferSelect;

// Profile Cache Table
export const profileCache = pgTable("profile_cache", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  cachedData: jsonb("cached_data").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProfileCacheSchema = createInsertSchema(profileCache, {
  cachedData: z.any(),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertProfileCache = z.infer<typeof insertProfileCacheSchema>;
export type ProfileCache = typeof profileCache.$inferSelect;
