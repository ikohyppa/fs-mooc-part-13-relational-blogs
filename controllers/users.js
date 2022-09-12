const router = require('express').Router();
const { Op } = require('sequelize');

const { Blog, User } = require('../models');

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] },
    },
  });
  res.json(users);
});

router.post('/', async (req, res, next) => {
  const user = await User.create(req.body);
  res.json(user);
});

router.get('/:id', async (req, res, next) => {
  let read = { [Op.in]: [true, false] };
  if (req.query.read) {
    read = req.query.read === 'true';
  }

  const user = await User.findByPk(req.params.id, {
    attributes: ['name', 'username'],
    include: {
      model: Blog,
      as: 'readings',
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'userId', 'user_blogs.id'],
      },
      through: {
        as: 'readinglist',
        attributes: ['id', 'read'],
        where: { read },
      },
    },
  });
  if (user) {
    res.json(user);
  } else {
    res.status(404).end();
  }
});

router.put('/:username', async (req, res) => {
  const user = await User.findOne({ where: { username: req.params.username } });
  if (user) {
    user.username = req.body.username;
    await user.save();
    res.json(user);
  } else {
    res.status(404).end();
  }
});

module.exports = router;
