// var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// ------- OAuth2.0 --------

const passport = require("pass port");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require('./config/keys');
const Users = require('./models/Users');
const cookieSession = require('cookie-session');


passport.use(
  new GoogleStrategy(
    {
      clientID : keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL : "http://localhost:3000/auth/google/redirect"
    },
      (accessToken, refreshToken, profile, done) => {
      // passport callback function
      //check if user already exists in our db with the given profile ID
      Users.findOne({ googleID : profile.id }).then((currentUser) => {
        if(currentUser)
        {
          // if user already have record with gven profileID
          done(null, currentUser); 
        } else {
          // if not, create a new user
          const user = new Users({
            googleID : profile.id
          }).save().then((newUser) => {
            done(null, newUser);
           })

         }
      })
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});


app.use(cookieSession({
  // milliseconds in one complete day
  maxAge: 3600 * 1000,
  keys:[keys.session.cookieKey]
}));

app.get('/auth/google', passport.authenticate("google", {
  scope : ["profile" , "email"]
}));

app.get('/auth/google/redirect', passport.authenticate("google", (req, res) => {
  // res.send(req.user);
  res.send("You reached the redirected URL");
}));

app.get('/auth/logout', (req, res) => {
  req.logout();
  // res.send(req.user);
  res.send('<h1>logged out</h1>');
});  

module.exports = app;
