const express = require('express');
const fs = require('fs');
const app = express();
const cookies = require('cookie-parser');
app.use(cookies());
const cloudinary = require('./src/middleware/cloudinary')
const bodyParser = require('body-parser');
const router = require('./src/routes');
const cors = require('cors');
app.use(cors());
const dotenv = require('dotenv');
const upload = require('./src/middleware/multer');
dotenv.config();

app.set('view engine', 'ejs');
app.set('views','./src/views');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(router);
app.listen(process.env.PORT, () => console.log(`Server started listening on port: ${process.env.PORT}`))

