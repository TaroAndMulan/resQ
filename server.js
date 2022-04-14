const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss= require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')

dotenv.config({path:'./config/config.env'});

connectDB();

const restaurants = require('./routes/restaurants');
const auth = require('./routes/auth')
const reservations = require('./routes/reservations');

const app = express();

const swaggerOptions= {
    swaggerDefinition:{
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            desription: 'A simple Express VacQ API'
        },
        servers: [
          {
              url:'http://localhost:5050/api/v1'
          }  
        ],
    },

    apis:['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs));

//add cookie parse
app.use(cookieParser());

// add body parse
app.use(express.json());
//sanitize data
app.use(mongoSanitize());

// set security header
app.use(helmet());

//xss
app.use(xss());


const limiter = rateLimit({
    windowsMs:10*60*1000, // 10mins
    max:100
});

app.use(limiter);

app.use(hpp());

app.use(cors());

app.use('/api/v1/restaurants',restaurants);
app.use('/api/v1/auth',auth)
app.use('/api/v1/reservations',reservations);


const PORT = process.env.PORT || 5050;

const server = app.listen(PORT, console.log('Server running in', process.env.NODE_ENV, ' mode on port ', PORT));
 
process.on('handlesRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
})