const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const session = require('express-session');
const sessionOptions = {
        secret: 'GreatSecretForUs',
        resave: true,
        saveUninitialized: false,
        }

mongoose.connect('mongodb://localhost:27017/authDemo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected')
});

const path = require('path');
const { addAbortSignal } = require('stream');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionOptions));

//middleware
const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        res.redirect('/login')
    }
    next()
};

app.get('/', (req, res) => {
    res.render('index')
});

app.get('/register', (req, res) => {
    res.render('register')
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save()
    req.session.user_id = user._id;
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login')
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password)
    if (foundUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/secret')
    } else {
        res.redirect('/login')
    } 
});

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    // req.session.destroy();
    res.redirect('/login')
});

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret')
});

app.listen(3000, () => {
    console.log('Serving on Port 3000')
});