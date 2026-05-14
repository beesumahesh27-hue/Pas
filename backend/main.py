from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import platforms, regions, options, virtual_machines, compliance

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
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(platforms.router)
app.include_router(regions.router)
app.include_router(options.router)
app.include_router(virtual_machines.router)
app.include_router(compliance.router)


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "healthy"}
