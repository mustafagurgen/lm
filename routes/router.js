const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser');



app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.json());
module.exports = {
  app,
  router,
  prisma
};
