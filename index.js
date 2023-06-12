const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const router = require("./src/Routes/route");
const commnMid = require("./src/Middleware/Auth");
const userprofile = require("./src/Models/profile");
const Test_Model = require("./src/Models/Test_Model");
const myDrillModel = require("./src/Models/myDrillModel");
const uploadDevice = require("./src/Models/uploadDevice");
const routineModel = require("./src/Models/routineModel");
const SessionModel = require("./src/Models/SessionModel");
const feedBackModel = require("./src/Models/feedBackModel");
const SnCPlayerModel = require("./src/Models/SnCPlayerModel");
const academyProfile = require("./src/Models/academyProfile");
const assignedByModel = require("./src/Models/assignedByModel");
const readinessSurvey = require("./src/Models/readinessSurvey");
const sncPlayerProfile = require("./src/Models/sncPlayerProfile");
const onGoingDrillModel = require("./src/Models/onGoingDrillModel");
const academy_coachModel = require("./src/Models/academy_coachModel");
const recommendationModel = require("./src/Models/recommendationModel");
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

mongoose.set("strictQuery", false);

//=====================[Multer Storage]=================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/images");
  },
  filename: function (req, file, cb) {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000000,
  },
});

//=================[Post Exercise]===================================//
const excel = require("./src/excel-to-json.json");
const ExerciseModel = require("./src/Models/ExerciseModel");
app.post("/StoreExcelData", async (req, res) => {
  try {
    const exercises = excel.Exercises;
    console.log(exercises, "aaa");

    for (const exercise of exercises) {
      const sessionId = exercise["Session_Id"];
      if (sessionId) {
        const sessionIds = sessionId.split(",").map(Number);
        exercise["Session_Id"] = sessionIds;
      }

      try {
        const newExercise = new ExerciseModel({
          Exercise_Name: exercise.Exercise_Name,
          Type: exercise.Type,
          Exercise_Type: exercise.Exercise_Type,
          Session_Id: exercise["Session_Id"],
        });

        await newExercise.save();
      } catch (error) {
        console.error("Failed to save exercise:", error);
        return res.status(500).send({
          status: false,
          message: "Failed to save exercises",
          error: error.message,
        });
      }
    }

    return res.status(201).send({
      status: true,
      message: "Excel Data Created Successfully",
      data: exercises,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
});
//=======================[Get Exercise]=================
app.get("/GetExercise", async (req, res) => {
  try {
    let session_id = req.query.Session_Id;

    if (session_id) {
      var exercises = await ExerciseModel.find({ Session_Id: session_id });

      return res.status(201).send({
        status: true,
        message: "Get Excel Data Successfully",
        data: exercises,
      });
    } else {
      var exercises = await ExerciseModel.find();
      return res.status(201).send({
        status: true,
        message: "Get Excel Data Successfully",
        data: exercises,
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
});
//============================[ User Profile]==============================
app.use("/image", express.static("./upload/images"));
app.post(
  "/:userId/userProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.file;
      let userid = req.params.userId;

      let { dob, gender, email, contact, height, weight, image, userId } = data;

      if (file) {
        data.image = `/image/${file.filename}`;
      }
      data.userId = userid;

      let userCreated = await userprofile.create(data);
      return res.status(201).send({
        status: true,
        message: "User Profile Created Successfully",
        data: userCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//============================[Update User Profile]=======================
app.use("/image", express.static("./upload/images"));
app.put(
  "/:userId/UpdateProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.file;
      let userid = req.params.userId;

      let { image, dob, gender, email, contact, height, weight } = data;

      if (file) {
        data.image = `/image/${file.filename}`;
      }
      let user = await userprofile.findOneAndUpdate(
        { userId: userid },
        {
          $set: {
            dob: data.dob,
            gender: data.gender,
            email: data.email,
            contact: data.contact,
            height: data.height,
            weight: data.weight,
            image: data.image,
          },
        },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "User Profile Updated Successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//===============================[ Get Image]===============================
app.get(
  "/:userId/getImage",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let body = req.query;

      let getImg = await userprofile.find(body);
      return res.status(200).send({
        status: true,
        message: "Success",
        data: getImg,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=======================[ Upload Device]=============================================
app.use("/image", express.static("./upload/images"));
app.post(
  "/:userId/uploadDevice",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.fields([
    { name: "video", maxCount: 5 },
    { name: "thumbnail", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.files;
      let userid = req.params.userId;

      let { video, thumbnail, videoLength, title, category, tag, userId } =
        data;

      data.video = `/image/${file.video[0].filename}`;
      data.thumbnail = `/image/${file.thumbnail[0].filename}`;
      data.userId = userid;

      let uploadDeviceCreated = await uploadDevice.create(data);
      return res.status(201).send({
        data: uploadDeviceCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//===========================[ Get My Video]=============================
app.get(
  "/:userId/myVideo",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let body = req.query;
      let userId = req.params.userId;

      let { category, title, tag } = body;

      let filter = {};

      if (category) {
        filter.category = category;
      }
      if (title) {
        filter.title = title;
      }
      if (tag) {
        filter.tag = tag;
      }
      if (userId) {
        filter.userId = userId;
      }

      let arr2 = [];

      let getVideo = await uploadDevice.find({ $or: [filter] });
      for (let i = 0; i > getVideo.length; i++) {}
      arr2.push(...getVideo);
      let OnGoingData = await onGoingDrillModel.find({ $or: [filter] });
      arr2.push(...OnGoingData);

      var MyDrillData = await myDrillModel.find({ $or: [filter] });

      for (let i = 0; i < MyDrillData.length; i++) {
        arr2.push(MyDrillData[i]);
        let userFeedback = await feedBackModel
          .find({ drill_id: MyDrillData[i]._id })
          .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
      }
      return res.status(200).send({
        status: true,
        message: "Success",
        data: arr2,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=======================[Get All Videos (Curriculum)]==============================
app.get("/curriculum", async (req, res) => {
  try {
    let data = req.query;

    let { category, title } = data;

    let filter = {};

    if (category) {
      filter.category = category;
    }
    if (title) {
      filter.title = title;
    }

    let Upload = await uploadDevice.find({ $or: [filter] });

    let lastIndex = Upload.length - 1;
    let lastObject = Upload[lastIndex];

    let arr = [];

    for (var i = 0; i < Upload.length; i++) {
      data.userId = Upload[i].userId;
      arr.push(data.userId);
    }

    let Alldrills = await myDrillModel.find({ userId: data.userId });

    let type = Alldrills ? true : false;

    let obj = [
      {
        title: lastObject.title,
        videoLength: lastObject.videoLength,
        video: lastObject.video,
        thumbnail: lastObject.thumbnail,
        category: lastObject.category,
        tag: lastObject.tag,
        isCompleted: type,
        drills: Alldrills,
      },
    ];

    return res.status(200).send({
      status: true,
      message: "Success",
      data: obj,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
});

//============================[My Drills]=======================================
app.use("/image", express.static("./upload/videos"));
app.post(
  "/:userId/myDrills",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.fields([
    { name: "video", maxCount: 5 },
    { name: "thumbnail", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.files;
      let userid = req.params.userId;

      let {
        title,
        category,
        repetation,
        sets,
        video,
        videoLength,
        thumbnail,
        userId,
        isCompleted,
        routine_id,
      } = data;

      if (file && file.video) {
        data.video = `/image/${file.video[0].filename}`;
      }

      if (file && file.thumbnail) {
        data.thumbnail = `/image/${file.thumbnail[0].filename}`;
      }

      data.userId = userid;

      let MyDrillCreated = await myDrillModel.create(data);

      let obj = {};
      obj["_id"] = MyDrillCreated._id;
      obj["title"] = MyDrillCreated.title;
      obj["category"] = MyDrillCreated.category;
      obj["repetation"] = MyDrillCreated.repetation;
      obj["sets"] = MyDrillCreated.sets;
      obj["video"] = MyDrillCreated.video;
      obj["videoLength"] = MyDrillCreated.videoLength;
      obj["thumbnail"] = MyDrillCreated.thumbnail;
      obj["createdAt"] = MyDrillCreated.createdAt;
      obj["userId"] = MyDrillCreated.userId;
      obj["isCompleted"] = MyDrillCreated.isCompleted;
      obj["routine_id"] = MyDrillCreated.routine_id;
      obj["comment"] = MyDrillCreated.comment;

      return res.status(201).send({
        status: true,
        message: "Success",
        data: obj,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//===================================[part-2 (snc Player)]===========================================
app.use("/image", express.static("./upload/images"));
app.post(
  "/:userId/sncPlayerProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.file;

      let {
        image,
        Height,
        Weight,
        Age,
        Gender,
        Sport,
        Dominance,
        Training_age,
        Recent_injuries,
      } = data;
      data.image = `/image/${file.filename}`;

      const sncPlayerCreated = await sncPlayerProfile.create(data);

      let obj = {};
      obj["image"] = sncPlayerCreated.image;
      obj["Height"] = sncPlayerCreated.Height;
      obj["Weight"] = sncPlayerCreated.Weight;
      obj["Age"] = sncPlayerCreated.Age;
      obj["Gender"] = sncPlayerCreated.Gender;
      obj["Sport"] = sncPlayerCreated.Sport;
      obj["Dominance"] = sncPlayerCreated.Dominance;
      obj["Training_age"] = sncPlayerCreated.Training_age;
      obj["Recent_injuries"] = sncPlayerCreated.Recent_injuries;

      return res.status(201).send({
        Status: true,
        Message: "Successfully Created",
        data: obj,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//============================[OnGoing Drills]=======================================
app.use("/image", express.static("./upload/videos"));
app.post(
  "/:userId/OnGoingDrills",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.fields([{ name: "video", maxCount: 5 }]),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.files;
      let userid = req.params.userId;

      let {
        userId,
        title,
        category,
        repetation,
        sets,
        video,
        comment,
        remarks,
        score,
      } = data;

      data.video = `/image/${file.video[0].filename}`;
      data.userId = userid;

      const OnGoingDrillCreated = await onGoingDrillModel.create(data);

      let obj = {
        _id: OnGoingDrillCreated._id,
        userId: OnGoingDrillCreated.userId,
        title: OnGoingDrillCreated.title,
        category: OnGoingDrillCreated.category,
        repetation: OnGoingDrillCreated.repetation,
        sets: OnGoingDrillCreated.sets,
        video: OnGoingDrillCreated.video,
        comment: OnGoingDrillCreated.comment,
        remarks: OnGoingDrillCreated.remarks,
        score: OnGoingDrillCreated.score,
        createdAt: OnGoingDrillCreated.createdAt,
      };

      return res.status(201).send({
        status: true,
        message: "Success",
        data: obj,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//============================[Get OnGoing Drills]=======================================
app.get(
  "/:userId/OnGoingDrill",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let data = req.query;
      let userid = req.params.userId;

      let { category, title } = data;

      let filter = {};

      if (category) {
        filter.category = category;
      }
      if (title) {
        filter.title = title;
      }

      let OnGoingDrillCreated = await onGoingDrillModel
        .find({ userId: userid, $or: [data, filter] })
        .lean();

      let arr = [];

      for (var i = 0; i < OnGoingDrillCreated.length; i++) {
        data.videoId = OnGoingDrillCreated[i]._id;
        arr.push(data.videoId);
      }
      let arr2 = [];
      for (let i = 0; i < OnGoingDrillCreated.length; i++) {
        arr2.push(OnGoingDrillCreated[i]);
      }

      for (let i = 0; i < arr2.length; i++) {
        let userRecommendation = await recommendationModel
          .find({ userId: arr2[i].userId })
          .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        arr2[i].recommendation = userRecommendation;
      }

      return res.status(201).send({
        status: true,
        message: "Success",
        data: arr2,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//===========================[ post Recommendation] =====================
app.use("/image", express.static("./upload/videos"));
app.post(
  "/:userId/recommendations",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("audioFile"),
  async (req, res) => {
    try {
      let data = req.body;
      let userid = req.params.userId;

      let { anecdote_no, message, audiolength, manual, videoId } = data;
      let file = req.file;
      let audioFile = `/image/${file.filename}`;
      data.audioFile = audioFile;

      let videoid = await onGoingDrillModel.find();
      data.userId = userid;

      let arr = [];

      for (let i = 0; i < videoid.length; i++) {
        data.videoId = videoid[i]._id;
        arr.push(data.videoId);
      }

      const RecommendationCreated = await recommendationModel.create(data);

      let obj = {
        userId: data.userId,
        videoId: data.videoId,
        anecdote_no: RecommendationCreated.anecdote_no,
        mesage: RecommendationCreated.message,
        audioFile: RecommendationCreated.audioFile,
        audiolength: RecommendationCreated.audiolength,
        createdat: RecommendationCreated.createdAt,
        manual: RecommendationCreated.manual,
      };

      return res.status(201).send({
        status: true,
        message: "Success",
        data: [obj],
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//==============================[Academy-Coach Profile]=================================
app.use("/image", express.static("./upload/images"));
app.post(
  "/:userId/academyProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.file;
      let userid = req.params.userId;

      let { userId, image, admin_name, email, contact, address } = data;

      if (file) {
        data.image = `/image/${file.filename}`;
      }

      data.userId = userid;

      let user2 = await academy_coachModel.findById({ _id: userid });

      if (user2.academy_name == null) {
        let user = await academy_coachModel.findByIdAndUpdate(
          { _id: userid },
          { academy_name: data.admin_name },
          { new: true }
        );
      }

      const academyCreated = await academyProfile.create(data);
      return res.status(201).send({
        status: true,
        message: "Academy/Coach Profile Created Successfully",
        data: academyCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//============================[Update Academy Profile]=======================
app.use("/image", express.static("./upload/images"));
app.put(
  "/:userId/UpdateAcademyProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.file;
      let userid = req.params.userId;

      let { image, admin_name, email, contact, address } = data;

      if (req.file) {
        data.image = `/image/${file.filename}`;
      }
      let academy = await academyProfile.findOneAndUpdate(
        { userId: userid },
        {
          $set: {
            image: data.image,
            admin_name: data.admin_name,
            email: data.email,
            contact: data.contact,
            address: data.address,
          },
        },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "Academy/Coach Profile Updated Successfully",
        data: academy,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//============================[My Drills]=======================================
app.use("/image", express.static("./upload/videos"));
app.post(
  "/:userId/assignedByDrills",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.array("video", 100),
  async (req, res) => {
    try {
      let data = req.body;
      let files = req.files;
      let userId = req.params.userId;

      let { title, category, repetation, sets, assignedBy } = data;

      let video = files.map((file) => `/image/${file.filename}`);

      data.assignedBy = userId;

      data.video = video;

      let assignedByCreated = await assignedByModel.create(data);

      let responseObj = {};

      responseObj["_id"] = assignedByCreated._id;
      responseObj["title"] = assignedByCreated.title;
      responseObj["category"] = assignedByCreated.category;
      responseObj["repetation"] = assignedByCreated.repetation;
      responseObj["sets"] = assignedByCreated.sets;
      responseObj["video"] = assignedByCreated.video;
      responseObj["createdAt"] = assignedByCreated.createdAt;
      responseObj["assignedBy"] = assignedByCreated.assignedBy;

      return res.status(201).send({
        status: true,
        message: "Success",
        data: responseObj,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//============================[Get All Drills]=======================================
app.get(
  "/:userId/allDrill",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let data = req.query;
      let userid = req.params.userId;

      let { category, title } = data;

      let filter = {};

      if (category) {
        filter.category = category;
      }
      if (title) {
        filter.title = title;
      }

      let allRoutines = await routineModel
        .find({ userId: userid, $or: [filter] })
        .lean();

      let arr2 = [];
      for (var i = 0; i < allRoutines.length; i++) {
        arr2.push(allRoutines[i]);
      }
      for (let i = 0; i < arr2.length; i++) {
        let allDrill = await myDrillModel
          .find({ routine_id: arr2[i]._id })
          .lean();
        for (let j = 0; j < allDrill.length; j++) {
          let feedback = await feedBackModel.find({
            drill_id: allDrill[j]._id,
          });
          allDrill[j].Feedback = feedback;
        }
        arr2[i].allDrill = allDrill;
      }

      return res.status(201).send({
        status: true,
        message: "Success",
        data: arr2,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

// ===================[get feedback and remark] ==================//
app.get(
  "/:userId/getFeedbacks",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let data = req.query;
      let userid = req.params.userId;

      let { drill_id, video_id } = data;

      let filter = {};

      if (drill_id) {
        filter.drill_id = drill_id;
      }
      if (video_id) {
        filter.video_id = video_id;
      }

      let allfeedbacks = await feedBackModel.find({ $or: [filter] }).lean();
      return res.status(201).send({
        status: true,
        message: "Success",
        data: allfeedbacks,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//======================[Update User Profile]===============================
app.put(
  "/:userId/updateUserProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let userid = req.params.userId;

      let {
        image,
        dob,
        gender,
        email,
        contact,
        height,
        weight,
        Sport,
        Dominance,
        Training_age,
        Recent_injuries,
      } = data;

      let user = await userprofile.findOneAndUpdate(
        { userId: userid },
        {
          $set: {
            dob: data.dob,
            gender: data.gender,
            email: data.email,
            contact: data.contact,
            height: data.height,
            weight: data.weight,
            Sport: data.Sport,
            Dominance: data.Dominance,
            Training_age: data.Training_age,
            Recent_injuries: data.Recent_injuries,
            image: data.image,
          },
        },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "User Profile Updated Successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//======================[Update Academy/Coach Profile]===============================
app.put(
  "/:userId/updateCoachProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let userid = req.params.userId;

      let { image, admin_name, email, contact, address } = data;

      let academy = await academyProfile.findOneAndUpdate(
        { userId: userid },
        {
          $set: {
            image: data.image,
            admin_name: data.admin_name,
            email: data.email,
            contact: data.contact,
            address: data.address,
          },
        },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "Academy/Coach Profile Updated Successfully",
        data: academy,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=================[New My Drill api]======================
app.post(
  "/:userId/createMyDrills",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.fields([
    { name: "video", maxCount: 5 },
    { name: "thumbnail", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      let userid = req.params.userId;
      let data = req.body;

      let {
        title,
        category,
        repetation,
        sets,
        video,
        videoLength,
        thumbnail,
        userId,
        isCompleted,
        routine_id,
      } = data;

      data.userId = userid;

      let myDrillsCreated = await myDrillModel.create(data);

      return res.status(201).send({
        status: true,
        message: "MyDrill Created Successfully",
        data: myDrillsCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=====================[New User Profile upload]=====================
app.post(
  "/:userId/videoUpload",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.fields([
    { name: "video", maxCount: 5 },
    { name: "thumbnail", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      let userid = req.params.userId;
      let data = req.body;

      let { video, thumbnail, videoLength, title, category, tag, userId } =
        data;

      data.userId = userid;

      let uploadDeviceCreated = await uploadDevice.create(data);

      return res.status(201).send({
        status: true,
        message: "Video Upload Successfully",
        data: uploadDeviceCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=================[New User Profile]=======================
app.post(
  "/:userId/createUserProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let userid = req.params.userId;

      let {
        dob,
        gender,
        email,
        contact,
        height,
        weight,
        image,
        userId,
        Sport,
        Dominance,
        Training_age,
        Recent_injuries,
      } = data;

      data.userId = userid;

      let userCreated = await userprofile.create(data);
      return res.status(201).send({
        status: true,
        message: "User Profile Created Successfully",
        data: userCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=================[Academy/Coach Profile]=========================
app.post(
  "/:userId/academy_coachProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let userid = req.params.userId;

      let { userId, image, admin_name, email, contact, address } = data;

      data.userId = userid;

      let user2 = await academy_coachModel.findById({ _id: userid });

      if (user2.academy_name == null) {
        let user = await academy_coachModel.findByIdAndUpdate(
          { _id: userid },
          { academy_name: data.admin_name },
          { new: true }
        );
      }

      const academyCreated = await academyProfile.create(data);
      return res.status(201).send({
        status: true,
        message: "Academy/Coach Profile Created Successfully",
        data: academyCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=================[New SnC User Profile]=======================
app.post(
  "/:userId/createSnCProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let userId = req.params.userId;

      let {
        Height,
        Weight,
        Age,
        Gender,
        Sport,
        Dominance,
        Training_age,
        Recent_injuries,
        image,
      } = data;

      data.userId = userId;

      let userCreated = await sncPlayerProfile.create(data);
      return res.status(201).send({
        status: true,
        message: "SnC Player Profile Created Successfully",
        data: userCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=================[ Update SnC Player profile]==================
app.put(
  "/:userId/updateSnCPlayerProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let userId = req.params.userId;

      let {
        Height,
        Weight,
        Age,
        Gender,
        Sport,
        Dominance,
        Training_age,
        Recent_injuries,
        image,
      } = data;

      let user = await sncPlayerProfile.findOneAndUpdate(
        { userId: userId },
        {
          $set: {
            Height: data.Height,
            Weight: data.Weight,
            Age: data.Age,
            Gender: data.Gender,
            Sport: data.Sport,
            Dominance: data.Dominance,
            Training_age: data.Training_age,
            Recent_injuries: data.Recent_injuries,
            image: data.image,
          },
        },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "SnC Player Profile Updated Successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//==========================[Update SNC Password]=================
app.post("/updateSncPassword", async (req, res) => {
  try {
    let data = req.body;
    let { email, password } = data;

    let user2 = await SnCPlayerModel.findOne({ email: email });

    const encryptedPassword = bcrypt.hashSync(password, 12);
    data.password = encryptedPassword;

    let user = await SnCPlayerModel.findOneAndUpdate(
      { email: email },
      { $set: { password: encryptedPassword } },
      { new: true }
    );
    return res.status(200).send({
      status: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
});

//=============[ get SNC contact ]================
app.post("/getSncContact", async (req, res) => {
  try {
    let email = req.body.email;

    let user = await SnCPlayerModel.findOne({ email: email });

    if (!user) {
      return res.status(400).send({
        status: false,
        msg: "This Email are not Registered.",
      });
    } else {
      return res.status(200).send({
        status: true,
        msg: "Get Contact",
        data: {
          phone: user.phone,
        },
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
});

//=============[ get IsReadiness submitted for a day]================
app.get(
  "/:userId/getReadinesssurvey",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let data = req.query;
      let userId = req.params.userId;

      let { date } = data;

      let filter = {};

      if (date) {
        filter.date = date;
      }
      let Readiness = await readinessSurvey.findOne({
        userId: userId,
        date: date,
      });
      if (Readiness) {
        return res.status(200).send({
          status: true,
          message: "Success",
          submitted: true,
        });
      } else {
        return res.status(200).send({
          status: true,
          message: "Success",
          submitted: false,
        });
      }
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//================[SnC Session Type]========================
app.post("/SncSession", async (req, res) => {
  try {
    let data = req.body;

    let SessionArr = [];

    for (let i = 0; i < data.length; i++) {
      let { id, title } = data[i];

      let Session = await SessionModel.create(data[i]);
      SessionArr.push(Session);
    }

    return res.status(201).send({
      status: true,
      message: "Session Created Successfully",
      data: SessionArr,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
});

//==================[Get SnC Test Category]================
app.get("/GetSncSession", async (req, res) => {
  try {
    let body = req.query;
    let filter = {};

    if (body.id) {
      filter.id = body.id;
    }

    const Session = await SessionModel.find(filter).select({
      id: 1,
      SessionType: 1,
      _id: 0,
    });

    return res.status(200).send({
      status: true,
      message: "Get Session Successfully",
      data: Session,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
});

// ========================[store Test score ]=======================//
app.post(
  "/:userId/Test",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let data = req.body;
      let userId = req.params.userId;

      let TestArr = [];

      for (let i = 0; i < data.length; i++) {
        let { testId, catId, date, title, score, unit } = data;
        data[i].userId = userId;

        let Test = await Test_Model.create(data[i]);
        TestArr.push(Test);
      }

      return res.status(201).send({
        status: true,
        message: "Session Created Successfully",
        data: TestArr,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=====================[Readiness survey day wise sleep]=====================
app.get(
  "/:userId/getdaywisesurvey",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let userId = req.params.userId;
      let sleep = [];
      let mood = [];
      let energy = [];
      let stressed = [];
      let sore = [];
      let heart_rate = [];
      let urine_color = [];
      let count = 0;
      let totalSleep = 0;
      let totalMood = 0;
      let totalEnergy = 0;
      let totalStressed = 0;
      let totalSore = 0;
      let totalHeart_rate = 0;
      let totalUrine_color = 0;
      let Readiness = await readinessSurvey
        .find({ userId: userId })
        .sort({ date: 1 });
      let startDateString = req.query.date;
      let endDateString = req.query.end_date;
      let [startDay, startMonth, startYear] = startDateString.split("-");
      let [endDay, endMonth, endYear] = endDateString.split("-");

      let startDateObj = new Date(`${startYear}`, startMonth - 1, startDay);
      let endDateObj = new Date(`${endYear}`, endMonth - 1, endDay);

      let dateArray = [];
      for (
        let date = startDateObj;
        date <= endDateObj;
        date.setDate(date.getDate() + 1)
      ) {
        let dateString = date
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .split("/")
          .join("-");
        dateArray.push({ date: dateString });
      }

      for (let j = 0; j < dateArray.length; j++) {
        let current_date = dateArray[j].date;
        let readinessData = Readiness.find(
          (data) => data.date === current_date
        );
        if (readinessData) {
          sleep.push({
            title: current_date,
            value: readinessData.Sleep,
          });
          totalSleep += readinessData.Sleep;
          count++;
          mood.push({
            title: current_date,
            value: readinessData.Mood,
          });
          totalMood += readinessData.Mood;
          energy.push({
            title: current_date,
            value: readinessData.Energy,
          });
          totalEnergy += readinessData.Energy;
          stressed.push({
            title: current_date,
            value: readinessData.Stressed,
          });
          totalStressed += readinessData.Stressed;
          sore.push({
            title: current_date,
            value: readinessData.Sore,
          });
          totalSore += readinessData.Sore;
          heart_rate.push({
            title: current_date,
            value: readinessData.Heart_rate,
          });
          totalHeart_rate += readinessData.Heart_rate;
          urine_color.push({
            title: current_date,
            value: readinessData.Urine_color,
          });
          totalUrine_color += readinessData.Urine_color;
        } else {
          sleep.push({
            title: current_date,
            value: null,
          });
          mood.push({
            title: current_date,
            value: null,
          });
          energy.push({
            title: current_date,
            value: null,
          });
          stressed.push({
            title: current_date,
            value: null,
          });
          sore.push({
            title: current_date,
            value: null,
          });
          heart_rate.push({
            title: current_date,
            value: null,
          });
          urine_color.push({
            title: current_date,
            value: null,
          });
        }
      }

      let averageSleep = count > 0 ? (totalSleep / count).toFixed(2) : null;
      let averageMood = count > 0 ? (totalMood / count).toFixed(2) : null;
      let averageEnergy = count > 0 ? (totalEnergy / count).toFixed(2) : null;
      let averageStressed =
        count > 0 ? (totalStressed / count).toFixed(2) : null;
      let averageSore = count > 0 ? (totalSore / count).toFixed(2) : null;
      let averageHeart_rate =
        count > 0 ? (totalHeart_rate / count).toFixed(2) : null;
      let averageUrine_color =
        count > 0 ? (totalUrine_color / count).toFixed(2) : null;

      return res.status(200).send({
        status: true,
        message: "Success",
        AverageSleep: averageSleep,
        Sleep: sleep,
        AverageMood: averageMood,
        Mood: mood,
        AverageEnergy: averageEnergy,
        Energy: energy,
        AverageStressed: averageStressed,
        Stressed: stressed,
        AverageSore: averageSore,
        Sore: sore,
        AverageHeart_rate: averageHeart_rate,
        Heart_rate: heart_rate,
        AverageUrine_color: averageUrine_color,
        Urine_color: urine_color,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=================[Readiness survey Month wise Average]===============
app.get(
  "/:userId/getmonthwiseaverage",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let userId = req.params.userId;
      let weeklyAverageSleep = [];
      let weeklySleepTotal = 0;
      let weeklySleepCount = 0;
      let weeklyAverageMood = [];
      let weeklyMoodTotal = 0;
      let weeklyMoodCount = 0;
      let weeklyAverageEnergy = [];
      let weeklyEnergyTotal = 0;
      let weeklyEnergyCount = 0;
      let weeklyAverageStressed = [];
      let weeklyStressedTotal = 0;
      let weeklyStressedCount = 0;
      let weeklyAverageSore = [];
      let weeklySoreTotal = 0;
      let weeklySoreCount = 0;
      let weeklyAverageHeart_rate = [];
      let weeklyHeart_rateTotal = 0;
      let weeklyHeart_rateCount = 0;
      let weeklyAverageUrine_color = [];
      let weeklyUrine_colorTotal = 0;
      let weeklyUrine_colorCount = 0;
      let monthlyAverageSleep = 0;
      let monthlyAverageMood = 0;
      let monthlyAverageEnergy = 0;
      let monthlyAverageStressed = 0;
      let monthlyAverageSore = 0;
      let monthlyAverageHeart_rate = 0;
      let monthlyAverageUrine_color = 0;

      let Readiness = await readinessSurvey.find({ userId: userId });

      let startDateString = req.query.date;
      let endDateString = req.query.end_date;
      let [startDay, startMonth, startYear] = startDateString.split("-");
      let [endDay, endMonth, endYear] = endDateString.split("-");

      let startDateObj = new Date(`${startYear}`, startMonth - 1, startDay);
      let endDateObj = new Date(`${endYear}`, endMonth - 1, endDay);

      let weekCount = Math.ceil(
        (endDateObj - startDateObj) / (7 * 24 * 60 * 60 * 1000)
      );

      let weekStartDates = [];
      let currentDate = new Date(startDateObj);
      for (let i = 0; i < weekCount; i++) {
        weekStartDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 7);
      }

      for (let i = 0; i < weekStartDates.length; i++) {
        let startDate = weekStartDates[i];
        let endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        let startDateString = startDate
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .split("/")
          .join("-");

        // let endDateString = endDate
        //   .toLocaleDateString("en-GB", {
        //     day: "2-digit",
        //     month: "2-digit",
        //     year: "numeric",
        //   })
        //   .split("/")
        //   .join("-");

        let weekNumber = i + 1;
        let averageSleep = null;
        let averageMood = null;
        let averageEnergy = null;
        let averageStressed = null;
        let averageSore = null;
        let averageHeart_rate = null;
        let averageUrine_color = null;

        for (let j = startDate; j <= endDate; j.setDate(j.getDate() + 1)) {
          let currentDate = j
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .split("/")
            .join("-");
          let readinessData = Readiness.find((r) => r.date === currentDate);

          if (readinessData) {
            let sleepValue = readinessData.Sleep;
            weeklySleepTotal += sleepValue;
            weeklySleepCount++;
          }

          if (readinessData) {
            let moodValue = readinessData.Mood;
            weeklyMoodTotal += moodValue;
            weeklyMoodCount++;
          }

          if (readinessData) {
            let energyValue = readinessData.Energy;
            weeklyEnergyTotal += energyValue;
            weeklyEnergyCount++;
          }

          if (readinessData) {
            let stressedValue = readinessData.Stressed;
            weeklyStressedTotal += stressedValue;
            weeklyStressedCount++;
          }

          if (readinessData) {
            let soreValue = readinessData.Sore;
            weeklySoreTotal += soreValue;
            weeklySoreCount++;
          }

          if (readinessData) {
            let heartRateValue = readinessData.Heart_rate;
            weeklyHeart_rateTotal += heartRateValue;
            weeklyHeart_rateCount++;
          }

          if (readinessData) {
            let urineColorValue = readinessData.Urine_color;
            weeklyUrine_colorTotal += urineColorValue;
            weeklyUrine_colorCount++;
          }
        }
        //==========[sleep]=====================
        if (weeklySleepCount > 0) {
          averageSleep = (weeklySleepTotal / weeklySleepCount).toFixed(2);
          monthlyAverageSleep += parseFloat(averageSleep);
        }

        weeklyAverageSleep.push({
          startDate: startDateString,
          average: averageSleep,
          week: weekNumber,
        });

        weeklySleepTotal = 0;
        weeklySleepCount = 0;

        //===========[mood]========================
        if (weeklyMoodCount > 0) {
          averageMood = (weeklyMoodTotal / weeklyMoodCount).toFixed(2);
          monthlyAverageMood += parseFloat(averageMood);
        }
        weeklyAverageMood.push({
          startDate: startDateString,
          average: averageMood,
          week: weekNumber,
        });
        weeklyMoodTotal = 0;
        weeklyMoodCount = 0;
        //============[energy]===================
        if (weeklyEnergyCount > 0) {
          averageEnergy = (weeklyEnergyTotal / weeklyEnergyCount).toFixed(2);
          monthlyAverageEnergy += parseFloat(averageEnergy);
        }
        weeklyAverageEnergy.push({
          startDate: startDateString,
          average: averageEnergy,
          week: weekNumber,
        });
        weeklyEnergyTotal = 0;
        weeklyEnergyCount = 0;
        //============[stressed]===================
        if (weeklyStressedCount > 0) {
          averageStressed = (weeklyStressedTotal / weeklyStressedCount).toFixed(
            2
          );
          monthlyAverageStressed += parseFloat(averageStressed);
        }
        weeklyAverageStressed.push({
          startDate: startDateString,
          average: averageStressed,
          week: weekNumber,
        });
        //============[sore]===========
        if (weeklySoreCount > 0) {
          averageSore = (weeklySoreTotal / weeklySoreCount).toFixed(2);
          monthlyAverageSore += parseFloat(averageSore);
        }
        weeklyAverageSore.push({
          startDate: startDateString,
          average: averageSore,
          week: weekNumber,
        });
        //=============[heart_rate]=======
        if (weeklyHeart_rateCount > 0) {
          averageHeart_rate = (
            weeklyHeart_rateTotal / weeklyHeart_rateCount
          ).toFixed(2);
          monthlyAverageHeart_rate += parseFloat(averageHeart_rate);
        }
        weeklyAverageHeart_rate.push({
          startDate: startDateString,
          average: averageHeart_rate,
          week: weekNumber,
        });
        //=============[urine_color]=================
        if (weeklyUrine_colorCount > 0) {
          averageUrine_color = (
            weeklyUrine_colorTotal / weeklyUrine_colorCount
          ).toFixed(2);
          monthlyAverageUrine_color += parseFloat(averageUrine_color);
        }
        weeklyAverageUrine_color.push({
          startDate: startDateString,
          average: averageUrine_color,
          week: weekNumber,
        });
      }

      var totalWeeks = weeklyAverageSleep.filter(
        (week) => week.average !== null
      ).length;

      let monthAverageSleep =
        totalWeeks > 0 ? (monthlyAverageSleep / totalWeeks).toFixed(2) : null;

      let monthAverageMood =
        totalWeeks > 0 ? (monthlyAverageMood / totalWeeks).toFixed(2) : null;

      let monthAverageEnergy =
        totalWeeks > 0 ? (monthlyAverageEnergy / totalWeeks).toFixed(2) : null;

      let monthAverageStressed =
        totalWeeks > 0
          ? (monthlyAverageStressed / totalWeeks).toFixed(2)
          : null;

      let monthAverageSore =
        totalWeeks > 0 ? (monthlyAverageSore / totalWeeks).toFixed(2) : null;

      let monthAverageHeart_rate =
        totalWeeks > 0
          ? (monthlyAverageHeart_rate / totalWeeks).toFixed(2)
          : null;

      let monthAverageUrine_color =
        totalWeeks > 0
          ? (monthlyAverageUrine_color / totalWeeks).toFixed(2)
          : null;

      return res.status(200).send({
        status: true,
        message: "Success",
        weeklyAverageSleep: weeklyAverageSleep,
        monthlyAverageSleep: monthAverageSleep,
        weeklyAverageMood: weeklyAverageMood,
        monthlyAverageMood: monthAverageMood,
        weeklyAverageEnergy: weeklyAverageEnergy,
        monthlyAverageEnergy: monthAverageEnergy,
        weeklyAverageStressed: weeklyAverageStressed,
        monthlyAverageStressed: monthAverageStressed,
        weeklyAverageSore: weeklyAverageSore,
        monthlyAverageSore: monthAverageSore,
        weeklyAverageHeart_rate: weeklyAverageHeart_rate,
        monthlyAverageHeart_rate: monthAverageHeart_rate,
        weeklyAverageUrine_color: weeklyAverageUrine_color,
        monthlyAverageUrine_color: monthAverageUrine_color,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=================[Readiness survey Quaterly wise Average]====================
app.get(
  "/:userId/getQuarterlyData",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let userId = req.params.userId;
      let monthlyAverageSleep = [];
      let monthlySleepTotal = 0;
      let monthlySleepCount = 0;
      let quarterlyAverageSleep = 0;
      let quarterlySleepCount = 0;
      let monthlyAverageMood = [];
      let monthlyMoodTotal = 0;
      let monthlyMoodCount = 0;
      let quarterlyAverageMood = 0;
      let quarterlyMoodCount = 0;
      let monthlyAverageEnergy = [];
      let monthlyEnergyTotal = 0;
      let monthlyEnergyCount = 0;
      let quarterlyAverageEnergy = 0;
      let quarterlyEnergyCount = 0;
      let monthlyAverageStressed = [];
      let monthlyStressedTotal = 0;
      let monthlyStressedCount = 0;
      let quarterlyAverageStressed = 0;
      let quarterlyStressedCount = 0;
      let monthlyAverageSore = [];
      let monthlySoreTotal = 0;
      let monthlySoreCount = 0;
      let quarterlyAverageSore = 0;
      let quarterlySoreCount = 0;
      let monthlyAverageHeart_rate = [];
      let monthlyHeart_rateTotal = 0;
      let monthlyHeart_rateCount = 0;
      let quarterlyAverageHeart_rate = 0;
      let quarterlyHeart_rateCount = 0;
      let monthlyAverageUrine_color = [];
      let monthlyUrine_colorTotal = 0;
      let monthlyUrine_colorCount = 0;
      let quarterlyAverageUrine_color = 0;
      let quarterlyUrine_colorCount = 0;

      let Readiness = await readinessSurvey.find({ userId: userId });

      let startDateString = req.query.date;
      let endDateString = req.query.end_date;
      let [startDay, startMonth, startYear] = startDateString.split("-");
      let [endDay, endMonth, endYear] = endDateString.split("-");

      let startDateObj = new Date(`${startYear}`, startMonth - 1, startDay);
      let endDateObj = new Date(`${endYear}`, endMonth - 1, endDay);

      let currentMonth = startDateObj.getMonth();
      let currentYear = startDateObj.getFullYear();

      while (
        currentYear < endDateObj.getFullYear() ||
        (currentYear === endDateObj.getFullYear() &&
          currentMonth <= endDateObj.getMonth())
      ) {
        let firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        let lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

        let monthString = (currentMonth + 1).toString().padStart(2, "0");
        let yearString = currentYear.toString();

        let monthStartDateString = `${monthString}-${yearString}`;

        let averageSleep = null;
        let averageMood = null;
        let averageEnergy = null;
        let averageStressed = null;
        let averageSore = null;
        let averageHeart_rate = null;
        let averageUrine_color = null;

        for (
          let date = firstDayOfMonth;
          date <= lastDayOfMonth;
          date.setDate(date.getDate() + 1)
        ) {
          let dateString = date
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .split("/")
            .join("-");

          let readinessData = Readiness.find((r) => r.date === dateString);

          if (readinessData) {
            let sleepValue = readinessData.Sleep;
            monthlySleepTotal += sleepValue;
            monthlySleepCount++;
          }

          if (readinessData) {
            let moodValue = readinessData.Mood;
            monthlyMoodTotal += moodValue;
            monthlyMoodCount++;
          }

          if (readinessData) {
            let energyValue = readinessData.Energy;
            monthlyEnergyTotal += energyValue;
            monthlyEnergyCount++;
          }

          if (readinessData) {
            let stressedValue = readinessData.Stressed;
            monthlyStressedTotal += stressedValue;
            monthlyStressedCount++;
          }

          if (readinessData) {
            let soreValue = readinessData.Sore;
            monthlySoreTotal += soreValue;
            monthlySoreCount++;
          }

          if (readinessData) {
            let heartRateValue = readinessData.Heart_rate;
            monthlyHeart_rateTotal += heartRateValue;
            monthlyHeart_rateCount++;
          }

          if (readinessData) {
            let urineColorValue = readinessData.Urine_color;
            monthlyUrine_colorTotal += urineColorValue;
            monthlyUrine_colorCount++;
          }
        }

        //==========[sleep]=========
        if (monthlySleepCount > 0) {
          averageSleep = (monthlySleepTotal / monthlySleepCount).toFixed(2);
          quarterlyAverageSleep += parseFloat(averageSleep);
          quarterlySleepCount++;
        }

        monthlyAverageSleep.push({
          startMonth: monthStartDateString,
          average: averageSleep,
          Month: currentMonth + 1,
        });

        monthlySleepTotal = 0;
        monthlySleepCount = 0;

        //==========[mood]==========
        if (monthlyMoodCount > 0) {
          averageMood = (monthlyMoodTotal / monthlyMoodCount).toFixed(2);
          quarterlyAverageMood += parseFloat(averageMood);
          quarterlyMoodCount++;
        }
        monthlyAverageMood.push({
          startMonth: monthStartDateString,
          average: averageMood,
          Month: currentMonth + 1,
        });
        monthlyMoodTotal = 0;
        monthlyMoodCount = 0;
        //========[energy]===========
        if (monthlyEnergyCount > 0) {
          averageEnergy = (monthlyEnergyTotal / monthlyEnergyCount).toFixed(2);
          quarterlyAverageEnergy += parseFloat(averageEnergy);
          quarterlyEnergyCount++;
        }
        monthlyAverageEnergy.push({
          startMonth: monthStartDateString,
          average: averageEnergy,
          Month: currentMonth + 1,
        });
        monthlyEnergyTotal = 0;
        monthlyEnergyCount = 0;
        //=======[stressed]===========
        if (monthlyStressedCount > 0) {
          averageStressed = (
            monthlyStressedTotal / monthlyStressedCount
          ).toFixed(2);
          quarterlyAverageStressed += parseFloat(averageStressed);
          quarterlyStressedCount++;
        }
        monthlyAverageStressed.push({
          startMonth: monthStartDateString,
          average: averageStressed,
          Month: currentMonth + 1,
        });
        monthlyStressedTotal = 0;
        monthlyStressedCount = 0;
        //=======[sore]===========
        if (monthlySoreCount > 0) {
          averageSore = (monthlySoreTotal / monthlySoreCount).toFixed(2);
          quarterlyAverageSore += parseFloat(averageSore);
          quarterlySoreCount++;
        }
        monthlyAverageSore.push({
          startMonth: monthStartDateString,
          average: averageSore,
          Month: currentMonth + 1,
        });
        monthlySoreTotal = 0;
        monthlySoreCount = 0;
        //=======[heart_rate]===========
        if (monthlyHeart_rateCount > 0) {
          averageHeart_rate = (
            monthlyHeart_rateTotal / monthlyHeart_rateCount
          ).toFixed(2);
          quarterlyAverageHeart_rate += parseFloat(averageHeart_rate);
          quarterlyHeart_rateCount++;
        }
        monthlyAverageHeart_rate.push({
          startMonth: monthStartDateString,
          average: averageHeart_rate,
          Month: currentMonth + 1,
        });
        monthlyHeart_rateTotal = 0;
        monthlyHeart_rateCount = 0;
        //===========[urine_color]=============
        if (monthlyUrine_colorCount > 0) {
          averageUrine_color = (
            monthlyUrine_colorTotal / monthlyUrine_colorCount
          ).toFixed(2);
          quarterlyAverageUrine_color += parseFloat(averageUrine_color);
          quarterlyUrine_colorCount++;
        }
        monthlyAverageUrine_color.push({
          startMonth: monthStartDateString,
          average: averageUrine_color,
          Month: currentMonth + 1,
        });

        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
      }

      let quarterlySleepAvg =
        quarterlySleepCount > 0
          ? (quarterlyAverageSleep / quarterlySleepCount).toFixed(2)
          : null;
      let quarterlyMoodAvg =
        quarterlyMoodCount > 0
          ? (quarterlyAverageMood / quarterlyMoodCount).toFixed(2)
          : null;
      let quarterlyEnergyAvg =
        quarterlyEnergyCount > 0
          ? (quarterlyAverageEnergy / quarterlyEnergyCount).toFixed(2)
          : null;
      let quarterlyStressedAvg =
        quarterlyStressedCount > 0
          ? (quarterlyAverageStressed / quarterlyStressedCount).toFixed(2)
          : null;
      let quarterlySoreAvg =
        quarterlySoreCount > 0
          ? (quarterlyAverageSore / quarterlySoreCount).toFixed(2)
          : null;
      let quarterlyHeart_rateAvg =
        quarterlyHeart_rateCount > 0
          ? (quarterlyAverageHeart_rate / quarterlyHeart_rateCount).toFixed(2)
          : null;
      let quarterlyUrine_colorAvg =
        quarterlyUrine_colorCount > 0
          ? (quarterlyAverageUrine_color / quarterlyUrine_colorCount).toFixed(2)
          : null;

      return res.status(200).send({
        status: true,
        message: "Success",
        monthlyAverageSleep: monthlyAverageSleep,
        quarterlyAverageSleep: quarterlySleepAvg,
        monthlyAverageMood: monthlyAverageMood,
        quarterlyAverageMood: quarterlyMoodAvg,
        monthlyAverageEnergy: monthlyAverageEnergy,
        quarterlyAverageEnergy: quarterlyEnergyAvg,
        monthlyAverageStressed: monthlyAverageStressed,
        quarterlyAverageStressed: quarterlyStressedAvg,
        monthlyAverageSore: monthlyAverageSore,
        quarterlyAverageSore: quarterlySoreAvg,
        monthlyAverageHeart_rate: monthlyAverageHeart_rate,
        quarterlyAverageHeart_rate: quarterlyHeart_rateAvg,
        monthlyAverageUrine_color: monthlyAverageUrine_color,
        quarterlyAverageUrine_color: quarterlyUrine_colorAvg,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//==================[Database Connectivity]==========================
mongoose
  .connect(
    "mongodb+srv://Cricket:4p8Pw0p31pioSP3d@cluster0.ayvqi4c.mongodb.net/Cricket-App"
  )
  .then(() => console.log("Database is connected successfully.."))
  .catch((Err) => console.log(Err));

app.use("/", router);

app.listen(port, function () {
  console.log(`Server is connected on Port ${port} ✅✅✅`);
});

// mongodb+srv://developerclumpcoder:nvoLLVn3YFf49lIC@cluster0.5sgifgr.mongodb.net/Cricket-App

//nvoLLVn3YFf49lIC
