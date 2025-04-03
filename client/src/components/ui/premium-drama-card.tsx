import { Link } from "wouter";
import { DramaSeries } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Star, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumDramaCardProps {
  drama: DramaSeries;
  className?: string;
}

export function PremiumDramaCard({ drama, className }: PremiumDramaCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const unlockPremiumMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/coins/unlock-premium", { 
        seriesId: drama.id 
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Premium Content Unlocked",
        description: `You've unlocked "${drama.title}" for ${drama.coinPrice} coins`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to unlock content",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleUnlock = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;
    
    if (user.coins < (drama.coinPrice || 0)) {
      toast({
        title: "Insufficient coins",
        description: `You need ${drama.coinPrice} coins to unlock this content. You have ${user.coins} coins.`,
        variant: "destructive",
      });
      return;
    }
    
    unlockPremiumMutation.mutate();
  };
  
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-lg bg-muted transition-transform duration-200 hover:scale-[1.03]",
        className
      )}
    >
      <div className="relative">
        <div className="aspect-video">
          <img
            src={drama.thumbnailUrl}
            alt={drama.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Lock className="text-yellow-400 mb-1" size={24} />
              <button
                onClick={handleUnlock}
                className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center"
              >
                <span className="mr-1">🪙</span> 
                {drama.coinPrice} coins
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex items-center mb-1">
          <span className="bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded mr-2">PREMIUM</span>
          <span className="text-muted-foreground text-xs">{drama.genre.length} episodes</span>
        </div>
        
        <h3 className="font-medium mb-1 truncate">{drama.title}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="text-yellow-500 mr-1" size={14} />
            <span className="text-sm">{drama.rating || "N/A"}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {drama.genre.slice(0, 2).join(", ")}
          </span>
        </div>
      </div>
    </div>
  );
}
