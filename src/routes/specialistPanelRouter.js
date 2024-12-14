const express = require('express');
const {loadSpecialistPanel, addMeeting, loadSpecialistMeetings, cancelMeeting, loadingMeetingMembers} = require('../controllers/specialistPanelController');

const router = express.Router()

router.get('/specialistPanel', loadSpecialistMeetings);

router.post('/createMeeting', addMeeting);

router.post('/cancelMeeting', cancelMeeting);

router.post('/loadMembers', loadingMeetingMembers);

module.exports = router;