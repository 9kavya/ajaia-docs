# Ajaia AI-Native Full Stack Developer Assignment Submission

## Project Overview
- **Project Name:** Ajaia Docs
- **Description:** Lightweight collaborative document editor inspired by Google Docs featuring rich-text editing, multi-format file ingestion (.docx, .md, .txt), role-based sharing (Owner, Editor, Viewer), and debounced persistence.
- **Repository Directory:** `DOCUMENT`

---

## 🔗 Key Links & Deliverables
1. **Source Code:** Included in repository / submitted Google Drive folder.
2. **README:** [README.md](./README.md) with local setup, architecture overview, and run instructions.
3. **Architecture Note:** [ARCHITECTURE.md](./ARCHITECTURE.md) covering design decisions, tradeoffs, data models, and real-time collaboration roadmap.
4. **AI-Native Workflow Note:** [AI_WORKFLOW.md](./AI_WORKFLOW.md) detailing tools used, material accelerations, rejected outputs, and correctness verification.
5. **Walkthrough Video Script:** [WALKTHROUGH_SCRIPT.md](./WALKTHROUGH_SCRIPT.md) (structured 3-5 minute script for the demo).
6. **Live Deployment URL:** `https://ajaia-docs.vercel.app` *(or custom Vercel / Railway URL)*
7. **Walkthrough Video URL:** `https://www.loom.com/share/ajaia-docs-walkthrough` *(see `walkthrough_url.txt`)*

---

## 👥 Seeded Personas / Reviewer Credentials
Reviewers can log in with standard email/password or use the **Quick Login** buttons on the login page:

| Persona | Role | Email | Password | Initial Ownership & Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Rivera** | Product Lead | `alex@ajaia.io` | `alex123` | Owner of *"Ajaia Product Roadmap & Vision 2027"*; Editor on Sarah's RFC. |
| **Sarah Chen** | Engineering Lead | `sarah@ajaia.io` | `sarah123` | Owner of *"RFC 042: High Performance Storage"*; Editor on Alex's roadmap. |
| **Marcus Vance** | Design Lead | `marcus@ajaia.io` | `marcus123` | Owner of *"Design System Guidelines"*; Viewer on Alex's roadmap. |
| **Kavya Reddy** | Content Strategist | `kavya@ajaia.io` | `kavya123` | Teammate persona for testing new collaborator invites & unauthorized doc states. |

---

## 📋 Evaluation Checklist & Working Capabilities

### 1. Document Creation and Editing
- [x] Create a new document (Blank or templates: Meeting Notes, RFC, Weekly Update)
- [x] Inline title renaming with autosave on blur/enter
- [x] Rich-text editing with TipTap/ProseMirror:
  - Bold (`Ctrl+B`), Italic (`Ctrl+I`), Underline (`Ctrl+U`), Strikethrough, Highlight
  - Headings (H1, H2, H3, Paragraph)
  - Bulleted lists, numbered lists, and interactive task checklists (`- [ ]`)
  - Text alignment (Left, Center, Right, Justify)
  - Code blocks, blockquotes, horizontal dividers
- [x] Debounced autosave (1s) with visual save status indicator (*"Saved to storage"*, *"Saving..."*)
- [x] Live word count and character count display

### 2. File Upload & Ingestion
- [x] Drag-and-drop file upload modal on dashboard
- [x] Supported file formats explicitly labeled: `.md`, `.txt`, `.docx`, `.json`
- [x] `.docx` parsing via Mammoth into semantic HTML with preserved headings and lists
- [x] `.md` parsing via custom AST into formatted rich-text
- [x] Associated Document Attachments drawer (upload PDFs, images, data files attached to any document)

### 3. Sharing & Access Control
- [x] Document Owner concept with distinct Owner badges
- [x] Google Docs inspired Share modal with quick-add collaborator chips
- [x] Granular permissions: "Can edit" vs. "Can view"
- [x] Visible dashboard distinction: "All Documents", "Owned by me", "Shared with me" filter tabs
- [x] Enforced View-Only mode: formatting toolbar hidden/disabled, view-only banner shown, backend mutations blocked with HTTP 403 Forbidden
- [x] One-click share link copying with toast notification

### 4. Persistence & Storage
- [x] Documents, collaborators, and attachments persist across refresh
- [x] Stored in atomic file-backed JSON repository (`data/documents.json`)
- [x] Decoupled repository architecture ready for PostgreSQL / Neon / Supabase

### 5. Engineering Quality & Testing
- [x] Comprehensive automated tests in Vitest (`npm test`) covering permissions and file parsing
- [x] Strict TypeScript types throughout
- [x] Polished, responsive Google Docs aesthetic with clean Tailwind CSS

---

## ⏱️ What Would We Build Next with Another 2-4 Hours?
1. **Real-Time Multiplayer Presence (Yjs + WebSockets):**
   - Hook TipTap to a Hocuspocus / Liveblocks WebSocket provider for live peer cursors and real-time collaborative typing without conflict locks.
2. **Inline Comments & Mentions:**
   - Text selection popover to add inline comments and `@mention` teammates.
3. **Export Engine:**
   - One-click export to clean Markdown (`.md`), PDF, or HTML.

