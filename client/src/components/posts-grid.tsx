import { useState } from "react";
import { Heart, MessageCircle, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InstagramPost } from "@shared/schema";

interface PostsGridProps {
  posts: InstagramPost[];
}

export function PostsGrid({ posts }: PostsGridProps) {
  const [expandedPost, setExpandedPost] = useState<number | null>(null);

  if (posts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          Nenhum post encontrado ou perfil privado
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Últimos Posts</h3>
        <Badge variant="secondary">{posts.length} posts analisados</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post, index) => (
          <Card 
            key={index} 
            className="overflow-hidden hover-elevate group"
            data-testid={`card-post-${index}`}
          >
            <div className="aspect-square relative overflow-hidden bg-muted">
              <img
                src={post.imageUrl}
                alt={`Post ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                data-testid={`img-post-${index}`}
              />
              {post.likes !== undefined && (
                <div className="absolute top-3 right-3">
                  <Badge className="gap-1 bg-background/80 backdrop-blur-sm">
                    <Heart className="w-3 h-3" />
                    {post.likes}
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4 space-y-3">
              {post.caption && (
                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-caption-${index}`}>
                  {post.caption}
                </p>
              )}

              {post.ocrText && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedPost(expandedPost === index ? null : index)}
                    className="w-full justify-start gap-2"
                    data-testid={`button-toggle-ocr-${index}`}
                  >
                    {expandedPost === index ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    <span className="text-xs">Texto Extraído (OCR)</span>
                  </Button>
                  
                  {expandedPost === index && (
                    <div className="p-3 rounded-md bg-muted text-xs font-mono leading-relaxed" data-testid={`text-ocr-${index}`}>
                      {post.ocrText}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
