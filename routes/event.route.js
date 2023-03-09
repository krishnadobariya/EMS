const router = require("express").Router();
const eventController = require("../controllers/event.controller");
const { verify } = require("../middleware/auth");

router.post('/create', verify, eventController.EventCreate);
router.get('/list', verify, eventController.EventList);
router.get('/list-get-by-id/:eventId', verify, eventController.EventListGetOne);
router.put('/update/:eventId', verify, eventController.EventUpdate);

module.exports = router;