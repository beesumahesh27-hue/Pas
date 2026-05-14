from database import engine, Base
from models import Region
from sqlalchemy.orm import sessionmaker

INDIAN_CITIES = [
    "Ahmedabad", "Bangalore", "Chennai", "Delhi",
    "Gurugram", "Hyderabad", "Indore", "Kolkata", "Mumbai",
]

Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
db = Session()

existing = {r.name for r in db.query(Region).all()}
added = 0
for city in INDIAN_CITIES:
    if city not in existing:
        db.add(Region(name=city))
        added += 1

db.commit()
db.close()
print(f"Seeded {added} regions ({len(INDIAN_CITIES) - added} already existed)")
