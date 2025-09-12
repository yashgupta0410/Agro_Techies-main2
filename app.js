import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import createError from 'http-errors';
import express, { json, urlencoded, static as staticFileMiddleware } from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import indexRouter from './src/routes/index.js';
import kisaanRouter from './src/routes/kisaan.js';
import officerRouter from './src/routes/officer.js';
import sellerRouter from './src/routes/seller.js';
import { Kisaan } from './src/models/kisaan.model.js';
import { Officer } from './src/models/officer.model.js';
import { Seller } from './src/models/seller.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// View engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware setup
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: "Ayush12@"
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(staticFileMiddleware(join(__dirname, 'public')));

// Passport configuration
passport.use('farmer-local', new LocalStrategy(Kisaan.authenticate()));
passport.use('officer-local', new LocalStrategy(Officer.authenticate()));
passport.use('seller-local', new LocalStrategy(Seller.authenticate()));

passport.serializeUser((user, done) => {
  done(null, user.username); // Assuming the username is stored in the user object
});

passport.deserializeUser(async (username, done) => {
  try {
    const officer = await Officer.findOne({ username });
    if (officer) return done(null, officer);
    
    const seller = await Seller.findOne({ username });
    if (seller) return done(null, seller);
    
    const kisaan = await Kisaan.findOne({ username });
    done(null, kisaan);
  } catch (err) {
    done(err);
  }
});

// Routes
app.use('/', indexRouter);
app.use('/kisaan', kisaanRouter);
app.use('/officer', officerRouter);
app.use('/seller', sellerRouter);

// Error handler
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

export default app;
