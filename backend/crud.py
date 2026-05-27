from sqlalchemy.orm import Session
from models import (
    Platform, Instance, VirtualMachine, VMDisk, Job, JobNotification,
    CompliancePolicySubmission,
)
from schemas import PlatformCreate, PlatformUpdate, JobCreate, JobUpdate
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

NOTIFY_LEAD_MIN = 30


def _notify_at_for(start: datetime) -> datetime:
    return start - timedelta(minutes=NOTIFY_LEAD_MIN)


def _upsert_notification(db: Session, job: Job):
    notif = db.query(JobNotification).filter(JobNotification.job_id == job.id).first()
    notify_at = _notify_at_for(job.start)
    if notif:
        notif.notify_at = notify_at
        notif.status = "pending"
    else:
        db.add(JobNotification(job_id=job.id, notify_at=notify_at, status="pending"))
    db.commit()


def get_platforms(db: Session, skip: int = 0, limit: int = 100, search: str = None, status: str = None):
    q = db.query(Platform).order_by(Platform.created_at.desc())
    if search:
        q = q.filter(Platform.pas_name.ilike(f"%{search}%"))
    if status:
        q = q.filter(Platform.status == status)
    return q.offset(skip).limit(limit).all()


def get_platform(db: Session, platform_id: int):
    return db.query(Platform).filter(Platform.id == platform_id).first()


def create_platform(db: Session, platform: PlatformCreate):
    db_platform = Platform(**platform.model_dump())
    db.add(db_platform)
    db.commit()
    db.refresh(db_platform)
    return db_platform


def update_platform(db: Session, platform_id: int, platform: PlatformUpdate):
    db_platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not db_platform:
        return None
    for key, value in platform.model_dump(exclude_unset=True).items():
        setattr(db_platform, key, value)
    db.commit()
    db.refresh(db_platform)
    return db_platform


def delete_platform(db: Session, platform_id: int):
    db_platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not db_platform:
        return None
    db.delete(db_platform)
    db.commit()
    return db_platform


def get_instances(db: Session, platform_id: int):
    return db.query(Instance).filter(Instance.platform_id == platform_id).order_by(Instance.id).all()


# ── Virtual Machine CRUD ─────────────────────────────────────────────────────

def get_vms(db: Session, skip: int = 0, limit: int = 100, search: str = None, power_state: str = None):
    q = db.query(VirtualMachine).order_by(VirtualMachine.created_at.desc())
    if search:
        q = q.filter(
            VirtualMachine.vm_name.ilike(f"%{search}%") |
            VirtualMachine.vm_uuid.ilike(f"%{search}%") |
            VirtualMachine.primary_ip.ilike(f"%{search}%")
        )
    if power_state:
        q = q.filter(VirtualMachine.power_state == power_state)
    return q.offset(skip).limit(limit).all()


def get_vm(db: Session, vm_id: int):
    return db.query(VirtualMachine).filter(VirtualMachine.id == vm_id).first()


def create_vm(db: Session, vm_data):
    vm_dict = vm_data.model_dump()
    vm_dict['vm_uuid'] = str(uuid.uuid4())
    db_vm = VirtualMachine(**vm_dict)
    db.add(db_vm)
    db.commit()
    db.refresh(db_vm)
    # Auto-create one default disk
    storage_uuid = str(uuid.uuid4()).replace('-', '')[:32]
    disk = VMDisk(
        vm_id=db_vm.id,
        disk_name="Hard disk 1",
        storage_uuid=storage_uuid,
        size_gb=vm_dict.get('total_disk_size', 50),
        iops=500,
        disk_class="Fixed",
    )
    db.add(disk)
    db.commit()
    return db_vm


def update_vm(db: Session, vm_id: int, vm_data):
    db_vm = db.query(VirtualMachine).filter(VirtualMachine.id == vm_id).first()
    if not db_vm:
        return None
    for k, v in vm_data.model_dump(exclude_unset=True).items():
        setattr(db_vm, k, v)
    db.commit()
    db.refresh(db_vm)
    return db_vm


def delete_vm(db: Session, vm_id: int):
    db_vm = db.query(VirtualMachine).filter(VirtualMachine.id == vm_id).first()
    if not db_vm:
        return None
    db.delete(db_vm)
    db.commit()
    return db_vm


def get_vm_disks(db: Session, vm_id: int, search: str = None):
    q = db.query(VMDisk).filter(VMDisk.vm_id == vm_id)
    if search:
        q = q.filter(VMDisk.disk_name.ilike(f"%{search}%"))
    return q.order_by(VMDisk.id).all()


def add_vm_disk(db: Session, vm_id: int, disk_data):
    storage_uuid = str(uuid.uuid4()).replace('-', '')[:32]
    disk = VMDisk(vm_id=vm_id, storage_uuid=storage_uuid, **disk_data.model_dump())
    db.add(disk)
    db.commit()
    db.refresh(disk)
    return disk


def update_vm_disk(db: Session, disk_id: int, disk_data):
    disk = db.query(VMDisk).filter(VMDisk.id == disk_id).first()
    if not disk:
        return None
    for field, value in disk_data.model_dump(exclude_unset=True).items():
        setattr(disk, field, value)
    db.commit()
    db.refresh(disk)
    return disk


def delete_vm_disk(db: Session, disk_id: int):
    disk = db.query(VMDisk).filter(VMDisk.id == disk_id).first()
    if not disk:
        return None
    db.delete(disk)
    db.commit()
    return disk


