# Ajaia Docs — Lightweight Collaborative Document Editor

An AI-native, lightweight collaborative document editor inspired by Google Docs, designed for speed, intuitive team collaboration, and frictionless file workflows.

![Ajaia Docs Banner](https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&auto=format&fit=crop&q=80)

---

## 🚀 Key Features

### 1. Document Creation & Rich-Text Editing
- **TipTap / ProseMirror Core:** Smooth, responsive WYSIWYG experience with zero perceptible latency.
- **Rich Formatting Options:**
  - **Text Styling:** Bold (`Ctrl+B`), Italic (`Ctrl+I`), Underline (`Ctrl+U`), Strikethrough, Highlight (amber), and inline Code.
  - **Typography:** Normal Text, Heading 1, Heading 2, Heading 3.
  - **Lists & Checklists:** Bulleted lists, numbered lists, and interactive task checklists (`- [ ]`).
  - **Alignment & Structure:** Left, Center, Right, and Justified alignment; Blockquotes; Horizontal rule dividers.
- **Inline Title Editing:** Click-to-edit title in the header with auto-save on blur or Enter.
- **Real-Time Autosave:** Debounced 1-second autosave + manual `Ctrl+S` / `Cmd+S` shortcut with a live visual save indicator (*"Saved to storage"*, *"Saving..."*).
- **Document Metrics:** Live word count and character count in the status bar.
- **Starter Templates:** Quick-start with Blank Document, Meeting Notes, Project Spec / RFC, or Weekly Team Update.

### 2. Multi-Format File Ingestion & Attachments
- **Supported File Types for Import:**
  - `.docx` (Microsoft Word): Parsed via Mammoth into semantic HTML preserving headings, formatting, and lists.
  - `.md` / `.markdown` (Markdown): Parsed via custom AST into headings, task lists, code blocks, and blockquotes.
  - `.txt` (Plain text): Preserves multi-line paragraphs and linebreaks.
  - `.json`: Document backup and restoration.
- **Drag-and-Drop Ingestion:** Drag any supported file onto the dashboard to instantly create and open an editable document.
- **Document Attachments Drawer:** Associate supporting files (PDFs, images, data files, specs) with any document. View metadata, size, uploader info, and download or delete attachments.

### 3. Sharing & Role-Based Access Control (RBAC)
- **Granular Roles:**
  - **Owner:** Full ownership (edit, rename, invite teammates, modify permissions, remove collaborators, delete document, manage attachments).
  - **Editor:** Can edit document title, modify content, add attachments, and invite additional collaborators.
  - **Viewer:** Read-only mode. The formatting toolbar is disabled, a *"View-Only"* banner is displayed, and backend mutation APIs reject changes with `403 Forbidden`.
- **Visible Separation:**
  - Dashboard filter tabs: **"All Documents"**, **"Owned by me"**, **"Shared with me"**.
  - Distinct badges on document cards: Green *"Owner"*, Blue *"Shared: Editor"*, Amber *"Shared: Viewer"*.
- **Google Docs Style Share Modal:**
  - Manage who has access with email/team auto-suggestions.
  - Change collaborator roles between "Can edit" and "Can view".
  - One-click share link copy.

### 4. Login, Logout & Persona Switching
- **Email + Password Login:** Standard login page with email/password fields, form validation, and error feedback.
- **Session Persistence:** Login state saved in `localStorage` — survives page refresh and browser restart.
- **Logout:** Click your avatar → "Log out" clears the session and redirects to login.
- **Quick Login:** Demo accounts listed on the login page for fast reviewer access.
- **Persona Switcher:** After logging in, switch between users instantly from the top-right avatar dropdown to test multi-user sharing and RBAC without re-entering credentials.

**Demo Accounts:**
| Name | Email | Password | Role |
|---|---|---|---|
| Alex Rivera | alex@ajaia.io | `alex123` | Product Lead |
| Sarah Chen | sarah@ajaia.io | `sarah123` | Engineering Lead |
| Marcus Vance | marcus@ajaia.io | `marcus123` | Design Lead |
| Kavya Reddy | kavya@ajaia.io | `kavya123` | Content Strategist |

### 5. Persistence & Reliability
- Atomic file-backed JSON store in `data/documents.json`.
- Automatic initial seeding with realistic team documents.
- Abstracted repository pattern allowing seamless migration to PostgreSQL / Supabase / Neon.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router, Server & Client Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Lucide React Icons
- **Rich-Text Engine:** TipTap 2.x, ProseMirror
- **File Parsing:** Mammoth (for Word `.docx`), Custom AST tokenizer (for Markdown & Text)
- **Testing:** Vitest

---

## 💻 Local Setup & Run

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### 1. Clone & Install
```bash
git clone <repository-url>
cd DOCUMENT
npm install
```

### 2. Run Tests
Execute the automated test suite covering permissions, roles, and file parsers:
```bash
npm test
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Testing the Multi-User Sharing Flow

1. Open [http://localhost:3000](http://localhost:3000) — the **login page** appears.
2. Log in as **Alex Rivera** (`alex@ajaia.io` / `alex123`), or click his name in the Quick Login section.
3. Open the document **"Ajaia Product Roadmap & Vision 2027"** (owned by Alex). Notice the green **Owner** badge and full editing toolbar.
4. Click the blue **Share** button. Notice Sarah is an **Editor** and Marcus is a **Viewer**.
5. Use the **persona switcher** (top-right avatar) to switch to **Sarah Chen**.
   - Notice the role updates to **Editor**. Sarah can edit content and title.
6. Switch to **Marcus Vance**.
   - Notice the amber **View Only** badge and notification: *"🔒 You are viewing this document in View-Only mode."*
   - Marcus cannot edit the text or use toolbar controls.
7. Switch to **Kavya Reddy** — she has no access to Alex's doc, demonstrating unauthorized access handling.
8. Click **Log out** from the avatar dropdown → returns to the login page.
9. Return to the dashboard and switch filter tabs:
   - **"Owned by me"** — documents owned by the active persona.
   - **"Shared with me"** — documents shared by teammates.

---

## 📂 Project Structure

```
├── ARCHITECTURE.md             # System architecture & tradeoff analysis
├── AI_WORKFLOW.md              # AI tools used, accelerations & verifications
├── SUBMISSION.md               # Submission checklist & credentials
├── WALKTHROUGH_SCRIPT.md       # 3-5 minute video demo presentation script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── documents/      # Document CRUD & permissions API
│   │   │   ├── upload/         # Multi-format file ingestion endpoint
│   │   │   └── users/          # Seeded persona roster
│   │   ├── document/[id]/      # Document editor route
│   │   ├── layout.tsx          # Root layout with UserProvider
│   │   └── page.tsx            # Dashboard with templates & filters
│   ├── components/
│   │   ├── auth/              # LoginPage, AuthGate
│   │   ├── dashboard/          # TemplatesBar, DocumentCard, UserSwitcher
│   │   ├── editor/             # TipTap DocumentEditor, EditorToolbar, DocumentHeader
│   │   ├── modals/             # ShareModal, FileUploadModal, AttachmentsDrawer
│   │   └── ui/                 # ToastContainer
│   ├── lib/
│   │   ├── context/            # UserContext (auth, persona switcher & toasts)
│   │   ├── db/                 # DocumentStore & Types
│   │   └── parser/             # Mammoth & Markdown AST parser
│   └── tests/                  # Vitest permissions & parser test suites
```

