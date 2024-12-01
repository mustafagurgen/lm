
'use strict'

const app = require('./routes/index');

console.log('Application running at port: ', process.env.APP_PORT);
app.listen(process.env.APP_PORT);


