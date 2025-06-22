const express = require('express')
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const fileUpload= require('express-fileupload')
const cors = require('cors')

app.use(fileUpload({
    useTempFiles : true,
    //tempFileDir : '/tmp/'
}))

const userRoute = require('./routes/user')
const courseRoute = require('./routes/course')
const studentRoute = require('./routes/student')
const feeRoute = require('./routes/fee')

mongoose.connect('mongodb+srv://debadrita:12345@lmsapp.40tojuu.mongodb.net/?retryWrites=true&w=majority&appName=LMSapp')
.then(()=>{
    console.log('connected')
})
.catch(err=>{
    console.log('err')
})

app.use(bodyParser.json())
app.use(cors());

app.use('/user',userRoute)
app.use('/course',courseRoute)
app.use('/student',studentRoute)
app.use('/fee',feeRoute)
app.use((req, res) => {
    res.status(404).json({
        msg: 'bad request'
    });
});



module.exports = app;