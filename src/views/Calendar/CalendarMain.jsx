import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Checkbox,
  CircularProgress,
  Divider,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from '@mui/material';

import AddOutlinedIcon          from '@mui/icons-material/AddOutlined';
import ChevronLeftIcon          from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon         from '@mui/icons-material/ChevronRight';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import TodayOutlinedIcon        from '@mui/icons-material/TodayOutlined';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showAlert } from '../../store/slices/alertSlice';

import MiniCalendar from './MiniCalendar';
import MonthView    from './MonthView';
import WeekView     from './WeekView';
import DayView      from './DayView';
import CreateJob    from './CalendarActions/CreateJob';
import JobDetails   from './CalendarActions/JobDetails';

import { listJobs, deleteJob, getJobStats, listJobCategories } from './jobsStorage';
import { addDays, addMonths, formatHeader } from './calendarUtils';

const VIEWS = ['Month', 'Week', 'Day'];

const CalendarMain = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [view, setView]             = useState('Month');
  const [jobs, setJobs]             = useState([]);
  const [stats, setStats]           = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState('');
  const [enabledCats, setEnabledCats] = useState([]);

  const [createOpen, setCreateOpen]   = useState(false);
  const [createPreset, setCreatePreset] = useState(null);
  const [editingJob, setEditingJob]   = useState(null);

  const [detailsAnchor, setDetailsAnchor] = useState(null);
  const [detailsJob, setDetailsJob]       = useState(null);

  const refresh = useCallback(async () => {
    setLoadError('');
    try {
      const [data, statsData] = await Promise.all([listJobs(), getJobStats()]);
      setJobs(data);
      setStats(statsData);
    } catch (err) {
      setLoadError(err.response?.data?.detail || err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ensureCategoriesLoaded = useCallback(async () => {
    if (categories.length) return;
    try {
      const cats = await listJobCategories();
      setCategories(cats);
      setEnabledCats(prev => (prev.length ? prev : cats.map(c => c.key)));
    } catch {
      /* silent — sidebar/dropdown will stay empty if this fails */
    }
  }, [categories.length]);

  useEffect(() => {
    if (createOpen) ensureCategoriesLoaded();
  }, [createOpen, ensureCategoriesLoaded]);

  const visibleJobs = useMemo(
    () => jobs.filter(j => enabledCats.includes(j.category || 'work')),
    [jobs, enabledCats],
  );

  const goPrev = () => {
    if (view === 'Month') setAnchorDate(addMonths(anchorDate, -1));
    else if (view === 'Week') setAnchorDate(addDays(anchorDate, -7));
    else setAnchorDate(addDays(anchorDate, -1));
  };
  const goNext = () => {
    if (view === 'Month') setAnchorDate(addMonths(anchorDate, 1));
    else if (view === 'Week') setAnchorDate(addDays(anchorDate, 7));
    else setAnchorDate(addDays(anchorDate, 1));
  };
  const goToday = () => setAnchorDate(new Date());

  const openCreate = (preset = null) => {
    setCreatePreset(preset);
    setEditingJob(null);
    setCreateOpen(true);
  };

  const handleDayClick = (day) => {
    if (view === 'Month') {
      // In month view, single-click drills into Day view; the "+" button creates.
      setAnchorDate(day);
      setView('Day');
    } else {
      openCreate(day);
    }
  };

  const handleSlotClick = (slot) => openCreate(slot);

  const handleEventClick = (job, anchorEl) => {
    setDetailsJob(job);
    setDetailsAnchor(anchorEl);
  };

  const closeDetails = () => {
    setDetailsAnchor(null);
    setDetailsJob(null);
  };

  const handleEdit = (job) => {
    closeDetails();
    setEditingJob(job);
    setCreatePreset(null);
    setCreateOpen(true);
  };

  const handleDelete = async (job) => {
    try {
      await deleteJob(job.id);
      closeDetails();
      await refresh();
      dispatch(showAlert({ message: 'Job deleted', severity: 'success' }));
    } catch (err) {
      dispatch(showAlert({
        message: err.response?.data?.detail || 'Failed to delete job',
        severity: 'error',
      }));
    }
  };

  const handleSaved = async (saved) => {
    const wasEditing = !!editingJob;
    await refresh();
    dispatch(showAlert({
      message: wasEditing ? 'Job updated' : 'Job created',
      severity: 'success',
    }));
    setEditingJob(null);
    setCreatePreset(null);
    if (saved?.start) setAnchorDate(new Date(saved.start));
  };

  const toggleCat = (key) => {
    setEnabledCats(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f5f7fa' }}>
      {/* Breadcrumb */}
      <Box sx={{ px: 3, pt: 2 }}>
        <Breadcrumbs sx={{ fontSize: 13 }}>
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={() => navigate('/')}
            sx={{
              fontSize: 13,
              color: 'primary.main',
              fontWeight: 500,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              p: 0,
              '&:hover': { color: 'primary.dark' },
            }}
          >
            Home
          </Link>
          <Typography color="text.primary" sx={{ fontSize: 13 }}>Calendar</Typography>
        </Breadcrumbs>
      </Box>

      {/* Toolbar */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 3, py: 1.5,
      }}>
        <CalendarTodayOutlinedIcon sx={{ color: '#1976d2' }} />
        <Typography sx={{ fontWeight: 700, fontSize: 20, color: '#0a1929' }}>Calendar</Typography>

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Today">
          <Button
            variant="outlined" size="small" onClick={goToday}
            startIcon={<TodayOutlinedIcon />} sx={{ textTransform: 'none' }}
          >
            Today
          </Button>
        </Tooltip>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" onClick={goPrev}><ChevronLeftIcon /></IconButton>
          <Typography sx={{ minWidth: 220, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
            {formatHeader(anchorDate, view.toLowerCase())}
          </Typography>
          <IconButton size="small" onClick={goNext}><ChevronRightIcon /></IconButton>
        </Box>

        <ButtonGroup size="small" variant="outlined">
          {VIEWS.map(v => (
            <Button
              key={v}
              variant={view === v ? 'contained' : 'outlined'}
              onClick={() => setView(v)}
              sx={{ textTransform: 'none', minWidth: 64 }}
            >
              {v}
            </Button>
          ))}
        </ButtonGroup>

        <Button
          variant="contained" size="small" startIcon={<AddOutlinedIcon />}
          onClick={() => openCreate()}
          sx={{ textTransform: 'none', boxShadow: 'none' }}
        >
          New Job
        </Button>
      </Box>

      <Divider />

      {/* Body */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left sidebar */}
        <Box sx={{ width: 300, bgcolor: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
          <MiniCalendar selectedDate={anchorDate} onSelect={setAnchorDate} />

          <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'auto' }}>
            {/* Categories column */}
            <Box sx={{ flex: 1, p: 1.5, borderRight: '1px solid #f0f0f0' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, mb: 1, height: 18 }}>
                Categories
              </Typography>
              {categories.map((c) => (
                <Box key={c.key} sx={{ height: 34, display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    size="small"
                    checked={enabledCats.includes(c.key)}
                    onChange={() => toggleCat(c.key)}
                    sx={{
                      color: c.color,
                      '&.Mui-checked': { color: c.color },
                      p: 0.5,
                    }}
                  />
                  <Typography sx={{ fontSize: 13, color: '#374151' }}>{c.label}</Typography>
                </Box>
              ))}
            </Box>

            {/* Status column — numerical counts, each row parallel to its Category row */}
            <Box sx={{ flex: 1, p: 1.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, mb: 1, height: 18 }}>
                Status
              </Typography>
              {categories.map((c) => {
                const count = stats?.[c.key] || 0;
                return (
                  <Box
                    key={c.key}
                    sx={{
                      height: 34,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                      borderLeft: `3px solid ${c.color}`,
                      bgcolor: count ? `${c.color}14` : '#fafafa',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 700,
                        lineHeight: 1,
                        color: count ? c.color : '#9ca3af',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Main view */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          {loadError && (
            <Alert severity="error" sx={{ m: 1.5, mb: 0 }}>{loadError}</Alert>
          )}
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          )}
          {!loading && view === 'Month' && (
            <MonthView
              anchorDate={anchorDate}
              jobs={visibleJobs}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          )}
          {!loading && view === 'Week' && (
            <WeekView
              anchorDate={anchorDate}
              jobs={visibleJobs}
              onSlotClick={handleSlotClick}
              onEventClick={handleEventClick}
            />
          )}
          {!loading && view === 'Day' && (
            <DayView
              anchorDate={anchorDate}
              jobs={visibleJobs}
              onSlotClick={handleSlotClick}
              onEventClick={handleEventClick}
            />
          )}
        </Box>
      </Box>

      {/* Create / Edit drawer */}
      <CreateJob
        open={createOpen}
        onClose={() => { setCreateOpen(false); setEditingJob(null); setCreatePreset(null); }}
        onSaved={handleSaved}
        presetDate={createPreset}
        job={editingJob}
        categories={categories}
      />

      {/* Event details popover */}
      <JobDetails
        anchorEl={detailsAnchor}
        job={detailsJob}
        onClose={closeDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        categories={categories}
      />
    </Box>
  );
};

export default CalendarMain;
