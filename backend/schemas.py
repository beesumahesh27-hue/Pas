from pydantic import BaseModel, Field, computed_field
from datetime import datetime
from typing import Optional, List


class RegionResponse(BaseModel):
    id:   int
    name: str
    model_config = {"from_attributes": True}


class PlatformTypeResponse(BaseModel):
    id:   int
    name: str
    model_config = {"from_attributes": True}


class PlatformStatusResponse(BaseModel):
    id:   int
    name: str
    model_config = {"from_attributes": True}


class InstanceResponse(BaseModel):
    id:            int
    instance_name: str
    cpu:           int
    memory:        int
    status:        str
    created_at:    datetime

    @computed_field
    @property
    def instance_id(self) -> str:
        return f"INST-{self.id:04d}"

    model_config = {"from_attributes": True}


class PlatformCreate(BaseModel):
    pas_name:    str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    region:      str = Field(..., min_length=1)
    status:      str = Field(..., min_length=1)
    type:        str = Field(..., min_length=1)
    cpu:         int = Field(..., ge=1, le=128)
    users:       int = Field(default=0, ge=0)
    uptime:      str = Field(default="100%")


class PlatformUpdate(BaseModel):
    pas_name:    Optional[str] = None
    description: Optional[str] = None
    region:      Optional[str] = None
    status:      Optional[str] = None
    type:        Optional[str] = None
    cpu:         Optional[int] = Field(default=None, ge=1, le=128)
    users:       Optional[int] = Field(default=None, ge=0)
    uptime:      Optional[str] = None


class PlatformResponse(BaseModel):
    id:          int
    pas_name:    str
    description: str
    region:      str
    status:      str
    type:        str
    cpu:         int
    users:       int
    uptime:      str
    created_at:  datetime
    updated_at:  Optional[datetime] = None

    @computed_field
    @property
    def pas_id(self) -> str:
        return str(self.id)

    @computed_field
    @property
    def created_date(self) -> str:
        return self.created_at.strftime('%Y-%m-%d') if self.created_at else ''

    model_config = {"from_attributes": True}


# ── Virtual Machine Schemas ──────────────────────────────────────────────────

class VMCreate(BaseModel):
    vm_name:         str            = Field(..., min_length=1, max_length=255)
    additional_name: Optional[str]  = None
    region:          Optional[str]  = None
    cloud_pod:       Optional[str]  = "Default_POD"
    compute:         Optional[str]  = None
    primary_ip:      Optional[str]  = None
    power_state:     str            = "Halted"
    guest_os:        Optional[str]  = None
    min_cpu:         int            = Field(default=1, ge=1)
    max_cpu:         int            = Field(default=4, ge=1)
    min_ram:         int            = Field(default=1, ge=1)
    max_ram:         int            = Field(default=8, ge=1)
    total_disk_size: int            = Field(default=50, ge=1)
    template:        Optional[str]  = None
    template_type:   Optional[str]  = None
    flavor:          Optional[str]  = None
    vm_count:        int            = Field(default=1, ge=1)
    schedule:        Optional[datetime] = None
    tags:            Optional[str]  = None
    network:         Optional[str]  = None
    vlan:            Optional[str]  = None
    subnet:          Optional[str]  = None
    gateway:         Optional[str]  = None
    encryption:      Optional[str]  = None
    type:            str            = "VM"


class VMUpdate(BaseModel):
    vm_name:         Optional[str] = None
    additional_name: Optional[str] = None
    power_state:     Optional[str] = None
    primary_ip:      Optional[str] = None
    guest_os:        Optional[str] = None
    min_cpu:         Optional[int] = None
    max_cpu:         Optional[int] = None
    min_ram:         Optional[int] = None
    max_ram:         Optional[int] = None
    total_disk_size: Optional[int] = None
    tags:            Optional[str] = None
    region:          Optional[str] = None
    cloud_pod:       Optional[str] = None
    compute:         Optional[str] = None
    encryption:      Optional[str] = None
    subnet:          Optional[str] = None
    network:         Optional[str] = None
    vlan:            Optional[str] = None
    gateway:         Optional[str] = None


