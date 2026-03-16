from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional


DB_PATH = Path(__file__).resolve().parents[2] / "nova_sentinel.db"
REVIEW_STATUSES = {"pending", "approved", "needs_changes", "rejected"}
REVIEW_STATUS_ALIASES = {
    "approve": "approved",
    "approved": "approved",
    "accept": "approved",
    "accepted": "approved",
    "pass": "approved",
    "needs_changes": "needs_changes",
    "needs changes": "needs_changes",
    "needs-change": "needs_changes",
    "changes_requested": "needs_changes",
    "changes requested": "needs_changes",
    "request_changes": "needs_changes",
    "request changes": "needs_changes",
    "revise": "needs_changes",
    "rejected": "rejected",
    "reject": "rejected",
    "decline": "rejected",
    "denied": "rejected",
    "deny": "rejected",
    "pending": "pending",
    "in_review": "pending",
    "in review": "pending",
    "under_review": "pending",
    "under review": "pending",
}


def _get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_history_db() -> None:
    with _get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                summary TEXT NOT NULL,
                compliance_score INTEGER NOT NULL,
                overall_risk TEXT NOT NULL,
                review_status TEXT NOT NULL DEFAULT 'pending',
                review_note TEXT,
                raw_result_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        existing_columns = {
            row["name"]
            for row in conn.execute("PRAGMA table_info(analyses)").fetchall()
        }
        if "review_status" not in existing_columns:
            conn.execute("ALTER TABLE analyses ADD COLUMN review_status TEXT NOT NULL DEFAULT 'pending'")
        if "review_note" not in existing_columns:
            conn.execute("ALTER TABLE analyses ADD COLUMN review_note TEXT")
        conn.commit()


def save_analysis(
    *,
    filename: str,
    summary: str,
    compliance_score: int,
    overall_risk: str,
    raw_result_json: Dict[str, Any],
) -> int:
    initialize_history_db()
    with _get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO analyses (filename, summary, compliance_score, overall_risk, raw_result_json)
            VALUES (?, ?, ?, ?, ?)
            """,
            (filename, summary, compliance_score, overall_risk, json.dumps(raw_result_json)),
        )
        conn.commit()
        return int(cursor.lastrowid)


def list_analyses() -> List[Dict[str, Any]]:
    initialize_history_db()
    with _get_connection() as conn:
        rows = conn.execute(
            """
            SELECT id, filename, summary, compliance_score, overall_risk, review_status, review_note, raw_result_json, created_at
            FROM analyses
            ORDER BY datetime(created_at) DESC, id DESC
            """
        ).fetchall()
    return [_row_to_dict(row) for row in rows]


def get_analysis(analysis_id: int) -> Optional[Dict[str, Any]]:
    initialize_history_db()
    with _get_connection() as conn:
        row = conn.execute(
            """
            SELECT id, filename, summary, compliance_score, overall_risk, review_status, review_note, raw_result_json, created_at
            FROM analyses
            WHERE id = ?
            """,
            (analysis_id,),
        ).fetchone()
    return _row_to_dict(row) if row else None


def update_analysis_review(analysis_id: int, review_status: str, review_note: Optional[str] = None) -> Optional[Dict[str, Any]]:
    initialize_history_db()
    normalized_status = (review_status or "").strip().lower().replace("-", "_")
    normalized_status = REVIEW_STATUS_ALIASES.get(normalized_status, normalized_status)
    if normalized_status not in REVIEW_STATUSES:
        raise ValueError(f"Invalid review status: {review_status}")

    with _get_connection() as conn:
        cursor = conn.execute(
            """
            UPDATE analyses
            SET review_status = ?, review_note = ?
            WHERE id = ?
            """,
            (normalized_status, review_note.strip() if isinstance(review_note, str) and review_note.strip() else None, analysis_id),
        )
        conn.commit()
        if cursor.rowcount == 0:
            return None

    return get_analysis(analysis_id)


def _row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "filename": row["filename"],
        "summary": row["summary"],
        "compliance_score": row["compliance_score"],
        "overall_risk": row["overall_risk"],
        "review_status": row["review_status"],
        "review_note": row["review_note"],
        "raw_result_json": json.loads(row["raw_result_json"]),
        "created_at": row["created_at"],
    }
