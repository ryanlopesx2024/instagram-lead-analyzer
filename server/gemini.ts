import { GoogleGenAI } from "@google/genai";
import type { InstagramProfile, AIAnalysis, InstagramPost } from "@shared/schema";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// Validate Gemini API Key is configured
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY não está configurada. Configure a chave nas variáveis de ambiente.");
}

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isRetryableError = error?.message?.includes("429") || error?.message?.includes("503") || error?.message?.includes("overloaded");
      
      if (isLastAttempt || !isRetryableError) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`[Gemini] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

// Fallback analysis when Gemini fails
function generateFallbackAnalysis(profile: InstagramProfile, posts: InstagramPost[]): AIAnalysis {
  const avgLikes = posts.length > 0 
    ? Math.round(posts.reduce((sum, p) => sum + (p.likes || 0), 0) / posts.length)
    : 0;
  
  const engagementRate = profile.followers ? (avgLikes / profile.followers) * 100 : 0;
  
  // Calculate basic metrics for fallback
  const autoridade = Math.min(100, Math.round(engagementRate * 10 + (posts.length > 0 ? 20 : 0)));
  const afinidadeTema = 50; // neutral when AI unavailable
  const riscoBotPercentage = engagementRate < 0.5 ? "75%" : engagementRate < 2 ? "30%" : "10%";
  
  const provaSocial = Math.min(100, Math.round((profile.followers || 0) / 1000));
  const intencao = profile.bio?.length ? 40 : 20; // basic heuristic
  const lqsScore = Math.round((intencao * 0.6) + (provaSocial * 0.4));
  
  let persona: "curioso" | "prospecto" | "cliente" | "influenciador" = "curioso";
  if (provaSocial > 70) persona = "influenciador";
  else if (intencao > 70) persona = "cliente";
  else if (intencao >= 40 && provaSocial >= 40) persona = "prospecto";

  return {
    summary: `Perfil @${profile.username} com ${profile.followers?.toLocaleString() || "N/A"} seguidores. A análise detalhada com IA está temporariamente indisponível, mas você pode ver os dados básicos do perfil e posts acima.`,
    keyInsights: [
      `Perfil possui ${profile.postsCount || 0} posts totais`,
      `Média de ${avgLikes.toLocaleString()} curtidas por post`,
      `Taxa de engajamento baseada em ${posts.length} posts recentes`,
    ],
    contentThemes: posts
      .filter(p => p.caption)
      .slice(0, 3)
      .map(p => p.caption!.substring(0, 50) + "..."),
    audienceProfile: `Audiência estimada com base em ${profile.followers?.toLocaleString() || "N/A"} seguidores`,
    engagementPattern: `Padrão de engajamento observado em ${posts.length} posts mais recentes`,
    recommendations: [
      "Análise completa com IA temporariamente indisponível",
      "Dados básicos do perfil disponíveis acima",
      "Tente novamente em alguns instantes",
    ],
    analyzedAt: new Date().toISOString(),
    
    // Fallback predictive metrics
    autoridade,
    afinidade_de_tema: afinidadeTema,
    risco_bot: riscoBotPercentage,
    lead_quality_score: {
      score: lqsScore,
      intencao,
      prova_social: provaSocial,
    },
    persona,
    insights: {
      por_que_esta_persona: "Classificação baseada em métricas básicas do perfil (IA indisponível).",
      como_elevar_lqs: "Análise detalhada indisponível. Tente novamente quando o serviço de IA estiver disponível.",
    },
  };
}

export async function analyzeInstagramProfile(
  profile: InstagramProfile,
  posts: InstagramPost[],
  personaAlvo?: string,
  briefing?: string
): Promise<AIAnalysis> {
  if (!briefing || briefing.trim().length < 10) {
    throw new Error("Briefing é obrigatório para análise do perfil");
  }
  try {
    console.log(`[Gemini] Starting analysis for @${profile.username}`);
    
    const briefingContext = `\n\n===== BRIEFING DO USUÁRIO =====
O usuário forneceu o seguinte briefing sobre o que está buscando:

${briefing}

===== FIM DO BRIEFING =====

CRITICAL: Use este briefing como guia principal para sua análise. Avalie o perfil do Instagram especificamente em relação aos critérios, objetivos e características descritos no briefing acima.`;

    const personaContext = personaAlvo 
      ? `\n\nAdicional: O usuário está buscando especificamente perfis com a persona "${personaAlvo}". 
