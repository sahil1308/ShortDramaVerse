import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Episode, InsertWatchHistory, DramaSeries, Advertisement as AdvertisementType } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Advertisement } from '@/components/advertisement';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, SkipForward, ArrowLeft, Maximize, Loader2 } from 'lucide-react';

export default function EpisodePlayerPage() {
  const [_, params] = useRoute('/episode/:id');
  const episodeId = parseInt(params?.id || '0');
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const controlsTimeoutRef = useState<NodeJS.Timeout | null>(null)[1];
  
  // Fetch episode data
  const {
    data: episode,
    isLoading: isLoadingEpisode,
    error: episodeError
  } = useQuery<Episode & { series: DramaSeries }>({
    queryKey: [`/api/episodes/${episodeId}`],
    enabled: !!episodeId && episodeId > 0,
  });
  
  // Fetch episode comments
  const {
    data: comments = [] as any[],
    isLoading: isLoadingComments
  } = useQuery<any[]>({
    queryKey: [`/api/episodes/${episodeId}/comments`],
    enabled: !!episodeId && episodeId > 0,
  });
  
  // Fetch next episode
  const {
    data: nextEpisode,
    isLoading: isLoadingNextEpisode
  } = useQuery<Episode>({
    queryKey: [`/api/episodes/${episodeId}/next`],
    enabled: !!episodeId && episodeId > 0,
  });
  
  // Get in-player advertisements
  const {
    data: videoAds = [] as AdvertisementType[]
  } = useQuery<AdvertisementType[]>({
    queryKey: ['/api/ads/video'],
  });
  
  // Record watch history mutation
  const recordWatchHistoryMutation = useMutation({
    mutationFn: async (progress: number) => {
      if (!user) return;
      
      const watchHistoryData: InsertWatchHistory = {
        userId: user.id,
        episodeId,
        progress,
        completed: progress >= 0.9, // Mark as completed if watched 90% or more
      };
      
      await apiRequest('POST', '/api/watch-history', watchHistoryData);
    },
    onError: (error: Error) => {
      console.error('Failed to record watch history:', error);
    },
  });
  
  // Simulate video buffering when first loading
  useEffect(() => {
    if (episode) {
      const timer = setTimeout(() => {
        setIsBuffering(false);
        // Auto-play after buffering if the user is authenticated
        if (user) {
          setIsPlaying(true);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [episode, user]);
  
  // Record watch history every 30 seconds and when component unmounts
  useEffect(() => {
    if (!user || !episode) return;
    
    const interval = setInterval(() => {
      if (currentTime > 0 && duration > 0) {
        recordWatchHistoryMutation.mutate(currentTime / duration);
      }
    }, 30000);
    
    return () => {
      clearInterval(interval);
      // Record final position when leaving the page
      if (currentTime > 0 && duration > 0) {
        recordWatchHistoryMutation.mutate(currentTime / duration);
      }
    };
  }, [user, episode, currentTime, duration, recordWatchHistoryMutation]);
  
  // Handle player controls visibility
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef) {
        clearTimeout(controlsTimeoutRef);
      }
      
      const timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
      
      controlsTimeoutRef(timeout);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef) {
        clearTimeout(controlsTimeoutRef);
      }
    };
  }, [isPlaying, controlsTimeoutRef]);
  
  // Handle play/pause toggle
  const togglePlay = () => {
    // In a real player, this would control the video element
    setIsPlaying(prev => !prev);
    setShowControls(true);
    
    if (controlsTimeoutRef) {
      clearTimeout(controlsTimeoutRef);
    }
    
    const timeout = setTimeout(() => {
      if (!isPlaying) { // Checking the opposite because state hasn't updated yet
        setShowControls(false);
      }
    }, 3000);
    
    controlsTimeoutRef(timeout);
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };
  
  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Loading state
  if (isLoadingEpisode || !episode) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4" />
          <p>Loading episode...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (episodeError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-red-900/50 p-8 rounded-lg text-white max-w-lg text-center">
          <h2 className="text-xl font-bold mb-4">Failed to Load Episode</h2>
          <p className="mb-6">We encountered an error while loading this episode. Please try again later.</p>
          <Button asChild>
            <Link href={`/series/${episode.seriesId}`}>Back to Series</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Premium content check
  if (episode.isPremium && (!user || (user && user.coinBalance === 0))) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-yellow-900/50 p-8 rounded-lg text-white max-w-lg text-center">
          <h2 className="text-xl font-bold mb-4">Premium Content</h2>
          <p className="mb-6">
            This episode is premium content. You need coins to watch this episode.
            {!user && " Please log in to purchase coins."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <Button asChild>
                <Link href="/auth">Login</Link>
              </Button>
            )}
            {user && (
              <Button asChild>
                <Link href="/coins/buy">Purchase Coins</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/series/${episode.seriesId}`}>Back to Series</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-black min-h-screen flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Video Player */}
      <div 
        className="relative w-full bg-black"
        style={{ height: isFullscreen ? '100vh' : '60vh' }}
      >
        {/* Back Button (only visible when not in fullscreen) */}
        {!isFullscreen && (
          <div className="absolute top-4 left-4 z-30">
            <Link href={`/series/${episode.seriesId}`}>
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Series
              </Button>
            </Link>
          </div>
        )}
        
        {/* Video Element (simulated with an image) */}
        <div className="absolute inset-0 bg-black">
          {isBuffering ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-white/80" />
            </div>
          ) : (
            <>
              <img 
                src={episode.videoUrl || episode.thumbnailUrl} 
                alt={episode.title}
                className="w-full h-full object-contain"
              />
              {/* This would be a real video element in production */}
              {/* <video 
                src={episode.videoUrl}
                poster={episode.thumbnailUrl}
                className="w-full h-full"
              /> */}
            </>
          )}
        </div>
        
        {/* Player Controls */}
        {showControls && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30">
            {/* Top controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
              <div>
                <h1 className="text-white font-bold text-lg md:text-xl">{episode.title}</h1>
                <p className="text-white/80 text-sm">
                  {episode.series?.title} - Episode {episode.episodeNumber}
                </p>
              </div>
            </div>
            
            {/* Center play/pause button */}
            <button 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-4 transition-colors"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white" />
              ) : (
                <Play className="h-8 w-8 text-white" />
              )}
            </button>
            
            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Progress bar */}
              <div className="flex items-center">
                <input 
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full cursor-pointer"
                />
              </div>
              
              {/* Control buttons */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <button 
                    className="text-white hover:text-white/80 transition-colors"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </button>
                  
                  <button 
                    className="text-white hover:text-white/80 transition-colors"
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <VolumeX className="h-6 w-6" />
                    ) : (
                      <Volume2 className="h-6 w-6" />
                    )}
                  </button>
                  
                  <div className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration || 0)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {nextEpisode && (
                    <Link href={`/episode/${nextEpisode.id}`}>
                      <button className="text-white hover:text-white/80 transition-colors flex items-center">
                        <span className="text-sm mr-1">Next</span>
                        <SkipForward className="h-5 w-5" />
                      </button>
                    </Link>
                  )}
                  
                  <button 
                    className="text-white hover:text-white/80 transition-colors"
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Episode Details and Comments (not shown in fullscreen mode) */}
      {!isFullscreen && (
        <div className="container py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1">
              {/* Episode Info */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">{episode.title}</h1>
                <div className="flex items-center gap-4 text-sm mb-4">
                  <span className="text-muted-foreground">Episode {episode.episodeNumber}</span>
                  <span className="text-muted-foreground">{episode.duration} min</span>
                  {episode.isPremium && (
                    <span className="bg-yellow-400/10 text-yellow-600 px-2 py-0.5 rounded-full text-xs">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mb-6">{episode.description}</p>
                
                {/* Episode Navigation */}
                <div className="flex justify-between">
                  <Button variant="outline" className="flex items-center" asChild>
                    <Link href={`/series/${episode.seriesId}`}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Series
                    </Link>
                  </Button>
                  
                  {nextEpisode && (
                    <Button className="flex items-center" asChild>
                      <Link href={`/episode/${nextEpisode.id}`}>
                        Next Episode
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Comments Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Comments</h2>
                
                {comments.length === 0 ? (
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Comment list would go here */}
                    <div className="text-center text-muted-foreground">
                      Comments functionality coming soon...
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="w-full md:w-72 space-y-6">
              {/* Related Episodes */}
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <h3 className="font-bold mb-3">More Episodes</h3>
                <div className="text-center text-muted-foreground text-sm">
                  Episodes list will appear here...
                </div>
              </div>
              
              {/* Sidebar Ad */}
              {videoAds.length > 0 && (
                <div>
                  <Advertisement ad={videoAds[0]} placement="sidebar" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}