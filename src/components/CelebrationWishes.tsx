import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Film, Trash2, Play, Sparkles, X, Tv, RefreshCw, Volume2, Link, FileVideo } from 'lucide-react';
import { saveFeaturedVideo, getFeaturedVideo, deleteFeaturedVideo } from '../utils/db';
import { playChimeSound, playSparkleSound } from '../utils/audio';

// Secure helper to detect and transform Google Drive Links to unblocked previews
function getGoogleDriveEmbedUrl(url: string): string | null {
  const regExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regExp);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  const regExp2 = /[?&]id=([a-zA-Z0-9_-]+)/;
  const match2 = url.match(regExp2);
  if (match2 && match2[1]) {
    return `https://drive.google.com/file/d/${match2[1]}/preview`;
  }
  if (url.includes('drive.google.com') && url.includes('/preview')) {
    return url;
  }
  return null;
}

// Secure helper to parse YouTube links to embeddable formats
function getYouTubeEmbedUrl(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
}

export default function CelebrationWishes() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(() => {
    return localStorage.getItem('featured_video_stream_link') || 'https://drive.google.com/file/d/1bf9kkPrcAzIKM3T4_FFQra6Stl2V85KS/view?usp=sharing';
  });
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('link');
  const [inputUrl, setInputUrl] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // Load the single saved video from IndexedDB on startup
  useEffect(() => {
    async function loadSavedVideo() {
      try {
        const savedBlob = await getFeaturedVideo();
        if (savedBlob) {
          const url = URL.createObjectURL(savedBlob);
          setVideoUrl(url);
        }
      } catch (err) {
        console.warn('Could not retrieve saved video:', err);
      }
    }
    loadSavedVideo();

    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        processVideoFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processVideoFile(e.target.files[0]);
    }
  };

  const processVideoFile = (file: File) => {
    setVideoFile(file);
    startSimulatedUpload(file);
  };

  const startSimulatedUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStep('Calibrating theater layout elements...');

    const steps = [
      { prg: 25, desc: 'Optimizing high-definition bitrates...' },
      { prg: 60, desc: 'Securing video stream into offline database store...' },
      { prg: 90, desc: 'Executing final touch-ups...' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(async () => {
      setUploadProgress((prev) => {
        const nextPrg = prev + Math.floor(Math.random() * 8) + 3;

        if (currentStepIdx < steps.length && nextPrg >= steps[currentStepIdx].prg) {
          setUploadStep(steps[currentStepIdx].desc);
          currentStepIdx++;
        }

        if (nextPrg >= 100) {
          clearInterval(interval);
          finalizeVideoSave(file);
          return 100;
        }
        return nextPrg;
      });
    }, 120);
  };

  const finalizeVideoSave = async (file: File) => {
    try {
      await saveFeaturedVideo(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setStreamUrl(null);
      localStorage.removeItem('featured_video_stream_link');
      setIsUploading(false);
      playSparkleSound();
    } catch (err) {
      console.error('Error saving video:', err);
      setIsUploading(false);
    }
  };

  const handleSaveStreamLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    
    localStorage.setItem('featured_video_stream_link', inputUrl.trim());
    setStreamUrl(inputUrl.trim());
    
    // Clear offline video
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
      deleteFeaturedVideo().catch(console.error);
    }
    
    setInputUrl('');
    playSparkleSound();
  };

  const handleRemoveVideo = async () => {
    if (confirm("Are you sure you want to remove the celebration video player?")) {
      try {
        await deleteFeaturedVideo();
        if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
        }
        setVideoUrl(null);
        setVideoFile(null);
        setStreamUrl(null);
        localStorage.removeItem('featured_video_stream_link');
        playChimeSound();
      } catch (err) {
        console.error('Failed deletion:', err);
      }
    }
  };

  // Compute what embedding to serve based on parsed inputs
  const gDriveEmbed = streamUrl ? getGoogleDriveEmbedUrl(streamUrl) : null;
  const youtubeEmbed = streamUrl ? getYouTubeEmbedUrl(streamUrl) : null;
  const isDirectVideoFormat = streamUrl && (
    streamUrl.endsWith('.mp4') || 
    streamUrl.endsWith('.webm') || 
    streamUrl.endsWith('.mov') || 
    streamUrl.endsWith('.ogg')
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative z-20">
      
      {/* Title area */}
      <div className="text-center mb-10">
        <span className="px-3 py-1 bg-brand-100 text-brand-500 rounded-full font-bold text-xs inline-flex items-center gap-1.5 mb-3 select-none">
          <Tv className="w-3.5 h-3.5 text-brand-500" /> CELEBRATION THEATER
        </span>
        <h2 className="font-serif italic font-extrabold text-neutral-800 text-3xl md:text-4xl mb-4">
          The Birthday Screening
        </h2>
        <p className="text-neutral-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-semibold">
          Paste a Google Drive video link, YouTube link, or upload your sister's celebration video file below. It plays directly on the page and stays saved persistently.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-100 shadow-xl shadow-neutral-100/30">
        <AnimatePresence mode="wait">
          
          {/* 1. Video Upload Progress Screen */}
          {isUploading && (
            <motion.div
              key="loading-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="min-h-[18rem] md:min-h-[22rem] flex flex-col justify-center items-center py-10"
            >
              <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
                <Film className="w-4 h-4 text-gold-500 absolute" />
              </div>
              <h4 className="text-neutral-800 font-sans font-extrabold text-lg mb-2">Preparing Video Playback</h4>
              <p className="text-neutral-400 font-medium text-xs mb-6 uppercase tracking-widest">{uploadStep}</p>
              
              {/* Giant clean loading element bar */}
              <div className="w-full max-w-sm h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/55 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-500 to-gold-400 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-brand-500 font-mono font-bold text-sm mt-2">{uploadProgress}% Complete</span>
            </motion.div>
          )}

          {/* 2. Interactive Video Screen Present (Either Uploaded Offline Video OR Link Player) */}
          {!isUploading && (videoUrl || streamUrl) && (
            <motion.div
              key="theater-player"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Custom styled widescreen browser frame wrapper */}
              <div className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-200 shadow-2xl aspect-video w-full max-w-3xl mx-auto flex items-center justify-center group">
                
                {videoUrl && (
                  <video
                    ref={videoPlayerRef}
                    src={videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )}

                {streamUrl && (
                  <>
                    {youtubeEmbed ? (
                      <iframe
                        src={youtubeEmbed}
                        className="w-full h-full border-0 absolute inset-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : gDriveEmbed ? (
                      <iframe
                        src={gDriveEmbed}
                        className="w-full h-full border-0 absolute inset-0 bg-neutral-950"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                      />
                    ) : isDirectVideoFormat ? (
                      <video
                        src={streamUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <iframe
                        src={streamUrl}
                        className="w-full h-full border-0 absolute inset-0 bg-neutral-950"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                      />
                    )}
                  </>
                )}

                {/* Subtle overlay crown label */}
                <div className="absolute top-4 left-4 cursor-default bg-neutral-900/80 text-white text-[10px] uppercase font-mono tracking-widest px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 backdrop-blur-xs select-none pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                  <Play className="w-3 h-3 text-brand-400 fill-brand-400 animate-pulse" /> SISTER CELEBRATION PLAYING
                </div>

                {/* Hover control indicators */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <span className="p-1.5 bg-neutral-900/80 text-white rounded-lg border border-white/10 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-gold-400" /> Web Player
                  </span>
                </div>
              </div>

              {/* Theater controls block */}
              <div className="max-w-md mx-auto pt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl(null);
                    setStreamUrl(null);
                    localStorage.removeItem('featured_video_stream_link');
                    deleteFeaturedVideo().catch(console.error);
                  }}
                  className="w-full sm:w-auto px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-neutral-200"
                >
                  <RefreshCw className="w-4 h-4 text-neutral-600" />
                  Load Different Video / Link
                </button>

                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="w-full sm:w-auto px-5 py-3 bg-neutral-50 hover:bg-brand-50 border border-neutral-200 hover:border-brand-100 text-neutral-500 hover:text-brand-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Video Playback
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </motion.div>
          )}

          {/* 3. Empty State Tabs & Paste/Upload Zone */}
          {!isUploading && !videoUrl && !streamUrl && (
            <motion.div
              key="uploader-zone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Tab selector */}
              <div className="flex bg-neutral-100 p-1.5 rounded-2xl mb-8 relative select-none">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('link');
                    playChimeSound();
                  }}
                  className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'link'
                      ? 'bg-white text-neutral-800 shadow-sm border border-neutral-200/40'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Link className="w-3.5 h-3.5 text-brand-500" /> Link (Google Drive / YouTube)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('upload');
                    playChimeSound();
                  }}
                  className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-white text-neutral-800 shadow-sm border border-neutral-200/40'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <FileVideo className="w-3.5 h-3.5 text-gold-500" /> Offline File Upload
                </button>
              </div>

              {activeTab === 'link' ? (
                <form onSubmit={handleSaveStreamLink} className="w-full max-w-xl text-center space-y-4 py-4 min-h-[14rem] flex flex-col justify-center items-center">
                  <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 mb-2 border border-brand-100">
                    <Link className="w-6 h-6 text-brand-500 animate-pulse" />
                  </div>
                  
                  <h4 className="font-serif italic font-extrabold text-neutral-800 text-lg">
                    Add Celebration Stream Link
                  </h4>
                  
                  <p className="font-sans font-medium text-neutral-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    Paste your Google Drive share link, YouTube video URL, or direct stream below. The portal safely parses it and serves it securely.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full pt-2">
                    <input
                      type="url"
                      required
                      placeholder="Paste link here (e.g., https://drive.google.com/file/d/...)"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-sans text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-50 transition-all"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                    >
                      Embed Video
                    </button>
                  </div>
                  
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Ensure your Google Drive link or YouTube url is set to "Anyone with the link can view"
                  </span>
                </form>
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[14rem] w-full ${
                    dragActive
                      ? 'border-brand-400 bg-brand-50/50 scale-[0.99] shadow-inner'
                      : 'border-neutral-200 hover:border-brand-200 bg-neutral-50/50 hover:bg-neutral-50 shadow-sm'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div className="w-14 h-14 rounded-full bg-gold-50 border border-gold-100 flex items-center justify-center text-gold-500 mb-4 animate-bounce">
                    <Upload className="w-6 h-6 text-gold-500" />
                  </div>

                  <h5 className="font-serif italic font-extrabold text-neutral-800 text-base mb-1">
                    Drag and Drop Local Video File
                  </h5>
                  
                  <p className="font-sans font-medium text-neutral-500 text-xs max-w-sm mb-4 leading-relaxed">
                    Drag your file directly into this block, or browse files on your computer to save locally on this device.
                  </p>

                  <span className="px-4 py-2 bg-neutral-800 hover:bg-neutral-900 duration-150 text-white font-bold text-xs rounded-xl shadow-lg shadow-neutral-800/10">
                    Browse Video file
                  </span>

                  <span className="text-[10px] text-neutral-400 font-mono mt-4">
                    Supports MP4, MOV, WebM, or OGG video format
                  </span>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
