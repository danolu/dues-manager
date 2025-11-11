# Dues Manager

A Next.js + Prisma application for member authentication, dues collection, and admin reporting.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (`jose`) + bcrypt |
| Forms | React Hook Form + Zod |
| Payments | Paystack |
| Email | Resend |
| Styling | Tailwind CSS v4 |

## Key Features

- **Auth** — Register, login/logout, forgot/reset password, email verification
- **Dues** — Paystack payment reference verification, downloadable PDF receipts
- **Admin** — Manage settings, users and tenures; view payment reports with revenue analytics
- **Security** — JWT-based route protection via `proxy.ts` middleware, role checks on all admin routes

---

## Setup

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 — install with `npm i -g pnpm`
- **PostgreSQL** ≥ 14 running locally or a hosted instance (e.g. Supabase, Neon)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-org/dues-manager.git
cd dues-manager
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Long random secret for signing JWTs. Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `NEXT_PUBLIC_APP_NAME` | Display name shown across the UI |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (use `sk_test_...` locally) |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key (use `pk_test_...` locally) |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) |
| `EMAIL_FROM` | Verified sender address e.g. `Dues Manager <noreply@yourdomain.com>` |

> **Tip:** For local development you can use Paystack's **test** keys and Resend's default `onboarding@resend.dev` sender.

### 4. Set up the database

```bash
# Run migrations to create tables
pnpm prisma:migrate

# Generate the Prisma client
pnpm prisma:generate

# (Optional) Seed default settings
pnpm prisma:seed
```

> **First-time admin setup:** After seeding, register your first user via the app and then manually set `is_admin = true` in the `users` table, or use `pnpm prisma studio` to do it via the UI.

### 5. Start the development server

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Compile a production build |
| `pnpm start` | Start the compiled production server |
| `pnpm lint` | Run ESLint |
| `pnpm prisma:generate` | Regenerate Prisma client after schema changes |
| `pnpm prisma:migrate` | Apply pending database migrations |
| `pnpm prisma:seed` | Seed default settings row |
| `pnpm prisma studio` | Open the Prisma visual database browser |

---

## CI

GitHub Actions workflow at `.github/workflows/ci.yml` runs on every push:

1. `pnpm install --frozen-lockfile`
2. `pnpm prisma:generate`
3. `pnpm lint`
4. `pnpm build`
