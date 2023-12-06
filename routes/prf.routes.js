const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Profile = require("../models/Profile.model");
const Exercise = require("../models/Exercise.model");
const Plan = require("../models/Plan.model");
const fs = require("fs");
const path = require("path");
const dataFolderPath = path.join(__dirname, "..", "data");
const exerciseFiles = fs.readdirSync(dataFolderPath);
router.get("/profile", async (req, res, next) => {
  try {
    // Retrieve the user data from the database based on the logged-in user's ID
    const user = await User.findById(req.session.currentUser._id);
    let profile = await Profile.findOne({ user: req.session.currentUser._id });
    if (!profile) {
      profile = new Profile({
        weight: 0,
        height: 0,
        age: 0,
        gender: "",
        user: req.session.currentUser._id,
      });
      // Save the newly created profile to the database
      await profile.save();
      // Associate the profile with the user in the User model
      user.profile = profile._id;
      await user.save();
    }
    res.render("prf/profile", { user, profile }); // Pass the user data to the profile view
  } catch (error) {
    console.log("Error retrieving user data:", error);
    res.redirect("/"); // Redirect to an error page or suitable route
  }
});
router.post("/profile", async (req, res, next) => {
  const { weight, height, age } = req.body;
  const userId = req.session.currentUser._id;
  try {
    // Retrieve the user data from the database based on the logged-in user's ID
    const user = await User.findById(userId);
    if (user) {
      // Update the user's profile fields
      user.profile.weight = weight;
      user.profile.height = height;
      user.profile.age = age;
      await user.save(); // Save the changes to the users collection
    }
    // Retrieve the profile data associated with the user
    let profile = await Profile.findOne({ user: userId });
    if (!profile) {
      // If the profile doesn't exist, create a new one
      profile = new Profile({
        weight,
        height,
        age,
        username: user.username,
        user: userId,
      });
      // Save the newly created profile to the database
      await profile.save();
      // Associate the profile with the user in the User model
      user.profile = profile._id;
      await user.save();
    } else {
      // If the profile already exists, update its fields
      profile.weight = weight;
      profile.height = height;
      profile.age = age;
      profile.username = user.username;
      await profile.save(); // Save the changes to the profiles collection
    }
    res.redirect("/auth/prf/profile");
  } catch (error) {
    console.log("Error updating profile:", error);
    res.redirect("/auth/prf/profile");
  }
});
// GET main page route
router.get("/mainPage", (req, res, next) => {
  // Retrieve the selected exercises list from session storage or initialize an empty array if it doesn't exist
  const selectedExercises = req.session.selectedExercises || [];
  res.render("prf/mainPage", { selectedExercises }); // Pass the selected exercises list to the mainPage view
});
//create plan
router.post("/createPlan", async (req, res) => {
  const { planName, selectedExercises } = req.body; // Destructure planName and selectedExercises from the request body
  try {
    // Create a new plan object and save it to the database
    const newPlan = new Plan({
      name: planName,
      exercises: JSON.parse(selectedExercises), // Parse the selectedExercises string back to an array
      user: req.session.currentUser._id,
    });
    await newPlan.save();
    // Clear the selectedExercises from the session
    req.session.selectedExercises = [];
    // Redirect the user to the workoutPage with the new plan's ID as a query parameter
    res.redirect(`/auth/prf/workoutPage?planId=${newPlan._id}`);
  } catch (error) {
    console.log("Error creating plan:", error);
    res.redirect("/auth/prf/mainPage");
  }
});
// Route to display the workoutPage with the selected plan's exercises
router.get("/workoutPage", async (req, res) => {
  try {
    const selectedExercises = req.session.selectedExercises || [];
    const userId = req.session.currentUser._id;  
    // Retrieve all plans for the current user from the database
    const plans = await Plan.find({ user: userId });
    // Check if there's a plan ID in the query parameters
    const planId = req.query.planId;
    // If the planId is provided, retrieve the plan from the database based on the plan ID
    let plan;
    if (planId) {
      plan = await Plan.findById(planId);
    }
    // Render the workoutPage with both plan and selectedExercises
    res.render("prf/workoutPage", { plans, plan, selectedExercises });
  } catch (error) {
    console.log("Error retrieving plan:", error);
    res.redirect("/auth/prf/mainPage");
  }
});
router.get("/workoutPage/:id/edit", async (req, res) => {
  try {
    const planId = req.params.id;
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).send("Plan not found.");
    }
    // Retrieve all exercises from your JSON files or the database
    const allExercises = []; 
    res.render("prf/editPlan", { plan, allExercises });
  } catch (error) {
    console.error("Error retrieving plan:", error);
    res.status(500).send("Error retrieving plan.");
  }
});
router.post("/workoutPage/:id/edit", async (req, res) => {
  const planId = req.params.id;
  const updatedName = req.body.planName;
  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).send("Plan not found.");
    }
    plan.name = updatedName;
    await plan.save();
    res.redirect(`/auth/prf/workoutPage/${planId}/edit`);
  } catch (error) {
    console.error("Error updating plan name:", error);
    res.status(500).send("Error updating plan name.");
  }
});
//Eric helped..rout to display add exercises from the update page
router.get("/workoutPage/:id/edit/addexercise", async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);
    console.log(plan);
    res.render("prf/searchUpdate", { plan });
  } catch (error) {
    console.log(error);
  }
});
//Eric helped.. rout to get the exercises when searching
router.get("/searchUpdate_results/:id", async (req, res) => {
  const query = req.query.query.toLowerCase();
  const { id } = req.params;
  try {
    const plan = await Plan.findById(id);
    const exerciseFiles = fs.readdirSync(dataFolderPath);
    // Array to store the results of the search
    const results = [];
    // Loop through each exercise file
    for (const exerciseFile of exerciseFiles) {
      if (exerciseFile.endsWith(".json")) {
        const filePath = path.join(dataFolderPath, exerciseFile);
        const jsonData = fs.readFileSync(filePath, "utf8");
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
    console.log("Exercise Search Results:", results);
    res.render(`prf/searchUpdate`, { plan, results });
  } catch (error) {
    console.error("Error fetching exercise search results:", error);
    res.status(500).json({ error: "Error fetching exercise search results" });
  }
});
//Eric helped ..have exercises updated in plan
router.get("/update/:id/:exerciseName", async (req, res) => {
  const { id } = req.params;
  const { exerciseName } = req.params;
  console.log(id, exerciseName);
  try {
    const plan = await Plan.findByIdAndUpdate(
      id,
      { $push: { exercises: exerciseName } },
      { new: true }
    );
    console.log(plan);
    res.redirect(`/auth/prf/workoutPage/${id}/edit`);
  } catch (error) {
    console.log(error);
  }
});
//display exercise details and images on start plan
router.get('/workoutPage/:planId/planExercises', async (req, res) => {
  const planId = req.params.planId;
  try {
    // Retrieve the plan from the database based on the plan ID
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).send('Plan not found.');
    }
    const exercisesData = {}; // Object to store exercise data by exercise name
    // Loop through the exercise files and populate the exercisesData object
    plan.exercises.forEach(exercise => {
      const exerciseFile = exercise.replace(/\s/g, "_") + ".json"; // Convert exercise name to filename format
      const filePath = path.join(dataFolderPath, exerciseFile);
      try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const exerciseData = JSON.parse(jsonData);
        exercisesData[exerciseData.name] = exerciseData;
      } catch (error) {
        console.error(`Error reading or parsing JSON data for exercise: ${exerciseFile}`, error);
        //handle the error
        exercisesData[exercise] = {
          name: "Exercise Not Found",
          force: "",
          level: "",
          mechanic: "",
          equipment: "",
          primaryMuscles: "",
          category: "",
          instructions: "Exercise details not available.",
        };
      }
    });
    const exercises = plan.exercises.map(exerciseName => {
      const exerciseData = exercisesData[exerciseName];
      const imageFolderPath = path.join(dataFolderPath, exerciseName.replace(/\s/g, "_"));
      const image1Path = path.join(imageFolderPath, '0.jpg');
      const image2Path = path.join(imageFolderPath, '1.jpg');
      let image1 = '';
      let image2 = '';
      if (fs.existsSync(image1Path) && fs.existsSync(image2Path)) {
        const image1Data = fs.readFileSync(image1Path, 'base64');
        const image2Data = fs.readFileSync(image2Path, 'base64');
        image1 = `data:image/jpeg;base64,${image1Data}`;
        image2 = `data:image/jpeg;base64,${image2Data}`;
      } else {
        console.error(`Image files not found for exercise: ${exerciseName}`);
      }
      // Combine the exercise details and images into a single object
      return {
        ...exerciseData,
        image1,
        image2,
      };
    });
    res.render('prf/planExercises', { plan, exercises });
  } catch (error) {
    console.error('Error retrieving plan:', error);
    res.status(500).send('Error retrieving plan.');
  }
});
// Route to handle starting the plan
router.post('/workoutPage/:planId/startPlan', async (req, res) => {
  const planId = req.params.planId;
  try {
    // Retrieve the plan from the database based on the plan ID
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).send('Plan not found.');
    }
    // Add your logic here to handle starting the plan
    // For example, you can set a flag in the plan to mark it as started
  res.redirect(`/auth/prf/workoutPage/${planId}/planExercises`);
  } catch (error) {
    console.error('Error starting plan:', error);
    res.status(500).send('Error starting plan.');
  }
});
router.post("/workoutPage/:id/addExercise", async (req, res) => {
  const planId = req.params.id;
  const exerciseToAdd = req.body.exerciseToAdd;
  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).send("Plan not found.");
    }
    // Add exercise to the plan
    plan.exercises.push(exerciseToAdd);
    await plan.save();
    res.sendStatus(200); // Successful request
  } catch (error) {
    console.error("Error adding exercise to plan:", error);
    res.status(500).send("Error adding exercise to plan.");
  }
});
// Remove exercise from the plan
router.post("/workoutPage/:planId/removeExercise", async (req, res) => {
  try {
    const planId = req.params.planId;
    const exercisesToRemove = req.body.exerciseToRemove;
    // Fetch the plan by ID and pull the exercises from the `exercises` array
    await Plan.findByIdAndUpdate(planId, {
      $pull: { exercises: { $in: exercisesToRemove } },
    });
    res.redirect(`/auth/prf/workoutPage/${planId}/edit`);
  } catch (error) {
    console.log("Error removing exercise from plan:", error);
    res.redirect("/auth/prf/workoutPage");
  }
});
router.post("/workoutPage/:planId/delete", async (req, res) => {
  try {
    const planId = req.params.planId;
    await Plan.findByIdAndDelete(planId);
    res.redirect("/auth/prf/workoutPage"); // Redirect to the correct page after deletion
  } catch (error) {
    console.log("Error deleting plan:", error);
    res.redirect("/auth/prf/workoutPage");
  }
});
router.get("/aboutus", (req, res) => {
  res.render("prf/about");
});
router.get("/workoutPage", (req, res) => {
  res.render("prf/workoutPage");
});
router.get("/awards", (req, res) => {
  res.render("prf/awards");
});
module.exports = router;