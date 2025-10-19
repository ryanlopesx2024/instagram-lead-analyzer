import { Sparkles, Lightbulb, Target, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AIAnalysis } from "@shared/schema";

interface AIAnalysisPanelProps {
  analysis: AIAnalysis;
}

export function AIAnalysisPanel({ analysis }: AIAnalysisPanelProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5" data-testid="card-ai-analysis">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Análise com IA</h3>
              <p className="text-sm text-muted-foreground">Gerado por Gemini AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span data-testid="text-analyzed-at">{formatDate(analysis.analyzedAt)}</span>
          </div>
        </div>

        {analysis.summary && (
          <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
            <p className="text-base leading-relaxed" data-testid="text-summary">
              {analysis.summary}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {analysis.keyInsights && analysis.keyInsights.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-chart-2" />
              <h4 className="font-semibold">Insights Principais</h4>
            </div>
            <ul className="space-y-2">
              {analysis.keyInsights.map((insight, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover-elevate"
                  data-testid={`text-insight-${index}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-chart-2 mt-2 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.contentThemes && analysis.contentThemes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-chart-3" />
              <h4 className="font-semibold">Temas de Conteúdo</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.contentThemes.map((theme, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-sm"
                  data-testid={`badge-theme-${index}`}
                >
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-chart-4" />
              <h4 className="font-semibold">Recomendações</h4>
            </div>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover-elevate"
                  data-testid={`text-recommendation-${index}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-chart-4 mt-2 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.audienceProfile && (
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <h4 className="font-semibold text-sm">Perfil de Audiência</h4>
            <p className="text-sm text-muted-foreground" data-testid="text-audience-profile">
              {analysis.audienceProfile}
            </p>
          </div>
        )}

        {analysis.engagementPattern && (
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <h4 className="font-semibold text-sm">Padrão de Engajamento</h4>
            <p className="text-sm text-muted-foreground" data-testid="text-engagement-pattern">
              {analysis.engagementPattern}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
