import { useState } from "react";
import { Link } from "wouter";
import { Star, Bookmark, BookmarkCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { DramaSeries } from "@shared/schema";
import { cn, truncateText } from "@/lib/utils";

interface DramaCardProps {
  drama: DramaSeries;
  className?: string;
  showBadge?: boolean;
}

export function DramaCard({ drama, className, showBadge = true }: DramaCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isHovering, setIsHovering] = useState(false);
  
  // Check if drama is in user's watchlist (simplified)
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/watchlist", { seriesId: drama.id });
      return await res.json();
    },
    onSuccess: () => {
      setIsInWatchlist(true);
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Added to watchlist",
        description: `${drama.title} has been added to your watchlist`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add to watchlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/watchlist/${drama.id}`);
    },
    onSuccess: () => {
      setIsInWatchlist(false);
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Removed from watchlist",
        description: `${drama.title} has been removed from your watchlist`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove from watchlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;
    
    if (isInWatchlist) {
      removeFromWatchlistMutation.mutate();
    } else {
      addToWatchlistMutation.mutate();
    }
  };
  
  return (
    <Link href={`/watch/${drama.id}`}>
      <div 
        className={cn(
          "group relative overflow-hidden rounded-lg bg-muted transition-transform duration-200 hover:scale-[1.03]",
          className
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative aspect-video">
          <img 
            src={drama.thumbnailUrl} 
            alt={drama.title}
            className="w-full h-full object-cover"
          />
          
          {/* Bookmark button */}
          <button
            onClick={toggleWatchlist}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white transition-all",
              isHovering ? "opacity-100" : "opacity-0 sm:opacity-100",
              isInWatchlist ? "text-primary" : "hover:text-primary"
            )}
            aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            {isInWatchlist ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>
        
        <div className="p-3">
          {showBadge && (
            <div className="flex items-center mb-1">
              {drama.isFeatured && (
                <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded mr-2">HOT</span>
              )}
              <span className="text-muted-foreground text-xs">{drama.genre.length} episodes</span>
            </div>
          )}
          
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
    </Link>
  );
}
