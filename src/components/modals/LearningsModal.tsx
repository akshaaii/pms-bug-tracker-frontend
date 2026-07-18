import React from 'react';
import { BookOpen, X } from 'lucide-react';
import { LEARNINGS } from '../../constants';
import { useAppContext } from '../../context/AppContext';

/**
 * Learnings dialog overlay. Reads open state and close handler from AppContext.
 */
export default function LearningsModal() {
  const { isLearningsOpen, setIsLearningsOpen } = useAppContext();

  if (!isLearningsOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1f32] border border-[#2a2d3e] w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl flex flex-col select-none animate-in fade-in duration-200">

        {/* Header */}
        <div className="bg-[#161a2e] border-b border-[#2a2d3e] px-5 py-4 flex justify-between items-center">
          <h3 className="font-bold font-sans text-sm text-[#dee1fd] flex items-center gap-1.5">
            <BookOpen className="w-[18px] h-[18px] text-[#b8c3ff]" />
            <span>Lessons Learned &amp; System Learnings Repository</span>
          </h3>
          <button
            onClick={() => setIsLearningsOpen(false)}
            className="p-1 hover:bg-[#93000a]/20 rounded-full text-[#8e90a0] hover:text-[#ffb4ab] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[480px] overflow-y-auto custom-scrollbar text-left">
          <p className="text-xs text-[#c4c5d7]">
            Welcome to the shared CSE Engineering Knowledge Pool. Access critical fixes, deallocation notes,
            and layout rules compiled by our senior engineers.
          </p>

          <div className="space-y-4 divide-y divide-[#2a2d3e]/50 pr-1.5">
            {LEARNINGS.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0">
                <span className="bg-blue-950 text-blue-300 border border-blue-900 px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wide">
                  {item.category}
                </span>
                <h4 className="text-xs font-bold font-sans text-[#dee1fd] mt-2 leading-snug">{item.title}</h4>
                <p className="text-xs text-[#c4c5d7]/90 font-sans mt-1 leading-relaxed">{item.description}</p>
                <span className="text-[10px] text-[#8e90a0] font-mono mt-1.5 block">Shared by: {item.author}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#161a2e] border-t border-[#2a2d3e] px-5 py-3 flex justify-end">
          <button
            onClick={() => setIsLearningsOpen(false)}
            className="bg-[#294fdb] hover:bg-blue-600 px-4 py-1.5 rounded-lg text-xs text-white font-bold transition-all"
          >
            Close Repository
          </button>
        </div>

      </div>
    </div>
  );
}
