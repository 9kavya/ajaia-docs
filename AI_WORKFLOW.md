# AI-Native Workflow Note

## Overview
This document outlines how AI tools and assistants were leveraged in the planning, implementation, and verification of the Ajaia collaborative document editor. In an AI-native engineering workflow, the model acts as a high-velocity multiplier for implementation and boilerplate, while the engineer retains strict ownership of architecture, UX invariants, and reliability verification.

---

## 1. AI Tools Utilized
- **Antigravity (Google DeepMind Coding Assistant):** Primary agent for repository scaffolding, component authoring, AST parser construction, test harness setup, and documentation.
- **Claude / Gemini 1.5 Pro Foundation Models:** Utilized for rapid exploration of TipTap 2.x extension compositions, Mammoth docx parsing edge cases, and RBAC permission models.

---

## 2. Where AI Materially Sped Up the Work
1. **TipTap Extension Configuration & Custom Toolbar Wiring:**
   - Setting up TipTap with multiple disparate extensions (`StarterKit`, `Underline`, `Highlight`, `TextAlign`, `TaskList`, `TaskItem`, `Placeholder`) typically involves tedious boilerplate. AI generated the configuration cleanly in minutes, including command chaining methods (`editor.chain().focus().toggleHeading(...).run()`).
2. **File Ingestion Engine (Mammoth & Markdown AST):**
   - Generating regex-based tokenizers for Markdown (`#`, `##`, `###`, `- [x]`, `> `, `***bold/italic***`) and integrating Mammoth buffer conversion was accelerated by ~80%, avoiding manual string manipulation errors.
3. **Automated Test Scenarios:**
   - AI generated comprehensive test assertions in Vitest covering edge cases: owner deletion permissions, editor vs. viewer mutation locks, and file parser HTML entity safety.
4. **Seed Data & Template Realism:**
   - Rather than testing with "Lorem ipsum" or empty cards, AI populated realistic product engineering artifacts ("RFC 042: High Performance Storage", "Q4 Roadmap", "Sprint Sync Notes"), giving the reviewer an authentic team environment immediately.

---

## 3. What AI-Generated Output Was Changed or Rejected
1. **Rejection of Complex Full-Text Search / Vector Indexing:**
   - Initial AI suggestions recommended embedding OpenAI or Chroma vector stores for document search. 
   - **Reason for Rejection:** Overkill for a 4-6 hour scoped assignment. A client/server string-matching filter on document title and plain-text preview provided sub-millisecond search performance with zero external dependencies and zero cost to reviewers.
2. **Correction of Plain-Text Paragraph HTML Escaping:**
   - The initial AI-generated plain-text parser replaced `\n` with `<br>` *before* calling `escapeHtml()`. When the test ran, Vitest failed because `<br>` became `&lt;br&gt;`. 
   - **Fix Applied:** Refactored the parser to escape raw text first, then transform newlines into `<br>`, maintaining XSS security while producing clean HTML.
3. **Rejection of Ephemeral `/tmp` SQLite on Serverless:**
   - AI initially suggested `better-sqlite3` with an embedded file. 
   - **Reason for Rejection:** On Node 25 on Windows and serverless Vercel runtimes, binary C++ bindings for sqlite3 frequently cause build errors or lose data on instance recycle. Instead, engineered an atomic JSON file store with an abstracted repository interface that works cross-platform with zero native dependencies.

---

## 4. Verification of Correctness, UX Quality, and Reliability
- **Automated Verification:**
  - Ran `npx vitest run` to ensure all permission invariants and parser outputs pass with zero regressions.
- **Role Invariant Checks:**
  - Verified that a Viewer cannot bypass client restrictions: attempting a direct `PATCH /api/documents/:id` with a viewer's user ID returns an explicit HTTP 403 Forbidden.
- **UX & Autosave Verification:**
  - Verified debounced autosaving: typing in the editor triggers a 1-second debounce before persisting, preventing database write exhaustion while giving immediate visual feedback via the "Saving..." / "Saved to storage" indicator.
- **Cross-Persona Validation:**
  - Tested seamless switching between Alex (Owner), Sarah (Editor), and Marcus (Viewer) to verify dashboard filters and editor read-only modes in real time.

