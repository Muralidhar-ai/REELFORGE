# ReelForge 4-Minute Hackathon Demo Script

This script walks judges through the complete end-to-end functionality of ReelForge.

## 0:00 – 0:45: Hero Concept & Art Direction Overview
- Open `http://localhost:3000`.
- Highlight the production desk aesthetic: quiet paper canvas (`#F5F2EC`), strict typography (`Instrument Serif` & `Instrument Sans`), and letterboxd/frame.io layout density.
- Point out the 6-frame mixed-aspect-ratio contact sheet on the right hero column.

## 0:45 – 1:45: Brief Definition & AI Brief Builder
- Click **"Define a brief"** (`/briefs/new`).
- Click **"Use sample idea"** to load the Gen-Z sneaker launch campaign concept.
- Click **"Structure brief with AI"** to observe automatic extraction into structured fields.
- Upload a reference image to demonstrate vision style tag extraction.
- Show the live **Brief Quality Meter** updating in real time to 85+.
- Click **"Publish campaign brief"**.

## 1:45 – 2:45: Ranked Creator Matches & Commercial Safety Clearance
- On `/briefs/[id]`, review the shot-list row layout.
- Explain the match score algorithm breakdown (skills, tools, format, style tags, and verification weight).
- Point out the **Commercial Safety Badges** (Evaluating Runway Pro vs Kling Standard for `paid_ads`).
- Click **"Invite creator"** on top-ranked creator Dev Ananth.

## 2:45 – 3:30: Creator Directory, Workflow Replay & Verification
- Navigate to `/creators`.
- Filter by **Runway**, **video**, and **9:16**.
- Demonstrate zero-result filter recovery suggestions by selecting conflicting filters.
- Open `/creators/cr_1` (Dev Ananth profile).
- Open a portfolio item modal to showcase the step-by-step **Workflow Replay Log** (step numbers, tool names, parameters, and generation counts) and the public proof link.

## 3:30 – 4:00: Role Switcher & Engagement Revision Board
- Use the top-bar role switcher to switch from **Brand** to **Creator: Dev Ananth**.
- Navigate to `/creator/dashboard` to view incoming invites and accept.
- Navigate to `/engagements/[id]` to review the multi-stage delivery stepper (`invited` -> `accepted` -> `in_progress` -> `delivered` -> `approved`) and test version submission / feedback cycles.
