"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Star } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function SponsorRecommendations() {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function loadRecommendations() {
      const { data } = await supabase
        .from('videos')
        .select(`
          *,
          channels (*),
          likes:video_likes(count)
        `)
        .order('views', { ascending: false })
        .limit(5);

      setRecommendations(data || []);
    }

    loadRecommendations();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Recommended Talents</h3>
      {recommendations.map((talent: any) => (
        <Card key={talent.id} className="bg-[#1a2942] border-gray-800">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-white font-medium">{talent.title}</h4>
                <p className="text-sm text-gray-400">{talent.channels?.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-400">
                    {talent.likes?.count || 0} likes
                  </span>
                </div>
              </div>
              <Link href={`/messages/${talent.channels?.user_id}`}>
                <Button size="sm" className="bg-[#1e90ff] hover:bg-[#1e90ff]/90">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}