Considere isso em conjunto com o briefing fornecido.`
      : '';

    const systemPrompt = `Você é um especialista em análise de redes sociais, marketing digital e qualificação de leads.
Analise o perfil do Instagram fornecido e gere insights valiosos incluindo métricas preditivas.${briefingContext}${personaContext}

CRITÉRIOS PARA MÉTRICAS PREDITIVAS:

1. AUTORIDADE (0-100):
   - 60% baseado no engajamento médio (likes + comentários / seguidores)
   - 40% baseado na frequência e consistência de publicações

2. AFINIDADE DE TEMA (0-100):
   - Compare palavras-chave da bio com as legendas dos posts
   - Quanto maior a repetição temática, maior a afinidade
   - Considere consistência de hashtags e temas recorrentes

3. RISCO/BOT:
   - "Alta" se engajamento < 0.5% e posts muito similares
   - "Média" se engajamento entre 0.5% e 2%
   - "Baixa" se engajamento > 2% e conteúdo variado
   - Retorne como percentual (ex: "15%", "45%", "5%")

4. LEAD QUALITY SCORE (LQS):
   - Intenção (0-100): Baseado em bio, call-to-actions, links, menções de produtos/serviços
   - Prova Social (0-100): Baseado em seguidores, engajamento, frequência de posts
   - Score final: (Intenção × 0.6) + (Prova Social × 0.4)

5. PERSONA:
   - "curioso": baixa intenção (<40) e baixa prova social (<40)
   - "prospecto": intenção média (40-70) e prova social média (40-70)
   - "cliente": alta intenção (>70)
   - "influenciador": alta prova social (>70)

Forneça uma análise profissional e estruturada em português.`;

    const profileData = `
Username: @${profile.username}
Nome: ${profile.fullName || "N/A"}
Bio: ${profile.bio || "Sem bio"}
Seguidores: ${profile.followers || "N/A"}
Seguindo: ${profile.following || "N/A"}
Posts: ${profile.postsCount || "N/A"}
Tipo: ${profile.isPrivate ? "Privado" : "Público"}

Posts recentes (${posts.length}):
${posts.map((post, i) => `
Post ${i + 1}:
- Legenda: ${post.caption || "Sem legenda"}
- Curtidas: ${post.likes || "N/A"}
- Data: ${post.timestamp || "N/A"}
${post.ocrText ? `- Texto extraído da imagem: ${post.ocrText}` : ""}
`).join("\n")}
`;

    const analysisInstructions = `\n\n**ATENÇÃO**: Avalie este perfil em relação ao briefing fornecido no system prompt. 
Suas análises e recomendações devem ser direcionadas aos objetivos e critérios descritos no briefing.${personaAlvo ? ` O usuário também especificou interesse na persona "${personaAlvo}".` : ''}`;

    const prompt = `${profileData}${analysisInstructions}

Com base nas informações acima, forneça um RELATÓRIO COMPLETO DE QUALIFICAÇÃO incluindo todas as seguintes seções:

1. IDENTIFICAÇÃO DO PERFIL:
   - nome_completo (se detectável)
   - localizacao (se detectável na bio/posts)
   - idade_aparente (estimativa baseada em fotos/conteúdo, ex: "25-30 anos")
   - tempo_formacao_estimado (se aplicável ao nicho, ex: "5 anos")
   - situacao_profissional (ex: "Advogado atuante, em busca de reposicionamento")

2. ANÁLISE GERAL DE COMPATIBILIDADE:
   Crie uma tabela de categorias avaliadas em relação ao briefing fornecido.
   Para cada categoria, atribua pontuação 0-10 e observações específicas.
   Exemplos de categorias (adapte ao briefing):
   - "Aderência ao nicho" (se briefing menciona nicho específico)
   - "Tom emocional compatível" (se briefing menciona persona/dor)
   - "Bio e destaques"
   - "Linguagem e conteúdo"
   - "Engajamento e intenção de crescimento"
   - "Padrões visuais"
   - "Sinais negativos detectados" (quanto menor, melhor)
   
   score_final: média ponderada de 0-100
   classificacao: "Altamente Qualificado" (80-100), "Qualificado" (60-79), "Parcialmente Qualificado" (40-59), "Não Qualificado" (<40)

