import React from "react";

export default function AICommentaryPanel({ commentary }) {
    if (!commentary || !commentary.line2) return null;

    return (
        <div className="bg-[#031d44] rounded-2xl p-6 shadow-2xl border border-blue-400/30 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ff6b35]"></div>
            <h3 className="text-[#ff6b35] text-[10px] font-black uppercase tracking-[0.3em] mb-3">
                Live AI Commentary
            </h3>
            <div className="animate-in slide-in-from-right duration-700">
                <p className="text-white text-lg font-bold leading-relaxed italic">
                    "{commentary.line2}"
                </p>
                {commentary.line1 && (
                    <p className="text-blue-300/60 text-xs mt-4 font-mono uppercase tracking-widest border-t border-blue-900 pt-3">
                        {commentary.line1}
                    </p>
                )}
            </div>
            
            <div className="absolute -bottom-4 -right-4 opacity-5">
                 <svg width="100" height="100" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v10h-2zm0 12h2v2h-2z"/>
                 </svg>
            </div>
        </div>
    );
}
