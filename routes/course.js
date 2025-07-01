const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/checkAuth");
const Course = require("../model/Course");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const Student = require("../model/Student");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//signup-post request bcz data comiing from frontend
router.post("/add-course", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "debadrita my name 123");

  cloudinary.uploader.upload(req.files.image.tempFilePath, (err, result) => {
    const newCourse = new Course({
      _id: new mongoose.Types.ObjectId(),
      courseName: req.body.courseName,
      price: req.body.price,
      description: req.body.description,
      startingDate: req.body.startingDate,
      endDate: req.body.endDate,
      uId: verify.uId,
      imageUrl: result.secure_url,
      imageId: result.public_id,
    });
    newCourse
      .save()
      .then((result) => {
        res.status(200).json({
          newCourse: result,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  });
});

//get all course  for any user
router.get("/all-courses/", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "debadrita my name 123");

  Course.find({ uId: verify.uId })
    .select(
      "_id uId courseName price description imageUrl imageId startingDate endDate"
    )
    .then((result) => {
      res.status(200).json({
        courses: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//get one course with id
router.get("/course-detail/:id", checkAuth, (req, res) => {
  Course.findById(req.params.id)
    .select(
      "_id uId courseName price description imageUrl imageId startingDate endDate"
    )
    .then((result) => {
      Student.find({ courseId: req.params.id }).then((students) => {
        res.status(200).json({
          course: result,
          studentList: students,
        });
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

// delete course
router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "debadrita my name 123");

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (course.uId !== verify.uId) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this course." });
    }

    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    cloudinary.uploader.destroy(course.imageId, async () => {
      await Student.deleteMany({ courseId: req.params.id });

      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
        result: deletedCourse
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong", error: err });
  }
});

//update course
router.put("/:id", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "debadrita my name 123");

  Course.findById(req.params.id)
    .then((course) => {
      if (verify.uId != course.uId) {
        return res.status(500).json({
          error: "not allowed to update data",
        });
      }
      if (req.files) {
        cloudinary.uploader.destroy(course.imageId, (deletedImage) => {
          cloudinary.uploader.upload(
            req.files.image.tempFilePath,
            (err, result) => {
              const newUpdatedCourse = {
                courseName: req.body.courseName,
                price: req.body.price,
                description: req.body.description,
                startingDate: req.body.startingDate,
                endDate: req.body.endDate,
                uId: verify.uId,
                imageUrl: result.secure_url,
                imageId: result.public_id,
              };

              Course.findByIdAndUpdate(req.params.id, newUpdatedCourse, {
                new: true,
              })
                .then((data) => {
                  res.status(200).json({
                    updatedCourse: data,
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({
                    error: err,
                  });
                });
            }
          );
        });
      } else {
        const updatedData = {
          courseName: req.body.courseName,
          price: req.body.price,
          description: req.body.description,
          startingDate: req.body.startingDate,
          endDate: req.body.endDate,
          uId: verify.uId,
          imageUrl: course.imageUrl,
          imageId: course.imageId,
        };
        Course.findByIdAndUpdate(req.params.id, updatedData, { new: true })
          .then((data) => {
            res.status(200).json({
              updatedData: data,
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//get latest 5 courses data
router.get("/latest-courses", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "debadrita my name 123");
  Course.find({ uid: verify.uId })
    .sort({ natural: -1 })
    .limit(5)
    .then((result) => {
      courses: result;
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
