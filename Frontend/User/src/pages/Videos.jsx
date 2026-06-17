import React, { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get("/blogs");
        const data = Array.isArray(res.data) ? res.data : (res.data.blogs || []);
        // Filter locally for blogs with videoUrl
        setVideos(data.filter(b => b.videoUrl));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="bg-cric-accent min-h-screen">
      <div className="pt-32 pb-20 px-4 text-center">
        <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
          BQ <span className="text-red-600">TV</span>
        </h1>
        <p className="text-blue-300/40 text-sm md:text-base font-black uppercase tracking-[0.3em]">
          Exclusive Highlights • Match Recaps • Player Features
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-32">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-video bg-white/5 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {videos.map(video => (
              <div key={video._id} className="group cursor-pointer">
                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-black shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-blue-500/20">
                  {video.imageUrl ? (
                    <img src={video.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt={video.title} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-black" />
                  )}

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-10 h-10 text-white ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-8 right-8">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full mb-3 inline-block shadow-lg">
                      Watch Now
                    </span>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight drop-shadow-lg">
                      {video.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="text-center py-40">
            <div className="text-6xl mb-6">🎬</div>
            <p className="text-blue-300/40 font-black uppercase tracking-widest text-sm">No video signals detected in current frequency</p>
          </div>
        )}
      </div>
    </div>
  );
}
