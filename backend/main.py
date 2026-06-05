import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import auth, platforms, regions, options, virtual_machines, compliance, jobs, notifications, recycle_bin
from seed import seed

# Create tables and run column migrations before app starts
def _migrate():
    from sqlalchemy import text
    Base.metadata.create_all(bind=engine)
    stmts = [
        "ALTER TABLE resource_groups  ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(36)",
        "ALTER TABLE recycle_resources ADD COLUMN IF NOT EXISTS url VARCHAR(500)",
        "ALTER TABLE recycle_resources ADD COLUMN IF NOT EXISTS os  VARCHAR(50)",
        "UPDATE resource_groups  SET subscription_id='fe4a1fdb-6a1c-4a6d-a6b0-dbb12f6a00f8' WHERE subscription_id IS NULL",
        "UPDATE recycle_resources SET os='Windows' WHERE os IS NULL AND type='Function App'",
        "UPDATE recycle_resources SET os='Linux'   WHERE os IS NULL AND type IN ('Application Insights','Storage account')",
    ]
    with engine.begin() as conn:
        for s in stmts:
            try:
                conn.execute(text(s))
            except Exception as e:
                print(f"migrate: {e}")

_migrate()

app = FastAPI(
    title="PAS Microapp API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _run_migrations():
    """Safely add new columns and backfill defaults for existing rows."""
    from sqlalchemy import text
    ddl = [
        "ALTER TABLE resource_groups  ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(36)",
        "ALTER TABLE recycle_resources ADD COLUMN IF NOT EXISTS url VARCHAR(500)",
        "ALTER TABLE recycle_resources ADD COLUMN IF NOT EXISTS os  VARCHAR(50)",
    ]
    backfill = [
        # Set a placeholder subscription_id for rows that have none yet
        "UPDATE resource_groups SET subscription_id = 'fe4a1fdb-6a1c-4a6d-a6b0-dbb12f6a00f8' WHERE subscription_id IS NULL",
        # Default OS for Function App resources
        "UPDATE recycle_resources SET os = 'Windows' WHERE os IS NULL AND type = 'Function App'",
        "UPDATE recycle_resources SET os = 'Linux'   WHERE os IS NULL AND type = 'Application Insights'",
        "UPDATE recycle_resources SET os = 'Linux'   WHERE os IS NULL AND type = 'Storage account'",
    ]
    try:
        with engine.begin() as conn:
            for sql in ddl:
                try:
                    conn.execute(text(sql))
                    print(f"DDL OK: {sql[:70]}")
                except Exception as e:
                    print(f"DDL note: {e}")
        with engine.begin() as conn:
            for sql in backfill:
                try:
                    result = conn.execute(text(sql))
                    print(f"Backfill OK ({result.rowcount} rows): {sql[:60]}")
                except Exception as e:
                    print(f"Backfill note: {e}")
    except Exception as e:
        print(f"Migration error: {e}")


@app.on_event("startup")
def on_startup():
    try:
        seed()
    except Exception as e:
        print(f"Warning: Startup error: {e}")

app.include_router(auth.router)
app.include_router(platforms.router)
app.include_router(regions.router)
app.include_router(options.router)
app.include_router(virtual_machines.router)
app.include_router(compliance.router)
app.include_router(jobs.router)
app.include_router(notifications.router)
app.include_router(recycle_bin.router)


@app.get("/", tags=["root"])
def root():
    return {
        "service": "PAS Microapp API",
        "status": "running",
        "docs": "/api/docs",
        "health": "/api/health",
    }


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "healthy"}
