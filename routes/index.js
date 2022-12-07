const express = require('express');
const router = express.Router();
// router
const signupRouter = require('./signup');
const usersRouter = require('./user');
const postsRouter = require('./post');
const commentsRouter = require('./comment');

router.get('/', (req, res) => {
  console.log('req: ', req.headers);
  res.send('Wellcome to Blog-API');
});

router.use('/signup', signupRouter);
router.use('/login', usersRouter);
router.use('/posts', postsRouter);
router.use('/comments', commentsRouter);

module.exports = router;
