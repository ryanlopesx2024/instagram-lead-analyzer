import { Users, UserPlus, Grid3x3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  followers?: number;
  following?: number;
  postsCount?: number;
}

export function StatsCards({ followers, following, postsCount }: StatsCardsProps) {
  const formatNumber = (num?: number) => {
    if (num === undefined) return "N/A";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const stats = [
    {
      icon: Users,
      label: "Seguidores",
      value: formatNumber(followers),
      rawValue: followers,
      testId: "stat-followers",
    },
    {
      icon: UserPlus,
      label: "Seguindo",
      value: formatNumber(following),
      rawValue: following,
      testId: "stat-following",
    },
    {
      icon: Grid3x3,
      label: "Posts",
      value: formatNumber(postsCount),
      rawValue: postsCount,
      testId: "stat-posts",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="hover-elevate" data-testid={stat.testId}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold font-mono" data-testid={`${stat.testId}-value`}>
                  {stat.value}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
