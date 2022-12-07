const express = require('express');
const router = express.Router();
// hashing password
const bcrypt = require('bcrypt');
// SQL
const { Op } = require('sequelize');
const { User } = require('../models');

// POST /signup, 회원가입
router.post('/', async (req, res, next) => {
  try {
    const { nickname, password, confirm } = req.body;
    const regex = /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()._-]{4,16}$/;
    // console.log('regex: ', regex);
    console.log('nickname: ', nickname);
    console.log('password: ', password);
    console.log('confirm: ', confirm);
    // console.log('password.split: ', password.includes(nickname));
    if (!nickname) {
      return res.status(400).send({
        errorMessage: '닉네임을 입력해주세요.',
      });
    }

    console.log('regex.test(nickname): ', regex.test(nickname));
    if (nickname.length < 4 || !regex.test(nickname)) {
      return res.status(412).send({
        errorMessage: '닉네임은 최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)로 구성되어야 합니다.',
      });
    }

    if (!password) {
      return res.status(400).send({
        errorMessage: '비밀번호를 입력해주세요.',
      });
    }

    console.log('password.includes(nickname): ', password.includes(nickname));
    if (password.length < 4 || password.includes(nickname)) {
      return res.status(412).send({ errorMessage: '비밀번호에 닉네임과 같은 값이 포함될 수 없습니다.' });
    }

    if (password !== confirm) {
      return res.status(400).send({
        errorMessage: '패스워드가 패스워드 확인란과 다릅니다.',
      });
    }

    // nickname이 동일한게 이미 있는지 확인하기 위해 가져온다.
    const existsUsers = await User.findAll({
      where: {
        [Op.or]: [
          {
            nickname: nickname,
          },
        ],
      },
    });

    if (existsUsers.length) {
      return res.status(400).send({
        errorMessage: '닉네임이 이미 사용중입니다.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('hashedPassword: ', hashedPassword);

    await User.create({
      nickname: nickname,
      password: hashedPassword,
    });

    return res.status(201).send({ message: '회원 가입에 성공하였습니다.' });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
