from database import engine, Base
from models import Pod, ComplianceTemplate, ComplianceTag
from sqlalchemy.orm import sessionmaker

Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
db = Session()

_PODS = ["hydpod-1", "bangpod-2", "mumpod-3", "delpod-4", "chepod-5"]
_TEMPLATES = ["Manual Template", "Template from Library", "AI Template"]
_TAGS = ["AWS Tag", "Azure Tag", "GCP Tag"]


def seed(model, names):
    existing = {r.name for r in db.query(model).all()}
    added = 0
    for name in names:
        if name not in existing:
            db.add(model(name=name))
            added += 1
    db.commit()
    return added


p = seed(Pod, _PODS)
t = seed(ComplianceTemplate, _TEMPLATES)
g = seed(ComplianceTag, _TAGS)

db.close()
print(f"Seeded: {p} pods, {t} templates, {g} tags")
