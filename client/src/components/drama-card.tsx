import { Link } from "wouter";
import { DramaSeries } from "@shared/schema";

interface DramaCardProps {
  series: DramaSeries;
}

export function DramaCard({ series }: DramaCardProps) {
  return (
    <Link href={`/series/${series.id}`}>
      <div className="relative group cursor-pointer overflow-hidden rounded-lg">
        {/* Thumbnail */}
        <img
          src={series.thumbnailUrl}
          alt={series.title}
          className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
          <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{series.title}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-white/90 text-sm">
              <span className="mr-2">{series.totalEpisodes} episodes</span>
              {series.averageRating && (
                <span className="flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-yellow-400 mr-1" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                  {series.averageRating.toFixed(1)}
                </span>
              )}
            </div>
            {series.genre && series.genre.length > 0 && (
              <span className="text-xs bg-primary/80 text-white px-2 py-1 rounded-full">
                {series.genre[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}