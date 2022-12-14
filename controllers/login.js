const jwt = require('jsonwebtoken');
const router = require('express').Router();

const { SECRET } = require('../util/config');
const { Session, User } = require('../models');

router.post('/', async (req, res) => {
  const body = req.body;

  const user = await User.findOne({ where: { username: body.username } });
  const { id, name, username, disabled } = user;

  if (disabled) {
    return res
      .status(401)
      .json({ error: 'account disabled, please contact admin' });
  }

  const passwordCorrect = body.password === 'secret';

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: 'invalid username or password' });
  }

  const userForToken = {
    username,
    id,
  };

  const token = jwt.sign(userForToken, SECRET);

  await Session.create({ userId: id, token });

  res.status(200).send({ token, username, name });
});

module.exports = router;
