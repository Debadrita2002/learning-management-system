const express = require('express');
const router =express.Router()
const checkAuth=require('../middleware/checkAuth')
const Student=require('../model/Student')
const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const cloudinary= require('cloudinary').v2;
const Fee=require('../model/Fee')

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.API_KEY,
  api_secret:process.env.API_SECRET
})

//signup-post request bcz data comiing from frontend



//add student
router.post('/add-student',checkAuth,(req,res)=>{
  const token = req.headers.authorization.split(" ")[1]
  const verify=jwt.verify(token,'debadrita my name 123' )
  console.log(req.body)
  console.log(req.files.image)
  
  cloudinary.uploader.upload(req.files.image.tempFilePath,(err,result)=>{
    const newStudent = new Student({
      _id: new mongoose.Types.ObjectId,
      fullName:req.body.fullName,
      phone:req.body.phone,
      email:req.body.email,
      address:req.body.address,
      courseId:req.body.courseId,
      uId:verify.uId,
      imageUrl:result.secure_url,
      imageId:result.public_id
    })
    newStudent.save()
    .then(result=>{
      res.status(200).json({
        newStudent:result
      })
    })
    .catch(err=>{
      console.log(err)
      res.status(500).json({
        error:err
      })
    })
  })
})



//get all students
router.get('/all-students',checkAuth,(req,res)=>{
  const token = req.headers.authorization.split(" ")[1]
  const verify=jwt.verify(token,'debadrita my name 123' )

  Student.find({uId:verify.uId})
  .select('_id uId fullName phone email address courseId imageUrl imageId')
  .then(result=>{
    res.status(200).json({
      students:result
    })
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    })
  })
})

//get student-detail by id
router.get('/student-detail/:id',checkAuth,(req,res)=>{
  const token = req.headers.authorization.split(" ")[1]
  const verify=jwt.verify(token,'debadrita my name 123' )

  student.findById(req.params.id)
  .select('_id uId fullName phone email address courseId imageUrl imageId')
  .then(result=>{
    Fee.find({uId:verify.uId,courseId:result.courseId,phone:result.phone})
    .then(feeData=>{
      res.status(200).json({
        studentDetail:result,
        feeDetail:feeData
      })
    })
    .catch(err=>{
      console.log(err)
      res.status(500).json({
        error:err
      })
    })
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    })
  })
})

//get students in one course
router.get('/all-students/:courseId',checkAuth,(req,res)=>{
  const token = req.headers.authorization.split(" ")[1]
  const verify=jwt.verify(token,'debadrita my name 123' )

  Student.find({uId:verify.uId,courseId:req.params.courseId})
  .select('_id uId fullName phone email address courseId imageUrl imageId')
  .then(result=>{
    res.status(200).json({
      students:result
    })
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    })
  })
})

//delete student
router.delete('/:id',checkAuth,(req,res)=>{
  const token = req.headers.authorization.split(" ")[1]
  const verify=jwt.verify(token,'debadrita my name 123' )
  Student.findById(req.params.id)
  .then(student=>{
    console.log(student)
    if(student.uId == verify.uId){
      //delete
      Student.findByIdAndDelete(req.params.id)
      .then(result=>{
        cloudinary.uploader.destroy(student.imageId,(deletedImage)=>{
          res.status(200).json({
            result:result
          })
        })
      })
      .catch(err=>{
        res.status(500).json({
          msg:err
        })
      })
    }
    else{
      res.status(500).json({
        msg:'bad request'
      })
    }
  })
})

//update student
router.put('/:id',checkAuth,(req,res)=>{
  const token = req.headers.authorization.split(" ")[1]
  const verify=jwt.verify(token,'debadrita my name 123')
  

  Student.findById(req.params.id)
  .then(student=>{
    if(verify.uId != student.uId){
      return res.status(500).json({
        error:'not allowed to update data'
      })
    }
    if(req.files){
      cloudinary.uploader.destroy(student.imageId,(deletedImage)=>{
          cloudinary.uploader.upload(req.files.image.tempFilePath,(err,result)=>{
            const newUpdatedStudent ={
              fullName:req.body.fullName,
              phone:req.body.phone,
              email:req.body.email,
              address:req.body.address,
              courseId:req.body.courseId,
              uId:verify.uId,
              imageUrl:result.secure_url,
              imageId:result.public_id
            }
            
            Student.findByIdAndUpdate(req.params.id,newUpdatedStudent,{new:true})
            .then(data=>{
              res.status(200).json({
                updatedStudent:data
              })
            })
            .catch(err=>{
              console.log(err)
              res.status(500).json({
                error:err
              })
            })

          })
      })
    }
    else{
      const updatedData={
        fullName:req.body.fullName,
        phone:req.body.phone,
        email:req.body.email,
        address:req.body.address,
        courseId:req.body.courseId,
        uId:verify.uId,
        imageUrl:student.imageUrl,
        imageId:student.imageId
      }
      Student.findByIdAndUpdate(req.params.id,updatedData,{new:true})
      .then(data=>{
        res.status(200).json({
          updatedData:data
        })
      })
      .catch(err=>{
        console.log(err)
        res.status(500).json({
          error:err
        })
      })
    }
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    })
  })

})

//get latest 5 students data
router.get('/latest-students',checkAuth,(req,res)=>{
  const token = req.headers.authorization.split(" ")[1]
  const verify=jwt.verify(token,'debadrita my name 123')
  Student.find({uid:verify.uId})
  .sort({natural:-1}).limit(5)
  .then(result=>{  
    students:result
  })
  .catch(err=>{
    res.status(500).json({
      error:err
    })
  })
})




module.exports = router;
