# Zizi Offers / عروض زيزي

Arabic RTL Next.js project for "عروض زيزي". Stage 1 covers setup and planning integration only; it does not build the full website, integrate Firebase/Cloudinary, add payments, add calendars, or create customer accounts.

## Runtime

- Node.js: tested with `v20.19.5`
- npm: tested with `11.4.2`
- Git: tested with `2.46.2.windows.1`

## Install

```sh
npm install
```

## Development

Run the local dev server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```sh
npm run lint
npm run typecheck
npm run build
```

## Environment

Copy `.env.example` to `.env.local` only when real configuration is needed. Keep all real secrets local or in the deployment provider dashboard. Do not commit `.env.local`, credentials, service-account files, or tokens.

## Documentation

- `START-HERE.md`: onboarding notes from the planning kit.
- `AGENTS.md`: project rules, content constraints, and workflow.
- `DESIGN.md`: visual system and interaction decisions.
- `PLAN.md`: staged delivery plan and actual status.
- `docs/zizi-website-reference.md`: source content/reference decisions.
- `docs/assets-register.md`: actual delivered asset registry.

## Stage 1 Notes

- Required frontend dependencies are installed: `motion`, `clsx`, `tailwind-merge`, and `@phosphor-icons/react`.
- No calendar, payment, or customer account libraries are included.
- Public/admin implementation is deferred to the next stage.
- Admin saves must be treated as prototype-only until durable backend storage and authorization are connected.

## GitHub and Vercel

`main` is the stable production branch. Local commits are checkpoints; unpushed commits do not update GitHub or Vercel. A pushed feature branch may create a Vercel preview, while pushing `main` may update production.
