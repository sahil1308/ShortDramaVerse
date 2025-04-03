import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DramaCard } from "@/components/ui/drama-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryNav } from "@/components/layout/category-nav";
import { Loader2, Search } from "lucide-react";
import { DramaSeries } from "@shared/schema";

export default function WatchlistPage() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch watchlist
  const { data: watchlist, isLoading } = useQuery<(any & { series: DramaSeries })[]>({
    queryKey: ["/api/watchlist"],
  });

  // Filter by genre and search query
  const filteredWatchlist = watchlist?.filter(item => {
    const matchesGenre = selectedGenre === "All" || item.series.genre.includes(selectedGenre);
    const matchesSearch = !searchQuery.trim() || item.series.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="app-container relative min-h-screen pb-16 md:pb-0 md:flex bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 md:ml-64 min-h-screen">
        <Header />

        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">My Watchlist</h1>
            
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Search watchlist..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <CategoryNav
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
          />

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredWatchlist && filteredWatchlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredWatchlist.map((item) => (
                <DramaCard key={item.id} drama={item.series} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              {searchQuery || selectedGenre !== "All" ? (
                <>
                  <h3 className="text-xl font-medium mb-2">No matching items found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSelectedGenre("All");
                    setSearchQuery("");
                  }}>
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-medium mb-2">Your watchlist is empty</h3>
                  <p className="text-muted-foreground mb-6">
                    Save shows and movies to watch later by clicking the bookmark icon
                  </p>
                  <Button asChild>
                    <a href="/">Browse Content</a>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
