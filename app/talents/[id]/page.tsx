"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Heart, ListPlus, Star } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/utils";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";

interface TalentVideo {
  _id: string;
  title: string;
  video_url: string;
  views: number;
  likes: number;
  favorites?: any[];
  channel_id: {
    _id: string;
    name: string;
    subscribers: number;
    avatar?: string;
  };
  isLiked?: boolean;
  isFavorite?: boolean;
}

interface RecommendedVideo {
  _id: string;
  title: string;
  video_url: string;
  views: number;
  likes: number;
  thumbnail: string;
}

export default function TalentDetailsPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [video, setVideo] = useState<TalentVideo | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<RecommendedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    async function fetchData() {
      try {
        const [videoRes, recommendedRes] = await Promise.all([
          fetch(`/api/talents/${params.id}`),
          fetch(`/api/talents/${params.id}/recommended`)
        ]);
        
        if (!videoRes.ok || !recommendedRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [videoData, recommendedData] = await Promise.all([
          videoRes.json(),
          recommendedRes.json()
        ]);
        
        const processedVideoData = {
          ...videoData,
          favorites: videoData.favorites || []
        };
        
        setVideo(processedVideoData);
        setRecommendedVideos(recommendedData);
        
        if (session?.user) {
          const [likesRes, favoritesRes, subsRes] = await Promise.all([
            fetch(`/api/talents/${params.id}/like`),
            fetch(`/api/favorites/${params.id}`),
            fetch(`/api/channels/${videoData.channel_id._id}/subscription`)
          ]);

          if (!likesRes.ok || !favoritesRes.ok || !subsRes.ok) {
            throw new Error('Failed to fetch user-specific data');
          }

          const [likesData, favoritesData, subsData] = await Promise.all([
            likesRes.json(),
            favoritesRes.json(),
            subsRes.json()
          ]);

          setVideo(prev => prev ? {
            ...prev,
            isLiked: likesData.isLiked,
            isFavorite: favoritesData.isFavorite
          } : null);
          setIsSubscribed(subsData.isSubscribed);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load video details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id, session, status]);

  const handleLike = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please login to like videos",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch(`/api/talents/${video?._id}/like`, {
        method: 'POST'
      });
      const data = await res.json();
      setVideo(prev => prev ? { ...prev, likes: data.likes, isLiked: data.isLiked } : null);
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please login to subscribe to channels",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch(`/api/channels/${video?.channel_id._id}/subscribe`, {
        method: 'POST'
      });
      const data = await res.json();
      setIsSubscribed(data.isSubscribed);
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleAddToPlaylist = () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please login to add videos to playlist",
        variant: "destructive"
      });
      return;
    }
    // Open playlist dialog
    setShowPlaylistDialog(true);
  };

  const handleAddToFavorites = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please login to add favorites",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch(`/api/favorites/${video?._id}`, {
        method: 'POST'
      });
      const data = await res.json();
      setVideo(prev => prev ? { ...prev, isFavorite: data.isFavorite } : null);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  console.log("video", video);

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white">Video not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-[#1a2942] border-gray-800">
            <CardContent className="p-6">
              {/* Video Player */}
              <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                <iframe
                  width="100%"
                  height="100%"
                  src={getYouTubeEmbedUrl(video?.video_url)}
                  title={video?.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              {/* Video Title and Actions */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">{video?.title}</h1>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddToPlaylist}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <ListPlus className="h-4 w-4 mr-1" />
                    Add to Playlist
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddToFavorites}
                    className={`hover:bg-gray-700 ${video?.isFavorite ? "text-yellow-500" : "text-gray-400"}`}
                  >
                    <Star className={`h-4 w-4 mr-1 ${video?.isFavorite ? "fill-current" : ""}`} />
                    {video?.isFavorite ? "Favorited" : "Add to Favorites"}
                  </Button>
                </div>
              </div>

              {/* Channel Info and Subscribe Button */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={video?.channel_id?.avatar} />
                    <AvatarFallback>
                      {video?.channel_id?.name ? video.channel_id.name[0].toUpperCase() : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/channels/${video?.channel_id?._id}`}>
                      <p className="font-medium text-white hover:text-[#ff1493] transition">
                        {video?.channel_id?.name || 'Unknown Channel'}
                      </p>
                    </Link>
                    <p className="text-sm text-gray-400">
                      {video?.channel_id?.subscribers?.toLocaleString() || 0} subscribers
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={handleSubscribe}
                  className={`${isSubscribed ? "bg-gray-700 hover:bg-gray-600" : "bg-[#ff1493] hover:bg-[#ff1493]/90"} transition`}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              </div>

              {/* Video Stats */}
              <div className="flex items-center gap-4 text-gray-400">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`hover:bg-gray-700 ${video?.isLiked ? "text-[#ff1493]" : "text-gray-400"}`}
                >
                  <Heart className={`h-5 w-5 mr-1 ${video?.isLiked ? "fill-current" : ""}`} />
                  {video?.likes?.toLocaleString() || 0}
                </Button>
                <span className="flex items-center gap-1">
                  <Eye className="h-5 w-5" />
                  {video?.views?.toLocaleString() || 0} views
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Videos */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-white mb-4">More from this channel</h2>
          <div className="space-y-4">
            {recommendedVideos.map((video) => (
              <Link key={video._id} href={`/talents/${video._id}`}>
                <Card className="bg-[#1a2942] border-gray-800 hover:bg-[#243555] transition">
                  <CardContent className="p-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                      <Image
                        src={getYouTubeEmbedUrl(video.thumbnail) || `/placeholder.jpg`}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-white line-clamp-2">{video.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.views?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {video.likes?.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}