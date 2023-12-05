const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Exercise = require('../models/Exercise.model');
const dataFolderPath = path.join(__dirname, '..', 'data');
router.get('/:id', async (req, res) => {
  const exerciseId = req.params.id;
  try {
    // Read the list of exercise files in the data folder
    const exerciseFiles = fs.readdirSync(dataFolderPath);
    // Filter out directories from the exerciseFiles array
    const exerciseFile = exerciseFiles.find((file) => {
    const filePath = path.join(dataFolderPath, file);
      return fs.statSync(filePath).isFile() && file.startsWith(exerciseId);
    });
    if (exerciseFile) {
      const filePath = path.join(dataFolderPath, exerciseFile);
      const jsonData = fs.readFileSync(filePath, 'utf8');
      const exerciseData = JSON.parse(jsonData);
      // images are named as '0.jpg' and '1.jpg' inside the Data/images folder
      const imageFolderPath = path.join(dataFolderPath, exerciseId);
      const image1Path = path.join(imageFolderPath, '0.jpg');
      const image2Path = path.join(imageFolderPath, '1.jpg');
      // Read the image files and convert them to base64 for rendering
      const image1 = fs.readFileSync(image1Path, 'base64');
      const image2 = fs.readFileSync(image2Path, 'base64');
      res.render('srch/exercise_details.ejs', {
        exercise: exerciseData,
        image1: `data:image/jpeg;base64,${image1}`,
        image2: `data:image/jpeg;base64,${image2}`,
        selectedExercise: exerciseData.name
      });
    } else { 
      res.render('not_found.ejs');
    }
  } catch (error) {
    console.error('Error fetching exercise details:', error);
    res.render('not_found.ejs');
  }
});
router.post('/exercise_selection/add', async (req, res) => {
  const { exerciseId, exerciseName } = req.body;
  try {
    // Redirect to the main page with the selected exercise name as a query parameter
    res.redirect(`/auth/prf/mainPage?selectedExercise=${encodeURIComponent(exerciseName)}`);
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).send('Error processing form submission.');
  }
});
module.exports = router;