import express from 'express'
import { add, deleteSweet, getAllSweets, searchSweets, updateSweet } from '../Controllers/sweet.controller.js';
import { isAuthenticated } from '../Middlewares/isAuthenticated.js';
import { purchaseSweet, restockSweet } from '../Controllers/inventory.controller.js';

const router = express.Router();

router.route('/').post(isAuthenticated,add);
router.route('/').get(isAuthenticated,getAllSweets);
router.route('/:id').put(isAuthenticated,updateSweet);
router.route('/search').get(isAuthenticated,searchSweets);
router.route('/:id').delete(isAuthenticated,deleteSweet);

//for inventory

router.route('/:id/purchase').post(isAuthenticated,purchaseSweet);
router.route('/:id/restock').post(isAuthenticated,restockSweet);



export default router;