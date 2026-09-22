# ANBAT – Your Nabataean Companion to Petra

> **Dual-sided MVP for Hackathon Technical Judging:** Connecting rich Nabataean visitor storytelling with a tamper-evident monument condition log for site conservation.

---

## 1. Problem & Value Proposition

**The Challenge:**
Petra's Nabataean stories are under-told and its monument condition is under-managed. Visitors often leave without understanding the astonishing hydraulic engineering and cultural sophistication of the ancient Nabataeans, while site managers lack modern, tamper-evident inspection ledgers to log rock deterioration, flash flood damage, and masonry conditions.

**The Solution:**
ANBAT bridges this divide:
1. **For Visitors:** An interactive satchel reveals a collectible creature guide that accompanies visitors along a stylized route map and answers inquiries using **strictly grounded RAG** powered by Google Gemini, ensuring zero historical hallucinations.
2. **For Site Managers:** A cryptographic **tamper-evident SHA-256 hash-chain register** where condition assessments are permanently sealed and verified using the browser's native Web Crypto API, coupled with an **unanswered questions queue** that closes the feedback loop.

---

## 2. Core MVP Modules

### A) Satchel & Creatures (Visitor)
- **4 Creatures:**
  - 🐪 **Camel (Al-Jamal)**: Desert trade routes, patience, caravan resilience (Common).
  - 🦂 **Scorpion (Al-Aqrab)**: Hidden crevices, rock shadows, canyon survival (Common).
  - 🦅 **Falcon (Al-Saqr)**: Royal vision, sandstone canyon aerial mastery (Rare, unlocked with roll $\ge 65$).
  - 🐐 **Nubian Ibex (Al-Badan)**: Sovereign mountain deity companion, high-peak navigator (Legendary, **unlocked ONLY after visiting all 5 landmarks**).
- **Explainable Math:** Transparent formula combining Starting Landmark + Time of Day + Rarity Roll.
- **Custom Naming & Passport:** Visitors customize their creature's name and export their official badge either via formatted share text (`#ANBAT_Petra`) or downloaded high-res PNG badge rendered on an HTML5 canvas.

### B) Interactive Petra Route Map & Camera QR Check-In (Visitor)
- Stylized SVG map with 5 sequential landmarks along the authentic canyon trajectory:
  1. **Siq Entrance**
  2. **Treasury (Al-Khazneh)**
  3. **Street of Facades**
  4. **Theatre**
  5. **Monastery (Ad-Deir)**
- **Camera-Based Physical QR Scanner (MediaDevices API):**
  - Uses `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })` to scan physical markers in Petra via continuous frame analysis using `jsQR`.
  - Decorated golden reticle viewfinder with animated laser sweep.
  - Automatically verifies landmark arrival, triggers haptic vibration (`navigator.vibrate`), increments the route counter, and updates the exploration progress.
  - **Graceful Fallbacks & Judge Demo Sheet:** Supports marker photo uploads (`input type="file"`) and includes a collapsible "Judge Demo QR Sheet" with one-click physical sign simulation buttons so judges can test on-site check-ins without camera access or moving to Jordan.
- Clicking any landmark opens verified stories from the curated archaeological corpus, tracks visited milestones, and updates the progress bar.
- Reaching 5/5 landmarks triggers the **Legendary Ibex summon unlock**.

### C) Grounded AI Guide Q&A (Visitor)
- Multilingual chat panel (English & Arabic RTL).
- Server-side Express proxy (`/api/chat`) interacting with **Gemini 3.8 Flash** using the modern `@google/genai` SDK.
- **Zero-Hallucination Mandate:** The AI is strictly instructed to answer *only* from the provided context. If a question is not found in the archaeological knowledge base, it transparently confesses it doesn't know and flags the question as sent to the Site Team.
- **Source Attribution:** Shows precise source tags beneath each verified answer.
- **Edge Case Protection:** Inline empty question validation, 500-character input counter, and automatic fallback to closest knowledge base match if network timeouts occur.

