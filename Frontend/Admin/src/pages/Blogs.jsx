import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
    videoUrl: "",
    category: "General",
    relatedId: "",
    isLive: false,
    tags: ""
  });
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetchBlogs();
    fetchMatches();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/blogs");
      setBlogs(res.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await api.get("/matches");
      setMatches(res.data);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tags: typeof formData.tags === 'string' ? formData.tags.split(",").map(t => t.trim()) : formData.tags
      };
      if (editingBlog) {
        await api.put(`/blogs/${editingBlog._id}`, data);
      } else {
        await api.post("/blogs", data);
      }
      setIsModalOpen(false);
      setEditingBlog(null);
      setFormData({
        title: "",
        content: "",
        imageUrl: "",
        videoUrl: "",
        category: "General",
        relatedId: "",
        isLive: false,
        tags: ""
      });
      fetchBlogs();
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await api.delete(`/blogs/${id}`);
        fetchBlogs();
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };

  return (
    <div className="space-y-8 bg-[#f8fafc] min-h-screen p-6">
      {/* Header section with premium styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#031d44] p-8 rounded-3xl shadow-2xl text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <div className="relative">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">News Desk</h2>
          <p className="text-blue-200/60 font-medium text-sm mt-1 uppercase tracking-widest">Broadcast live highlights and official press releases</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => {
              setEditingBlog(null);
              setIsModalOpen(true);
            }}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95"
          >
             Flash New Story
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <div key={blog._id} className="group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl border border-slate-100 overflow-hidden transition-all duration-500 hover:-translate-y-1">
            <div className="relative aspect-video bg-slate-100">
               {blog.imageUrl ? (
                 <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center font-black text-slate-300 text-xl italic uppercase">No Cover</div>
               )}
               <div className="absolute top-4 left-4 flex gap-2">
                  <span className="text-[9px] font-black bg-blue-600 text-white px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg">
                    {blog.category}
                  </span>
                  {blog.isLive && (
                    <span className="text-[9px] font-black bg-red-600 text-white px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg animate-pulse">
                      Live Now
                    </span>
                  )}
               </div>
            </div>
            
            <div className="p-8">
              <h3 className="text-xl font-black text-slate-800 mb-3 uppercase tracking-tighter italic leading-tight group-hover:text-blue-600 transition-colors">
                 {blog.title}
              </h3>
              <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">{blog.content}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                 <div className="flex -space-x-1">
                    {blog.tags?.slice(0, 3).map((tag, i) => (
                       <span key={i} className="text-[8px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">#{tag}</span>
                    ))}
                 </div>
                 <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingBlog(blog);
                        setFormData({
                          title: blog.title,
                          content: blog.content,
                          imageUrl: blog.imageUrl || "",
                          videoUrl: blog.videoUrl || "",
                          category: blog.category,
                          relatedId: blog.relatedId || "",
                          isLive: blog.isLive || false,
                          tags: blog.tags.join(", ")
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="p-3 bg-slate-50 hover:bg-red-600 hover:text-white text-red-600 rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#031d44]/90 backdrop-blur-xl flex items-center justify-center p-6 z-[100]">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
            <div className="bg-[#031d44] p-10 text-white relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />
               <h2 className="text-3xl font-black uppercase tracking-tighter italic">{editingBlog ? "Refine Transmission" : "Direct Draft"}</h2>
               <p className="text-blue-200/50 text-xs font-black uppercase tracking-widest mt-2">{editingBlog ? "Updating registry record #" + editingBlog._id : "Preparing new broadcast signal"}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1">Headliner Title</label>
                      <input
                        required
                        placeholder="State your business..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1">Extended Copy</label>
                      <textarea
                        required
                        rows={8}
                        placeholder="Detailed report..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all resize-none"
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                      />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1">Category</label>
                          <select
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                          >
                            <option value="General">General</option>
                            <option value="Match">Match News</option>
                            <option value="Player">Player Spotlight</option>
                            <option value="Tournament">Tournament</option>
                          </select>
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1">Live Status</label>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isLive: !formData.isLive })}
                            className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                              formData.isLive ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {formData.isLive ? "Active Stream" : "Static Report"}
                          </button>
                       </div>
                    </div>

                    {formData.category === "Match" && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1">Associate Match</label>
                      <select
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all"
                        value={formData.relatedId}
                        onChange={e => setFormData({ ...formData, relatedId: e.target.value })}
                      >
                        <option value="">No Association</option>
                        {matches.map(m => (
                          <option key={m._id} value={m._id}>
                             {m.teams[0]?.shortName} vs {m.teams[1]?.shortName} ({new Date(m.date).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                    )}

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1">Visual Asset URL</label>
                      <input
                        placeholder="Hero image link..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all"
                        value={formData.imageUrl}
                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1">Video Stream URL</label>
                      <input
                        placeholder="YouTube / MP4 source..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all"
                        value={formData.videoUrl}
                        onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1">Search Keywords</label>
                      <input
                        placeholder="Tag01, Tag02..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all"
                        value={formData.tags}
                        onChange={e => setFormData({ ...formData, tags: e.target.value })}
                      />
                    </div>
                 </div>
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="px-12 py-4 bg-[#031d44] hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all active:scale-95"
                >
                  {editingBlog ? "Apply Patch" : "Commit Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