class VMResponse(BaseModel):
    id:              int
    vm_name:         str
    additional_name: Optional[str]  = None
    vm_uuid:         str
    type:            str
    compute:         Optional[str]  = None
    primary_ip:      Optional[str]  = None
    power_state:     str
    encryption:      Optional[str]  = None
    subnet:          Optional[str]  = None
    guest_os:        Optional[str]  = None
    cloud_pod:       str
    min_cpu:         int
    max_cpu:         int
    min_ram:         int
    max_ram:         int
    total_disk_size: int
    region:          Optional[str]  = None
    template:        Optional[str]  = None
    template_type:   Optional[str]  = None
    flavor:          Optional[str]  = None
    vm_count:        int
    schedule:        Optional[datetime] = None
    tags:            Optional[str]  = None
    network:         Optional[str]  = None
    vlan:            Optional[str]  = None
    gateway:         Optional[str]  = None
    created_at:      datetime
    updated_at:      Optional[datetime] = None
    model_config = {"from_attributes": True}


# ── Calendar Job Schemas ─────────────────────────────────────────────────────

class JobCreate(BaseModel):
    title:       str            = Field(..., min_length=1, max_length=255)
    category:    str            = Field(default="work", min_length=1, max_length=50)
    location:    Optional[str]  = None
    description: Optional[str]  = None
    all_day:     bool           = False
    start:       datetime
    end:         datetime


class JobUpdate(BaseModel):
    title:       Optional[str]      = Field(default=None, min_length=1, max_length=255)
    category:    Optional[str]      = None
    location:    Optional[str]      = None
    description: Optional[str]      = None
    all_day:     Optional[bool]     = None
    start:       Optional[datetime] = None
    end:         Optional[datetime] = None


class JobResponse(BaseModel):
    id:          int
    title:       str
    category:    str
    location:    Optional[str] = None
    description: Optional[str] = None
    all_day:     bool
    start:       datetime
    end:         datetime
    created_at:  datetime
    updated_at:  Optional[datetime] = None
    model_config = {"from_attributes": True}


class NotificationResponse(BaseModel):
    id:         int
    job_id:     int
    notify_at:  datetime
    status:     str
    created_at: datetime
    # Joined fields from Job — handy so frontend doesn't have to fetch twice
    job_title:    Optional[str] = None
    job_start:    Optional[datetime] = None
    job_category: Optional[str] = None
    model_config = {"from_attributes": True}


# ── Compliance Policy Submission Schemas ────────────────────────────────────

class CompliancePolicySubmissionCreate(BaseModel):
    platform_id:   int
    platform_name: str
    templates:     List[str] = []
    tags:          List[str] = []


class CompliancePolicySubmissionResponse(BaseModel):
    id:            int
    platform_id:   int
    platform_name: str
    templates:     Optional[str] = None
    tags:          Optional[str] = None
    submitted_at:  datetime
    model_config = {"from_attributes": True}


class VMDiskCreate(BaseModel):
    disk_name:  str            = Field(default="Hard disk 1")
    size_gb:    int            = Field(default=50, ge=1)
    iops:       int            = Field(default=500, ge=0)
    disk_class: str            = "Fixed"
    encryption: Optional[str]  = None


class VMDiskUpdate(BaseModel):
    disk_name:  Optional[str] = None
    size_gb:    Optional[int] = Field(default=None, ge=1)
    iops:       Optional[int] = Field(default=None, ge=0)
    disk_class: Optional[str] = None
    encryption: Optional[str] = None


class VMDiskResponse(BaseModel):
    id:           int
    vm_id:        int
    disk_name:    str
    devices:      int
    storage_uuid: Optional[str] = None
    lag_time:     Optional[str] = None
    size_gb:      int
    iops:         int
    disk_class:   str
    encryption:   Optional[str] = None
    created_at:   datetime
    model_config = {"from_attributes": True}
