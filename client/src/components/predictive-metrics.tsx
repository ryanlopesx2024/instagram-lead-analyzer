import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  ShieldAlert, 
  Award, 
  User, 
  Lightbulb 
} from "lucide-react";
import type { AIAnalysis } from "@shared/schema";

interface PredictiveMetricsProps {
  analysis: AIAnalysis;
}

export function PredictiveMetrics({ analysis }: PredictiveMetricsProps) {
  // Se as métricas preditivas não estão disponíveis, não mostra o componente
  if (!analysis.autoridade && !analysis.lead_quality_score) {
    return null;
  }

  const getPersonaColor = (persona?: string) => {
    switch (persona) {
      case "influenciador":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "cliente":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "prospecto":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "curioso":
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getRiscoBotColor = (risco?: string) => {
    if (!risco) return "text-gray-600";
    const percentage = parseInt(risco.replace("%", ""));
    if (percentage < 20) return "text-green-600 dark:text-green-400";
    if (percentage < 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 dark:text-green-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold">Métricas Preditivas</h3>
      </div>

      {/* Grid de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Autoridade */}
        {analysis.autoridade !== undefined && (
          <Card className="p-4 space-y-3" data-testid="card-autoridade">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Autoridade</p>
              </div>
              <p className={`text-2xl font-bold ${getScoreColor(analysis.autoridade)}`} data-testid="value-autoridade">
                {analysis.autoridade}
              </p>
            </div>
            <Progress value={analysis.autoridade} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Baseado em engajamento e consistência
            </p>
          </Card>
        )}

        {/* Afinidade de Tema */}
        {analysis.afinidade_de_tema !== undefined && (
          <Card className="p-4 space-y-3" data-testid="card-afinidade">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Afinidade</p>
              </div>
              <p className={`text-2xl font-bold ${getScoreColor(analysis.afinidade_de_tema)}`} data-testid="value-afinidade">
                {analysis.afinidade_de_tema}
              </p>
            </div>
            <Progress value={analysis.afinidade_de_tema} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Consistência temática do conteúdo
            </p>
          </Card>
        )}

        {/* Risco Bot */}
        {analysis.risco_bot && (
          <Card className="p-4 space-y-3" data-testid="card-risco-bot">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Risco Bot</p>
              </div>
              <p className={`text-2xl font-bold ${getRiscoBotColor(analysis.risco_bot)}`} data-testid="value-risco-bot">
                {analysis.risco_bot}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Probabilidade de ser automação
            </p>
          </Card>
        )}

        {/* Lead Quality Score */}
        {analysis.lead_quality_score && (
          <Card className="p-4 space-y-3" data-testid="card-lqs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">LQS</p>
              </div>
              <p className={`text-2xl font-bold ${getScoreColor(analysis.lead_quality_score.score)}`} data-testid="value-lqs">
                {analysis.lead_quality_score.score}
              </p>
            </div>
            <Progress value={analysis.lead_quality_score.score} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Intenção: {analysis.lead_quality_score.intencao}</span>
              <span>Prova: {analysis.lead_quality_score.prova_social}</span>
            </div>
          </Card>
        )}
      </div>

      {/* Persona e Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Persona */}
        {analysis.persona && (
          <Card className="p-6 space-y-4" data-testid="card-persona">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Persona</h4>
            </div>
            <Badge 
              className={`text-base px-4 py-2 ${getPersonaColor(analysis.persona)}`}
              data-testid="badge-persona"
            >
              {analysis.persona.charAt(0).toUpperCase() + analysis.persona.slice(1)}
            </Badge>
            {analysis.insights?.por_que_esta_persona && (
              <p className="text-sm text-muted-foreground" data-testid="text-persona-justificativa">
                {analysis.insights.por_que_esta_persona}
              </p>
            )}
          </Card>
        )}

        {/* Insights para elevar LQS */}
        {analysis.insights?.como_elevar_lqs && (
          <Card className="p-6 space-y-4" data-testid="card-insights-lqs">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Como Elevar o LQS</h4>
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-como-elevar-lqs">
              {analysis.insights.como_elevar_lqs}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
