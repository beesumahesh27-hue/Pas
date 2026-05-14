from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE platforms ADD COLUMN IF NOT EXISTS type VARCHAR(100) NOT NULL DEFAULT 'Web'"))
    conn.execute(text("ALTER TABLE platforms ADD COLUMN IF NOT EXISTS users INTEGER NOT NULL DEFAULT 0"))
    conn.execute(text("ALTER TABLE platforms ADD COLUMN IF NOT EXISTS uptime VARCHAR(20) NOT NULL DEFAULT '100%'"))
    conn.commit()
    print("Migration complete — added type, users, uptime columns")