# ── Calendar Job CRUD ────────────────────────────────────────────────────────

def get_jobs(
    db: Session,
    skip: int = 0,
    limit: int = 1000,
    search: Optional[str] = None,
    category: Optional[str] = None,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
):
    q = db.query(Job).order_by(Job.start.asc())
    if search:
        q = q.filter(Job.title.ilike(f"%{search}%"))
    if category:
        q = q.filter(Job.category == category)
    if start is not None:
        q = q.filter(Job.end >= start)
    if end is not None:
        q = q.filter(Job.start <= end)
    return q.offset(skip).limit(limit).all()


def get_job(db: Session, job_id: int):
    return db.query(Job).filter(Job.id == job_id).first()


def create_job(db: Session, job: JobCreate):
    db_job = Job(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    _upsert_notification(db, db_job)
    return db_job


def update_job(db: Session, job_id: int, job: JobUpdate):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        return None
    payload = job.model_dump(exclude_unset=True)
    start_changed = "start" in payload and payload["start"] != db_job.start
    for key, value in payload.items():
        setattr(db_job, key, value)
    db.commit()
    db.refresh(db_job)
    if start_changed:
        _upsert_notification(db, db_job)
    return db_job


def delete_job(db: Session, job_id: int):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        return None
    db.delete(db_job)
    db.commit()
    return db_job


def get_job_stats(db: Session):
    from sqlalchemy import func as _func
    rows = (
        db.query(Job.category, _func.count(Job.id))
          .group_by(Job.category)
          .all()
    )
    return {category: count for category, count in rows}


# ── Insights / Analytics ─────────────────────────────────────────────────────

def _as_aware(dt: Optional[datetime]) -> Optional[datetime]:
    """Normalise to a timezone-aware UTC datetime for safe comparison."""
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


def _pct(part: int, whole: int) -> float:
    return round(part / whole * 100, 1) if whole else 0.0


def get_insights_summary(db: Session) -> dict:
    """Aggregate live counts for the Insights home page.

    Returns per-component metrics (total, running/active, utilization %, and a
    full status breakdown) for VMs, platforms, compliance and jobs. Everything
    is computed from the database — no static data.
    """
    # ── Virtual Machines ──────────────────────────────────────────────
    vms = db.query(VirtualMachine).all()
    vm_total = len(vms)
    vm_status: dict = {}
    cpu_alloc = ram_alloc = disk_alloc = 0
    for vm in vms:
        state = vm.power_state or "Unknown"
        vm_status[state] = vm_status.get(state, 0) + 1
        count = vm.vm_count or 1
        cpu_alloc += (vm.max_cpu or 0) * count
        ram_alloc += (vm.max_ram or 0) * count
        disk_alloc += (vm.total_disk_size or 0) * count
    vm_running = vm_status.get("Running", 0)

    # 7-day cumulative VM count — "day" is the x-axis unit on the Insights graph.
    today = datetime.now(timezone.utc).date()
    window = [today - timedelta(days=i) for i in range(6, -1, -1)]
    vm_dates = [_as_aware(vm.created_at).date() for vm in vms if vm.created_at]
    vm_trend = [
        {"label": d.strftime("%d %b"), "value": sum(1 for vd in vm_dates if vd <= d)}
        for d in window
    ]

    # ── Platforms ─────────────────────────────────────────────────────
    platforms = db.query(Platform).all()
    platform_total = len(platforms)
    platform_status: dict = {}
    for p in platforms:
        platform_status[p.status] = platform_status.get(p.status, 0) + 1
    platform_active = platform_status.get("Active", 0)

    # ── Compliance (coverage across platforms) ────────────────────────
    submissions = db.query(CompliancePolicySubmission).all()
    compliance_total = len(submissions)
    covered = len({s.platform_id for s in submissions})
    not_covered = max(platform_total - covered, 0)

    # ── Jobs ──────────────────────────────────────────────────────────
    jobs = db.query(Job).all()
    job_total = len(jobs)
    now = datetime.now(timezone.utc)
    job_status = {"Upcoming": 0, "Ongoing": 0, "Completed": 0}
    job_categories: dict = {}
    for j in jobs:
        start, end = _as_aware(j.start), _as_aware(j.end)
        if end and end < now:
            job_status["Completed"] += 1
        elif start and start > now:
            job_status["Upcoming"] += 1
        else:
            job_status["Ongoing"] += 1
        job_categories[j.category] = job_categories.get(j.category, 0) + 1
    job_active = job_status["Upcoming"] + job_status["Ongoing"]

    return {
        "vms": {
            "total": vm_total,
            "running": vm_running,
            "utilization": _pct(vm_running, vm_total),
            "status": vm_status,
            "resources": {"cpu": cpu_alloc, "ram": ram_alloc, "disk": disk_alloc},
            "trend": vm_trend,
        },
        "platforms": {
            "total": platform_total,
            "running": platform_active,
            "utilization": _pct(platform_active, platform_total),
            "status": platform_status,
        },
        "compliance": {
            "total": compliance_total,
            "running": covered,
            "utilization": _pct(covered, platform_total),
            "status": {"Covered": covered, "Not Covered": not_covered},
        },
        "jobs": {
            "total": job_total,
            "running": job_active,
            "utilization": _pct(job_active, job_total),
            "status": job_status,
            "categories": job_categories,
        },
    }
