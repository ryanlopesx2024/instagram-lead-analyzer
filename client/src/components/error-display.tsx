import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5" data-testid="card-error">
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Erro ao Analisar Perfil</h3>
            <p className="text-muted-foreground max-w-md" data-testid="text-error-message">
              {message}
            </p>
          </div>

          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="gap-2" data-testid="button-retry">
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
