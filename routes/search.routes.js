const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const dataFolderPath = path.join(__dirname,'..', 'data');
router.get('/search', (req, res) => {
  res.render('srch/search');
});
router.post('/search_results', (req, res) => {
  const query = req.body.query.toLowerCase();
  try {
    const exerciseFiles = fs.readdirSync(dataFolderPath);
    // Array to store the results of the search
    const results = [];
    // Loop through each exercise file
    for (const exerciseFile of exerciseFiles) {
      if (exerciseFile.endsWith('.json')) {
        const filePath = path.join(dataFolderPath, exerciseFile);
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const exerciseData = JSON.parse(jsonData);
        // Check if the exercise name or instructions contain the search query
        if (
          exerciseData.name.toLowerCase().includes(query) ||
          exerciseData.instructions.some((instruction) =>
            instruction.toLowerCase().includes(query)
          )
        ) {
          // If there's a match, add the exercise to the results array
          results.push(exerciseData);
        }
      }
    }
    console.log('Search Results:', results);
    res.render('srch/search_results.ejs', { results });
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.render('search_results.ejs', { results: [] });
  }
});
router.get('/exercises/search_results', async (req, res) => {
  const query = req.query.q.toLowerCase();
  try {
    const exerciseFiles = fs.readdirSync(dataFolderPath);
    // Array to store the results of the search
    const results = [];
    // Loop through each exercise file
    for (const exerciseFile of exerciseFiles) {
      if (exerciseFile.endsWith('.json')) {
        const filePath = path.join(dataFolderPath, exerciseFile);
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const exerciseData = JSON.parse(jsonData);
        // Check if the exercise name or instructions contain the search query
        if (
          exerciseData.name.toLowerCase().includes(query) ||
          exerciseData.instructions.some((instruction) => instruction.toLowerCase().includes(query))
        ) {
          // If there's a match, add the exercise to the results array
          results.push(exerciseData);
        }
      }
    }
    console.log('Exercise Search Results:', results);
    res.json(results);
  } catch (error) {
    console.error('Error fetching exercise search results:', error);
    res.status(500).json({ error: 'Error fetching exercise search results' });
  }
});
module.exports = router;