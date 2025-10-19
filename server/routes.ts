import type { Express } from "express";
import { createServer, type Server } from "http";
import { analyzeProfileRequestSchema, analyzeBatchRequestSchema, type BatchAnalysisItem } from "@shared/schema";
import { scrapeInstagramProfile } from "./instagram-scraper";
import { analyzeInstagramProfile, extractTextFromImage } from "./gemini";
import { storage } from "./storage";
import { applyFilters } from "./filter-utils";

// Helper function to detect demo data
function isDemoData(profile: any): boolean {
  // Demo data uses ui-avatars.com for profile pictures
  return profile.profilePicUrl?.includes('ui-avatars.com');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze Instagram Profile endpoint
  app.post("/api/analyze-profile", async (req, res) => {
    try {
      // Check if Gemini API key is configured
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          success: false,
          error: "Configuração inválida: GEMINI_API_KEY não está definida. Configure a chave da API do Gemini nas variáveis de ambiente.",
        });
      }

      // Validate request
      const validationResult = analyzeProfileRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: "Username inválido. Use apenas letras, números, pontos e underscores.",
        });
      }

      const { username, filters, personaAlvo, briefing } = validationResult.data;
      
      // Log filters, persona and briefing if provided
      if (filters) {
        console.log("Applying filters:", filters);
      }
      if (personaAlvo) {
        console.log("Persona alvo:", personaAlvo);
      }
      if (briefing) {
        console.log("Briefing recebido:", briefing.substring(0, 100) + (briefing.length > 100 ? "..." : ""));
      }

      // Step 1: Check cache first
      console.log(`Checking cache for @${username}`);
      const cached = await storage.getCachedProfile(username);
      
      let profile, posts;
      let fromCache = false;

      if (cached) {
        console.log(`Using cached data for @${username}`);
        const cachedResult = cached.cachedData as any;
        profile = cachedResult.profile;
        posts = cachedResult.posts;
        fromCache = true;
      } else {
        // Step 2: Scrape Instagram profile
        console.log(`Scraping profile: @${username}`);
        const scrapedData = await scrapeInstagramProfile(username);
        profile = scrapedData.profile;
        posts = scrapedData.posts;
      }

      // Step 2: Apply filters to posts if provided
      let filteredPosts = posts;
      if (filters) {
        console.log(`Filtering posts with: ${JSON.stringify(filters)}`);
        filteredPosts = applyFilters(posts, filters);
        console.log(`Posts after filtering: ${filteredPosts.length} (originally: ${posts.length})`);
      }

      // Step 3: Extract text from post images using OCR
      // LIMIT to 3 posts to avoid Gemini quota exhaustion (free tier: 10 req/min)
      console.log("Extracting text from images (limited to 3 posts)...");
      const postsWithOCR = await Promise.all(
        filteredPosts.map(async (post: any, index: number) => {
          try {
            // Only process first 3 posts to save quota for main analysis
            if (index < 3) {
              const ocrText = await extractTextFromImage(post.imageUrl);
              return { ...post, ocrText };
            }
            return post;
          } catch (error) {
            console.error("Error extracting text from image:", error);
            return post;
          }
        })
      );

      // Update profile with posts including OCR
      profile.posts = postsWithOCR;

      // Step 4: Analyze profile with Gemini AI
      console.log("Generating AI analysis...");
      const analysis = await analyzeInstagramProfile(profile, postsWithOCR, personaAlvo, briefing);

      // Step 5: Save to cache if not from cache (save UNFILTERED posts)
      // Only cache REAL Instagram data, not demo data
      if (!fromCache && !isDemoData(profile)) {
        console.log(`Caching profile data for @${username}`);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour cache
        
        // Cache the original posts WITH OCR (limited), not the filtered ones
        // This allows different filter combinations on cached data
        // LIMIT to 3 posts to avoid quota exhaustion
        const allPostsWithOCR = await Promise.all(
          posts.map(async (post: any, index: number) => {
            try {
              // Only process first 3 posts to save quota
              if (index < 3) {
                const ocrText = await extractTextFromImage(post.imageUrl);
                return { ...post, ocrText };
              }
              return post;
            } catch (error) {
              console.error("Error extracting text from image:", error);
              return post;
            }
          })
        );
        
        await storage.setCachedProfile({
          username,
          cachedData: { profile, posts: allPostsWithOCR },
          expiresAt,
        });
      } else if (isDemoData(profile)) {
        console.log(`Skipping cache for demo data: @${username}`);
      }

      // Step 6: Save analysis to history
      console.log("Saving analysis to history...");
      await storage.saveAnalysis({
        username,
        profileData: profile,
        analysisData: analysis,
      });

      // Return complete analysis result
      return res.json({
        success: true,
        data: {
          profile,
          analysis,
        },
        fromCache,
      });
    } catch (error) {
      console.error("Error analyzing profile:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erro ao analisar perfil. Tente novamente.";

      return res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  });

  // Get analysis history
  app.get("/api/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getRecentAnalyses(limit);
      
      return res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error("Error fetching history:", error);
      return res.status(500).json({
        success: false,
        error: "Erro ao buscar histórico",
      });
    }
  });

  // Batch analyze profiles endpoint
  app.post("/api/analyze-batch", async (req, res) => {
    try {
      // Check if Gemini API key is configured
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          success: false,
          error: "Configuração inválida: GEMINI_API_KEY não está definida.",
        });
      }

      // Validate request
      const validationResult = analyzeBatchRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: validationResult.error.errors[0].message,
        });
      }

      const { usernames, personaAlvo, briefing } = validationResult.data;
      console.log(`\n=== Batch Analysis Started for ${usernames.length} profiles ===`);
      console.log("Briefing:", briefing.substring(0, 100) + (briefing.length > 100 ? "..." : ""));
      
      const results: BatchAnalysisItem[] = [];
      let completed = 0;
      let failed = 0;

      // Process each username sequentially with delay to avoid rate limiting
      for (let i = 0; i < usernames.length; i++) {
        const username = usernames[i];
        console.log(`\n[${i + 1}/${usernames.length}] Processing @${username}...`);

        try {
          // Check cache first
          const cached = await storage.getCachedProfile(username);
          
          let profile, posts;
          if (cached) {
            console.log(`  ✓ Using cached data`);
            const cachedResult = cached.cachedData as any;
            profile = cachedResult.profile;
            posts = cachedResult.posts;
          } else {
            // Scrape profile
            const scrapedData = await scrapeInstagramProfile(username);
            profile = scrapedData.profile;
            posts = scrapedData.posts;
          }

          // Extract text from images (limited to 3 posts)
          const postsForOCR = posts.slice(0, 3);
          console.log(`  Extracting text from ${postsForOCR.length} post images...`);
          
          for (const post of postsForOCR) {
            if (!isDemoData(profile)) {
              try {
                const extractedText = await extractTextFromImage(post.imageUrl);
                post.extractedText = extractedText;
              } catch (error) {
                console.error(`  ⚠ OCR failed for post, continuing without it`);
                post.extractedText = "";
              }
            } else {
              post.extractedText = "";
            }
          }

          // Generate AI analysis
          console.log(`  Generating AI analysis...`);
          const analysis = await analyzeInstagramProfile(
            profile,
            posts,
            personaAlvo,
            briefing
          );

          // Save to history (only if not demo data)
          if (!isDemoData(profile)) {
            await storage.saveAnalysis({
              username,
              profileData: profile,
              analysisData: analysis,
            });

            // Cache the profile if not already cached
            if (!cached) {
              const expiresAt = new Date();
              expiresAt.setHours(expiresAt.getHours() + 24); // Cache expires in 24 hours
              
              await storage.setCachedProfile({
                username,
                cachedData: { profile, posts },
                expiresAt,
              });
            }
          }

          results.push({
            username,
            success: true,
            data: {
              profile: {
                ...profile,
                posts,
              },
              analysis,
            },
          });
          completed++;
          console.log(`  ✓ Success (${completed}/${usernames.length})`);

        } catch (error: any) {
          console.error(`  ✗ Error:`, error.message);
          results.push({
            username,
            success: false,
            error: error.message || "Erro ao processar perfil",
          });
          failed++;
        }

        // Add delay between requests to avoid rate limiting (except for last item)
        if (i < usernames.length - 1) {
          const delay = 2000; // 2 seconds between requests
          console.log(`  Waiting ${delay}ms before next profile...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      console.log(`\n=== Batch Analysis Completed ===`);
      console.log(`Total: ${usernames.length}, Completed: ${completed}, Failed: ${failed}`);

      return res.json({
        success: true,
        total: usernames.length,
        completed,
        failed,
        results,
      });

    } catch (error: any) {
      console.error("Error in batch analysis:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao processar análise em lote",
      });
    }
  });

  // Get specific analysis by ID
  app.get("/api/history/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getAnalysisById(id);
      
      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: "Análise não encontrada",
        });
      }

      return res.json({
        success: true,
        data: {
          profile: analysis.profileData,
          analysis: analysis.analysisData,
        },
      });
    } catch (error) {
      console.error("Error fetching analysis:", error);
      return res.status(500).json({
        success: false,
        error: "Erro ao buscar análise",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
