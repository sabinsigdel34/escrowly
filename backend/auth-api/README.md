# Escrowly Auth API

Authentication and authorization API with:
- Email/password login and registration
- Email activation flow
- Forgot/reset password
- Role-based access (`admin`, `manager`, `user`)
- Google + GitHub OAuth login
- Admin user management endpoints

## Setup

1. Install dependencies:
   - `npm install`
2. Copy env:
   - `cp .env.example .env`
3. Fill `.env` values:
   - `SMTP_USER` and `SMTP_PASS` for activation/reset emails
   - OAuth client IDs/secrets for Google/GitHub
   - `AUTH_DB_FILE` only if you want the JSON auth store outside the default `data/auth-db.json`
   - Solana payout wallet configuration:
     - `SOLANA_RPC_URL`
     - `SOLANA_ESCROW_PROGRAM_ID` (required when `ESCROW_MODE=program`)
     - `SOLANA_TREASURY_PUBLIC_KEY`
     - `SOLANA_TREASURY_SECRET` (base58 string or JSON secret key array)
     - `ESCROW_MODE` = `custodial` or `program`
4. Start:
   - `npm run dev`

## Important Role Rules

- `admin`: full control (users, manager, transactions scope in app integrations)
- `manager`: read-only access for protected information
- `user`: normal system usage only
- Admin can block/remove users.
- Admin can transfer admin role:
  - current admin becomes `manager`
  - selected user becomes new `admin`

## Main Endpoints

- `POST /auth/register`
- `POST /auth/activate`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/google`
- `GET /auth/github`
- `GET /auth/me`
- `GET /deals`
- `GET /deals/:id`
- `POST /deals`
- `POST /deals/:id/release`
- `POST /deals/:id/cancel`
- `POST /deals/:id/refund`
- `GET /admin/users` (manager/admin read-only)
- `PATCH /admin/users/:id/role` (admin)
- `POST /admin/transfer-admin/:id` (admin)
- `PATCH /admin/users/:id/block` (admin)
- `PATCH /admin/users/:id/unblock` (admin)
- `DELETE /admin/users/:id` (admin)
