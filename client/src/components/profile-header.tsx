import { Instagram, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { InstagramProfile } from "@shared/schema";

interface ProfileHeaderProps {
  profile: InstagramProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <Card className="p-8" data-testid="card-profile-header">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-2 ring-primary/20">
          <AvatarImage src={profile.profilePicUrl} alt={profile.username} />
          <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
            {profile.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-bold font-mono" data-testid="text-username">
                @{profile.username}
              </h2>
              {!profile.isPrivate && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Público
                </Badge>
              )}
              {profile.isPrivate && (
                <Badge variant="secondary" className="gap-1">
                  Privado
                </Badge>
              )}
            </div>
            
            {profile.fullName && (
              <p className="text-lg text-foreground font-medium" data-testid="text-fullname">
                {profile.fullName}
              </p>
            )}
          </div>

          {profile.bio && (
            <p className="text-muted-foreground leading-relaxed max-w-2xl" data-testid="text-bio">
              {profile.bio}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Instagram className="w-4 h-4" />
            <span>instagram.com/{profile.username}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
