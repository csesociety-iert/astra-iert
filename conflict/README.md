# ASTRA backend

Standalone TypeScript API service for ASTRA authentication and profile data. Keep privileged Supabase and Judge0 credentials in this service's environment only.

## Local setup

1. Apply `supabase/migrations/202610130001_create_astra_credentials.sql` to the Supabase project. This creates the outsider `astra_credentials` table and private photo bucket.
2. Copy `conflict/.env.example` to `conflict/.env`.
3. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a random `ASTRA_SESSION_SECRET` of at least 32 characters.
4. Configure the existing member credential/profile table fields using the `MEMBER_*` variables. Defaults are `user.society_id`, `user.email`, `user.password_hash`, and `member.society_id`. Password hashes in the member credential table must be bcrypt hashes.
5. In `shuffal/.env.local`, set `NEXT_PUBLIC_API_URL=http://localhost:4000`.

Start the frontend and backend in separate terminals from the repository root:

```sh
npm run dev:frontend
npm run dev:backend
```

The API health endpoint is `http://localhost:4000/api/health`. Authentication uses an HTTP-only, signed session cookie; do not store the session token in browser storage.

Outsider accounts are stored only in `public.astra_credentials`; passwords are bcrypt-hashed on the server. The service-role key is backend-only. Profile photos are validated (JPG/PNG/WebP, 5 MB maximum), stored in the private Supabase bucket, and served using signed URLs.

Member table columns differ between projects, so set their exact existing identifiers through `MEMBER_*` variables. If the existing password hash format is not bcrypt, the member password verifier must be adjusted to that hash algorithm before enabling member sign-in.
