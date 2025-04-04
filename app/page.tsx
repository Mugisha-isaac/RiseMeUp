import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Eye, Heart } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getYouTubeEmbedUrl } from "@/utils"

async function getFeaturedVideos() {
  const { data, error } = await supabase
    .from("videos")
    .select("*, channels(*)")
    .order("views", { ascending: false })
    .limit(6)

  if (error) {
    console.error("Error fetching featured videos:", error)
    return []
  }

  return data
}

async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*").limit(3)

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data
}

export default async function Home() {
  const featuredVideos = await getFeaturedVideos()
  const categories = await getCategories()

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to RiseMeUp</h1>
        <p className="text-xl text-gray-400 mb-8">Discover and showcase African talent</p>
        <Link href="/categories">
          <Button className="bg-[#ff1493] hover:bg-[#ff1493]/90 text-white text-lg px-8 py-4">Get Started</Button>
        </Link>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-white mb-6">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="bg-[#1a2942] border-gray-800">
              <CardContent className="p-6">
                <Zap className="h-8 w-8 text-[#9d4edd] mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
                <p className="text-gray-400 mb-4">{category.description}</p>
                <Link href={`/categories/${category.name.toLowerCase()}`}>
                  <Button variant="outline" className="w-full">
                    Explore {category.name}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-white mb-6">Trending Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVideos.map((video) => (
            <Link href={`/talents/${video.id}`} key={video.id} className="group">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                <iframe
                  width="100%"
                  height="100%"
                  src={getYouTubeEmbedUrl(video.video_url)}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-white text-sm">
                  {video.duration}
                </div>
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <Eye className="h-4 w-4 text-[#1e90ff]" />
                  <span className="text-white text-sm">{video.views?.toLocaleString()}</span>
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <Heart className="h-4 w-4 text-[#ff1493]" />
                  <span className="text-white text-sm">{video.likes?.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-white font-medium group-hover:text-[#1e90ff]">{video.title}</h3>
                <p className="text-[#1e90ff]">{video.channels?.name}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/categories">
            <Button className="bg-[#9d4edd] hover:bg-[#9d4edd]/90 text-white">Explore More Videos</Button>
          </Link>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to showcase your talent?</h2>
        <p className="text-xl text-gray-400 mb-8">Join thousands of talented individuals across Africa</p>
        <Link href="/talents/add">
          <Button className="bg-[#9d4edd] hover:bg-[#9d4edd]/90 text-white text-lg px-8 py-4">
            Upload Your Talent
          </Button>
        </Link>
      </section>
    </div>
  )
}

