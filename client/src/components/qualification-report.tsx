import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Target,
  Brain,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Trophy,
  MapPin,
  Briefcase,
  Calendar,
  BarChart3,
} from "lucide-react";
import type { AIAnalysis, InstagramProfile } from "@shared/schema";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface QualificationReportProps {
  analysis: AIAnalysis;
  profile: InstagramProfile;
}

export default function QualificationReport({ analysis, profile }: QualificationReportProps) {
  const { toast } = useToast();

  if (!analysis.analise_compatibilidade || !analysis.resumo_rapido) {
    return null;
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    if (score >= 40) return "bg-orange-100 dark:bg-orange-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  const getNivelBadgeVariant = (nivel: string) => {
    if (nivel === "Alta") return "default";
    if (nivel === "Média") return "secondary";
    return "destructive";
  };

  const getStatusIcon = (status: string) => {
    if (status === "Sim" || status === "Presente" || status === "Alta") {
      return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
    }
    if (status === "Não" || status === "Baixa") {
      return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
  };

  return (
    <div className="space-y-8">
      {/* 1. Resumo Rápido - Dashboard Hero */}
      <Card className={`${getScoreBgColor(analysis.resumo_rapido.score)} border-2`} data-testid="card-resumo-rapido">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-3xl flex items-center gap-2">
                <Trophy className={`h-8 w-8 ${getScoreColor(analysis.resumo_rapido.score)}`} />
                {analysis.resumo_rapido.nome}
              </CardTitle>
              <CardDescription className="text-lg">
                Score de Qualificação: <span className={`font-bold ${getScoreColor(analysis.resumo_rapido.score)}`}>
                  {analysis.resumo_rapido.score}/100
                </span>
              </CardDescription>
            </div>
            <Badge variant={getNivelBadgeVariant(analysis.prontidao_conversao?.nivel || "Média")} className="text-lg px-4 py-2">
              {analysis.resumo_rapido.classificacao}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1" data-testid="resumo-nivel-consciencia">
              <p className="text-sm text-muted-foreground">Nível de Consciência</p>
              <p className="font-semibold">{analysis.resumo_rapido.nivel_consciencia}</p>
            </div>
            <div className="space-y-1" data-testid="resumo-emocao">
              <p className="text-sm text-muted-foreground">Emoção Predominante</p>
              <p className="font-semibold">{analysis.resumo_rapido.emocao_predominante}</p>
            </div>
            <div className="space-y-1" data-testid="resumo-motivador">
              <p className="text-sm text-muted-foreground">Motivador de Compra</p>
              <p className="font-semibold">{analysis.resumo_rapido.motivador_compra}</p>
            </div>
            <div className="space-y-1" data-testid="resumo-abordagem">
              <p className="text-sm text-muted-foreground">Melhor Abordagem</p>
              <p className="font-semibold">{analysis.resumo_rapido.melhor_abordagem}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="bg-background rounded-lg p-4" data-testid="resumo-acao-imediata">
            <p className="text-sm text-muted-foreground mb-1">Ação Imediata</p>
            <p className="text-lg font-semibold text-primary">{analysis.resumo_rapido.acao_imediata}</p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Lead Scoring - Consolidação de Todas as Pontuações */}
      <Card data-testid="card-lead-scoring">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Lead Scoring - Pontuação Consolidada
          </CardTitle>
          <CardDescription>
            Todas as métricas de qualificação reunidas em um único painel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Final de Compatibilidade */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Score de Compatibilidade</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${getScoreColor(analysis.analise_compatibilidade.score_final)}`}>
                  {analysis.analise_compatibilidade.score_final}/100
                </span>
                <Badge variant="outline" className={getScoreColor(analysis.analise_compatibilidade.score_final)}>
                  {analysis.analise_compatibilidade.classificacao}
                </Badge>
              </div>
            </div>
            <Progress value={analysis.analise_compatibilidade.score_final} className="h-3" />
          </div>

          <Separator />

          {/* Autoridade */}
          {typeof analysis.autoridade === 'number' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Autoridade</span>
                </div>
                <span className={`text-xl font-bold ${getScoreColor(analysis.autoridade)}`}>
                  {analysis.autoridade}/100
                </span>
              </div>
              <Progress value={analysis.autoridade} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Baseado em engajamento (60%) e consistência de conteúdo (40%)
              </p>
            </div>
          )}

          {/* Afinidade de Tema */}
          {typeof analysis.afinidade_de_tema === 'number' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Afinidade de Tema</span>
                </div>
                <span className={`text-xl font-bold ${getScoreColor(analysis.afinidade_de_tema)}`}>
                  {analysis.afinidade_de_tema}/100
                </span>
              </div>
              <Progress value={analysis.afinidade_de_tema} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Alinhamento do conteúdo com o briefing fornecido
              </p>
            </div>
          )}

          {/* Lead Quality Score (LQS) */}
          {analysis.lead_quality_score && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Lead Quality Score (LQS)</span>
                </div>
                <span className={`text-xl font-bold ${getScoreColor(analysis.lead_quality_score.score)}`}>
                  {analysis.lead_quality_score.score}/100
                </span>
              </div>
              <Progress value={analysis.lead_quality_score.score} className="h-3" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Intenção: </span>
                  <span className="font-semibold">{analysis.lead_quality_score.intencao}/100</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Prova Social: </span>
                  <span className="font-semibold">{analysis.lead_quality_score.prova_social}/100</span>
                </div>
              </div>
            </div>
          )}

          {/* Prontidão para Conversão */}
          {analysis.prontidao_conversao && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Prontidão para Conversão</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${getScoreColor(analysis.prontidao_conversao.score)}`}>
                    {analysis.prontidao_conversao.score}/100
                  </span>
                  <Badge variant={getNivelBadgeVariant(analysis.prontidao_conversao.nivel)}>
                    {analysis.prontidao_conversao.nivel}
                  </Badge>
                </div>
              </div>
              <Progress value={analysis.prontidao_conversao.score} className="h-3" />
              <p className="text-sm text-muted-foreground">{analysis.prontidao_conversao.descricao}</p>
            </div>
          )}

          {/* Resumo Visual */}
          <Separator />
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">Resumo de Qualificação</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Classificação Final:</span>
                <Badge variant="outline" className="ml-2">
                  {analysis.resumo_rapido.classificacao}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Persona:</span>
                <Badge variant="secondary" className="ml-2">
                  {analysis.persona || "N/A"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Identificação do Perfil */}
      {analysis.identificacao_perfil && (
        <Card data-testid="card-identificacao-perfil">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Identificação do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Nome Completo</p>
                  <p className="font-medium" data-testid="text-nome-completo">
                    {analysis.identificacao_perfil.nome_completo || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="font-medium" data-testid="text-localizacao">
                    {analysis.identificacao_perfil.localizacao || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Idade Aparente</p>
                  <p className="font-medium" data-testid="text-idade-aparente">
                    {analysis.identificacao_perfil.idade_aparente || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Tempo de Formação Estimado</p>
                  <p className="font-medium" data-testid="text-tempo-formacao">
                    {analysis.identificacao_perfil.tempo_formacao_estimado || "N/A"}
                  </p>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Situação Profissional</p>
                <p className="font-medium" data-testid="text-situacao-profissional">
                  {analysis.identificacao_perfil.situacao_profissional || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Análise Geral de Compatibilidade */}
      {analysis.analise_compatibilidade && (
        <Card data-testid="card-analise-compatibilidade">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Análise Geral de Compatibilidade
              </CardTitle>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Score Final</p>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.analise_compatibilidade.score_final)}`} data-testid="text-score-final">
                  {analysis.analise_compatibilidade.score_final}/100
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.analise_compatibilidade?.categorias.map((cat, idx) => (
                <div key={idx} className="space-y-2" data-testid={`categoria-${idx}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{cat.categoria}</span>
                    <Badge variant="outline" className={getScoreColor(cat.pontuacao * 10)}>
                      {cat.pontuacao}/10
                    </Badge>
                  </div>
                  <Progress value={cat.pontuacao * 10} className="h-2" />
                  <p className="text-sm text-muted-foreground">{cat.observacoes}</p>
                  {idx < (analysis.analise_compatibilidade?.categorias.length || 0) - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. Diagnóstico Emocional e Profissional */}
      {analysis.diagnostico_emocional && (
        <Card data-testid="card-diagnostico-emocional">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Diagnóstico Emocional e Profissional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Estado Emocional Atual
              </p>
              <div className="flex flex-wrap gap-2" data-testid="estados-emocionais">
                {analysis.diagnostico_emocional.estado_emocional_atual.map((estado, idx) => (
                  <Badge key={idx} variant="secondary">
                    {estado}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="font-semibold mb-2">Emoção Aspiracional Dominante</p>
              <p className="text-muted-foreground" data-testid="text-emocao-aspiracional">
                {analysis.diagnostico_emocional.emocao_aspiracional_dominante}
              </p>
            </div>

            <Separator />

            <div>
              <p className="font-semibold mb-2">Discurso Predominante</p>
              <div className="space-y-2" data-testid="discurso-predominante">
                {analysis.diagnostico_emocional.discurso_predominante.map((frase, idx) => (
                  <div key={idx} className="bg-muted rounded-lg p-3 italic">
                    "{frase}"
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="font-semibold mb-2">Nível de Consciência</p>
              <p className="text-muted-foreground" data-testid="text-nivel-consciencia">
                {analysis.diagnostico_emocional.nivel_consciencia}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. Sinais Técnicos e de Mercado */}
      {analysis.sinais_tecnicos && (
        <Card data-testid="card-sinais-tecnicos">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sinais Técnicos e de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.sinais_tecnicos.indicadores.map((ind, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border" data-testid={`indicador-${idx}`}>
                  {getStatusIcon(ind.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{ind.indicador}</p>
                      <Badge variant="outline">{ind.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{ind.interpretacao}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7. Nível de Prontidão para Conversão */}
      {analysis.prontidao_conversao && (
        <Card data-testid="card-prontidao-conversao">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Nível de Prontidão para Conversão
              </CardTitle>
              <Badge variant={getNivelBadgeVariant(analysis.prontidao_conversao.nivel)} className="text-base px-4 py-1">
                {analysis.prontidao_conversao.nivel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Descrição</p>
              <p data-testid="text-prontidao-descricao">{analysis.prontidao_conversao.descricao}</p>
            </div>

            <Separator />

            <div className="bg-primary/10 rounded-lg p-4">
              <p className="font-semibold mb-2">Ação Recomendada</p>
              <p className="text-primary" data-testid="text-acao-recomendada">
                {analysis.prontidao_conversao.acao_recomendada}
              </p>
            </div>

            <div>
              <p className="font-semibold mb-2">Ênfase na Abordagem</p>
              <p className="text-muted-foreground" data-testid="text-enfase-abordagem">
                {analysis.prontidao_conversao.enfase_abordagem}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 8. Insights Estratégicos */}
      {analysis.insights_estrategicos && (
        <Card data-testid="card-insights-estrategicos">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Insights Estratégicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">Mensagem de Conexão Ideal</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(analysis.insights_estrategicos!.mensagem_conexao_ideal, "Mensagem")}
                  data-testid="button-copy-mensagem"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="italic" data-testid="text-mensagem-conexao">
                  "{analysis.insights_estrategicos.mensagem_conexao_ideal}"
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="font-semibold mb-2">Tom Ideal de Abordagem</p>
              <p className="text-muted-foreground" data-testid="text-tom-abordagem">
                {analysis.insights_estrategicos.tom_ideal_abordagem}
              </p>
            </div>

            <Separator />

            <div>
              <p className="font-semibold mb-2">Proposta que Mais Converte</p>
              <p className="text-muted-foreground" data-testid="text-proposta-converte">
                {analysis.insights_estrategicos.proposta_mais_converte}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
