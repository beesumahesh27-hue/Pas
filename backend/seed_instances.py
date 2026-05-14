import random
from database import engine, Base
from models import Instance, Platform
from sqlalchemy.orm import sessionmaker

Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
db = Session()

platforms = db.query(Platform).all()
added = 0

for platform in platforms:
    existing = db.query(Instance).filter(Instance.platform_id == platform.id).count()
    if existing > 0:
        continue
    for i in range(1, random.randint(3, 6)):
        db.add(Instance(
            platform_id=platform.id,
            instance_name=f"{platform.pas_name}-inst-{i:02d}",
            cpu=random.choice([2, 4, 8, 16]),
            memory=random.choice([4, 8, 16, 32]),
            status=random.choice(["Active", "Active", "Active", "Inactive", "Maintenance"]),
        ))
        added += 1

db.commit()
db.close()
print(f"Seeded {added} instances across {len(platforms)} platforms")
