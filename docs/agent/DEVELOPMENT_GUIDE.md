# Development Guide For AI Agents

## 1. Core Engineering Constraints

1. Keep the project compatible with GitHub Pages
2. Preserve `.github/workflows/deploy-pages.yml`
3. Preserve GitHub Pages `base` handling in `vite.config.ts`
4. Keep the project front-end only unless explicitly asked otherwise
5. Do not introduce SSR, backend API routes, or server-required runtime for baseline operation
6. Keep `npm run build` passing
7. Do not commit `dist/`

## 2. Product Constraints

1. Do not overclaim automation in user-facing copy
2. Do not present planned modules as shipped functionality
3. Keep raw business data local in browser whenever possible
4. Preserve privacy messaging in upload / analysis areas

## 3. Development Style

1. Prefer small scoped changes
2. Avoid broad refactors unless explicitly requested
3. Keep existing workflow structure unless the task requires a redesign
4. If changing product messaging, verify that the code behavior actually matches the new wording

## 4. Documentation Rules

When adding docs:

- user-facing docs go into `docs/user/`
- agent-facing docs go into `docs/agent/`
- root `README.md` stays as the main entry point only

## 5. Recommended Start Prompt For A New Bolt Session

```text
You are continuing development on an existing Vite + React + TypeScript project called SuveyTool4MBA.

Understand the current product correctly before making changes:

1. This is a business research and decision-validation workflow tool for DBA/MBA users.
2. The current shipped version is not a fully automated in-app LLM product.
3. The current version should be treated as:
   - local browser-side analysis
   - external AI prompt collaboration
4. Story-to-model currently works by generating prompts for external AI tools and then parsing pasted JSON.
5. Boardroom report currently works by generating prompts for external AI tools.
6. Do not present future roadmap items as current shipped features.
7. Keep the app compatible with GitHub Pages.
8. Do not remove or overwrite deployment files such as:
   - `.github/workflows/deploy-pages.yml`
   - `vite.config.ts`
9. Keep raw uploaded business data local in the browser whenever possible.
10. Keep every change scoped and maintain `npm run build` success.

Now inspect the existing codebase and continue from the current implementation rather than rebuilding from scratch.
```
