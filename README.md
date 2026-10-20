# carekind-admin-web

Facility admin web app (机构管理端) — part of **CareKind AI**.

- Stack: React + TypeScript (web)
- Requirements, boundaries and module guidance: [src/admin-web](https://github.com/terryxu0321/JRAgedCareProject/tree/main/company-os/06-app-development/src/admin-web)
- **All documentation lives in the meta repo** [terryxu0321/JRAgedCareProject](https://github.com/terryxu0321/JRAgedCareProject) (PRD, specs, rules, decisions, changelog). This repo holds only code, tests and config.
- Before working here (people or AI agents), read the meta repo's root `AGENTS.md` and the module guidance linked above.

Formatting follows `.editorconfig` (tabs, width 4). Never commit secrets or real resident / personal data — this repo is public.

## Development

Requires Node.js 20+. `@carekind/shared` is a `file:` dependency on `../../packages/carekind-shared` in the meta repo; build it first (`npm install && npm run build` there).

```sh
npm install
cp .env.example .env    # optional: VITE_API_BASE_URL (default http://localhost:3000)
npm run dev             # http://localhost:5174
npm run build           # typecheck + production build into dist/
npm run typecheck
npm run lint            # ESLint + Prettier check
npm test                # Vitest + Testing Library (synthetic data only)
```
