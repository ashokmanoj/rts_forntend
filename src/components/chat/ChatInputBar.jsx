import { useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Mic,
  Square,
  X,
  Play,
  Pause,
  FileText,
  FileSpreadsheet,
  FileImage,
  Film,
  Music,
  Archive,
  File,
} from "lucide-react";
import { formatDuration } from "../../utils/dateTime";

// ─── helpers ────────────────────────────────────────────────

function getFileInfo(file) {
  const t = file.type;
  const n = file.name.toLowerCase();
  if (t.startsWith("image/"))
    return {
      label: "Image",
      color: "bg-purple-100",
      iconColor: "text-purple-500",
      Icon: FileImage,
    };
  if (t.startsWith("video/"))
    return {
      label: "Video",
      color: "bg-pink-100",
      iconColor: "text-pink-500",
      Icon: Film,
    };
  if (t.startsWith("audio/"))
    return {
      label: "Audio",
      color: "bg-yellow-100",
      iconColor: "text-yellow-600",
      Icon: Music,
    };
  if (t === "application/pdf")
    return {
      label: "PDF",
      color: "bg-red-100",
      iconColor: "text-red-500",
      Icon: FileText,
    };
  if (t.includes("word") || /\.(doc|docx)$/.test(n))
    return {
      label: "Word Doc",
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: FileText,
    };
  if (
    t.includes("excel") ||
    t.includes("spreadsheet") ||
    /\.(xls|xlsx|csv)$/.test(n)
  )
    return {
      label: "Spreadsheet",
      color: "bg-green-100",
      iconColor: "text-green-600",
      Icon: FileSpreadsheet,
    };
  if (/\.(zip|rar|7z|tar|gz)$/.test(n))
    return {
      label: "Archive",
      color: "bg-orange-100",
      iconColor: "text-orange-500",
      Icon: Archive,
    };
  return {
    label: "File",
    color: "bg-slate-100",
    iconColor: "text-slate-500",
    Icon: File,
  };
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── component ──────────────────────────────────────────────

/**
 * ChatInputBar — stage everything first, send once.
 *
 * Compose flow:
 *   1. Optionally attach a file  (any type — preview shown above bar)
 *   2. Optionally record audio   (waveform preview shown above bar)
 *   3. Optionally type a caption / message
 *   4. Hit Send → everything goes together
 *   User can remove the staged file or audio at any point before sending.
 *
 * Props:
 *   onSend({ text, file, voiceBlob, voiceDuration }) — called on Send
 */
export default function ChatInputBar({ onSend }) {
  // staged attachments
  const [pendingFile, setPendingFile] = useState(null); // File object
  const [imgPreview, setImgPreview] = useState(null); // blob URL if image
  const [pendingVoice, setPendingVoice] = useState(null); // { blob, url, duration }
  const [voicePlaying, setVoicePlaying] = useState(false);

  // text caption
  const [message, setMessage] = useState("");

  // recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const chunksRef = useRef([]);
  const voiceAudioRef = useRef(null);

  const hasAttachment = !!pendingFile || !!pendingVoice;
  const canSend = hasAttachment || message.trim().length > 0;

  // ── file ────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPendingFile(f);
    setImgPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
    e.target.value = "";
  };

  const removeFile = () => {
    setPendingFile(null);
    setImgPreview(null);
  };

  // ── voice ───────────────────────────────────────────────
  const startRecording = async () => {
    if (pendingVoice) return; // already have one staged
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const duration = formatDuration(recordingTime);
        setPendingVoice({ blob, url, duration });
        stream.getTracks().forEach((t) => t.stop());
        setRecordingTime(0);
      };

      mr.start();
      setIsRecording(true);
      recordingIntervalRef.current = setInterval(
        () => setRecordingTime((t) => t + 1),
        1000,
      );
    } catch {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    clearInterval(recordingIntervalRef.current);
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const removeVoice = () => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
    }
    setPendingVoice(null);
    setVoicePlaying(false);
  };

  const togglePlay = () => {
    if (!voiceAudioRef.current) return;
    if (voicePlaying) {
      voiceAudioRef.current.pause();
      setVoicePlaying(false);
    } else {
      voiceAudioRef.current.play();
      setVoicePlaying(true);
    }
  };

  // ── send ────────────────────────────────────────────────
  const handleSend = () => {
    if (!canSend) return;
    onSend({
      text: message.trim(),
      file: pendingFile || null,
      voiceBlob: pendingVoice?.blob || null,
      voiceDuration: pendingVoice?.duration || null,
    });
    setMessage("");
    setPendingFile(null);
    setImgPreview(null);
    setPendingVoice(null);
    setVoicePlaying(false);
  };

  const fileInfo = pendingFile ? getFileInfo(pendingFile) : null;

  return (
    <div className="flex flex-col gap-2">
      {/* ══════════════════════════════════════════════════════
          STAGED ATTACHMENTS — shown above the input bar
      ══════════════════════════════════════════════════════ */}
      {(pendingFile || pendingVoice || isRecording) && (
        <div className="flex flex-wrap gap-2">
          {/* ── Staged file card ── */}
          {pendingFile && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2 shadow-sm max-w-[260px]">
              {/* Thumbnail for images, coloured icon for others */}
              {fileInfo.Icon &&
              pendingFile.type.startsWith("image/") &&
              imgPreview ? (
                <img
                  src={imgPreview}
                  alt="preview"
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-100"
                />
              ) : (
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${fileInfo.color}`}
                >
                  <fileInfo.Icon size={17} className={fileInfo.iconColor} />
                </div>
              )}

              {/* Name + size */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-700 truncate leading-tight">
                  {pendingFile.name}
                </p>
                <p className="text-[9px] text-slate-400 leading-tight mt-0.5">
                  {fileInfo.label} · {formatSize(pendingFile.size)}
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={removeFile}
                className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          )}

          {/* ── Staged voice card (after recording stopped) ── */}
          {pendingVoice && !isRecording && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-2xl px-3 py-2 shadow-sm">
              {/* Play / pause */}
              <button
                onClick={togglePlay}
                className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 hover:bg-indigo-700 transition-colors"
              >
                {voicePlaying ? <Pause size={11} /> : <Play size={11} />}
              </button>

              {/* Waveform bars */}
              <div className="flex items-end gap-[2px] h-5">
                {[3, 6, 9, 5, 8, 4, 7, 5, 9, 6, 4, 3].map((h, i) => (
                  <div
                    key={i}
                    className={`w-[2px] rounded-full transition-all ${
                      voicePlaying
                        ? "bg-indigo-400 animate-pulse"
                        : "bg-indigo-300"
                    }`}
                    style={{ height: `${h * 2}px` }}
                  />
                ))}
              </div>

              <span className="text-[10px] text-indigo-600 font-mono font-bold">
                {pendingVoice.duration}
              </span>

              {/* Remove button */}
              <button
                onClick={removeVoice}
                className="w-5 h-5 rounded-full bg-indigo-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors ml-1"
              >
                <X size={11} />
              </button>

              <audio
                ref={voiceAudioRef}
                src={pendingVoice.url}
                onEnded={() => setVoicePlaying(false)}
              />
            </div>
          )}

          {/* ── Active recording indicator ── */}
          {isRecording && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-3 py-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              <span className="text-red-600 font-bold text-[11px]">
                Recording {formatDuration(recordingTime)}
              </span>
              <button
                onClick={stopRecording}
                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-xl font-bold text-[10px] transition-colors ml-1"
              >
                <Square size={10} /> Stop
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MAIN INPUT ROW
      ══════════════════════════════════════════════════════ */}
      <div
        className={`flex items-center gap-2 border-2 rounded-2xl overflow-hidden transition-all bg-white ${
          canSend
            ? "border-indigo-300 focus-within:border-indigo-500"
            : "border-slate-200 focus-within:border-indigo-400"
        }`}
      >
        {/* Paperclip — attach file (highlighted when file staged) */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`flex-shrink-0 p-3 transition-colors ${
            pendingFile
              ? "text-indigo-500"
              : "text-slate-400 hover:text-indigo-600"
          }`}
          title="Attach file"
        >
          <Paperclip size={18} />
        </button>
        <input
          type="file"
          accept="*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Text input — placeholder changes based on context */}
        <input
          className="flex-1 py-3 outline-none text-[12px] bg-transparent placeholder:text-slate-400"
          placeholder={
            pendingFile
              ? "Add a caption (optional)…"
              : pendingVoice
                ? "Add a caption (optional)…"
                : isRecording
                  ? "Recording in progress…"
                  : "Type your message…"
          }
          disabled={isRecording}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isRecording && handleSend()}
        />

        {/* Mic — starts recording; turns red + pulses while recording;
                  disabled if a voice clip is already staged */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!!pendingVoice && !isRecording}
          title={isRecording ? "Stop recording" : "Record voice message"}
          className={`flex-shrink-0 p-3 transition-colors ${
            isRecording
              ? "text-red-500 animate-pulse"
              : pendingVoice
                ? "text-slate-200 cursor-not-allowed"
                : "text-slate-400 hover:text-red-500"
          }`}
        >
          <Mic size={18} />
        </button>

        {/* Send — grey/disabled until something is ready to send */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 p-3 transition-all ${
            canSend
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-slate-100 text-slate-300 cursor-not-allowed"
          }`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
