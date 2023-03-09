const router = require("express").Router();
const userController = require("../controllers/user.controller");

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout/:id', userController.logOutUser);
router.post('/change-password/:id', userController.changePassword);
router.post('/reset-password/:id', userController.resetPassword);
router.post('/update-password/:id', userController.updatePassword);

module.exports = router;