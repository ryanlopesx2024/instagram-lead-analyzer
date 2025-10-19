import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SearchSection } from "@/components/search-section";
import { ProfileHeader } from "@/components/profile-header";
import { StatsCards } from "@/components/stats-cards";
import { PostsGrid } from "@/components/posts-grid";
import { AIAnalysisPanel } from "@/components/ai-analysis-panel";
import { PredictiveMetrics } from "@/components/predictive-metrics";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorDisplay } from "@/components/error-display";
import { HistoryPanel } from "@/components/history-panel";
import { AnalysisFiltersComponent } from "@/components/analysis-filters";
import QualificationReport from "@/components/qualification-report";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { AnalysisResult, AnalyzeProfileRequest, AnalysisFilters } from "@shared/schema";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [lastUsername, setLastUsername] = useState<string>("");
  const [lastPersonaAlvo, setLastPersonaAlvo] = useState<string | undefined>(undefined);
  const [lastBriefing, setLastBriefing] = useState<string | undefined>(undefined);
  const [fromCache, setFromCache] = useState(false);
  const [filters, setFilters] = useState<AnalysisFilters>({
    dateRange: "all",
    minEngagement: 0,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: AnalyzeProfileRequest) => {
      const response = await apiRequest("POST", "/api/analyze-profile", data);
      const json = await response.json();
      
      // Check for HTTP errors or API-level errors
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Erro ao analisar perfil. Tente novamente.");
      }
      
      return json;
    },
    onSuccess: (data: any) => {
      if (data.success && data.data) {
        setResult(data.data);
        setFromCache(data.fromCache || false);
      }
    },
  });

  const handleSearch = (username: string, personaAlvo?: string, briefing?: string) => {
    if (!briefing || briefing.trim().length < 10) {
      console.error("Briefing é obrigatório");
      return;
    }
    setResult(null);
    setFromCache(false);
    setLastUsername(username);
    setLastPersonaAlvo(personaAlvo);
    setLastBriefing(briefing);
    analyzeMutation.mutate({ 
      username, 
      filters,
      personaAlvo: personaAlvo as any,
      briefing: briefing
    });
  };

  const handleApplyFilters = () => {
    if (lastUsername && lastBriefing) {
      handleSearch(lastUsername, lastPersonaAlvo, lastBriefing);
    }
  };

  const handleSelectHistory = async (id: number) => {
    try {
      const response = await apiRequest("GET", `/api/history/${id}`, null);
      const json = await response.json();
      
      if (json.success && json.data) {
        setResult(json.data);
        setFromCache(true);
        setLastUsername(json.data.profile.username);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const handleRetry = () => {
    if (lastUsername && lastBriefing) {
      handleSearch(lastUsername, lastPersonaAlvo, lastBriefing);
    }
  };

  return (
    <div className="min-h-screen">
      <SearchSection onSearch={handleSearch} isLoading={analyzeMutation.isPending} />

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {lastUsername && (
              <AnalysisFiltersComponent
                filters={filters}
                onFiltersChange={setFilters}
                onApply={handleApplyFilters}
              />
            )}

            {analyzeMutation.isPending && <LoadingSkeleton />}

            {analyzeMutation.isError && (
              <ErrorDisplay
                message={
                  analyzeMutation.error instanceof Error
                    ? analyzeMutation.error.message
                    : "Não foi possível analisar o perfil. Verifique se o username está correto e tente novamente."
                }
                onRetry={handleRetry}
              />
            )}

            {result && !analyzeMutation.isPending && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-2xl font-semibold">Resultado da Análise</h2>
                  {fromCache && (
                    <Badge variant="secondary" className="gap-2">
                      <Clock className="w-4 h-4" />
                      Dados em Cache
                    </Badge>
                  )}
                </div>

                <ProfileHeader profile={result.profile} />

                <StatsCards
                  followers={result.profile.followers}
                  following={result.profile.following}
                  postsCount={result.profile.postsCount}
                />

                <PredictiveMetrics analysis={result.analysis} />

                <QualificationReport analysis={result.analysis} profile={result.profile} />

                {result.profile.posts && result.profile.posts.length > 0 && (
                  <PostsGrid posts={result.profile.posts} />
                )}

                <AIAnalysisPanel analysis={result.analysis} />
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <HistoryPanel onSelectHistory={handleSelectHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
