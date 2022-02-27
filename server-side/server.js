const express = require('express');

const app = express();
require('dotenv').config();
console.log(process.env);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
