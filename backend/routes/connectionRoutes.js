import express from 'express';

const router = express.Router();

// Deprecated: legacy consent-based connection requests.
// The app now uses caregiver invites + patient claim flow under /api/invites.
router.all('*', (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Connections API is deprecated. Use /api/invites for caregiver→patient onboarding.'
  });
});

export default router;
