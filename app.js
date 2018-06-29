const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {mongoURI} = require('./configuration');
mongoose.connect(mongoURI);

const app = express();

//Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());


//Routes
app.use('/users', require('./routes/users'));


//start the server
const port = process.env.PORT || 5000;
app.listen(port, ()=>{
    console.log(`server is running at http://localhost:${port}`);
})