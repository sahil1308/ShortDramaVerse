import { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  Rewind, 
  FastForward 
} from "lucide-react";
import { cn, formatDuration, calculateProgress } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
}

export function VideoPlayer({
  src,
  poster,
  title,
  className,
  autoPlay = false,
  onTimeUpdate,
  onEnded
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleDurationChange = () => {
      setDuration(video.duration || 0);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
      onTimeUpdate?.(video.currentTime, video.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate, onEnded]);
  
  // Handle play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isPlaying]);
  
  // Handle volume changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);
  
  // Auto-hide controls
  useEffect(() => {
    if (!isPlaying) return;
    
    const showControls = () => {
      setIsControlsVisible(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    };
    
    const player = playerRef.current;
    if (player) {
      player.addEventListener('mousemove', showControls);
      showControls();
    }
    
    return () => {
      if (player) {
        player.removeEventListener('mousemove', showControls);
      }
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);
  
  // Handle fullscreen
  const toggleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;
    
    if (!document.fullscreenElement) {
      player.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const seekTime = parseFloat(e.target.value);
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  // Skip forward/backward
  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  };
  
  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(0, video.currentTime - 10);
  };
  
  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  return (
    <div 
      ref={playerRef}
      className={cn(
        "relative overflow-hidden bg-black w-full aspect-video group", 
        className
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        playsInline
        onClick={() => setIsPlaying(!isPlaying)}
      />
      
      {/* Video Controls Overlay */}
      <div 
        className={cn(
          "absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300",
          isControlsVisible ? "opacity-100" : "opacity-0"
        )}
      >
        {title && (
          <div className="absolute top-4 left-4 text-white">
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="w-full mb-3">
          <div className="relative flex items-center w-full">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
            <div 
              className="absolute h-1 bg-primary rounded-full pointer-events-none" 
              style={{ width: `${calculateProgress(currentTime, duration)}%` }}
            />
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 text-white hover:text-primary transition-colors rounded-full bg-white/10 hover:bg-white/20"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button 
              onClick={skipBackward}
              className="p-2 text-white hover:text-primary transition-colors"
              aria-label="Rewind 10 seconds"
            >
              <Rewind size={20} />
            </button>
            
            <button 
              onClick={skipForward}
              className="p-2 text-white hover:text-primary transition-colors"
              aria-label="Forward 10 seconds"
            >
              <FastForward size={20} />
            </button>
            
            <div className="flex items-center space-x-2 text-white">
              <button 
                onClick={toggleMute}
                className="p-1 hover:text-primary transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
            
            <span className="text-white text-sm ml-2">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {}}
              className="p-1 text-white hover:text-primary transition-colors"
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
            
            <button 
              onClick={toggleFullscreen}
              className="p-1 text-white hover:text-primary transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
