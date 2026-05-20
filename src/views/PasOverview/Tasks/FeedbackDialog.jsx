import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Rating,
  Typography,
} from '@mui/material';
import CloseIcon            from '@mui/icons-material/Close';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import StarIcon             from '@mui/icons-material/Star';

const FIELDS = [
  { key: 'overall',     label: 'Overall Experience',   hint: 'How satisfied are you overall?' },
  { key: 'performance', label: 'Performance & Speed',  hint: 'Speed and reliability of the platform.' },
  { key: 'support',     label: 'Support & Service',    hint: 'Quality of customer support received.' },
  { key: 'usability',   label: 'Ease of Use',          hint: 'How intuitive is the application?' },
];

const EMPTY = { overall: 0, performance: 0, support: 0, usability: 0 };

const FeedbackDialog = ({ open, onClose }) => {
  const [ratings, setRatings] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (key, value) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRatings(EMPTY);
      onClose();
    }, 1800);
  };

  const allRated = Object.values(ratings).every(v => v > 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3, position: 'fixed', right: 20, top: 20, margin: 0, width: 450, overflow: 'hidden' } }}
      sx={{ '& .MuiDialog-paper': { overflow: 'hidden' } }}>

      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <FeedbackOutlinedIcon sx={{ color: '#1976d2', fontSize: 22 }} />
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1, fontSize: 17 }}>
          Share Your Feedback
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5, pb: 3, overflow: 'visible' }}>
        {submitted ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography fontSize={36}>🎉</Typography>
            <Typography fontWeight={700} fontSize={16} mt={1}>Thank you for your feedback!</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Your ratings help us improve.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {FIELDS.map(({ key, label, hint }) => (
              <Box key={key}>
                <Typography fontWeight={600} fontSize={14}>{label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  {hint}
                </Typography>
                <Rating
                  value={ratings[key]}
                  onChange={(_, val) => handleChange(key, val)}
                  size="large"
                  emptyIcon={<StarIcon style={{ opacity: 0.35 }} fontSize="inherit" />}
                  sx={{ color: '#f9a825' }}
                />
              </Box>
            ))}

            <Button
              variant="contained"
              fullWidth
              disabled={!allRated}
              onClick={handleSubmit}
              sx={{ mt: 1, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              Submit Feedback
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
