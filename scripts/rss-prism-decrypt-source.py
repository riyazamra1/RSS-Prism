#!/usr/bin/env python3
"""Decrypt RSS Prism product source files in a CI checkout.

Reads RSS_PRISM_ENCRYPTION_KEY from the environment. The key is never printed.
The script is safe before the history migration: if no *.rssenc files exist,
it exits successfully and leaves the current plaintext checkout untouched.
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT = Path(__file__).resolve().parents[1]
PREFIX = b"RSSPRISMENC1"
SCOPES = ("products/rss-prism-builder/", "products/rss-prism-theme/")


def main() -> int:
    raw_key = os.environ.get("RSS_PRISM_ENCRYPTION_KEY", "")
    if not re.fullmatch(r"[0-9a-fA-F]{64}", raw_key):
        print("::error::RSS_PRISM_ENCRYPTION_KEY must be a 64-character hex key.", file=sys.stderr)
        return 2
    aes = AESGCM(bytes.fromhex(raw_key))
    encrypted = []
    for scope in SCOPES:
        folder = ROOT / scope
        if folder.exists():
            encrypted.extend(p for p in folder.rglob("*.rssenc") if p.is_file())
    if not encrypted:
        print("No encrypted RSS Prism product files found; plaintext checkout unchanged.")
        return 0

    for source in sorted(encrypted):
        relative = source.relative_to(ROOT).as_posix()
        if not relative.endswith(".rssenc") or not relative.startswith(SCOPES):
            raise RuntimeError(f"Refusing unexpected encrypted path: {relative}")
        original_relative = relative[:-7]
        original = ROOT / original_relative
        if original.exists():
            raise RuntimeError(f"Refusing to overwrite existing file: {original_relative}")
        sealed = source.read_bytes()
        if len(sealed) < len(PREFIX) + 12 + 16 or not sealed.startswith(PREFIX):
            raise RuntimeError(f"Invalid RSS Prism encrypted envelope: {relative}")
        nonce_start = len(PREFIX)
        nonce = sealed[nonce_start:nonce_start + 12]
        ciphertext = sealed[nonce_start + 12:]
        plaintext = aes.decrypt(nonce, ciphertext, original_relative.encode("utf-8"))
        original.parent.mkdir(parents=True, exist_ok=True)
        original.write_bytes(plaintext)
        original.chmod(source.stat().st_mode & 0o777)
        source.unlink()

    print(f"Decrypted {len(encrypted)} RSS Prism product source files for this CI job.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
