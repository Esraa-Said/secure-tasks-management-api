const express = require("express");
require("dotenv").config();
const morgan = require('morgan');
const sequelize = require("./config/connectDB");


// sequelize.authenticate().then(() => {
//    console.log('Connection has been established successfully.');
// }).catch((error) => {
//    console.error('Unable to connect to the database: ', error);
// });


const app = express();


app.use(express.json());
app.use(morgan('dev'));



app.get('/', (req, res)=>{
    res.status(200).send(`<h1>HEllo</h1>`)
})


const PORT = process.env.PORT || 5000;
sequelize
	.sync()
	.then(() => {
		app.listen(process.env.PORT);
		console.log("Server listening on port " + PORT);
	})
	.catch(err => {
		console.log(err);
	});
