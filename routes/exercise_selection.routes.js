const express = require('express');
const router = express.Router();
router.post('/add', async (req, res) => {
  const exerciseName = req.body.exerciseName;
  req.session.selectedExercises = req.session.selectedExercises || [];
  // Add the selected exercise name to the list
  req.session.selectedExercises.push(exerciseName);
  res.redirect('/auth/prf/mainPage')
})
module.exports = router;