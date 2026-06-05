import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import auth, platforms, regions, options, virtual_machines, compliance, jobs, notifications, recycle_bin
from seed import seed

# Create all tables on startup
Base.metadata.create_all(bind=engine)

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

@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
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
