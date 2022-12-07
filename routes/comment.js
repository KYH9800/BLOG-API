const express = require('express');
const router = express.Router();
// 로그인 검사
const authMiddleware = require('../middleware/auth-middleware');
// SQL
const { Post, User, Comment } = require('../models');

// POST /comments/:postId, 댓글 생성
router.post('/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { comment } = req.body;
    const { userId } = res.locals.user;
    const { postId } = req.params;
    // userId로 User 정보를 찾아 nickname에 넣어준다.
    // comment: comment
    // userId: res.locals.user
    // console.log('comment: ', comment);
    if (!comment) {
      return res.status(412).send({ errorMessage: '댓글을 입력해주세요.' });
    }

    const findUser = await User.findOne({
      where: {
        userId: userId,
      },
    });
    // console.log('findUser.userId: ', findUser.userId);
    // console.log('findUser.nickname: ', findUser.nickname);
    const findPost = await Post.findOne({
      where: {
        postId: postId,
      },
    });
    // console.log('findPost: ', findPost);
    if (!findPost) {
      return res.status(404).send({ errorMessage: '게시글이 존재하지 않습니다.' });
    }

    await Comment.create({
      comment: comment,
      nickname: findUser.nickname,
      userId: findUser.userId,
      postId: findPost.postId,
    });

    return res.status(200).send({ message: '댓글을 작성하였습니다.' });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ errorMessage: '댓글 작성에 실패하였습니다.' });
  }
});

// GET /comments/:postId, 댓글 목록 조회
router.get('/:postId', async (req, res, next) => {
  try {
    const { postId } = req.params;

    const allComment = await Comment.findAll({
      attributes: ['commentId', 'userId', 'nickname', 'comment', 'createdAt', 'updatedAt'],
      where: {
        postId: postId,
      },
    });
    console.log(allComment);

    return res.json({ data: allComment });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ errorMessage: '댓글 조회에 실패하였습니다.' });
  }
});

// PUT /comments/:commentId, 댓글 수정
router.put('/:commentId', authMiddleware, async (req, res, next) => {
  const { commentId } = req.params;
  const { comment } = req.body;
  const { userId } = res.locals.user;

  const findComment = await Comment.findOne({
    where: {
      commentId: commentId,
    },
  });

  if (!comment) {
    return res.status(412).send({ errorMessage: '댓글을 입력해주세요.' });
  }

  if (!findComment) {
    return res.status(404).send({ errorMessage: '댓글이 존재하지 않습니다.' });
  }

  if (findComment.userId !== userId) {
    return res.status(400).send({ errorMessage: '본인이 작성한 댓글만 수정 가능합니다.' });
  }

  await Comment.update(
    {
      comment: comment,
    },
    {
      where: {
        commentId: commentId,
      },
    }
  );

  return res.send({ errorMessage: '댓글을 수정하였습니다.' });
});

// DELETE /comments/:commentId, 댓글 삭제
router.delete('/:commentId', authMiddleware, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { userId } = res.locals.user;

    const checkComments = await Comment.findOne({
      where: {
        commentId: commentId,
      },
    });
    console.log('checkComments: ', checkComments);

    if (!checkComments) {
      return res.status(404).send({ errorMessage: '댓글이 존재하지 않습니다.' });
    }

    if (checkComments.userId !== userId) {
      return res.status(400).send({ errorMessage: '내가 작성한 댓글만 삭제 가능합니다.' });
    }

    await Comment.destroy({
      where: {
        commentId: commentId,
        userId: userId,
      },
    });

    return res.status(200).json({ message: '댓글을 삭제하였습니다.' });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ errorMessage: '댓글 삭제에 실패하였습니다.' });
  }
});

module.exports = router;
