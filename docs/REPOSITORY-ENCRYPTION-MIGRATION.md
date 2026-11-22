# RSS Prism repository source encryption

## Current state

The public repository is not encrypted until the local history rewrite has been
run and the rewritten refs have been deliberately published. This branch adds
the preparation and CI decryption code; it does not rewrite GitHub history.

## Scope and format

- Historical tracked files below `products/rss-prism-builder/` and
  `products/rss-prism-theme/` are encrypted with AES-256-GCM.
- Encrypted paths receive the `.rssenc` suffix.
- The original repository-relative path is authenticated as AES-GCM additional
  authenticated data (AAD), so a file cannot be renamed without detection.
- `.github/workflows/`, migration scripts, and documentation remain readable.
- Public installable ZIP releases remain plaintext by design. The four package
  workflows retrieve the decryption helper from `main` and decrypt only inside
  the GitHub Actions runner using the `RSS_PRISM_ENCRYPTION_KEY` secret.

This is source-code-at-rest protection, not DRM. A public release ZIP can be
inspected by anyone who downloads it. Public forks, old clones, caches, and
previous releases may retain plaintext copies after history rewriting.

## Required secret

The repository Actions secret must be named exactly
`RSS_PRISM_ENCRYPTION_KEY` and contain the existing 32-byte key encoded as
exactly 64 hexadecimal characters. Do not paste the key into issues, pull
requests, commits, workflow logs, or ChatGPT.

## Local preparation

Install Git, `git-filter-repo`, Python 3.9+, and the Python package
`cryptography`. Then run from a trusted local clone of this branch:

```bash
export RSS_PRISM_ENCRYPTION_KEY='<your existing 64-character hex key>'
python3 scripts/rss-prism-encrypt-history.py
```

The tool clones all advertised refs into a mirror, creates and verifies a
pre-rewrite bundle backup, rewrites matching historical product files, and
checks that all product paths in the rewritten refs end in `.rssenc`. It does
not push anything.

## Mandatory review before publishing

1. Confirm the bundle backup exists and passes `git bundle verify`.
2. Inspect every branch and tag in the rewritten mirror.
3. Confirm no plaintext product paths remain in any rewritten ref.
4. Confirm the decryption helper restores byte-identical files using the same
   key. Test a staging build before any production release.
5. Confirm all required refs, tags, PR branches, and collaborators are covered.
6. Only after review, decide how to publish the rewritten refs. A mirror update
   is destructive to existing commit IDs and may be blocked by branch rules.
   Do not use a normal `git push`; do not force-push until backups, protection
   settings, and the exact ref list have been reviewed.

## CI workflow behavior

The four packaging workflows now:
1. Check out the decryption helper from `main` separately, so dispatching an
   older tag does not depend on that tag containing the helper.
2. Install `cryptography`.
3. Decrypt the encrypted product source in the temporary Actions workspace.
4. Continue existing validation and ZIP packaging.

Before the history rewrite, the helper detects that no `.rssenc` files exist
and leaves the plaintext checkout unchanged. After the rewrite, it requires
the Actions secret and decrypts the source for packaging.

## Important limitation

The migration script currently targets the two product directories only. Audit
the full repository for any additional proprietary source or sensitive files
before declaring the entire repository encrypted.
