# STUDY: Supabase storage update

The existing Firebase login and Firestore material metadata remain in use.
New files upload to the private Supabase `study-materials` bucket.
The Supabase project and `study-storage` Edge Function are already deployed.
Project: `rjeqphxewhbinkidspdm` (Mumbai). Free plan selected; no paid plan enabled.

## Start locally

1. Extract this ZIP into a new folder. Keep your old project as a backup.
2. Open the extracted `pari` folder in VS Code/Antigravity.
3. Open `admin-login.html` with Live Server. Do not double-click the HTML file.
4. Sign in with your existing Firebase admin credentials.
5. Select a year, group, and subject; upload a small PDF first.
6. Open the matching year/group as a signed-in user and click the material.

The user login page remains separate. Admins are restricted to these Firebase UIDs:

| Account | UID |
| --- | --- |
| mpari1485@gmail.com | fMGIdEIX9YcpqTYS9LswRMcFSIb2 |
| pavanwadile777@gmail.com | jIf44hCNk6heym0SI0dGRUhIs7G2 |

Passwords were not changed and are not included in this ZIP.

## Publish frontend and Firestore rules

From this folder, with Python and Firebase CLI installed:

```sh
python build.py
firebase login
firebase deploy --only "hosting,firestore" --project alpha-c3c01
```

Use the Google account with access to Firebase project alpha-c3c01.
The included public folder is already built. Run build.py again after editing.
Deploy the included Firestore rules and indexes as well as Hosting.
Firebase Storage is not required for new uploads. Old Firebase files retain their original URLs.

## Storage behavior

- Maximum file size: 25 MiB; PDF, DOC/DOCX, PPT/PPTX, ZIP and TXT.
- Both admins can upload and delete any study material.
- The backend cryptographically verifies Firebase ID tokens; normal users cannot upload/delete.
- Any signed-in Firebase user can obtain a two-minute download link for a known material path.
- Firestore saves a permanent file reference, never an expiring signed link.
- Failed metadata saves trigger file cleanup. Failed file deletion keeps metadata for retry.
- The browser contains only a public Supabase key. Service credentials stay in the Edge Function.
- Private bucket; no direct anonymous upload/download policies are enabled.
- Existing login UI and year/group structure are preserved.

## Verification and remaining deployment

Local tests cover real RS256 signature verification, expired/wrong-project tokens,
both admin permissions, denied student writes, download signing, file size/type and
year/group validation. Storage API responses are mocked in those local tests.
The live deployed function returns HTTP 401 without a valid Firebase token.
Frontend module imports and deletion recovery have also been checked.

An authenticated end-to-end upload/download in your browser still needs checking.
Firebase Hosting and these updated Firestore rules have not been deployed from this session.
No Firebase password, secret service key, or authentication export is included.

## Future backend changes

The deployed backend source is in supabase/functions/study-storage/index.ts.
Deploy changes with Supabase CLI after authenticating:

```sh
supabase functions deploy study-storage --project-ref rjeqphxewhbinkidspdm --no-verify-jwt
```

The function performs its own Firebase JWT verification; do not remove that verification.
Keep the admin UID lists consistent across the function, firebase-config.js and firestore.rules.
