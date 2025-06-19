const express = require('express');
const router =express.Router()
const checkAuth=require('../middleware/checkAuth')
const jwt=require('jsonwebtoken')
const Fee= require('../model/Fee')
const mongoose=require('mongoose')

//signup-post request bcz data comiing from frontend
router.post('/add-fee',(req,res)=>{
  const token = req.headers.authorization.split(" ")[1]
  const verify=jwt.verify(token,'debadrita my name 123' )
  
  const newFee= new Fee({
    _id: new mongoose.Types.ObjectId,
    fullName:req.body.fullName,
    phone:req.body.phone,
    courseId:req.body.courseId,
    uId:verify.uId,
    amount:req.body.amount,
    remark:req.body.remark
  })
  newFee.save()
  .then(result=>{
    res.status(200).json({
      newFee:result
    })
  })
  .catch(err=>
    res.status(500).json({
      error:err
    })
  )

})


//get all fee collection data
router.get('/payment-history',checkAuth,(req,res)=>{
  const token = req.headers.authorization.split(" ")[1]
  const verify=jwt.verify(token,'debadrita my name 123' )

  Fee.find({uId:verify.uId})
  .then(result=>{
    res.status(200).json({
      paymentHistory:result
    })
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    })
  })
})

//one particular student payed for a particular course
router.get('/all-payment',checkAuth,(req,res)=>{
  const token = req.headers.authorization.split(" ")[1]
  const verify=jwt.verify(token,'debadrita my name 123' )

  Fee.find({uId:verify.uId,courseId:req.query.courseId,phone:req.query.phone})
  .then(result=>{
    res.status(500).json({
      fees:result
    })
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    })
  })
})


module.exports = router;