3. DIAGNÓSTICO EMOCIONAL E PROFISSIONAL:
   - estado_emocional_atual: array de 2-4 estados detectados (ex: "insegurança", "ansiedade financeira leve")
   - emocao_aspiracional_dominante: 1-2 frases sobre o que busca (ex: "Busca de confiança e domínio técnico")
   - discurso_predominante: array de 2-3 citações/padrões do perfil
   - nivel_consciencia: descrição completa (ex: "Alta. Já sabe o que é previdenciário, entende a dor e está em transição.")

4. SINAIS TÉCNICOS E DE MERCADO:
   Array de indicadores relevantes ao briefing. Exemplos (adapte):
   - indicador: "Bio com palavras-chave do nicho"
   - status: "Presente" | "Sim" | "Não" | "Parcial" | "Média" | "Alta" | "Baixa"
   - interpretacao: Breve interpretação
   
   Incluir 5-7 indicadores relevantes.

5. NÍVEL DE PRONTIDÃO PARA CONVERSÃO:
   - nivel: "Alta" | "Média" | "Baixa" | "Não qualificado"
   - score: mesmo da analise_compatibilidade
   - descricao: Uma frase descrevendo o estado
   - acao_recomendada: Ação específica (ex: "Ofertar mentoria/treinamento direto")
   - enfase_abordagem: Aspectos a enfatizar na abordagem

6. INSIGHTS ESTRATÉGICOS:
   - mensagem_conexao_ideal: Mensagem pronta para iniciar contato (2-3 frases)
   - tom_ideal_abordagem: Descrição do tom (ex: "Empático + autoritário")
   - proposta_mais_converte: Descrição da proposta ideal para este perfil

7. RESUMO RÁPIDO (dashboard):
   - nome: Nome completo ou username
   - score: score final 0-100
   - classificacao: mesma da analise_compatibilidade
   - nivel_consciencia: resumo curto (ex: "3/4 (sabe o que quer, busca estrutura)")
   - emocao_predominante: uma palavra/frase curta
   - motivador_compra: uma frase curta
   - melhor_abordagem: uma frase curta
   - acao_imediata: uma frase curta

8. MÉTRICAS PREDITIVAS (mantidas para compatibilidade):
   - autoridade (0-100)
   - afinidade_de_tema (0-100)
   - risco_bot (percentual string)
   - lead_quality_score (score, intencao, prova_social)
   - persona
   - insights (por_que_esta_persona, como_elevar_lqs)

9. ANÁLISE TRADICIONAL (mantida para compatibilidade):
   - summary
   - keyInsights
   - contentThemes
   - audienceProfile
   - engagementPattern
   - recommendations

