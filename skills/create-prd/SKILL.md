---
name: create-prd
description: Create a detailed Product Requirements Document (PRD) in Markdown from a feature idea — asks 3–10 essential clarifying questions with lettered options, then writes a PRD with goals, user stories, prefixed trackable tasks, non-goals, success metrics and open questions. Use for any new feature or product capability before planning or implementation.
invocable: true
---

# Generating a Product Requirements Document (PRD)

## Goal

To guide an AI assistant in creating a detailed Product Requirements Document (PRD) in **Markdown** format, based on an initial user prompt.  
The PRD should be clear, actionable, and suitable for a junior developer to understand and implement the feature.

---

## Process

### 1. Receive Initial Prompt

The user provides a brief description or request for a new feature or functionality.

### 2. Ask Clarifying Questions

Before writing the PRD, the AI must ask **only the most essential clarifying questions** needed to write a clear PRD.

- Limit questions to **3–10 critical gaps** in understanding.
- The goal is to understand the **what** and **why** of the feature, not the **how** (which the developer will figure out).
- Provide options in **letter/number lists** so the user can respond easily with selections.

### 3. Generate PRD

Based on the initial prompt and the user’s answers to the clarifying questions, generate a PRD using the structure outlined below.

### 4. Deliver the PRD

Where it goes depends on where you are running:

1. **Inside a project repository** (the normal case): write it to the project's PRD location — the path named in `docs/ai/SYSTEM.md` (`prd_dir`) or `docs/ai/INDEX.md`; if the project names none, use `docs/ai/prd/`. Filename `prd-[feature-name].md`. Then add it to `docs/ai/INDEX.md` and note it under `MEMORY.md` → Current Position (the project's `WORKFLOW.md` says exactly which layers to touch). Do **not** create the plan or start implementing — the PRD gate ends with the owner's approval of the PRD.
2. **In a chat with no repository** (Claude.ai, ChatGPT, Antigravity chat): deliver it as a downloadable file `prd-[feature-name].md` (or PDF if the user asks; use the runtime's PDF skill when one exists).

Ask the user for their preferred format only in case 2, and only if they have not said.

---

## Clarifying Questions (Guidelines)

Ask only the most critical questions needed to write a clear PRD.  
Focus on areas where the initial prompt is ambiguous or missing essential context.

Common areas that may need clarification:

- **Problem / Goal**  
  If unclear: _“What problem does this feature solve for the user?”_

- **Core Functionality**  
  If vague: _“What are the key actions a user should be able to perform?”_

- **Scope / Boundaries**  
  If broad: _“Are there any specific things this feature should not do?”_

- **Success Criteria**  
  If unstated: _“How will we know when this feature is successfully implemented?”_

**Important:**  
Only ask questions when the answer isn’t reasonably inferable from the initial prompt.  
Prioritize questions that would significantly impact the PRD’s clarity.

---

## Formatting Requirements for Questions

- Number all questions (1, 2, 3, etc.)
- List options for each question as **A, B, C, D**, etc.
- Make it simple for the user to respond with selections like:  
  `1A, 2C, 3B`

---

## Example Question Format

1. **What is the primary goal of this feature?**  
   A. Improve user onboarding experience  
   B. Increase user retention  
   C. Reduce support burden  
   D. Generate additional revenue

2. **Who is the target user for this feature?**  
   A. New users only  
   B. Existing users only  
   C. All users  
   D. Admin users only

3. **What is the expected timeline for this feature?**  
   A. Urgent (1–2 weeks)  
   B. High priority (3–4 weeks)  
   C. Standard (1–2 months)  
   D. Future consideration (3+ months)

---

## PRD Structure

The generated PRD should include the following sections:

### 1. Introduction / Overview

Briefly describe the feature and the problem it solves.  
Clearly state the goal.

### 2. Goals

List the specific, measurable objectives for this feature.

### 3. User Stories

Detail the user narratives describing feature usage and benefits.

### 4. Features / Tasks

This section **must follow a strict format** to ensure tasks are trackable.

Rules:

- Group tasks by **Category** (e.g., FedEx Integration, Authentication, Email Service).
- Assign a **2-letter prefix** to each category (e.g., FedEx → `FE`, Authentication → `AT`).
- Number tasks sequentially (`01`, `02`, etc.).
- Format each item as:  
  `[Prefix][Number]: [Task Description]`

#### Required Format Example

- **Task / Feature**:
  - TF01: What the first step to achieving is.
  - TF02: What the second step to achieving is.

- **FedEx Integration**:
  - FE01: Enable `ELECTRONIC_TRADE_DOCUMENTS` for all FedEx shipments.
  - FE02: Fix `SHIPPING.DOCUMENT.REQUIRED` error by auto-generating Commercial Invoices for international shipments.
  - FE03: Automatically detect international routes (origin ≠ destination) and inject `shippingDocumentSpecification`.

- **Email Service**:
  - ES01: Replace legacy `mailer.ts` with `NotificationService` (SMTP/Brevo) to fix “Forbidden” errors.
  - ES02: Remove broken legacy mailer utilities.

- **Authentication**:
  - AT01: Increase Access Token expiry to 1d (was 15m).
  - AT02: Increase Refresh Token expiry to 14d (was 7d).

- **Maintenance**:
  - MA01: Update user deletion script to handle cascading deletes.

### 5. Non-Goals (Out of Scope)

Clearly state what this feature will **not** include to manage scope.

### 6. Design Considerations (Optional)

Link to mockups, describe UI/UX requirements, or mention relevant components/styles if applicable.

### 7. Technical Considerations (Optional)

Mention any known technical constraints, dependencies, or suggestions  
(e.g., _“Should integrate with the existing Auth module”_).

### 8. Success Metrics

Define how success will be measured, for example:

- Increase user engagement by 10%
- Reduce support tickets related to X

### 9. Open Questions

List any remaining questions or areas needing further clarification.

---

## Target Audience

Assume the primary reader of the PRD is determined by the user’s stated audience.

Examples may include:
- Software Engineers
- Operations Teams
- Product Managers
- Designers
- QA Engineers
- Business Stakeholders
- Customer Support Teams

The PRD should adapt its language, technical depth, and implementation detail based on the intended audience.

When the PRD is intended for implementation on an existing codebase, requirements should be explicit, actionable, and unambiguous, with enough context for contributors to execute effectively.

---

## Output

- **Format:** Markdown (`.md`); PDF only when asked outside a repository
- **Location:** the project's PRD directory (default `docs/ai/prd/`) when inside a repository; a downloadable file otherwise
- **Filename:** `prd-[feature-name].md`

---

## Final Instructions

- **Do NOT start implementing the PRD**
- **Make sure to ask the user clarifying questions**
- **Use the user’s answers to improve and finalize the PRD**
- **In a repository, write the PRD to the project's PRD directory and index it; do not implement**
- **Outside a repository, deliver it as a downloadable file in the format the user chose**
- **A PRD is approved by the owner before any implementation plan is written — say so when you hand it over**