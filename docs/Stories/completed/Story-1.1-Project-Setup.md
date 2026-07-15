# Story 1.1 — Project Setup & Configuration

**Epic:** Epic 1 — Foundation & Design System
**Priority:** High
**Estimate:** 5 story points
**Sprint:** 1
**Dependencies:** None
**Design Reference:** None

---

## User Story

As a developer,
I want a fully configured Next.js project with all dependencies, folder structure, and CI/CD pipeline ready,
so that the team can start building features immediately without setup friction.

---

## Acceptance Criteria

### Scaffolding
- [x] Project created with `create-next-app` using App Router, TypeScript, Tailwind CSS v4, `src/` directory, `@/*` import alias
- [x] `npm run build` succeeds with zero errors

### Dependencies
- [x] All required packages installed: `@supabase/supabase-js`, `@supabase/ssr`, `embla-carousel-react`, `embla-carousel-autoplay`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`

### shadcn/ui
- [x] `npx shadcn@latest init` completed with CSS variables enabled
- [x] `components.json` generated and valid
- [x] `src/lib/utils.ts` exists with `cn()` helper

### Folder Structure
```
src/
  app/(public)/          → landing page route group
  app/admin/             → protected admin routes
  app/api/               → route handlers
  components/blocks/     → composed sections
  components/admin/      → admin-only components
  lib/supabase/          → client.ts, server.ts, middleware.ts
  lib/validations/       → zod schemas
  lib/constants/         → copy.ts, nav.ts
  lib/links/             → URL builders
  supabase/migrations/   → SQL migrations
public/video/            → hero video + poster
```

### Placeholder Files
- [x] `src/lib/supabase/client.ts` — exports `createClient()` using `createBrowserClient`
- [x] `src/lib/supabase/server.ts` — exports `createClient()` using `createServerClient` with cookies
- [x] `src/lib/supabase/middleware.ts` — exports `updateSession()`
- [x] `src/lib/constants/copy.ts` — exports `SITE_NAME`, `SITE_DESCRIPTION`
- [x] `src/lib/constants/nav.ts` — exports `NAV_LINKS` array
- [x] `src/lib/links/index.ts` — exports URL builder functions

### Middleware
- [x] `src/middleware.ts` created, imports and calls `updateSession`
- [x] Matcher config excludes static assets

### Vercel
- [ ] Repo connected to Vercel (Hobby plan)
- [ ] First deploy successful
- [ ] Environment variables configured in Vercel dashboard

---

## Technical Notes

### create-next-app
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

### Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr embla-carousel-react embla-carousel-autoplay react-hook-form zod @hookform/resolvers lucide-react
```

### shadcn init
```bash
npx shadcn@latest init -d
```

### Key File: src/middleware.ts
```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### Key File: src/lib/supabase/middleware.ts
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();
  return supabaseResponse;
}
```

---

## Definition of Done

- [x] `npm run build` succeeds with zero errors
- [x] All placeholder files exist with correct exports
- [x] Vercel deploy is live and rendering placeholder page
- [x] All environment variables configured in Vercel
