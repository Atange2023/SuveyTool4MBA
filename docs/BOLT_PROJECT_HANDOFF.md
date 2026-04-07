# Bolt Project Handoff

## Project Summary

SuveyTool4MBA is a front-end-first business research workflow tool for DBA/MBA users with strong business intuition but weak statistical background.

The product goal is not to behave like a traditional "statistics calculator". It should feel like an AI-assisted decision-validation workflow that helps users move from business pain point to structured research design, data quality checking, statistical validation, and executive-facing interpretation.

## Current Version Positioning

The current shipped V2.0 should be understood as:

`pure front-end analysis + external AI prompt collaboration`

That means:

- Story-to-model is currently implemented as prompt generation, then paste into an external AI assistant, then paste JSON back into the app
- Boardroom report is currently implemented as prompt generation for an external AI assistant
- Direct in-app LLM API integration is not implemented yet
- Raw uploaded business data should remain local in the browser

Do not describe the product as if in-app LLM automation is already complete.

## Current Implemented Capabilities

1. Homepage with project entry
   Users can either open an example project or start a new project from scratch.

2. Story-to-model assistant
   Users describe a business problem, copy a generated professional prompt, use an external AI tool, then paste the returned JSON into the app.

3. Research workflow editing
   Users can edit project title, description, constructs, hypotheses, and indicator items.

4. Publish and collect
   A lightweight publish panel exists as a workflow step and product placeholder.

5. Traffic-light data QA
   CSV upload, local parsing, Alpha/AVE checks, weak-item highlighting, and manual item removal with recalculation.

6. PLS-SEM analysis
   Local statistical analysis and result rendering in a business-friendly workflow.

7. Boardroom report assistance
   The app generates prompts that users copy into ChatGPT, DeepSeek, Tongyi, etc. to get executive-level narrative output.

## Features Not Yet Implemented

These belong in the roadmap or future plan, not as current shipped capabilities:

- In-app OpenAI-compatible API integration
- Settings panel for user-provided API keys stored in localStorage
- End-to-end automatic LLM orchestration inside the app
- Automatic statistical router for T-test / ANOVA / Chi-square based on data sniffing
- Multi-group analysis
- Mediation / moderation dedicated workflows
- Team collaboration and project sharing
- Native online survey collection system

## Product Language Rules

Use the following language consistently:

- Say "AI prompt collaboration" instead of "the system automatically completes everything"
- Say "generate prompts for external AI assistants" instead of "built-in report generation" when referring to current behavior
- Keep messaging oriented to business users, not statisticians
- Hide jargon when possible, but do not falsely claim automation that does not exist

## Engineering Constraints

1. Keep the app compatible with GitHub Pages
   - Preserve `.github/workflows/deploy-pages.yml`
   - Preserve `vite.config.ts` base handling for Pages
   - Do not add server-only runtime requirements

2. Keep it client-side first
   - No Node backend
   - No SSR
   - No API routes required for baseline product operation

3. Preserve privacy messaging
   - Raw uploaded business data should remain in-browser for current architecture

4. Keep the repository deployable
   - `npm ci`
   - `npm run build`
   - output in `dist/`

## How Future Development Should Be Scoped

When implementing new work:

- Prefer small, bounded tasks
- Do not perform broad refactors unless explicitly asked
- Do not overwrite deployment files
- Do not replace prompt-based flows with fake in-app automation claims
- If adding future-facing modules, clearly label them as planned, beta, or placeholder unless fully implemented

## Recommended Instruction Prompt For A New Bolt Session

Use the following as the starting prompt in a new Bolt account:

```text
You are continuing development on an existing Vite + React + TypeScript project called SuveyTool4MBA.

First understand the product correctly:

1. This is an AI-assisted business research and decision-validation workflow tool for DBA/MBA users.
2. The current shipped version is NOT a fully automated in-app LLM product.
3. The current version should be treated as:
   - local browser-side analysis
   - external AI prompt collaboration
4. Story-to-model currently works by:
   - user describes a business pain point
   - system generates a professional prompt
   - user copies that prompt into an external AI assistant
   - user pastes returned JSON back into the app
5. Boardroom report currently works by:
   - system prepares structured prompt text
   - user copies the prompt to an external AI assistant
   - external AI generates the final executive narrative
6. Do not claim that direct OpenAI-compatible API automation is already implemented.
7. Do not remove or overwrite deployment-related files:
   - `.github/workflows/deploy-pages.yml`
   - `vite.config.ts`
8. Keep the project compatible with GitHub Pages and pure front-end deployment.
9. Do not introduce SSR, backend services, or server-only dependencies unless explicitly requested.
10. Keep raw uploaded business data local in the browser whenever possible.

Product language requirements:

- Use business-friendly wording
- Avoid statistics-heavy framing
- Do not overclaim automation
- If a capability is not implemented yet, present it as planned rather than shipped

Delivery requirements for every task:

- Keep changes scoped to the requested feature
- Preserve buildability with `npm run build`
- Do not commit build artifacts like `dist/`
- If you modify product copy, align it with the actual implementation state

Now inspect the current codebase and continue development from the existing project structure rather than rebuilding from scratch.
```
