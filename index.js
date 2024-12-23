require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.listen(port, () => {
  console.log("Server is running on port: ", port);
})
const db_username = process.env.DB_USER;
const db_password = process.env.DB_PASS;


