// :símbolo_informações: Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv').config()
// :símbolo_informações: Connects to the database
require('./db')
// Handles http requests (express is node js framework)
const express = require('express')
const app = express()
// :símbolo_informações: This function is getting exported from the config folder. It runs most pieces of middleware
require('./config')(app)
//sessions config
require('./config/session.config')(app)
// default value for title local
const capitalize = require('./utils/capitalize')
const projectName = 'fitnessApp'
app.locals.appTitle = `${capitalize(projectName)} created with IronLauncher`
//used this function to pass currentUser variable to layout template.check if there is other way.
app.use((req, res, next) => {
    res.locals.currentUser = req.session.currentUser || null;
    next();
  });
// :apontando_para_baixo: Start handling routes here
const indexRoutes = require('./routes/index.routes')
app.use('/', indexRoutes)
//auth routes bouncer
const authRoutes = require('./routes/auth.routes')


app.use('/auth', authRoutes)



const prfRoutes = require('./routes/prf.routes');
app.use('/auth/prf', prfRoutes);
const searchRoutes = require('./routes/search.routes');
const exerciseRoutes = require('./routes/exercise.routes');
app.use('/auth/srch', searchRoutes);
app.use('/auth/srch/exercise', exerciseRoutes);
const exerciseSelectionRoutes = require('./routes/exercise_selection.routes');
app.use('/auth/exercise_selection', exerciseSelectionRoutes);
// :exclamação: To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app)



module.exports = app