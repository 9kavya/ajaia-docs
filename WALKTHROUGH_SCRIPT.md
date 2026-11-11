# Walkthrough Video Script: Ajaia Docs Demo
**Target Duration:** 3 - 5 Minutes  
**Speaker:** Lead Full Stack Engineer

---

### [0:00 - 0:45] 1. Introduction & Scenario Framing
- **Screen:** Dashboard at `http://localhost:3000` (logged in as **Alex Rivera**).
- **Audio:**
  > *"Hi everyone, today I'm presenting Ajaia Docs—a lightweight, AI-native collaborative document editor inspired by Google Docs. The objective of this assignment was not to build a bloated clone of every edge case, but to ship a rock-solid, focused core in 4-6 hours with sound product judgment, strict permission boundaries, and delightful UX.*
  >
  > *On screen is our dashboard. We see initial seeded documents, quick-start templates, global search, and our simulated persona switcher in the top right. Let's walk through the end-to-end user flow."*

---

### [0:45 - 1:45] 2. Document Creation, Rich-Text Editing & Autosave
- **Action:**
  1. Click on **"Ajaia Product Roadmap & Vision 2027"**.
  2. Show the Google Docs paper layout, margins, and formatting toolbar.
  3. Rename title inline: click title, type `Ajaia Product Roadmap & Vision 2027 (Updated)`, press Enter.
  4. Type a new task or heading in the body. Format text: toggle Bold (`Ctrl+B`), Italic (`Ctrl+I`), Underline (`Ctrl+U`), and check off an interactive task item.
  5. Point to the save indicator pill: *"Notice the status smoothly transitions from 'Saving to storage...' to 'Saved to storage'. We implemented a 1-second debounced autosave, along with manual Ctrl+S shortcut support."*
  6. Point to the bottom status bar displaying live word count (320 words) and character count.

---

### [1:45 - 2:45] 3. Multi-Format File Ingestion & Attachments
- **Action:**
  1. Click the **"Attachments"** button in the header.
  2. Show existing attachments (`roadmap_milestones.txt`).
  3. Upload an attachment (e.g. an image or spec). Show immediate metadata calculation, file size formatting, and download capability. Close drawer.
  4. Navigate back to the Dashboard.
  5. Click **"Import File"** (or drag-and-drop a sample `.md` or `.docx` file).
  6. Show how the parser AST extracts the title from the filename and converts Markdown / Word structures into rich HTML nodes, immediately opening the editable draft in the TipTap editor.

---

### [2:45 - 3:45] 4. Sharing Model & Role Enforcement (Owner vs. Editor vs. Viewer)
- **Action:**
  1. Click the blue **"Share"** button.
  2. Show the Google Docs style modal: Alex is **Owner**, Sarah is **Editor**, Marcus is **Viewer**.
  3. Show quick-add team suggestion chips and the role dropdown ("Can edit" vs "Can view").
  4. Click **"Copy Link"** (demonstrate clipboard toast notification). Close modal.
  5. **Switch persona to Sarah Chen (Editor):**
     - Notice the role badge updates to **Editor**.
     - Sarah can edit content and title freely.
  6. **Switch persona to Marcus Vance (Viewer):**
     - Notice the role badge updates to **View Only** (amber).
     - Notice the warning banner: *"🔒 You are viewing this document in View-Only mode. Editing tools are disabled."*
     - The formatting toolbar is disabled, and the editor is read-only.
  7. Return to Dashboard and demonstrate the filter tabs: **"All Documents"**, **"Owned by me"**, and **"Shared with me"**.

---

### [3:45 - 4:45] 5. Architecture, Intentional Deprioritizations & AI Workflow
- **Screen:** Show codebase / `ARCHITECTURE.md` and test suite output (`npm test`).
- **Audio:**
  > *"From an engineering quality perspective, all 9 unit and integration tests are passing in Vitest, covering our RBAC matrix and parser AST.*
  >
  > *Key implementation decisions:*
  > *1. **TipTap over raw contenteditable:** TipTap provides an immutable ProseMirror document model, making future real-time multiplayer via Yjs straightforward.*
  > *2. **Decoupled persistence:** An atomic repository store that runs zero-config locally, but can plug into PostgreSQL/Neon with a single adapter.*
  >
  > *What we intentionally deprioritized:*
  > *1. **Premature WebSocket OT/CRDT:** Real-time multiplayer synchronization requires heavy infrastructure. We prioritized a deterministic, reliable debounced save model that guarantees zero data loss.*
  > *2. **OAuth Friction:** We built an instant Persona Switcher so reviewers can test multi-user sharing in 5 seconds without signing up or managing mock sessions.*
  >
  > *Finally, regarding AI usage:*
  > *AI accelerated TipTap boilerplate and AST regex generation by ~80%. We actively rejected AI suggestions for heavyweight vector embeddings and ephemeral /tmp SQLite databases that fail on serverless. Reliability, security invariants, and test coverage remained strictly engineer-guided.*
  >
  > *Thank you, and I look forward to your feedback!"*
