#!/usr/bin/env python3
"""
02_seed_db.py — Create admin user and seed sample data.

Run ONCE after 01_setup_db.py. Creates:
  1. Your admin account (sets role='admin')
  2. A sample "Getting Started" workout program
  3. Three sample sessions

Usage:
    cd /Users/oscarjohansson/Supermom
    python3 tools/02_seed_db.py

Requires in .env:
    NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
    ADMIN_EMAIL
"""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

try:
    from supabase import create_client, Client
except ImportError:
    print("ERROR: supabase not installed. Run: pip install -r tools/requirements.txt")
    sys.exit(1)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

if not all([SUPABASE_URL, SERVICE_ROLE_KEY, ADMIN_EMAIL]):
    missing = [
        k for k, v in {
            "NEXT_PUBLIC_SUPABASE_URL": SUPABASE_URL,
            "SUPABASE_SERVICE_ROLE_KEY": SERVICE_ROLE_KEY,
            "ADMIN_EMAIL": ADMIN_EMAIL,
        }.items() if not v
    ]
    print(f"ERROR: Missing env vars: {', '.join(missing)}")
    sys.exit(1)

SAMPLE_PROGRAM = {
    "name": "Getting Started — 4 Week Intro",
    "description": "A light full-body program to build the habit of training. "
                   "Focus on form, not weight. 3 sessions per week.",
    "duration_weeks": 4,
}

SAMPLE_SESSIONS = [
    {
        "week_number": 1, "day_number": 1,
        "title": "Day 1 — Full Body A",
        "exercises": [
            {"name": "Bodyweight Squat",  "sets": 3, "reps": "15",    "rest_sec": 60},
            {"name": "Wall Push-Up",      "sets": 3, "reps": "10",    "rest_sec": 60},
            {"name": "Glute Bridge",      "sets": 3, "reps": "12",    "rest_sec": 45},
            {"name": "Dead Bug",          "sets": 2, "reps": "8/side","rest_sec": 45},
        ],
        "notes": "Take it easy. Focus on breathing and proper form.",
    },
    {
        "week_number": 1, "day_number": 3,
        "title": "Day 2 — Full Body B",
        "exercises": [
            {"name": "Step-Up (chair)",   "sets": 3, "reps": "10/leg","rest_sec": 60},
            {"name": "Incline Push-Up",   "sets": 3, "reps": "8",     "rest_sec": 60},
            {"name": "Bird-Dog",          "sets": 3, "reps": "8/side","rest_sec": 45},
            {"name": "Hip Hinge",         "sets": 3, "reps": "12",    "rest_sec": 45},
        ],
        "notes": "Control each movement. Quality over quantity.",
    },
    {
        "week_number": 1, "day_number": 5,
        "title": "Day 3 — Full Body C",
        "exercises": [
            {"name": "Goblet Squat",      "sets": 3, "reps": "12",    "rest_sec": 60, "notes": "Use a water bottle if no weights"},
            {"name": "Push-Up",           "sets": 3, "reps": "8",     "rest_sec": 60},
            {"name": "Reverse Lunge",     "sets": 3, "reps": "10/leg","rest_sec": 60},
            {"name": "Plank Hold",        "sets": 3, "reps": "20s",   "rest_sec": 45},
        ],
        "notes": "You made it to day 3 this week. Great work! 💪",
    },
]


def main() -> None:
    print("=" * 60)
    print("Supermom — Seed Database")
    print("=" * 60)
    print()

    client: Client = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

    # ─── 1. Create admin user ──────────────────────────────────────────────────
    print(f"Creating admin user: {ADMIN_EMAIL}")
    try:
        response = client.auth.admin.create_user({
            "email": ADMIN_EMAIL,
            "email_confirm": True,
            "user_metadata": {"full_name": "Oscar (Admin)"},
        })
        admin_id = response.user.id
        print(f"Admin user created: {admin_id} ✓")
    except Exception as e:
        if "already been registered" in str(e) or "already exists" in str(e):
            print(f"Admin user already exists — fetching their ID...")
            users = client.auth.admin.list_users()
            admin_user = next((u for u in users if u.email == ADMIN_EMAIL), None)
            if not admin_user:
                print(f"ERROR: Could not find user {ADMIN_EMAIL}")
                sys.exit(1)
            admin_id = admin_user.id
            print(f"Found admin: {admin_id} ✓")
        else:
            print(f"ERROR creating admin user: {e}")
            sys.exit(1)

    # ─── 2. Set role to admin ──────────────────────────────────────────────────
    print("Setting role to 'admin'...")
    try:
        client.table("profiles").update({"role": "admin", "full_name": "Oscar (Admin)"}).eq("id", admin_id).execute()
        print("Role set ✓")
    except Exception as e:
        print(f"ERROR setting role: {e}")
        sys.exit(1)

    # ─── 3. Create sample program ─────────────────────────────────────────────
    print()
    print(f"Creating sample program: '{SAMPLE_PROGRAM['name']}'...")
    try:
        result = client.table("workout_programs").insert({
            **SAMPLE_PROGRAM,
            "created_by": admin_id,
        }).execute()
        program_id = result.data[0]["id"]
        print(f"Program created: {program_id} ✓")
    except Exception as e:
        print(f"ERROR creating program: {e}")
        sys.exit(1)

    # ─── 4. Create sample sessions ────────────────────────────────────────────
    print("Creating sample sessions...")
    for session in SAMPLE_SESSIONS:
        try:
            client.table("workout_sessions").insert({
                **session,
                "program_id": program_id,
                "exercises": session["exercises"],
            }).execute()
            print(f"  Week {session['week_number']} Day {session['day_number']}: {session['title']} ✓")
        except Exception as e:
            print(f"  ERROR creating session: {e}")

    print()
    print("=" * 60)
    print("Seed complete!")
    print()
    print("Next steps:")
    print("  1. Run: python3 tools/03_verify_rls.py")
    print("  2. Run: npm install && npm run dev")
    print(f"  3. Log in as admin at http://localhost:3000 with: {ADMIN_EMAIL}")
    print("  4. Go to /admin/programs to see the sample program")
    print("  5. Go to /admin/assign to assign it to your mom (after she signs up)")
    print("=" * 60)


if __name__ == "__main__":
    main()
