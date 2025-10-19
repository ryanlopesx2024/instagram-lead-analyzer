import { useState, useRef } from "react";
import { Search, Sparkles, Target, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SearchSectionProps {
  onSearch: (username: string, personaAlvo?: string, briefing?: string) => void;
  isLoading: boolean;
}

export function SearchSection({ onSearch, isLoading }: SearchSectionProps) {
  const [username, setUsername] = useState("");
  const [personaAlvo, setPersonaAlvo] = useState<string>("nenhuma");
  const [briefing, setBriefing] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBriefing(text);
      toast({
        title: "Arquivo carregado",
        description: `${file.name} foi carregado com sucesso`,
      });
    };
    reader.onerror = () => {
      toast({
        title: "Erro ao ler arquivo",
        description: "Não foi possível ler o arquivo",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.replace("@", "").trim();
    const cleanBriefing = briefing.trim();
    
    if (!cleanBriefing || cleanBriefing.length < 10) {
      toast({
        title: "Briefing obrigatório",
        description: "Por favor, escreva um briefing com pelo menos 10 caracteres",
        variant: "destructive",
      });
      return;
    }
    
    if (cleanUsername) {
      onSearch(
        cleanUsername, 
        personaAlvo !== "nenhuma" ? personaAlvo : undefined,
        cleanBriefing
      );
    }
  };

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by Gemini AI</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Analise Perfis do Instagram
            <span className="block text-primary mt-2">com Inteligência Artificial</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Extraia informações detalhadas, analise posts e descubra insights poderosos 
            sobre qualquer perfil público do Instagram usando IA avançada.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-4 text-left bg-card border rounded-lg p-6">
            <div className="space-y-2">
              <Label htmlFor="briefing" className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Briefing sobre a Persona (obrigatório)
              </Label>
              <p className="text-xs text-muted-foreground">
                Descreva o contexto, objetivos e características da persona que você está buscando. 
                A IA usará essas informações para personalizar a análise.
              </p>
            </div>
            
            <Textarea
              id="briefing"
              placeholder="Ex: Estou buscando influenciadores de fitness com foco em emagrecimento, que sejam autênticos e engajem sua audiência com conteúdo educacional. O público-alvo são mulheres de 25-40 anos..."
              value={briefing}
              onChange={(e) => setBriefing(e.target.value)}
              disabled={isLoading}
              className="min-h-[120px] resize-none"
              data-testid="textarea-briefing"
            />
            
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="input-file-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                data-testid="button-upload-file"
              >
                <Upload className="w-4 h-4 mr-2" />
                Carregar de arquivo (.txt, .md)
              </Button>
              {briefing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setBriefing("")}
                  disabled={isLoading}
                  data-testid="button-clear-briefing"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2 text-left">
              <Label htmlFor="persona-select" className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Persona Alvo (opcional)
              </Label>
              <Select 
                value={personaAlvo} 
                onValueChange={setPersonaAlvo}
                disabled={isLoading}
              >
                <SelectTrigger 
                  id="persona-select"
                  className="h-12"
                  data-testid="select-persona-alvo"
                >
                  <SelectValue placeholder="Selecione uma persona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Análise Geral</SelectItem>
                  <SelectItem value="curioso">Curioso - Baixa intenção e engajamento</SelectItem>
                  <SelectItem value="prospecto">Prospecto - Potencial interessado</SelectItem>
                  <SelectItem value="cliente">Cliente - Alta intenção de compra</SelectItem>
                  <SelectItem value="influenciador">Influenciador - Alto alcance e impacto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                @
              </div>
              <Input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-9 h-12 text-base font-mono"
                disabled={isLoading}
                data-testid="input-username"
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              disabled={isLoading || !username.trim() || !briefing.trim()}
              className="h-12 px-8"
              data-testid="button-analyze"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "Analisando..." : "Analisar"}
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-chart-2" />
            <span>Scraping Inteligente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-chart-2" />
            <span>Análise de IA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-chart-2" />
            <span>OCR de Imagens</span>
          </div>
        </div>
      </div>
    </div>
  );
}
