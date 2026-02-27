const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middleware/auth');

router.post('/create', auth, groupController.createGroup);
router.post('/join', auth, groupController.joinGroup);
router.get('/my-groups', auth, groupController.getMyGroups);
router.get('/:groupId/members', auth, groupController.getGroupMembers);
router.delete('/:groupId', auth, groupController.deleteGroup);
router.post('/:groupId/remove/:memberId', auth, groupController.removeMember);

module.exports = router;
