import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { VideoPlayer } from "@/components/ui/video-player";
import { DramaCard } from "@/components/ui/drama-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  ChevronRight,
  Star
} from "lucide-react";
import { DramaSeries, Episode } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDuration } from "@/lib/utils";

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("episodes");
  const [currentPlayingEpisode, setCurrentPlayingEpisode] = useState<Episode | null>(null);
  const [progress, setProgress] = useState(0);

  // Drama series query
  const { data: drama, isLoading: isLoadingDrama } = useQuery<DramaSeries>({
    queryKey: [`/api/dramas/${id}`],
    onError: () => {
      navigate("/not-found");
    }
  });

  // Episodes query
  const { data: episodes, isLoading: isLoadingEpisodes } = useQuery<Episode[]>({
    queryKey: [`/api/dramas/${id}/episodes`],
    enabled: !!drama,
  });

  // Similar dramas query
  const { data: similarDramas } = useQuery<DramaSeries[]>({
    queryKey: ["/api/dramas/trending"],
    enabled: !!drama,
  });

  // Watch history mutation
  const watchHistoryMutation = useMutation({
    mutationFn: async (data: { episodeId: number; progress: number; isCompleted: boolean }) => {
      const res = await apiRequest("POST", "/api/history", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });

  // Update watch history periodically
  useEffect(() => {
    if (!currentPlayingEpisode) return;

    const updateInterval = setInterval(() => {
      if (progress > 0) {
        watchHistoryMutation.mutate({
          episodeId: currentPlayingEpisode.id,
          progress,
          isCompleted: false,
        });
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(updateInterval);
  }, [currentPlayingEpisode, progress]);

  // Set the first episode as current playing if none selected
  useEffect(() => {
    if (episodes && episodes.length > 0 && !currentPlayingEpisode) {
      setCurrentPlayingEpisode(episodes[0]);
    }
  }, [episodes, currentPlayingEpisode]);

  // Handle video time update
  const handleTimeUpdate = (currentTime: number, duration: number) => {
    setProgress(currentTime);
    
    // Mark as completed if watched more than 90%
    if (currentTime > duration * 0.9 && currentPlayingEpisode) {
      watchHistoryMutation.mutate({
        episodeId: currentPlayingEpisode.id,
        progress: currentTime,
        isCompleted: true,
      });
    }
  };

  // Handle video completion
  const handleVideoEnded = () => {
    if (!episodes || !currentPlayingEpisode) return;
    
    // Find the next episode
    const currentIndex = episodes.findIndex(ep => ep.id === currentPlayingEpisode.id);
    if (currentIndex < episodes.length - 1) {
      setCurrentPlayingEpisode(episodes[currentIndex + 1]);
    }
  };

  // Play specific episode
  const playEpisode = (episode: Episode) => {
    setCurrentPlayingEpisode(episode);
    setProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoadingDrama || isLoadingEpisodes) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="app-container relative min-h-screen pb-16 md:pb-0 md:flex bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 md:ml-64 min-h-screen">
        <Header />

        <div className="p-4">
          {currentPlayingEpisode && (
            <div className="mb-6">
              <VideoPlayer 
                src={currentPlayingEpisode.videoUrl}
                poster={currentPlayingEpisode.thumbnailUrl}
                title={`${drama?.title} - ${currentPlayingEpisode.title}`}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
              />
            </div>
          )}

          {drama && (
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{drama.title}</h1>
                  <div className="flex items-center mt-1 text-muted-foreground">
                    <span className="flex items-center mr-3">
                      <Star className="text-yellow-500 mr-1" size={16} />
                      {drama.rating || "N/A"}
                    </span>
                    <span>{drama.genre.join(" • ")}</span>
                  </div>
                </div>
                <div className="flex mt-4 md:mt-0 space-x-2">
                  <Button variant="secondary" size="sm" className="flex items-center">
                    <ThumbsUp className="mr-1" size={16} /> Like
                  </Button>
                  <Button variant="secondary" size="sm" className="flex items-center">
                    <Bookmark className="mr-1" size={16} /> Save
                  </Button>
                  <Button variant="secondary" size="sm" className="flex items-center">
                    <Share2 className="mr-1" size={16} /> Share
                  </Button>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">{drama.description}</p>
              
              <Tabs defaultValue="episodes" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="episodes">Episodes</TabsTrigger>
                  <TabsTrigger value="more">More Like This</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>
                
                <TabsContent value="episodes" className="mt-4">
                  {episodes && episodes.length > 0 ? (
                    <div className="space-y-3">
                      {episodes.map((episode) => (
                        <div 
                          key={episode.id}
                          className={`p-3 rounded-lg flex items-center cursor-pointer hover:bg-muted ${
                            currentPlayingEpisode?.id === episode.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => playEpisode(episode)}
                        >
                          <div className="relative w-28 h-16 rounded overflow-hidden mr-3 flex-shrink-0">
                            <img 
                              src={episode.thumbnailUrl} 
                              alt={episode.title}
                              className="w-full h-full object-cover"
                            />
                            {currentPlayingEpisode?.id === episode.id && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="bg-primary text-primary-foreground rounded-full p-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{episode.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              S{episode.seasonNumber} E{episode.episodeNumber} • {formatDuration(episode.duration, true)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      No episodes available.
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="more" className="mt-4">
                  {similarDramas && similarDramas.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {similarDramas
                        .filter(d => d.id !== Number(id))
                        .slice(0, 8)
                        .map((drama) => (
                          <DramaCard key={drama.id} drama={drama} />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      No similar content available.
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="comments" className="mt-4">
                  <div className="mb-6">
                    <h3 className="mb-2 font-medium">Add a comment</h3>
                    <div className="flex">
                      <Avatar className="mr-3">
                        <AvatarImage src="https://ui-avatars.com/api/?background=E50914&color=fff" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <textarea 
                          className="w-full p-3 rounded-lg bg-muted border-0 min-h-[100px] focus:ring-1 focus:ring-primary"
                          placeholder="What did you think of this drama?"
                        ></textarea>
                        <div className="mt-2 flex justify-end">
                          <Button>Post Comment</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="py-4 text-center text-muted-foreground">
                    Comments feature coming soon
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
