const express = require('express');
const router = express.Router();
// SQL
const { Post, User, Comment } = require('../models');
// 로그인 검사
const authMiddleware = require('../middleware/auth-middleware');

// POST /posts, 게시글 작성
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const { userId } = res.locals.user;
    // console.log('userId: ', userId);

    if (!title) {
      return res.status(412).send({ errorMessage: '게시글 제목을 입력하세요.' });
    }

    if (!content) {
      return res.status(412).send({ errorMessage: '게시글 내용을 입력하세요.' });
    }

    const userNickname = await User.findOne({
      where: {
        userId: userId,
      },
    });

    await Post.create({
      title: title,
      content: content,
      userId: userId,
      nickname: userNickname.nickname,
    });

    return res.status(200).send({ message: '게시글 작성에 성공하였습니다.' });
  } catch (error) {
    console.error(error);
    next(error);
    return res.status(400).send({ errorMessage: '게시글 작성에 실패하였습니다.' });
  }
});

// GET /posts, 게시글 조회
router.get('/', async (req, res, next) => {
  try {
    const allPosts = await Post.findAll({
      attributes: ['postId', 'userId', 'nickname', 'title', 'createdAt', 'updatedAt', 'likes'],
    });
    console.log('전체 조회: ', allPosts);
    return res.json({ data: allPosts });
  } catch (error) {
    console.error('error: ', error);
    return res.status(400).send({ errorMessage: '게시글 조회에 실패하였습니다.' });
  }
});

// GET /posts/:postId, 게시글 상세 조회
router.get('/:postId', async (req, res, next) => {
  try {
    const { postId } = req.params;
    const targetPosts = await Post.findOne({
      where: {
        postId: postId,
      },
      attributes: ['postId', 'userId', 'nickname', 'title', 'content', 'createdAt', 'updatedAt', 'likes'],
      include: [
        {
          model: Comment,
          attributes: ['userId', 'postId', 'commentId', 'comment', 'createdAt', 'updatedAt'],
        },
      ],
    });
    // console.log('postId: ', postId);
    return res.status(200).json({ data: targetPosts }).send('게시글 상세 조회');
  } catch (error) {
    console.error(error);
    return res.status(400).send({ errorMessage: '게시글 조회에 실패하였습니다.' });
  }
});

// PUT /posts/:postId, 게시글 수정
router.put('/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;
    const { userId } = res.locals.user;

    if (!req.body) {
      return res.status(412).send({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }

    const checkUserPosts = await Post.findOne({
      where: {
        postId: postId,
      },
    });
    console.log('checkUserPosts: ', checkUserPosts);

    if (checkUserPosts.userId !== userId) {
      return res.status(401).send({ errorMessage: '내가 작성한 글만 수정 가능합니다.' });
    }

    const targetPosts = await Post.update(
      {
        title: title,
        content: content,
      },
      {
        where: {
          postId: postId,
        },
      }
    );

    if (!targetPosts) {
      return res.status(401).send({ errorMessage: '게시글이 정상적으로 수정되지 않았습니다.' });
    }

    return res.status(200).send({ message: '게시글을 수정하였습니다.' });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ errorMessage: '게시글 수정에 실패하였습니다.' });
  }
});

// DELETE /posts/:postId, 게시글 삭제
router.delete('/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = res.locals.user;

    const checkUserPosts = await Post.findOne({
      where: {
        postId: postId,
      },
    });
    console.log('checkUserPosts: ', checkUserPosts);

    if (!checkUserPosts) {
      return res.status(404).send({ errorMessage: '게시글이 존재하지 않습니다.' });
    }

    if (checkUserPosts.userId !== userId) {
      return res.status(401).send({ errorMessage: '내가 작성한 글만 삭제 가능합니다.' });
    }

    await Post.destroy({
      where: {
        postId: postId,
        userId: userId,
      },
    });

    return res.status(200).json({ message: '게시글을 삭제하였습니다.' });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ errorMessage: '게시글이 삭제에 실패하였습니다.' });
  }
});

// PUT /posts/:postId/like, 게시글 좋아요
router.put('/:postId/like', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = res.locals.user;

    const post = await Post.findOne({
      where: { postId: postId },
      include: [
        {
          model: User,
          as: 'Likers',
          attributes: ['userId'],
        },
      ],
    });
    console.log('post: ', post);

    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.');
    }

    console.log('userId: ', userId);
    console.log('post.postId: ', post.postId);

    await post.addLikers(userId);
    return res.json({ postId: post.postId, userId: userId, data: post });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// GET /posts/like, 좋아요 게시글 조회
router.get('/like', authMiddleware, async (req, res, next) => {
  return res.send('좋아요 게시글 조회');
});

module.exports = router;
