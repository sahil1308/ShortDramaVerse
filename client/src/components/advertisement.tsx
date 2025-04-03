import { useEffect } from "react";
import { Advertisement as AdvertisementType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AdvertisementProps {
  ad: AdvertisementType;
  placement: string;
}

export function Advertisement({ ad, placement }: AdvertisementProps) {
  // Record impression when the ad is shown
  useEffect(() => {
    const recordImpression = async () => {
      try {
        await apiRequest("POST", `/api/ads/${ad.id}/impression`);
      } catch (error) {
        console.error("Failed to record ad impression:", error);
      }
    };
    
    recordImpression();
  }, [ad.id]);
  
  // Handle ad click
  const handleAdClick = async () => {
    try {
      // Record the click
      await apiRequest("POST", `/api/ads/${ad.id}/click`);
      
      // Open the target URL in a new tab
      if (ad.targetUrl) {
        window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Failed to record ad click:", error);
    }
  };
  
  return (
    <div 
      className={`
        w-full overflow-hidden rounded-lg cursor-pointer shadow-md
        ${placement === 'banner' ? 'aspect-[5/1]' : 'aspect-video'}
        ${placement === 'sidebar' ? 'max-w-[300px]' : ''}
        ${placement === 'in-feed' ? 'max-w-full' : ''}
        hover:shadow-lg transition-shadow
      `}
      onClick={handleAdClick}
    >
      <div className="relative w-full h-full">
        <img 
          src={ad.imageUrl} 
          alt={ad.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
          Ad
        </div>
      </div>
    </div>
  );
}