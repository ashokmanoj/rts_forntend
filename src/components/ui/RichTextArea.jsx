import { useRef, useEffect, useState } from "react";
import { Bold, Underline, Highlighter, List } from "lucide-react";
import { sanitizePaste } from "../../utils/sanitize";

/**
 * WYSIWYG rich-text editor using contenteditable.
 * Formatting is applied immediately — no markdown markers shown.
 *
 * Props:
 *   value          — HTML string (controlled; only syncs when externally reset to "")
 *   onChange       — called as onChange({ target: { value: htmlString } })
 *   placeholder    — ghost text shown when empty
 *   disabled       — disables editing and toolbar
 *   wrapperClassName — extra classes on the outer border wrapper
 *   minRows        — minimum visible rows (default 3)
 */
export default function RichTextArea({
  value = "",
  onChange,
  placeholder = "",
  disabled = false,
  wrapperClassName = "",
  minRows = 3,
}) {
  const editorRef  = useRef(null);
  const prevVal    = useRef(value);
  const [empty, setEmpty] = useState(!value);

  // Set initial content on mount
  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
      setEmpty(!editorRef.current.textContent.trim());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync editor when parent changes value:
  //   "" → clears (after submit)
  //   "" → non-empty: restores (draft restore)
  useEffect(() => {
    if (!editorRef.current) return;
    if (value === "" && prevVal.current !== "") {
      editorRef.current.innerHTML = "";
      setEmpty(true);
    } else if (value && !prevVal.current && document.activeElement !== editorRef.current) {
      // Only restore draft when not focused — prevents cursor reset while user is typing
      editorRef.current.innerHTML = value;
      setEmpty(!editorRef.current.textContent.trim());
    }
    prevVal.current = value;
  }, [value]);

  const emit = () => {
    const html = editorRef.current?.innerHTML || "";
    const text = editorRef.current?.textContent || "";
    setEmpty(!text.trim());
    onChange?.({ target: { value: html } });
  };

  // ── Highlight: wrap/unwrap selection in <mark> ──────────────
  const execHighlight = () => {
    const sel = window.getSelection();
    if (!sel?.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const anchor = range.commonAncestorContainer;
    const existing = (anchor.nodeType === 1 ? anchor : anchor.parentElement)?.closest("mark");
    if (existing) {
      const parent = existing.parentNode;
      while (existing.firstChild) parent.insertBefore(existing.firstChild, existing);
      existing.remove();
    } else {
      try {
        const mark = document.createElement("mark");
        mark.className = "bg-yellow-200 rounded-sm";
        range.surroundContents(mark);
      } catch {
        // Selection spans multiple block elements — fall back to background color
        document.execCommand("backColor", false, "#fef08a");
      }
    }
    emit();
  };

  const fmt = (type) => {
    editorRef.current?.focus();
    if      (type === "bold")      document.execCommand("bold",                false, null);
    else if (type === "underline") document.execCommand("underline",           false, null);
    else if (type === "highlight") { execHighlight(); return; }
    else if (type === "bullet")    document.execCommand("insertUnorderedList", false, null);
    emit();
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "b") { e.preventDefault(); fmt("bold"); }
    if ((e.ctrlKey || e.metaKey) && e.key === "u") { e.preventDefault(); fmt("underline"); }
  };

  const handlePaste = (e) => {
    const html = e.clipboardData?.getData("text/html");
    if (html) {
      e.preventDefault();
      const clean = sanitizePaste(html);
      document.execCommand("insertHTML", false, clean);
      emit();
    }
    // Plain text paste — let browser handle it
  };

  const minH = minRows * 24;

  return (
    <div
      className={`flex flex-col rounded-2xl border-2 border-slate-200 hover:border-slate-300 focus-within:border-indigo-400 overflow-hidden bg-white transition-all ${wrapperClassName}`}
    >
      {/* Formatting toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 bg-slate-50 border-b border-slate-100">
        {[
          { id: "bold",      Icon: Bold,        title: "Bold (Ctrl+B)",    bolder: true },
          { id: "underline", Icon: Underline,   title: "Underline (Ctrl+U)"              },
          { id: "highlight", Icon: Highlighter, title: "Highlight"                        },
          { id: "bullet",    Icon: List,        title: "Bullet list"                      },
        ].map(({ id, Icon, title, bolder }) => (
          <button
            key={id}
            type="button"
            title={title}
            disabled={disabled}
            onMouseDown={(e) => { e.preventDefault(); fmt(id); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Icon size={13} strokeWidth={bolder ? 3 : 2} />
          </button>
        ))}
        <span className="ml-auto text-[9px] text-slate-300 pr-1 select-none">Ctrl+B · U</span>
      </div>

      {/* Editable area */}
      <div className="relative">
        {empty && placeholder && (
          <span className="absolute top-3 left-4 text-[13px] text-slate-300 font-medium pointer-events-none select-none leading-relaxed">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={emit}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="outline-none px-4 py-3 text-[13px] text-slate-800 font-medium leading-relaxed [&_ul]:list-disc [&_ul]:list-inside [&_ul]:my-0.5 [&_mark]:bg-yellow-200 [&_mark]:rounded-sm"
          style={{ minHeight: minH, maxHeight: 200, overflowY: "auto" }}
        />
      </div>
    </div>
  );
}
