import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";

/** Playable audio bubble for voice messages in the chat panel. */
export default function VoiceMessageBubble({ src, duration }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 min-w-[140px]">
      <button
        onClick={toggle}
        className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0"
      >
        {playing ? <Pause size={12} /> : <Play size={12} />}
      </button>
      <div className="flex-1">
        <div className="h-1.5 bg-indigo-200 rounded-full w-full">
          <div className="h-1.5 bg-indigo-500 rounded-full w-1/3" />
        </div>
      </div>
      <span className="text-[10px] text-slate-500 font-mono">
        {duration || "0:00"}
      </span>
      {src && (
        <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} />
      )}
    </div>
  );
}
