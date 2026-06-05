from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base
import uuid as _uuid


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String(255), nullable=False, unique=True, index=True)
    name            = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role            = Column(String(50),  nullable=False, default="user")
    created_at      = Column(DateTime(timezone=True), server_default=func.now())


class Region(Base):
    __tablename__ = "regions"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)


class PlatformType(Base):
    __tablename__ = "platform_types"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)


class PlatformStatus(Base):
    __tablename__ = "platform_statuses"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)


class Platform(Base):
    __tablename__ = "platforms"

    id          = Column(Integer, primary_key=True, index=True)
    pas_name    = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    region      = Column(String(100), nullable=False)
    status      = Column(String(50), nullable=False)
    type        = Column(String(100), nullable=False, default="Web")
    cpu         = Column(Integer, nullable=False)
    users       = Column(Integer, nullable=False, default=0)
    uptime      = Column(String(20), nullable=False, default="100%")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())


class Instance(Base):
    __tablename__ = "instances"

    id            = Column(Integer, primary_key=True, index=True)
    platform_id   = Column(Integer, ForeignKey("platforms.id", ondelete="CASCADE"), nullable=False)
    instance_name = Column(String(255), nullable=False)
    cpu           = Column(Integer, nullable=False)
    memory        = Column(Integer, nullable=False)
    status        = Column(String(50), nullable=False, default="Active")
    created_at    = Column(DateTime(timezone=True), server_default=func.now())


class VirtualMachine(Base):
    __tablename__ = "virtual_machines"

    id               = Column(Integer, primary_key=True, index=True)
    vm_name          = Column(String(255), nullable=False)
    additional_name  = Column(String(255), nullable=True)
    vm_uuid          = Column(String(36), nullable=False, unique=True, default=lambda: str(_uuid.uuid4()))
    type             = Column(String(50), default="VM")
    compute          = Column(String(100), nullable=True)
    primary_ip       = Column(String(50), nullable=True)
    power_state      = Column(String(50), default="Halted")
    encryption       = Column(String(50), nullable=True)
    subnet           = Column(String(50), nullable=True)
    guest_os         = Column(String(100), nullable=True)
    cloud_pod        = Column(String(100), default="Default_POD")
    min_cpu          = Column(Integer, default=1)
    max_cpu          = Column(Integer, default=4)
    min_ram          = Column(Integer, default=1)
    max_ram          = Column(Integer, default=8)
    total_disk_size  = Column(Integer, default=50)
    region           = Column(String(100), nullable=True)
    template         = Column(String(255), nullable=True)
    template_type    = Column(String(100), nullable=True)
    flavor           = Column(String(100), nullable=True)
    vm_count         = Column(Integer, default=1)
    schedule         = Column(DateTime(timezone=True), nullable=True)
    tags             = Column(Text, nullable=True)
    network          = Column(String(100), nullable=True)
    vlan             = Column(String(50), nullable=True)
    gateway          = Column(String(50), nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), onupdate=func.now())


class DiskClass(Base):
    __tablename__ = "disk_classes"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)


class DiskEncryption(Base):
    __tablename__ = "disk_encryptions"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)


class Pod(Base):
    __tablename__ = "pods"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)


class ComplianceTemplate(Base):
    __tablename__ = "compliance_templates"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)


class ComplianceTag(Base):
    __tablename__ = "compliance_tags"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)


class JobCategory(Base):
    __tablename__ = "job_categories"

    id    = Column(Integer, primary_key=True, index=True)
    key   = Column(String(50),  nullable=False, unique=True)
    label = Column(String(100), nullable=False)
    color = Column(String(20),  nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)


class Job(Base):
    __tablename__ = "jobs"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(255), nullable=False)
    category    = Column(String(50),  nullable=False, default="work")
    location    = Column(String(255), nullable=True)
    description = Column(Text,        nullable=True)
    all_day     = Column(Boolean,     nullable=False, default=False)
    start       = Column(DateTime(timezone=True), nullable=False)
    end         = Column(DateTime(timezone=True), nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())


class JobNotification(Base):
    __tablename__ = "job_notifications"

    id         = Column(Integer, primary_key=True, index=True)
    job_id     = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    notify_at  = Column(DateTime(timezone=True), nullable=False, index=True)
    status     = Column(String(20), nullable=False, default="pending")  # pending | dismissed
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CompliancePolicySubmission(Base):
    __tablename__ = "compliance_submissions"

    id            = Column(Integer, primary_key=True, index=True)
    platform_id   = Column(Integer, ForeignKey("platforms.id", ondelete="CASCADE"), nullable=False)
    platform_name = Column(String(255), nullable=False)
    templates     = Column(Text, nullable=True)
    tags          = Column(Text, nullable=True)
    submitted_at  = Column(DateTime(timezone=True), server_default=func.now())


class ResourceGroup(Base):
    __tablename__ = "resource_groups"

    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(255), nullable=False, unique=True, index=True)
    subscription    = Column(String(100), nullable=False, default="Free Trial")
    subscription_id = Column(String(36),  nullable=True)
    location        = Column(String(100), nullable=False, default="East US")
    created_at      = Column(DateTime(timezone=True), server_default=func.now())


class RecycleResource(Base):
    __tablename__ = "recycle_resources"

    id                 = Column(Integer, primary_key=True, index=True)
    resource_group_id  = Column(Integer, ForeignKey("resource_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    name               = Column(String(255), nullable=False)
    type               = Column(String(100), nullable=False)
    location           = Column(String(100), nullable=False, default="East US")
    status             = Column(String(50),  nullable=False, default="Running")
    runtime_version    = Column(String(50),  nullable=True)
    url                = Column(String(500), nullable=True)
    os                 = Column(String(50),  nullable=True)
    created_at         = Column(DateTime(timezone=True), server_default=func.now())


class RecycleFunction(Base):
    __tablename__ = "recycle_functions"

    id           = Column(Integer, primary_key=True, index=True)
    resource_id  = Column(Integer, ForeignKey("recycle_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    name         = Column(String(255), nullable=False)
    trigger      = Column(String(100), nullable=False, default="HTTP")
    language     = Column(String(50),  nullable=False, default="Python")
    status       = Column(String(50),  nullable=False, default="Enabled")
    description  = Column(Text,        nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())


class DropdownOption(Base):
    __tablename__ = "dropdown_options"

    id         = Column(Integer, primary_key=True, index=True)
    category   = Column(String(100), nullable=False, index=True)
    value      = Column(String(255), nullable=False)
    sort_order = Column(Integer, default=0)


class VMDisk(Base):
    __tablename__ = "vm_disks"

    id           = Column(Integer, primary_key=True, index=True)
    vm_id        = Column(Integer, ForeignKey("virtual_machines.id", ondelete="CASCADE"), nullable=False)
    disk_name    = Column(String(100), nullable=False, default="Hard disk 1")
    devices      = Column(Integer, default=0)
    storage_uuid = Column(String(100), nullable=True)
    lag_time     = Column(String(50), nullable=True)
    size_gb      = Column(Integer, default=50)
    iops         = Column(Integer, default=500)
    disk_class   = Column(String(50), default="Fixed")
    encryption   = Column(String(50), nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
