const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/login', (req, res) => {
  res.render('auth', { mode: 'login', error: null, redirect: req.query.redirect || '/' });
});

router.get('/register', (req, res) => {
  res.render('auth', { mode: 'register', error: null, redirect: req.query.redirect || '/' });
});

router.post('/login', async (req, res) => {
  const { email, password, redirect } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth', { mode: 'login', error: 'Invalid email or password', redirect: redirect || '/' });
    }
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.email = user.email;
    res.redirect(redirect || '/');
  } catch (err) {
    res.render('auth', { mode: 'login', error: 'Something went wrong', redirect: redirect || '/' });
  }
});

router.post('/register', async (req, res) => {
  const { username, email, password, redirect } = req.body;
  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.render('auth', { mode: 'register', error: 'Email or username already exists', redirect: redirect || '/' });
    }
    const user = new User({ username, email, password });
    await user.save();
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.email = user.email;
    res.redirect(redirect || '/');
  } catch (err) {
    res.render('auth', { mode: 'register', error: 'Registration failed', redirect: redirect || '/' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
