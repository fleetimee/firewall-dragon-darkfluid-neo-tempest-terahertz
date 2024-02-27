import express from 'express';

import auth from './auth/api';
import news from './news/api';
import packet from './packet/api';
import posts from './posts/api';
import user from './user/api';

const router = express.Router();

router.use('/', auth);
router.use('/user', user);
router.use('/posts', posts);
router.use('/news', news);
router.use('/package', packet);

export default router;
