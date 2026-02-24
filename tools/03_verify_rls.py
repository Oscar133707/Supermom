#!/usr/bin/env python3
"""
03_verify_rls.py — Verify Row Level Security policies are working correctly.

Tests:
  1. Admin (service role) can read all data
  2. Anonymous user cannot read any protected data
  3. Schema tables all exist

Usage:
    cd /Users/oscarjohansson/Supermom
    python3 tools/03_verify_rls.py

Requires in .env:
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

try:
    from supabase import create_client
except ImportError:
    print("ERROR: supabase not installed. Run: pip install -r tools/requirements.txt")
    sys.exit(1)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not all([SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY]):
    print("ERROR: Missing env vars. Check .env")
    sys.exit(1)

TABLES = [
    "profiles",
    "workout_programs",
    "workout_sessions",
    "program_assignments",
    "session_completions",
    "measurements",
    "chat_messages",
]


def run_test(name: str, passed: bool, detail: str = "") -> bool:
    status = "PASS ✓" if passed else "FAIL ✗"
    print(f"  [{status}] {name}")
    if detail:
        print(f"         {detail}")
    return passed


def main() -> None:
    print("=" * 60)
    print("Supermom — RLS Verification")
    print("=" * 60)
    print()

    all_passed = True
    admin_client = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)
    anon_client = create_client(SUPABASE_URL, ANON_KEY)

    # ─── Test 1: Admin can read all tables ────────────────────────────────────
    print("Test 1: Admin (service role) can read all tables")
    for table in TABLES:
        try:
            result = admin_client.table(table).select("*").limit(1).execute()
            passed = run_test(f"Admin reads {table}", True, f"{len(result.data)} rows returned")
        except Exception as e:
            passed = run_test(f"Admin reads {table}", False, str(e))
        all_passed = all_passed and passed
    print()

    # ─── Test 2: Anonymous user cannot read protected tables ──────────────────
    print("Test 2: Anonymous user cannot read protected data (RLS blocks them)")
    for table in TABLES:
        try:
            result = anon_client.table(table).select("*").limit(1).execute()
            # Should return empty (RLS filters out all rows) or raise
            passed = run_test(
                f"Anon blocked from {table}",
                len(result.data) == 0,
                f"Got {len(result.data)} rows (expected 0 — RLS should filter all)",
            )
        except Exception as e:
            # Exception = blocked = good for protected tables
            passed = run_test(f"Anon blocked from {table}", True, f"Exception (blocked): {type(e).__name__}")
        all_passed = all_passed and passed
    print()

    # ─── Test 3: Profiles table has at least one row (admin seeded) ──────────
    print("Test 3: Admin profile exists")
    try:
        result = admin_client.table("profiles").select("*").eq("role", "admin").execute()
        passed = run_test(
            "Admin profile found",
            len(result.data) > 0,
            f"Found {len(result.data)} admin profile(s)",
        )
    except Exception as e:
        passed = run_test("Admin profile found", False, str(e))
    all_passed = all_passed and passed
    print()

    # ─── Test 4: Sample program exists ────────────────────────────────────────
    print("Test 4: Sample workout program exists")
    try:
        result = admin_client.table("workout_programs").select("*, sessions:workout_sessions(*)").execute()
        if result.data:
            prog = result.data[0]
            sessions = prog.get("sessions", [])
            passed = run_test(
                "Sample program found",
                True,
                f"'{prog['name']}' with {len(sessions)} session(s)",
            )
        else:
            passed = run_test("Sample program found", False, "No programs found — run 02_seed_db.py first")
    except Exception as e:
        passed = run_test("Sample program found", False, str(e))
    all_passed = all_passed and passed
    print()

    # ─── Summary ──────────────────────────────────────────────────────────────
    print("=" * 60)
    if all_passed:
        print("All tests PASSED ✓")
        print()
        print("Your database is ready. Next: npm install && npm run dev")
    else:
        print("Some tests FAILED ✗")
        print()
        print("Check the errors above and re-run 01_setup_db.py / 02_seed_db.py if needed.")
    print("=" * 60)


if __name__ == "__main__":
    main()
