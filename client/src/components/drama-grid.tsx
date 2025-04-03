import { Advertisement as AdvertisementType, DramaSeries } from "@shared/schema";
import { DramaCard } from "./drama-card";
import { Advertisement } from "./advertisement";
import { useQuery } from "@tanstack/react-query";

interface DramaGridProps {
  title: string;
  seriesQueryKey: string[];
  adsQueryKey?: string[];
  emptyMessage?: string;
}

export function DramaGrid({ 
  title, 
  seriesQueryKey, 
  adsQueryKey,
  emptyMessage = "No drama series found" 
}: DramaGridProps) {
  // Fetch drama series
  const { 
    data: seriesData = [], 
    isLoading: isLoadingSeries,
    error: seriesError
  } = useQuery<DramaSeries[]>({
    queryKey: seriesQueryKey
  });
  
  // Fetch ads if specified
  const { 
    data: adsData = [] as AdvertisementType[],
    isLoading: isLoadingAds
  } = useQuery<AdvertisementType[]>({
    queryKey: adsQueryKey || [],
    enabled: !!adsQueryKey,
  });
  
  // Calculate positions to insert ads
  const getItemsWithAds = () => {
    if (!adsData || adsData.length === 0 || !seriesData || seriesData.length === 0) {
      return seriesData;
    }
    
    // Insert an ad after every 6 items
    const result: (DramaSeries | { isAd: true; ad: AdvertisementType })[] = [];
    seriesData.forEach((item, index) => {
      result.push(item);
      
      // After every 6th item, insert an ad if available
      if ((index + 1) % 6 === 0 && adsData.length > 0) {
        const adIndex = Math.floor(index / 6) % adsData.length;
        result.push({ isAd: true, ad: adsData[adIndex] });
      }
    });
    
    return result;
  };
  
  const itemsWithAds = getItemsWithAds();
  
  // Loading state
  if (isLoadingSeries) {
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 w-full aspect-video rounded-lg mb-2"></div>
              <div className="bg-gray-200 h-5 w-3/4 rounded mb-1"></div>
              <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (seriesError) {
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Error loading drama series. Please try again later.
        </div>
      </div>
    );
  }
  
  // Empty state
  if (itemsWithAds.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="p-4 bg-gray-50 text-gray-600 rounded-lg">
          {emptyMessage}
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {itemsWithAds.map((item, index) => {
          if ('isAd' in item) {
            return (
              <div key={`ad-${index}`} className="col-span-1">
                <Advertisement 
                  ad={item.ad} 
                  placement="in-feed" 
                />
              </div>
            );
          }
          
          return (
            <div key={item.id} className="col-span-1">
              <DramaCard series={item} />
            </div>
          );
        })}
      </div>
    </div>
  );
}