### D) Site Manager Admin Console (Site Team)
- Password-gated with demo credentials (`admin123`).
- **1. Unanswered Questions Queue:** When visitors ask unverified questions, they land here. Admins write and approve verified answers that immediately append to the knowledge base, enabling the AI to answer subsequent inquiries (**Closed Feedback Loop**).
- **2. Knowledge Base Manager:** Add and edit verified corpus records with keyword indexing.
- **3. Append-Only Tamper-Evident Monument Condition Register:**
  - Each block stores `prevHash`, `landmarkId`, `note`, `severity` (1–5), optional Base64 photo, `timestamp`, and `hash`.
  - Cryptographic formula: `SHA-256(prevHash + landmarkId + note + severity + timestamp)` using native `crypto.subtle`.
  - **Verify Integrity:** Scans and mathematically validates every block in the chain.
  - **Demo: Simulate Tampering:** Silently modifies block #2 in storage so judges can observe instant detection of tampering.
  - **Reset Demo Data:** Restores the valid genesis ledger.

---

## 3. Recommended 3-Minute Hackathon Demo Script

Follow these steps for a complete demonstration of all 4 modules:

| Step | Action | What to Look For |
|---|---|---|
| **1** | Open the application | Note the **Problem & Value** banner at the top and the 5-step flow. |
| **2** | In **Step 1 (Open Satchel)**, pick a starting landmark and time, then click **"Open the Satchel"** | Watch the reveal animation, explainable formula breakdown, customize the creature's name, and click **"Download Badge as Image"** to verify the PNG canvas rendering. |
| **3** | Click **"Explore Map"** in navigation | Explore the stylized canyon map. Click **"Demo: Jump 5/5"** in the top bar. Observe the progress bar reach 100% and unlock the **Legendary Al-Badan (Nubian Ibex)**. |
| **4** | Navigate to **"Ask Guide"** | Click the sample query **"Water Engineering"** to observe grounded answering with source tags. Then click **"Negative Test (Unknown)"**; watch the guide admit it doesn't know and announce it is queued for Site Team review. |
| **5** | Switch to **"Site Manager Admin"** (Password: `admin123`) | In **Unanswered Queue**, locate the question. Click **"Write Approved Answer"** and approve it. Notice it saves to the knowledge base. |
| **6** | In Admin, click **"3. Monument Condition Register"** | Click **"Verify Chain Integrity"** (Green check: all blocks valid). Click **"Demo: Simulate Tampering"**, then **"Verify Chain Integrity"** (Red alert: Tampering detected at block #2!). Click **"Reset Demo Data"** to restore. |

---

## 4. Technical Architecture

```
[Visitor UI / Mobile Browser]
      │
      ├── 1. Creature Reveal & Badge Canvas (Local Math & Canvas API)
      ├── 2. Interactive SVG Map & Landmarks (Data Layer)
      │
      ├── 3. Chat Inquiry
      │        │
      │        ▼
      │   [Local RAG Engine] (Token scoring & Language normalization)
      │        │
      │        ▼ Top-2 Verified Knowledge Entries
      │   [Express /api/chat Proxy] (Server-side GEMINI_API_KEY security)
      │        │
      │        ▼
      │   [Google Gemini 3.8 Flash]
      │        │
      │        ├── Grounded Response with Sources
      │        └── If Unknown ➔ Auto-Pushed to Unanswered Queue
      │
      └── 4. Monument Condition Register
               │
               ▼
          [Web Crypto API: SHA-256] ➔ [Append-Only Local Hash Chain]
```

---

## 5. Security & Edge Case Handling Checklist

- [x] **No Leaked Secrets:** `GEMINI_API_KEY` is exclusively consumed server-side in `server.ts`.
- [x] **Grounded RAG:** AI response constrained by system instructions to never hallucinate.
- [x] **Bilingual Localization:** Full support for Arabic RTL (`dir="rtl"`) and English.
- [x] **Input Bounds:** Character limit counters, empty query guards, and error banners.
- [x] **Tamper Detection:** Mathematical SHA-256 verification detects single-character tampering in historic condition blocks.
- [x] **No Unsolicited Dependencies:** Clean native implementation built on React, TypeScript, Tailwind CSS, Lucide icons, and Motion.
