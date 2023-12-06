const express = require('express')
const User = require('../models/User.model')
const router = express.Router()
const bcrypt = require('bcryptjs')
/* GET Signup page */
router.get('/signup', (req, res, next) => {
  res.render('auth/signup.ejs');
})
/* POST data to register a new user */
router.post('/signup', async (req, res, next) => {
  console.log(req.body)
  const payload = { ...req.body }
  delete payload.password
  const salt = bcrypt.genSaltSync(13)
  payload.passwordHash = bcrypt.hashSync(req.body.password, salt)
  try {
    const newUser = await User.create(payload)
    console.log("here is your new user", newUser);
    res.redirect("/auth/login");
  } catch (error) {
    console.log(error)
  }
})
/* GET Login page */
router.get('/login', (req, res, next) => {
    res.render('auth/login');
  })
  /*POST data to see if our user is really our user */
router.post('/login', async (req, res, next) => {
console.log("SESSION =======> ", req.session)
  try {
    const checkedUser = await User.findOne({ email: req.body.email.toLowerCase()})
    console.log('here is the checked user', checkedUser)
    if (checkedUser) {
      // User does exists
      let doesPasswordMatch = bcrypt.compareSync(
        req.body.password,
        checkedUser.passwordHash
        );
      console.log('do they match', doesPasswordMatch)
      if(doesPasswordMatch){
        checkedUser.passwordHash='****';
        req.session.currentUser = checkedUser
        res.redirect('prf/profile')
      } else {
        // Password is incorrect
        //console.log('Password is incorrect')
        res.render('auth/login', {
          errorMessage: 'Wrong Credentials!!!', 
          //payload: { email: currentUser.email },
        })
      }
    } else {
      // No user with this email
      //console.log('No user with this email')
      res.render('auth/login', {
        errorMessage: 'Wrong Credentials!!!', 
       // payload: { email: currentUser.email },
      })
    }
  } catch (error) {
    console.log('error occured: ', error)
    res.render('auth/login', {
      errorMessage: 'There was an error on the server',
      //payload: { email: currentUser.email },
    })
  }
})
//logout
router.get('/logout', (req, res, next) => {
    res.render('auth/logout.ejs');
  })
  router.post('/logout', async (req, res, next) => {
    try {
      const user = await User.findById(req.session.currentUser._id);
      user.session = null;
      //await user.save();
      req.session.destroy((err) => {
        if (err) {
          console.log('Error logging out:', err);
          res.redirect('/'); 
        } else {
          res.redirect('/'); // Redirect to the login page after logout
        }
      });
    } catch (error) {
      console.log('Error ending session in the database:', error);
      res.redirect('/'); 
    }
  });
module.exports = router