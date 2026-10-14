# ASTRA backend

Standalone TypeScript API service for ASTRA authentication and profile data. Keep privileged Supabase and Judge0 credentials in this service's environment only.

## Local setup

1. Apply all SQL migrations in `supabase/migrations/` to the Supabase project. These create the outsider credentials, profile activity, and notification storage.
2. Copy `conflict/.env.example` to `conflict/.env`.
3. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a random `ASTRA_SESSION_SECRET` of at least 32 characters.
4. Configure the existing member credential/profile table fields using the `MEMBER_*` variables. Defaults are `user.society_id`, `user.email`, `user.password_hash`, and `member.society_id`. Password hashes in the member credential table must be bcrypt hashes.
5. Set `ASTRA_ADMIN_ACCOUNT_IDS` to a comma-separated allowlist of admin account IDs. For members, use their configured society ID; for outsider accounts, use the account UUID. Only these signed-in accounts can publish notifications.
6. In `shuffal/.env.local`, set `NEXT_PUBLIC_API_URL=http://localhost:4000`.
7. Configure Judge0 in this backend environment: set `JUDGE0_API_URL` to your Judge0 API base URL. Set `JUDGE0_API_KEY` and `JUDGE0_AUTH_HEADER` when your provider requires authentication; the header defaults to `X-Auth-Token`. RapidAPI endpoints also get the `X-RapidAPI-Host` header automatically. Never put Judge0 credentials in the frontend environment.

Start the frontend and backend in separate terminals from the repository root:

```sh
npm run dev:frontend
npm run dev:backend
```

The API health endpoint is `http://localhost:4000/api/health`. Authentication uses an HTTP-only, signed session cookie; do not store the session token in browser storage.

Admins can publish announcements from `/admin`. Signed-in accounts see unread announcements at `/notifications`; the navigation badge polls for new items and shows a red dot while unread announcements remain.

The problem workspace sends code and stdin to `POST /api/judge/execute`. The backend requires a signed-in session, limits executions, submits code to Judge0, and polls for the result. It currently supports C, C++17, Java, JavaScript, and Python 3. Add expected test cases before treating an execution as a problem verdict; this endpoint only runs the supplied program.

Outsider accounts are stored only in `public.astra_credentials`; passwords are bcrypt-hashed on the server. The service-role key is backend-only. Profile photos are validated (JPG/PNG/WebP, 5 MB maximum), stored in the private Supabase bucket, and served using signed URLs.

Member table columns differ between projects, so set their exact existing identifiers through `MEMBER_*` variables. If the existing password hash format is not bcrypt, the member password verifier must be adjusted to that hash algorithm before enabling member sign-in.
