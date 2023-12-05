const express = require('express');
const router = express.Router();
// Route handler for the home page
router.get("/", (req, res, next) => {
  // Check if the user is authenticated
  if (req.session.currentUser) {
    // If the user is logged in, redirect them to the main page
    res.redirect('/auth/prf/mainPage'); // Replace '/auth/prf/mainPage' with the route you want to redirect to
  } else {
    // If the user is not logged in, render the home page as usual
    res.render("index");
  }
});
// Other route handlers and middleware...
module.exports = router;