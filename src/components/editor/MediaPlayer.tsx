
"use client";

import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface MediaPlayerProps {
  audioSrc?: string; // URL or path to the audio file
  isLoading: boolean; // If audio source is still loading or not available
}

const MediaPlayer = ({ audioSrc, isLoading }: MediaPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (audioRef.current && audioSrc) {
      audioRef.current.src = audioSrc; // Set src when it becomes available
      audioRef.current.load(); // Important to load the new source

      const setAudioData = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
          setCurrentTime(audioRef.current.currentTime);
        }
      };

      const setAudioTime = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0); // Reset to start or to duration based on preference
      };

      audioRef.current.addEventListener("loadeddata", setAudioData);
      audioRef.current.addEventListener("timeupdate", setAudioTime);
      audioRef.current.addEventListener("ended", handleEnded);


      // Reset states if src changes
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);


      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("loadeddata", setAudioData);
          audioRef.current.removeEventListener("timeupdate", setAudioTime);
          audioRef.current.removeEventListener("ended", handleEnded);
        }
      };
    }
  }, [audioSrc]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => console.error("Error playing audio:", error));
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };


  if (isLoading) {
    return <div className="text-center p-4 text-muted-foreground">Loading audio player...</div>;
  }
  if (!audioSrc && !isLoading) {
     return <div className="text-center p-4 text-muted-foreground">No audio file loaded for playback.</div>;
  }

  return (
    <div className="p-4 bg-card rounded-lg shadow-md w-full">
      <audio ref={audioRef} preload="metadata" />
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{formatTime(currentTime)}</span>
        <span className="text-sm text-muted-foreground">{formatTime(duration)}</span>
      </div>
      <Slider
        value={[currentTime]}
        max={duration || 0}
        step={0.1}
        onValueChange={handleSliderChange}
        className="mb-3"
        disabled={!audioSrc || duration === 0}
        aria-label="Audio progress"
      />
      <div className="flex items-center justify-center space-x-3">
        <Button variant="ghost" size="icon" onClick={() => seek(-5)} disabled={!audioSrc}>
          <RotateCcw className="h-5 w-5" />
          <span className="sr-only">Rewind 5 seconds</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={togglePlayPause} disabled={!audioSrc || duration === 0} className="w-12 h-12">
          {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
          <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => seek(5)} disabled={!audioSrc}>
          <RotateCw className="h-5 w-5" />
          <span className="sr-only">Forward 5 seconds</span>
        </Button>
      </div>
    </div>
  );
};

export default MediaPlayer;
