"""
Rainly Space — Database Layer (simplified)
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rainly.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.executescript("""
        CREATE TABLE IF NOT EXISTS guest_messages (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname    TEXT    DEFAULT 'visitor',
            message     TEXT    NOT NULL,
            created_at  TEXT    DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS ai_chat_history (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id  TEXT    DEFAULT 'default',
            role        TEXT    NOT NULL,
            content     TEXT    NOT NULL,
            created_at  TEXT    DEFAULT (datetime('now'))
        );
    """)
    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_db()
    print(f"Database created at {DB_PATH}")
