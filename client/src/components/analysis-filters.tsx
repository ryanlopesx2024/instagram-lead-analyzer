import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { AnalysisFilters } from "@shared/schema";

interface AnalysisFiltersProps {
  filters: AnalysisFilters;
  onFiltersChange: (filters: AnalysisFilters) => void;
  onApply: () => void;
}

export function AnalysisFiltersComponent({ filters, onFiltersChange, onApply }: AnalysisFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateRangeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: value as AnalysisFilters["dateRange"],
    });
  };

  const handleEngagementChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      minEngagement: value[0],
    });
  };

  const hasActiveFilters = 
    filters.dateRange !== "all" || 
    filters.minEngagement > 0;

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover-elevate">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros Avançados
                {hasActiveFilters && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-md">
                    Ativos
                  </span>
                )}
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date-range" data-testid="label-date-range">
                  Período de Posts
                </Label>
                <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger id="date-range" data-testid="select-date-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Posts</SelectItem>
                    <SelectItem value="week">Última Semana</SelectItem>
                    <SelectItem value="month">Último Mês</SelectItem>
                    <SelectItem value="3months">Últimos 3 Meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="engagement" data-testid="label-engagement">
                  Engajamento Mínimo: {filters.minEngagement} likes
                </Label>
                <div className="pt-2">
                  <Slider
                    id="engagement"
                    min={0}
                    max={10000}
                    step={100}
                    value={[filters.minEngagement]}
                    onValueChange={handleEngagementChange}
                    data-testid="slider-engagement"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  onFiltersChange({
                    dateRange: "all",
                    minEngagement: 0,
                  });
                }}
                data-testid="button-clear-filters"
              >
                Limpar Filtros
              </Button>
              <Button onClick={onApply} data-testid="button-apply-filters">
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
