const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { signToken } = require('../utils/jwt');
const { isNonEmptyString, isValidEmail } = require('../utils/validators');

const AVATAR_COLORS = ['#3654F4', '#1FB27A', '#E8A23D', '#B84DE5', '#0EA5C4', '#E5484D'];
function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!isNonEmptyString(name, 120)) {
      return res.status(400).json({ message: 'Please enter your name.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      avatarColor: randomAvatarColor(),
    });

    const token = signToken(user.id);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!isValidEmail(email) || typeof password !== 'string') {
      return res.status(400).json({ message: 'Please enter your email and password.' });
    }

    const userRow = await userModel.findByEmail(email);
    if (!userRow) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const matches = await bcrypt.compare(password, userRow.password_hash);
    if (!matches) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const { password_hash, ...publicUser } = userRow;
    const token = signToken(publicUser.id);
    res.json({ user: publicUser, token });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, me };
