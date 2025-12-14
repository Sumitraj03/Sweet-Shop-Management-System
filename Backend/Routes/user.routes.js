import express from 'express'
import { login, logout, register } from '../Controllers/user.controller.js';
import { isAuthenticated } from '../Middlewares/isAuthenticated.js';
import { getPurchases } from '../Controllers/inventory.controller.js';


const router = express.Router();

router.route('/auth/register').post(register);
router.route('/auth/login').post(login);
router.route('/auth/logout').get(logout);
router.route('/purchases').get(isAuthenticated,getPurchases);



export default router;
