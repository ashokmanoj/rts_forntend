// ─────────────────────────────────────────────────────────────
// Content for the Instructions modal — updated with precise
// logic for forwarding, file attachments, and mark-as-unread.
// ─────────────────────────────────────────────────────────────

export const INSTRUCTION_SECTIONS = [
  {
    icon: "🔐", title: "Login",
    color: "bg-indigo-50 border-indigo-200", titleColor: "text-indigo-700",
    steps: [
      "Enter your Username / Email and Password on the login screen.",
      "Click Login to access the RTS dashboard.",
      "Your name and role (User / RM / HOD / Admin) will be shown in the top-right corner.",
      "Click your avatar and select Logout to safely exit the system.",
    ],
  },
  {
    icon: "📋", title: "Understanding the Table",
    color: "bg-blue-50 border-blue-200", titleColor: "text-blue-700",
    steps: [
      "The table is split into two sections: Requestor Department (blue header) and Assigned Department (orange header).",
      "Blue highlighted rows are unread — they float to the top so you never miss an update.",
      "Bold text in a row means it has unseen activity (approval, forwarding, or a status change).",
      "A blue dot (●) next to the request title in the Details column indicates an unread request.",
      "Right-click any row to mark it as Unread — it will float back to the top of the table.",
    ],
  },
  {
    icon: "➕", title: "Adding a New Request",
    color: "bg-green-50 border-green-200", titleColor: "text-green-700",
    steps: [
      "Click the green + Add Request button in the top right corner.",
      "Fill in the Request Title — briefly describe what you need (e.g., 'New Mouse').",
      "Select the Department to whom you want to assign the task from the dropdown.",
      "Write a detailed description explaining your request.",
      "Optionally upload an image or any file supporting your request or the issue.",
      "Click Submit to send the request. Click Close to discard or return back.",
    ],
  },
  {
    icon: "🔍", title: "Viewing Request Details",
    color: "bg-purple-50 border-purple-200", titleColor: "text-purple-700",
    steps: [
      "Click the underlined request title (e.g., 'Mouse') in the Details column to open the detailed popup.",
      "Inside the popup box in the left panel shows user info, request title (locked 🔒), assigned department, description, and uploaded image or file.",
      "The right panel shows the full chat and activity history for that request.",
    ],
  },
  {
    icon: "✅", title: "Actioning Requests (RM & HOD)",
    color: "bg-emerald-50 border-emerald-200", titleColor: "text-emerald-700",
    steps: [
      "Open the request details by clicking the request title.",
      "RM Status and HOD Status show '--' until the respective role takes action.",
      "Add an official comment in the text area, then choose an action:",
      "→ Approve (green): Marks the request as approved at your level.",
      "→ Checking (amber): Indicates the request is under review.",
      "→ Reject (red): Declines the request with your comment.",
      "Use the Assigned Department dropdown to change the department before forwarding in case the given request is handled by different department.",
      "If you change the Assigned Department dropdown, the Approve button Changes to 'Forward', once you click on Forward button it shifts the responsibility to the newly forwarded Department.",
      "All actions are logged in the chat history with your name, role, and timestamp.",
    ],
  },
  {
    icon: "📨", title: "Chat & Communication",
    color: "bg-amber-50 border-amber-200", titleColor: "text-amber-700",
    steps: [
      "Anyone with access can chat on a request — Requestor, RM, HOD, or Admin.",
      "Type your message in the chat box and press Enter or click the Send (➤) button.",
      "Click the 📎 paperclip icon to attach and send a file or image.",
      "Click the 🎤 microphone icon to record a voice message for quick updates. Click Stop & Send when done.",
      "Voice messages appear as playable audio bubbles with a play/pause button.",
      "All messages show the sender's name, role badge, and timestamp.",
    ],
  },
  {
    icon: "🔒", title: "Closing a Ticket (Assigned Department only)",
    color: "bg-red-50 border-red-200", titleColor: "text-red-700",
    steps: [
      "Open the request details and scroll down to the Close Ticket button (red).",
      "In the popup, write a resolution note explaining how the issue was resolved.",
      "Optionally attach a file or image as evidence of completion.",
      "Click Close Ticket to confirm. Once closed, the status shows the date with '(Closed)' in green.",
      "Any files attached during closing will appear in the request chat history.",
    ],
  },
  {
    icon: "👁️", title: "Marking as Unread",
    color: "bg-slate-50 border-slate-200", titleColor: "text-slate-700",
    steps: [
      "Right-click on any row in the table to open the context menu.",
      "Select 'Mark as Unread' — the row turns blue and floats back to the top.",
      "This is useful for flagging requests that need follow-up attention later.",
      "Opening a request detail automatically marks it as read.",
    ],
  },
  {
    icon: "🔎", title: "Filtering & Searching",
    color: "bg-cyan-50 border-cyan-200", titleColor: "text-cyan-700",
    steps: [
      "Use the dropdown filters at the top to filter by Requestor, Assigned Name, Department, or Status.",
      "Use the date picker to filter requests by a specific creation date.",
      "Use the Search box on the right to quickly find requests by keyword.",
    ],
  },
];