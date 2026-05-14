from database import engine, Base
from models import PlatformType, PlatformStatus
from sqlalchemy.orm import sessionmaker

TYPES = [
    "Web", "API", "Database", "Analytics", "Cache",
    "Queue", "Search", "CDN", "Auth", "Storage",
    "Communication", "ML", "Gateway", "Logging",
]

STATUSES = ["Active", "Inactive", "Maintenance"]

Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
db = Session()

existing_types = {t.name for t in db.query(PlatformType).all()}
for name in TYPES:
    if name not in existing_types:
        db.add(PlatformType(name=name))

existing_statuses = {s.name for s in db.query(PlatformStatus).all()}
for name in STATUSES:
    if name not in existing_statuses:
        db.add(PlatformStatus(name=name))

db.commit()
db.close()
print(f"Seeded {len(TYPES)} types and {len(STATUSES)} statuses")
