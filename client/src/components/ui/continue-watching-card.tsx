import { Link } from "wouter";
import { DramaSeries, Episode, WatchHistory } from "@shared/schema";
import { cn, formatDuration, calculateProgress } from "@/lib/utils";

interface ContinueWatchingCardProps {
  watchHistory: WatchHistory & { episode: Episode, series: DramaSeries };
  className?: string;
}

export function ContinueWatchingCard({ watchHistory, className }: ContinueWatchingCardProps) {
  const { episode, series } = watchHistory;
  const progress = calculateProgress(watchHistory.progress, episode.duration);
  const timeLeft = Math.max(0, episode.duration - watchHistory.progress);
  
  return (
    <Link href={`/watch/${episode.id}`}>
      <div 
        className={cn(
          "group relative overflow-hidden rounded-lg bg-muted transition-transform duration-200 hover:scale-[1.03]",
          className
        )}
      >
        <div className="relative">
          <div className="aspect-video">
            <img
              src={episode.thumbnailUrl || series.thumbnailUrl}
              alt={episode.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(timeLeft)} left
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 w-full bg-muted-foreground/20">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="p-3">
          <h3 className="font-medium mb-1 truncate">{series.title}</h3>
          <p className="text-muted-foreground text-sm">
            {`Season ${episode.seasonNumber}, Episode ${episode.episodeNumber}`}
          </p>
        </div>
      </div>
    </Link>
  );
}
