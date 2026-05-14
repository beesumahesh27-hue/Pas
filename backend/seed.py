from database import SessionLocal
from models import (
    Region, PlatformType, PlatformStatus,
    DiskClass, DiskEncryption,
    Pod, ComplianceTemplate, ComplianceTag,
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

        if db.query(ComplianceTemplate).count() == 0:
            templates = ["CIS Benchmark", "HIPAA", "PCI-DSS", "ISO 27001", "NIST", "SOC 2"]
            db.add_all([ComplianceTemplate(name=t) for t in templates])

        if db.query(ComplianceTag).count() == 0:
            tags = ["Production", "Development", "Staging", "Testing", "Critical", "Low-Risk"]
            db.add_all([ComplianceTag(name=t) for t in tags])

        db.commit()
        print("Database seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
    finally:
        db.close()
