from database import engine, Base
from models import DiskClass, DiskEncryption
from sqlalchemy.orm import sessionmaker

Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
db = Session()

_DISK_CLASSES = ['Standard', 'SSD', 'Premium SSD', 'Ultra Disk']
_DISK_ENCRYPTIONS = ['None', 'AES-256', 'RSA-2048']


def seed(model, names):
    existing = {r.name for r in db.query(model).all()}
    added = 0
    for name in names:
        if name not in existing:
            db.add(model(name=name))
            added += 1
    db.commit()
    return added


c = seed(DiskClass, _DISK_CLASSES)
e = seed(DiskEncryption, _DISK_ENCRYPTIONS)

db.close()
print(f"Seeded: {c} disk classes, {e} encryption types")
