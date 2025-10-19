import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Download, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  BarChart3,
  FileJson,
} from "lucide-react";
import type { AnalyzeBatchResponse, BatchAnalysisItem } from "@shared/schema";

// Função pura para parsing de usernames (fora do componente para evitar TDZ)
function parseUsernames(text: string): string[] {
  return text
    .split(/[\n,;]/) // Aceita quebra de linha, vírgula ou ponto e vírgula
    .map(line => line.trim().replace('@', ''))
    .filter(line => line.length > 0 && /^[a-zA-Z0-9._]+$/.test(line));
}

export default function BatchAnalysis() {
  const { toast } = useToast();
  const [usernames, setUsernames] = useState<string[]>([]);
  const [usernamesText, setUsernamesText] = useState(""); // Texto bruto do textarea
  const [briefing, setBriefing] = useState("");
  const [batchResults, setBatchResults] = useState<BatchAnalysisItem[] | null>(null);
  const [stats, setStats] = useState<{ total: number; completed: number; failed: number } | null>(null);

  // Derivar lista de usernames válidos em tempo real do texto
  // Se textarea está vazio, retornar array vazio (não o estado antigo)
  const currentUsernames = useMemo(() => {
    if (!usernamesText.trim()) {
      return [];
    }
    return parseUsernames(usernamesText);
  }, [usernamesText]);

  const batchMutation = useMutation({
    mutationFn: async (data: { usernames: string[]; briefing: string }) => {
      const response = await apiRequest("POST", "/api/analyze-batch", data);
      const json = await response.json();
      
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Erro ao processar análise em lote");
      }
      
      return json as AnalyzeBatchResponse;
    },
    onSuccess: (data) => {
      setBatchResults(data.results);
      setStats({
        total: data.total,
        completed: data.completed,
        failed: data.failed,
      });
      toast({
        title: "Análise em lote concluída!",
        description: `${data.completed} perfis analisados com sucesso, ${data.failed} falharam.`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro na análise em lote",
        description: error.message || "Erro desconhecido",
      });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUsernamesText(text);
      processUsernames(text);
    };
    reader.readAsText(file);
  };

  const processUsernames = (text: string) => {
    const lines = parseUsernames(text);
    setUsernames(lines);
    
    if (lines.length > 0) {
      toast({
        title: "Usernames processados!",
        description: `${lines.length} username${lines.length !== 1 ? 's' : ''} válido${lines.length !== 1 ? 's' : ''} encontrado${lines.length !== 1 ? 's' : ''}`,
      });
    }
  };

  const handleTextareaChange = (text: string) => {
    setUsernamesText(text);
  };

  const handleTextareaBlur = () => {
    // Processar usernames quando o usuário sair do campo
    if (usernamesText.trim()) {
      processUsernames(usernamesText);
    }
  };

  const handleAnalyze = () => {
    if (currentUsernames.length === 0) {
      toast({
        variant: "destructive",
        title: "Lista vazia",
        description: "Adicione pelo menos um username válido para análise",
      });
      return;
    }

    if (briefing.length < 10) {
      toast({
        variant: "destructive",
        title: "Briefing obrigatório",
        description: "O briefing deve ter pelo menos 10 caracteres",
      });
      return;
    }

    // Atualizar estado para feedback visual
    setUsernames(currentUsernames);

    // Submeter análise
    batchMutation.mutate({ usernames: currentUsernames, briefing });
  };

  const exportToCSV = () => {
    if (!batchResults) return;

    const headers = [
      "Username",
      "Status",
      "Score Final",
      "Classificação",
      "Autoridade",
      "Afinidade",
      "LQS",
      "Prontidão",
      "Persona",
      "Seguidores",
      "Posts",
      "Erro"
    ].join(",");

    const rows = batchResults.map(item => {
      if (!item.success) {
        return `@${item.username},Falha,,,,,,,,,,"${item.error}"`;
      }

      const analysis = item.data!.analysis;
      const profile = item.data!.profile;

      return [
        `@${item.username}`,
        "Sucesso",
        analysis.resumo_rapido?.score || "",
        analysis.resumo_rapido?.classificacao || "",
        analysis.autoridade || "",
        analysis.afinidade_de_tema || "",
        analysis.lead_quality_score?.score || "",
        analysis.prontidao_conversao?.score || "",
        analysis.persona || "",
        profile.followers || "",
        profile.postsCount || "",
        ""
      ].join(",");
    });

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `analise-lote-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "CSV exportado!",
      description: "Download iniciado com sucesso",
    });
  };

  const exportToJSON = () => {
    if (!batchResults) return;

    const json = JSON.stringify(batchResults, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `analise-lote-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    toast({
      title: "JSON exportado!",
      description: "Download iniciado com sucesso",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Análise em Lote</h1>
        <p className="text-muted-foreground">
          Analise múltiplos perfis do Instagram de uma só vez
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Carregar Lista de Usernames
          </CardTitle>
          <CardDescription>
            Faça upload de um arquivo .txt ou .csv com usernames (um por linha ou separados por vírgula)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="max-w-md"
              data-testid="input-file-upload"
            />
            <Badge variant="outline">
              {currentUsernames.length} username{currentUsernames.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-sm font-medium">Ou digite manualmente:</label>
            <p className="text-xs text-muted-foreground">
              Digite um username por linha, ou separe por vírgula ou ponto e vírgula. Pode usar @ antes do username.
            </p>
            <Textarea
              placeholder="instagram&#10;natgeo&#10;nasa&#10;&#10;Ou separados por vírgula: instagram, natgeo, nasa"
              value={usernamesText}
              onChange={(e) => handleTextareaChange(e.target.value)}
              onBlur={handleTextareaBlur}
              className="min-h-32 font-mono text-sm"
              data-testid="textarea-manual-input"
            />
            {usernamesText && currentUsernames.length > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ {currentUsernames.length} username{currentUsernames.length !== 1 ? 's' : ''} válido{currentUsernames.length !== 1 ? 's' : ''}: {currentUsernames.join(', ')}
              </p>
            )}
            {usernamesText && currentUsernames.length === 0 && (
              <p className="text-xs text-red-600 dark:text-red-400">
                ✗ Nenhum username válido encontrado. Verifique o formato.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Briefing (obrigatório - mínimo 10 caracteres):</label>
            <Textarea
              placeholder="Descreva o perfil ideal que você está buscando, critérios de qualificação, objetivos..."
              value={briefing}
              onChange={(e) => setBriefing(e.target.value)}
              className="min-h-32"
              data-testid="textarea-briefing"
            />
            <p className="text-xs text-muted-foreground">
              {briefing.length}/10 caracteres mínimos
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={batchMutation.isPending || currentUsernames.length === 0 || briefing.length < 10}
            className="w-full"
            size="lg"
            data-testid="button-analyze-batch"
          >
            {batchMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando {currentUsernames.length} perfis...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analisar {currentUsernames.length} Perfis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress & Stats */}
      {batchMutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Processando...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Análise em andamento</span>
                <span className="text-muted-foreground">Isso pode levar alguns minutos</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {stats && batchResults && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Resultados da Análise em Lote
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button onClick={exportToCSV} variant="outline" size="sm" data-testid="button-export-csv">
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                  <Button onClick={exportToJSON} variant="outline" size="sm" data-testid="button-export-json">
                    <FileJson className="h-4 w-4 mr-2" />
                    Exportar JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Sucesso</p>
                </div>
                <div className="text-center p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.failed}</p>
                  <p className="text-sm text-muted-foreground">Falhas</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {batchResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                    data-testid={`result-item-${idx}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {item.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">@{item.username}</p>
                        {item.success && item.data ? (
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Score: {item.data.analysis.resumo_rapido?.score || 0}/100
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {item.data.analysis.resumo_rapido?.classificacao || "N/A"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.data.profile.followers?.toLocaleString()} seguidores
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {item.error || "Erro desconhecido"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