IMPORTANTE: Todas as análises devem ser ESPECÍFICAS ao briefing fornecido. Use termos e critérios do briefing nas avaliações.`;

    const response = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              // Análise tradicional
              summary: { type: "string" },
              keyInsights: { type: "array", items: { type: "string" } },
              contentThemes: { type: "array", items: { type: "string" } },
              audienceProfile: { type: "string" },
              engagementPattern: { type: "string" },
              recommendations: { type: "array", items: { type: "string" } },
              
              // Métricas preditivas
              autoridade: { type: "number" },
              afinidade_de_tema: { type: "number" },
              risco_bot: { type: "string" },
              lead_quality_score: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  intencao: { type: "number" },
                  prova_social: { type: "number" },
                },
                required: ["score", "intencao", "prova_social"],
              },
              persona: { type: "string", enum: ["curioso", "prospecto", "cliente", "influenciador"] },
              insights: {
                type: "object",
                properties: {
                  por_que_esta_persona: { type: "string" },
                  como_elevar_lqs: { type: "string" },
                },
                required: ["por_que_esta_persona", "como_elevar_lqs"],
              },
              
              // 1. Identificação do Perfil
              identificacao_perfil: {
                type: "object",
                properties: {
                  nome_completo: { type: "string" },
                  localizacao: { type: "string" },
                  idade_aparente: { type: "string" },
                  tempo_formacao_estimado: { type: "string" },
                  situacao_profissional: { type: "string" },
                },
              },
              
              // 2. Análise de Compatibilidade
              analise_compatibilidade: {
                type: "object",
                properties: {
                  categorias: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        categoria: { type: "string" },
                        pontuacao: { type: "number" },
                        observacoes: { type: "string" },
                      },
                      required: ["categoria", "pontuacao", "observacoes"],
                    },
                  },
                  score_final: { type: "number" },
                  classificacao: { type: "string" },
                },
                required: ["categorias", "score_final", "classificacao"],
              },
              
              // 3. Diagnóstico Emocional
              diagnostico_emocional: {
                type: "object",
                properties: {
                  estado_emocional_atual: { type: "array", items: { type: "string" } },
                  emocao_aspiracional_dominante: { type: "string" },
                  discurso_predominante: { type: "array", items: { type: "string" } },
                  nivel_consciencia: { type: "string" },
                },
                required: ["estado_emocional_atual", "emocao_aspiracional_dominante", "discurso_predominante", "nivel_consciencia"],
              },
              
              // 4. Sinais Técnicos
              sinais_tecnicos: {
                type: "object",
                properties: {
                  indicadores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        indicador: { type: "string" },
                        status: { type: "string" },
                        interpretacao: { type: "string" },
                      },
                      required: ["indicador", "status", "interpretacao"],
                    },
                  },
                },
                required: ["indicadores"],
              },
              
              // 5. Prontidão para Conversão
              prontidao_conversao: {
                type: "object",
                properties: {
                  nivel: { type: "string", enum: ["Alta", "Média", "Baixa", "Não qualificado"] },
                  score: { type: "number" },
                  descricao: { type: "string" },
                  acao_recomendada: { type: "string" },
                  enfase_abordagem: { type: "string" },
                },
                required: ["nivel", "score", "descricao", "acao_recomendada", "enfase_abordagem"],
              },
              
              // 6. Insights Estratégicos
              insights_estrategicos: {
                type: "object",
                properties: {
                  mensagem_conexao_ideal: { type: "string" },
                  tom_ideal_abordagem: { type: "string" },
                  proposta_mais_converte: { type: "string" },
                },
                required: ["mensagem_conexao_ideal", "tom_ideal_abordagem", "proposta_mais_converte"],
              },
              
              // 7. Resumo Rápido
              resumo_rapido: {
                type: "object",
                properties: {
                  nome: { type: "string" },
                  score: { type: "number" },
                  classificacao: { type: "string" },
                  nivel_consciencia: { type: "string" },
                  emocao_predominante: { type: "string" },
                  motivador_compra: { type: "string" },
                  melhor_abordagem: { type: "string" },
                  acao_imediata: { type: "string" },
                },
                required: ["nome", "score", "classificacao", "nivel_consciencia", "emocao_predominante", "motivador_compra", "melhor_abordagem", "acao_imediata"],
              },
            },
            required: [
              "summary", "keyInsights", "contentThemes", "autoridade", "afinidade_de_tema", 
              "risco_bot", "lead_quality_score", "persona", "insights",
              "identificacao_perfil", "analise_compatibilidade", "diagnostico_emocional",
              "sinais_tecnicos", "prontidao_conversao", "insights_estrategicos", "resumo_rapido"
            ],
          },
        },
        contents: prompt,
      });
    }, 3, 1000);

    const rawJson = response.text;

    if (rawJson) {
      const analysisData = JSON.parse(rawJson);
      console.log(`[Gemini] Analysis completed successfully for @${profile.username}`);
      console.log(`[Gemini] Response data:`, JSON.stringify(analysisData, null, 2));
      return {
        ...analysisData,
        analyzedAt: new Date().toISOString(),
      };
    } else {
      throw new Error("Empty response from Gemini AI");
    }
  } catch (error: any) {
    console.error("[Gemini] Error analyzing profile:", error?.message || error);
    console.error("[Gemini] Full error:", error);
    
    // Return fallback analysis instead of throwing error
    console.log(`[Gemini] Using fallback analysis for @${profile.username}`);
    return generateFallbackAnalysis(profile, posts);
  }
}

export async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    // Skip OCR for demo images (picsum.photos) to save quota
    if (imageUrl.includes("picsum.photos") || imageUrl.includes("ui-avatars")) {
      return "";
    }

    // Fetch image as base64
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error(`[Gemini OCR] Failed to fetch image: ${response.status}`);
      return "";
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const contents = [
      {
        inlineData: {
          data: base64,
          mimeType: "image/jpeg",
        },
      },
      `Extraia todo o texto visível desta imagem. Se não houver texto, retorne uma descrição breve da imagem.`,
    ];

    const aiResponse = await retryWithBackoff(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });
    }, 2, 500); // Fewer retries for OCR

    return aiResponse.text || "";
  } catch (error: any) {
    console.error("[Gemini OCR] Error:", error?.message || error);
    return ""; // Return empty string instead of error message
  }
}
