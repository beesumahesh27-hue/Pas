from database import SessionLocal
from models import (
    Region, PlatformType, PlatformStatus,
    DiskClass, DiskEncryption,
    Pod, ComplianceTemplate, ComplianceTag,
    JobCategory,
)


def seed():
    db = SessionLocal()
    try:
        if db.query(Region).count() == 0:
            regions = ["Mumbai", "Pune", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata"]
            db.add_all([Region(name=r) for r in regions])

        if db.query(PlatformStatus).count() == 0:
            statuses = ["Active", "Inactive", "Maintenance"]
            db.add_all([PlatformStatus(name=s) for s in statuses])

        if db.query(PlatformType).count() == 0:
            types = ["Web", "Database", "Cache", "Queue", "Storage", "Compute"]
            db.add_all([PlatformType(name=t) for t in types])

        if db.query(DiskClass).count() == 0:
            classes = ["SSD", "HDD", "NVMe"]
            db.add_all([DiskClass(name=c) for c in classes])

        if db.query(DiskEncryption).count() == 0:
            encryptions = ["None", "AES-128", "AES-256"]
            db.add_all([DiskEncryption(name=e) for e in encryptions])

        if db.query(Pod).count() == 0:
            pods = ["POD-1", "POD-2", "POD-3", "POD-4", "POD-5"]
            db.add_all([Pod(name=p) for p in pods])

        _compliance_templates = [
            "SOC 2 Type II", "ISO 27001", "HIPAA", "PCI-DSS",
            "NIST CSF", "CIS Benchmark", "GDPR", "FedRAMP",
        ]
        existing_ct = {t.name for t in db.query(ComplianceTemplate).all()}
        db.add_all([ComplianceTemplate(name=n) for n in _compliance_templates if n not in existing_ct])

        if db.query(JobCategory).count() == 0:
            categories = [
                ("work",        "Work",         "#1976d2"),
                ("maintenance", "Maintenance",  "#fb8c00"),
                ("deployment",  "Deployment",   "#43a047"),
                ("incident",    "Incident",     "#e53935"),
                ("personal",    "Personal",     "#8e24aa"),
                ("meeting",     "Meeting",      "#00897b"),
            ]
            db.add_all([
                JobCategory(key=k, label=l, color=c, sort_order=i)
                for i, (k, l, c) in enumerate(categories)
            ])

        _compliance_tags = [
            "Production", "Development", "Staging", "Critical",
            "High Risk", "Low Risk", "Data Privacy", "Encryption Required",
        ]
        existing_cg = {t.name for t in db.query(ComplianceTag).all()}
        db.add_all([ComplianceTag(name=n) for n in _compliance_tags if n not in existing_cg])

        db.commit()
        print("Database seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
    finally:
        db.close()
