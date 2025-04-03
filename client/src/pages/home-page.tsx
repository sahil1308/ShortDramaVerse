import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CategoryNav } from "@/components/layout/category-nav";
import { DramaCard } from "@/components/ui/drama-card";
import { ContinueWatchingCard } from "@/components/ui/continue-watching-card";
import { PremiumDramaCard } from "@/components/ui/premium-drama-card";
import { ChannelCard } from "@/components/ui/channel-card";
import { Button } from "@/components/ui/button";
import { Play, Plus, Info } from "lucide-react";
import { DramaSeries, WatchHistory, Channel } from "@shared/schema";

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState("All");

  // Featured drama query
  const { data: featuredDramas } = useQuery<DramaSeries[]>({
    queryKey: ["/api/dramas/featured"],
  });

  // Continue watching query
  const { data: watchHistory } = useQuery<(WatchHistory & { episode: any, series: DramaSeries })[]>({
    queryKey: ["/api/history"],
  });

  // Trending dramas query
  const { data: trendingDramas } = useQuery<DramaSeries[]>({
    queryKey: ["/api/dramas/trending"],
  });

  // Premium dramas query
  const { data: premiumDramas } = useQuery<DramaSeries[]>({
    queryKey: ["/api/dramas/premium"],
  });

  // Popular channels query
  const { data: popularChannels } = useQuery<Channel[]>({
    queryKey: ["/api/channels/popular"],
  });

  // Drama by genre query
  const { data: dramasByGenre } = useQuery<DramaSeries[]>({
    queryKey: ["/api/dramas/genre", selectedGenre],
    enabled: selectedGenre !== "All",
  });

  // Filter dramas by selected genre
  const filteredDramas = selectedGenre === "All" 
    ? trendingDramas 
    : dramasByGenre;

  // Featured drama (first item from featured dramas or trending dramas)
  const featuredDrama = featuredDramas?.[0] || trendingDramas?.[0];

  return (
    <div className="app-container relative min-h-screen pb-16 md:pb-0 md:flex bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 md:ml-64 min-h-screen">
        <Header />

        <div className="p-4">
          {/* Category Navigation */}
          <CategoryNav
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
          />

          {/* Featured Content */}
          {featuredDrama && (
            <div className="relative rounded-xl overflow-hidden mb-8 group hover:scale-[1.01] transition-transform duration-200">
              <div className="aspect-video bg-muted relative">
                <img 
                  src={featuredDrama.bannerUrl || featuredDrama.thumbnailUrl} 
                  alt={featuredDrama.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
                  {featuredDrama.isPremium ? (
                    <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded mb-2 inline-block">PREMIUM</span>
                  ) : (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded mb-2 inline-block">NEW EPISODE</span>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">{featuredDrama.title}</h2>
                  <p className="text-muted-foreground text-sm md:text-base mb-3">
                    {featuredDrama.genre.join(" • ")}
                  </p>
                  <div className="flex space-x-3">
                    <Button asChild>
                      <Link href={`/watch/${featuredDrama.id}`}>
                        <Play className="mr-1" size={18} /> Play
                      </Link>
                    </Button>
                    <Button variant="secondary" className="flex items-center">
                      <Plus className="mr-1" size={18} /> Watchlist
                    </Button>
                    <Button variant="secondary" size="icon" className="w-10 h-10">
                      <Info size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Continue Watching */}
          {watchHistory && watchHistory.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">Continue Watching</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {watchHistory.slice(0, 5).map((item) => (
                  <ContinueWatchingCard key={item.id} watchHistory={item} />
                ))}
              </div>
            </section>
          )}

          {/* Trending Now */}
          {filteredDramas && filteredDramas.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {selectedGenre === "All" ? "Trending Now" : `${selectedGenre} Dramas`}
                </h2>
                <Button variant="link" className="text-muted-foreground">
                  See All
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredDramas.slice(0, 10).map((drama) => (
                  <DramaCard key={drama.id} drama={drama} />
                ))}
              </div>
            </section>
          )}

          {/* Premium Exclusives */}
          {premiumDramas && premiumDramas.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Premium Exclusives</h2>
                <Button variant="link" className="text-muted-foreground">
                  See All
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {premiumDramas.slice(0, 5).map((drama) => (
                  <PremiumDramaCard key={drama.id} drama={drama} />
                ))}
              </div>
            </section>
          )}

          {/* Popular Channels */}
          {popularChannels && popularChannels.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4">Popular Channels</h2>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                {popularChannels.map((channel) => (
                  <ChannelCard key={channel.id} channel={channel} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
