import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Eye, Heart, MessageSquare, Share2 } from "lucide-react"
import Link from "next/link"
import FavoriteButton from "@/components/favorite-button"

async function getTalentDetails(id: string) {
  const { data: video, error } = await supabase
    .from("videos")
    .select(`
      *,
      channels (*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching video:", error)
    return null
  }

  // Get related videos from the same channel
  const { data: relatedVideos, error: relatedError } = await supabase
    .from("videos")
    .select(`
      *,
      channels (

      *,
      channels (*)
    `)
    .eq("channel_id", video.channel_id)
    .neq("id", id)
    .order("views", { ascending: false })
    .limit(3)

  if (relatedError) {
    console.error("Error fetching related videos:", relatedError)
    return { ...video, relatedVideos: [] }
  }

  return { ...video, relatedVideos }
}

export default async function TalentPage({ params }: { params: { id: string } }) {
  const talent = await getTalentDetails(params.id)

  if (!talent) {
    return <div className="text-white">Video not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
            <iframe
              width="100%"
              height="100%"
              src={talent.video_url}
              title={talent.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div className="mt-6 flex items-center">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage
                src={talent.channels?.avatar || "/placeholder.svg?height=48&width=48"}
                alt={talent.channels?.name}
              />
              <AvatarFallback>
                {talent.channels?.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{talent.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>
                  By{" "}
                  <Link href={`/channels/${talent.channel_id}`} className="text-[#9d4edd]">
                    {talent.channels?.name}
                  </Link>
                </span>
                <span className="text-[#9d4edd]">{talent.views?.toLocaleString()} Views</span>
                <span>{new Date(talent.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Button className="bg-[#ff1493] hover:bg-[#ff1493]/90 text-white">Subscribe</Button>
            <div className="text-white font-bold">{talent.channels?.subscribers?.toLocaleString()}</div>

            <div className="flex items-center ml-auto gap-6">
              <FavoriteButton videoId={talent.id} />
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <MessageSquare className="h-6 w-6 mr-2" />
                <span>Comment</span>
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <Share2 className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-6">
            <p className="text-gray-300">{talent.description}</p>
            <p className="mt-4 text-gray-300">
              Category:{" "}
              <Link href={`/categories/${talent.channels?.category.toLowerCase()}`} className="text-[#9d4edd]">
                {talent.channels?.category}
              </Link>
            </p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold text-white mb-4">Related Videos</h3>
          <div className="space-y-4">
            {talent.relatedVideos?.map((item: any) => (
              <Link href={`/talents/${item.id}`} key={item.id} className="flex gap-4 group">
                <div className="relative w-40 h-24 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                  <iframe
                    width="100%"
                    height="100%"
                    src={item.video_url}
                    title={item.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div>
                  <h4 className="text-white font-medium group-hover:text-[#9d4edd]">{item.title}</h4>
                  <p className="text-[#9d4edd] text-sm">{talent.channels?.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" /> {item.views?.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" /> {item.likes?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

