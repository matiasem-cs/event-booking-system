import express from 'express';
import { ADMIN_LOGIN_PATH, FORGOT_PASSWORD, GET_USER_INFO, GET_USER_INFO_BY_ID, GET_USER_PERMISSION, LOGIN_PATH, LOGOUT_PATH, RESET_PASSWORD, SIGNUP_PATH, UPDATE_USER_PERMISSION, USERNAME_PATH } from '../consts.js';
import { adminLoginRoute, forgotPasswordRoute, getUserInfo, getUserInfoById, getUserPermission, loginRoute, logoutRoute, resetPassword, signupRoute, updateUserPermission, usernameRoute } from '../controllers/userControllers.js';

const router = express.Router();

router.post(ADMIN_LOGIN_PATH, adminLoginRoute);

router.post(LOGIN_PATH, loginRoute);
router.post(LOGOUT_PATH, logoutRoute);
router.post(SIGNUP_PATH, signupRoute);

router.get(USERNAME_PATH, usernameRoute);
router.get(GET_USER_PERMISSION, getUserPermission);
router.get(GET_USER_INFO, getUserInfo); // for production
router.get(GET_USER_INFO_BY_ID, getUserInfoById); // without token, for testing

router.put(UPDATE_USER_PERMISSION, updateUserPermission);
router.post(FORGOT_PASSWORD, forgotPasswordRoute);
router.put(RESET_PASSWORD, resetPassword);



export default router;