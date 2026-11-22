#!/usr/bin/env python3
"""
RSS Prism source-history encryption preparation (AES-256-GCM).

This tool rewrites a LOCAL mirror only. It never pushes, force-pushes, changes
GitHub settings, or prints the encryption key.

Scope: tracked historical files under products/rss-prism-builder/ and
products/rss-prism-theme/. Workflow files and documentation remain readable.
Public release ZIPs are intentionally plaintext distributables.

Requirements:
  git, git-filter-repo, Python 3.9+, cryptography
  RSS_PRISM_ENCRYPTION_KEY = 64 hexadecimal characters (32 bytes)

Usage:
  export RSS_PRISM_ENCRYPTION_KEY='<your existing 64-char key>'
  python3 scripts/rss-prism-encrypt-history.py
  # Optional: python3 scripts/rss-prism-encrypt-history.py --repo URL --workdir DIR

After it finishes, inspect the mirror and its refs before deciding whether to
publish rewritten refs. Do not use a normal push; a history rewrite needs a
carefully reviewed mirror update and will invalidate old commit IDs.
"""
from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO_URL = "https://github.com/riyazamra1/RSS-Prism.git"
DEFAULT_WORKDIR = Path("rss-prism-encryption-work")
PREFIX = b"RSSPRISMENC1"
SCOPES = (b"products/rss-prism-builder/", b"products/rss-prism-theme/")


def run(args, cwd=None, *, capture=False):
    return subprocess.run(
        args, cwd=cwd, check=True, text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
    )


def main():
    parser = argparse.ArgumentParser(description="Prepare an encrypted RSS Prism Git mirror")
    parser.add_argument("--repo", default=REPO_URL, help="Git clone URL")
    parser.add_argument("--workdir", type=Path, default=DEFAULT_WORKDIR)
    args = parser.parse_args()

    raw_key = os.environ.get("RSS_PRISM_ENCRYPTION_KEY", "")
    if not re.fullmatch(r"[0-9a-fA-F]{64}", raw_key):
        raise SystemExit("ERROR: RSS_PRISM_ENCRYPTION_KEY must be exactly 64 hex characters.")
    key = bytes.fromhex(raw_key)
    if shutil.which("git") is None or shutil.which("git-filter-repo") is None:
        raise SystemExit("ERROR: install git and git-filter-repo first.")
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    except ImportError:
        raise SystemExit("ERROR: install Python package 'cryptography' first.")

    work = args.workdir.resolve()
    mirror = work / "RSS-Prism.git"
    backup = work / "RSS-Prism-before-encryption.bundle"
    if work.exists():
        raise SystemExit(f"ERROR: work directory already exists: {work}\nMove it aside or choose --workdir.")
    work.mkdir(parents=True)

    print("[1/5] Cloning every advertised ref into a local mirror...")
    run(["git", "clone", "--mirror", args.repo, str(mirror)])

    print("[2/5] Creating a complete pre-rewrite Git bundle backup...")
    run(["git", "bundle", "create", str(backup), "--all"], cwd=mirror)
    run(["git", "bundle", "verify", str(backup)])

    # git-filter-repo's file-info callback receives (filename, mode, blob_id, value).
    # It encrypts each matching historical file and changes its path to *.rssenc.
    callback = r'''
import os, secrets
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
_key = bytes.fromhex(os.environ["RSS_PRISM_ENCRYPTION_KEY"])
_aes = AESGCM(_key)
_prefix = b"RSSPRISMENC1"
_scopes = (b"products/rss-prism-builder/", b"products/rss-prism-theme/")
def _rss_prism_file_info(filename, mode, blob_id, value):
    if filename.startswith(_scopes) and not filename.endswith(b".rssenc"):
        _plain = value.get_contents_by_identifier(blob_id)
        _nonce = secrets.token_bytes(12)
        _sealed = _prefix + _nonce + _aes.encrypt(_nonce, _plain, filename)
        _new_blob_id = value.insert_file_with_contents(_sealed)
        return (filename + b".rssenc", mode, _new_blob_id)
    return (filename, mode, blob_id)
return _rss_prism_file_info(filename, mode, blob_id, value)
'''.strip()

    print("[3/5] Rewriting all refs in the mirror with authenticated encryption...")
    env = os.environ.copy()
    # Keep key only in process environment; never put it in command arguments or logs.
    env["RSS_PRISM_ENCRYPTION_KEY"] = raw_key
    subprocess.run(
        ["git", "filter-repo", "--force", "--file-info-callback", callback],
        cwd=mirror, env=env, check=True,
    )

    print("[4/5] Verifying rewritten path inventory...")
    listing = run(["git", "rev-list", "--objects", "--all"], cwd=mirror, capture=True).stdout
    paths = [line.split(" ", 1)[1] for line in listing.splitlines() if " " in line]
    source_paths = [p for p in paths if p.startswith("products/rss-prism-builder/") or p.startswith("products/rss-prism-theme/")]
    bad = [p for p in source_paths if not p.endswith(".rssenc")]
    if not source_paths:
        raise SystemExit("ERROR: no product source paths found after rewrite; do not publish this mirror.")
    if bad:
        raise SystemExit("ERROR: plaintext-path entries remain; do not publish. Example: " + bad[0])

    # Verify at least one encrypted object has the expected envelope marker.
    sample_path = next((p for p in source_paths if p.endswith(".rssenc")), None)
    if sample_path is None:
        raise SystemExit("ERROR: no encrypted product files found.")
    sample = run(["git", "show", f"HEAD:{sample_path}"], cwd=mirror, capture=True).stdout.encode()
    if not sample.startswith(PREFIX):
        raise SystemExit("ERROR: encrypted envelope verification failed.")

    print("[5/5] Completed local preparation.")
    print(f"Backup bundle: {backup}")
    print(f"Rewritten mirror: {mirror}")
    print(f"Encrypted historical product paths: {len(source_paths)}")
    print("NO PUSH WAS PERFORMED.")
    print("IMPORTANT: Release workflows must be updated to decrypt with the GitHub Actions secret")
    print("RSS_PRISM_ENCRYPTION_KEY before building public installable ZIPs.")
    print("This tool covers product paths only; audit other proprietary paths before publication.")


if __name__ == "__main__":
    main()
