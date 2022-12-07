const express = require('express');
const router = express.Router();
// hashing password
const bcrypt = require('bcrypt');
// SQL
const { Op } = require('sequelize');
const { User } = require('../models');
// jsonwebtoken
const jwt = require('jsonwebtoken');

// POST /login, 로그인
router.post('/', async (req, res, next) => {
  const { nickname, password } = req.body;
  console.log('nickname: ', nickname);
  console.log('password: ', password);

  try {
    const { nickname, password } = req.body;

    const user = await User.findOne({
      where: {
        nickname: nickname,
      },
    });
    console.log('user: ', user.userId);

    const hashedPassword = await bcrypt.compare(password, user.password); // 입력한 pw가 user.password와 같으면 true
    console.log('hashedPassword: ', hashedPassword);

    if (!user || !hashedPassword) {
      res.status(400).send({
        errorMessage: '닉네임 또는 패스워드를 확인해주세요.',
      });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.userId, // payload 설정
      },
      'blog-secret-key' // jwt를 활용 암호화를 위한 비밀키
    );

    console.log('복호화: ', jwt.decode(token));
    console.log('token: ', token);

    return res.status(200).send({
      token: token,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
