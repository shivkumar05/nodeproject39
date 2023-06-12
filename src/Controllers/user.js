const axios = require("axios");
const bcrypt = require("bcrypt");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const tagModel = require("../Models/tagModel");
const otpModel = require("../Models/otpModel");
const userModel = require("../Models/userModel");
const testModel = require("../Models/Test_Model");
const profileModel = require("../Models/profile");
const wicketModel = require("../Models/wicketModel");
const battingModel = require("../Models/battingModel");
const bowlingModel = require("../Models/bowlingModel");
const bow_batModel = require("../Models/bow_batModel");
const routineModel = require("../Models/routineModel");
const myDrillModel = require("../Models/myDrillModel");
const invitesModel = require("../Models/invitesModel");
const workoutModel = require("../Models/workoutModel");
const feedBackModel = require("../Models/feedBackModel");
const categoryModel = require("../Models/categoryModel");
const academyProfile = require("../Models/academyProfile");
const SnCPlayerModel = require("../Models/SnCPlayerModel");
const Snc_coachModel = require("../Models/Snc_coachModel");
const powerTestModel = require("../Models/power_testModel");
const uploadDeviceModel = require("../Models/uploadDevice");
const assignedByModel = require("../Models/assignedByModel");
const testExportModel = require("../Models/testExportModel");
const SnCPlayerProfile = require("../Models/sncPlayerProfile");
const testCategoryModel = require("../Models/testCategoryModel");
const readinessSurveyModel = require("../Models/readinessSurvey");
const strengthTestModel = require("../Models/strength_testModel");
const academy_coachModel = require("../Models/academy_coachModel");
const recommendationModel = require("../Models/recommendationModel");
const scoreAndremarkModel = require("../Models/scoreAndremarkModel");
const session_exerciseModel = require("../Models/session_exerciseModel");

//==========================[user register]==============================
const createUser = async function (req, res) {
  try {
    let data = req.body;
    let {
      name,
      phone,
      join_as,
      signup_as,
      email,
      password,
      academy_name,
      academy_id,
      coach_id,
      snc_id,
    } = data;

    if (await userModel.findOne({ phone: phone }))
      return res.status(400).send({ message: "Phone already exist" });

    if (await userModel.findOne({ email: email }))
      return res.status(400).send({ message: "Email already exist" });

    const encryptedPassword = bcrypt.hashSync(password, 12);
    req.body["password"] = encryptedPassword;

    var token = jwt.sign(
      {
        userId: userModel._id,
      },
      "project"
    );
    data.token = token;

    let savedData = await userModel.create(data);
    res.status(201).send({
      status: true,
      msg: "User Register successfull",
      data: {
        _id: savedData._id,
        name: savedData.name,
        phone: savedData.phone,
        join_as: savedData.join_as,
        email: savedData.email,
        password: savedData.password,
        signup_as: savedData.signup_as,
        academy_id: savedData.academy_id,
        coach_id: savedData.coach_id,
        snc_id: savedData.snc_id,
      },
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//====================[Create Feedback]==========================
const createFeedback = async function (req, res) {
  try {
    let userid = req.params.userId;
    let dataArr = req.body;
    let messaging = admin.messaging();

    let feedbackArr = [];

    for (let i = 0; i < dataArr.length; i++) {
      let {
        drill_id,
        video_id,
        userId,
        timePosition,
        type,
        message,
        duration,
        file,
      } = dataArr[i];

      dataArr[i].userId = userid;

      let feedback = await feedBackModel.create(dataArr[i]);
      feedbackArr.push(feedback);

      if (dataArr[i].video_id) {
        var videoIds = dataArr[i].video_id;
      }
      if (dataArr[i].drill_id) {
        var drillIds = dataArr[i].drill_id;
      }
    }

    if (videoIds) {
      var videos = await uploadDeviceModel.findById({
        _id: videoIds,
      });

      let message = {
        data: {
          userId: videos.userId,
          topic: "Player",
          event: "FEEDBACK_CREATED",
          title: "New Feedback Created.",
          body: videos.title,
          data: JSON.stringify({
            userId: videos.userId,
            topic: "Player",
            event: "FEEDBACK_CREATED",
            title: "New Feedback Created.",
            body: videos.title,
            Videos: JSON.stringify(videos),
          }),
        },
      };

      messaging
        .sendToTopic("Player", message)
        .then((response) => {
          return res.status(201).send({
            status: true,
            message: "Notification sent successfully!",
            data: feedbackArr,
          });
        })
        .catch((error) => {
          console.error("Error sending notification:", error);
          return res
            .status(500)
            .send({ status: false, message: "Error sending notification." });
        });
    } else if (drillIds) {
      var drills = await myDrillModel.findById({
        _id: drillIds,
      });

      let message = {
        data: {
          userId: drills.userId,
          topic: "Player",
          event: "FEEDBACK_CREATED",
          title: "New Feedback Created.",
          body: drills.title,
          data: JSON.stringify({
            userId: drills.userId,
            topic: "Player",
            event: "FEEDBACK_CREATED",
            title: "New Feedback Created.",
            body: drills.title,
            Videos: JSON.stringify(drills),
          }),
        },
      };

      messaging
        .sendToTopic("Player", message)
        .then((response) => {
          return res.status(201).send({
            status: true,
            message: "Notification sent successfully!",
            data: feedbackArr,
          });
        })
        .catch((error) => {
          console.error("Error sending notification:", error);
          return res
            .status(500)
            .send({ status: false, message: "Error sending notification." });
        });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========================[user login]==============================
const userLogin = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;

    let user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(400).send({
        status: false,
        msg: "Email and Password is Invalid",
      });
    }

    let compared = await bcrypt.compare(password, user.password);
    if (!compared) {
      return res.status(400).send({
        status: false,
        message: "Your password is invalid",
      });
    }

    let UserProfile = await profileModel
      .findOne({ userId: user._id })
      .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    let type = UserProfile ? "Yes" : "No";
    user.user_details_submit = type;

    var token = jwt.sign(
      {
        userId: user._id,
      },
      "project"
    );

    let updateToken = await userModel.findByIdAndUpdate(
      { _id: user._id },
      { token },
      { new: true }
    );
    user.token = updateToken.token;

    let progress = await battingModel
      .findOne({ userId: user._id })
      .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    let type1 = progress ? true : false;

    let progress2 = await bowlingModel
      .findOne({ userId: user._id })
      .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    let type2 = progress2 ? true : false;

    let progress3 = await wicketModel
      .findOne({ userId: user._id })
      .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    let type3 = progress3 ? true : false;

    let Questions = await bow_batModel
      .findOne({ userId: user._id })
      .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    user.userQuestion = Questions;

    return res.status(200).send({
      status: true,
      msg: "User login successfull",
      data: {
        userId: user._id,
        name: user.name,
        phone: user.phone,
        join_as: user.join_as,
        email: user.email,
        password: user.password,
        signup_as: user.signup_as,
        snc_id: user.snc_id,
        academy_id: user.academy_id,
        coach_id: user.coach_id,
        user_details_submit: user.user_details_submit,
        userProfile: UserProfile,
        userQuestion: user.userQuestion,
        userBattingProgress: type1,
        userBowlingProgress: type2,
        userWicketProgress: type3,
        token: updateToken.token,
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//=============[Get All Users]=============================
const getUsers = async function (req, res) {
  try {
    let data = req.body;
    let user = await academy_coachModel.find();

    return res.status(201).send({
      status: true,
      msg: "Get All Users",
      data: user,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//=============[ get contact ]================
const getContact = async function (req, res) {
  try {
    let email = req.body.email;

    let user = await userModel.findOne({ email: email });

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
};

//==========================[Update Password]=================
const updatePassword = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;

    let user2 = await userModel.findOne({ email: email });

    const encryptedPassword = bcrypt.hashSync(password, 12);
    data.password = encryptedPassword;

    let user = await userModel.findOneAndUpdate(
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
};

//===========================[create bat_bow]===============================
const bow_bat = async function (req, res) {
  try {
    let data = req.body;
    let userid = req.params.userId;

    let {
      bat_hand,
      bowl_hand,
      batting_order,
      bowling_order,
      bowler_skill,
      wicket_keeper,
      userId,
    } = data;
    data.userId = userid;

    const actionCreated = await bow_batModel.create(data);

    return res.status(201).send({
      status: true,
      message: "Success",
      data: actionCreated,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========================[Update batting_bowling]======================
let updateBat_Bow = async function (req, res) {
  try {
    let data = req.body;
    let userid = req.params.userId;

    let user = await bow_batModel.findOneAndUpdate(
      { userId: userid },
      {
        $set: {
          bat_hand: data.bat_hand,
          bowl_hand: data.bowl_hand,
          batting_order: data.batting_order,
          bowling_order: data.bowling_order,
          bowler_skill: data.bowler_skill,
          wicket_keeper: data.wicket_keeper,
        },
      },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      message: "Batting Bowling Updated Successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========================[progress screen (batting)]==============================
const createBattings = async function (req, res) {
  try {
    let data = req.body;

    let userid = req.params.userId;

    let {
      userId,
      matches,
      runs,
      faced,
      strike_rate,
      fifty_hundred,
      average,
      level,
      out,
    } = data;
    data.userId = userid;

    const battingCreated = await battingModel.create(data);

    return res.status(201).send({
      status: true,
      message: "Battings created successfully",
      data: battingCreated,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========================[Update Batting]======================
let updateBatting = async function (req, res) {
  try {
    let data = req.body;
    let userid = req.params.userId;

    let user = await battingModel.findOneAndUpdate(
      { userId: userid },
      {
        $set: {
          matches: data.matches,
          runs: data.runs,
          faced: data.faced,
          strike_rate: data.strike_rate,
          fifty_hundred: data.fifty_hundred,
          average: data.average,
          level: data.level,
          out: data.out,
        },
      },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      message: "Batting Data Updated Successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========================[progress screen (bowling)]==============================
const createBowlings = async function (req, res) {
  try {
    let data = req.body;
    let userid = req.params.userId;

    let {
      userId,
      matches,
      overs,
      wickets,
      conced,
      average,
      economy,
      threeW_fiveW,
      wicket_matche,
      level,
    } = data;
    data.userId = userid;

    const bowlingCreated = await bowlingModel.create(data);

    return res.status(201).send({
      status: true,
      message: "Bowling created successfully",
      data: bowlingCreated,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========================[Update Bowling]======================
let updateBowling = async function (req, res) {
  try {
    let data = req.body;
    let userid = req.params.userId;

    let user = await bowlingModel.findOneAndUpdate(
      { userId: userid },
      {
        $set: {
          matches: data.matches,
          overs: data.overs,
          wickets: data.wickets,
          conced: data.conced,
          average: data.average,
          economy: data.economy,
          threeW_fiveW: data.threeW_fiveW,
          wicket_matche: data.wicket_matche,
          level: data.level,
        },
      },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      message: "Bowling Data Updated Successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========================[progress screen (wicket)]==============================
const createWickets = async function (req, res) {
  try {
    let data = req.body;
    let userid = req.params.userId;

    var { userId, level, match, catches, stumps, runout } = data;
    data.userId = userid;

    const wicketCreated = await wicketModel.create(data);
    return res.status(201).send({
      status: true,
      message: "Wicket created successfully",
      data: wicketCreated,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========================[Update Wicket]======================
let updateWicket = async function (req, res) {
  try {
    let data = req.body;
    let userid = req.params.userId;

    let updateWickets = await wicketModel.findOneAndUpdate(
      { userId: userid },
      {
        $set: {
          level: data.level,
          match: data.match,
          catches: data.catches,
          stumps: data.stumps,
          runout: data.runout,
        },
      },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      message: "Wicket Data Updated Successfully",
      data: updateWickets,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========================[create category]==============================
const category = async function (req, res) {
  try {
    let data = req.body;

    let category = await categoryModel.create(data);
    let obj = {};
    obj["category_id"] = category.category_id;
    obj["category_name"] = category.category_name;

    return res.status(201).send({
      message: "category created successfully",
      data: obj,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========================[Get Category]==============================
const getCategory = async function (req, res) {
  try {
    let body = req.body;

    const Category = await categoryModel
      .find(body)
      .select({ category_id: 1, category_name: 1, _id: 0 });

    return res.status(200).send({
      status: true,
      message: "success",
      data: Category,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========================[create tag]==============================
const tag = async function (req, res) {
  try {
    let data = req.body;

    let tags = await tagModel.create(data);
    let obj = {};
    obj["tag_id"] = tags.tag_id;
    obj["tag"] = tags.tag;
    obj["category_id"] = tags.category_id;
    obj["category_name"] = tags.category_name;

    return res.status(201).send({
      message: "tags created successfully",
      data: obj,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//============================[Get Tag]========================================
const getTags = async function (req, res) {
  try {
    let body = req.body;

    const Tag = await tagModel
      .find(body)
      .select({ tag_id: 1, tag: 1, category_id: 1, category_name: 1, _id: 0 });

    return res.status(200).send({
      status: true,
      data: Tag,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//============================[Create Routine]======================================
let admin = require("firebase-admin");
let serviceAccount = require("../google-services.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const createRoutine = async function (req, res) {
  try {
    let data = req.body;
    let userId = req.params.userId;

    let {
      drills,
      date,
      time,
      category,
      drill_id,
      repetation,
      sets,
      comment,
      routineId,
      isCompleted,
      end_date,
    } = data;

    let group = data.drill_id ? 1 : 1;

    let messaging = admin.messaging();
    let allRoutines = await routineModel.find({ userId }).lean();

    for (let i = 0; i < allRoutines.length; i++) {
      if (
        data.date === allRoutines[i].date &&
        data.time === allRoutines[i].time
      ) {
        return res.status(400).send({
          status: false,
          message: "You already have a routine set for this time",
        });
      }
    }

    let startDateString = data.date;
    let endDateString = data.end_date;
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
      dateArray.push({ date: dateString, complete: false });
    }

    if (dateArray.length === 0) {
      return res.status(400).send({
        status: false,
        message: "No valid dates in range",
      });
    }

    let newRoutine = {
      userId,
      drills,
      date,
      time,
      category,
      drill_id,
      repetation,
      sets,
      comment,
      routineId,
      isCompleted,
      end_date,
      group,
      dates: dateArray,
    };

    let CreateRoutine = await routineModel.create(newRoutine);
    let message = {
      data: {
        userId: CreateRoutine.userId,
        topic: "Player",
        event: "ROUTINE_CREATED",
        title: "New Routine Created.",
        body: CreateRoutine.drills,
        data: JSON.stringify({
          userId: CreateRoutine.userId,
          topic: "Player",
          event: "ROUTINE_CREATED",
          title: "New Routine Created.",
          body: CreateRoutine.drills,
          routine: JSON.stringify(CreateRoutine),
        }),
      },
    };

    messaging
      .sendToTopic("Player", message)
      .then((response) => {
        return res.status(201).send({
          status: true,
          message: "Notification sent successfully!",
          data: {
            userId: CreateRoutine.userId,
            topic: "Player",
            event: "ROUTINE_CREATED",
            title: "New Routine Created.",
            body: CreateRoutine.drills,
            routine: {
              _id: CreateRoutine._id,
              userId: CreateRoutine.userId,
              drills: CreateRoutine.drills,
              date: CreateRoutine.date,
              time: CreateRoutine.time,
              category: CreateRoutine.category,
              repetation: CreateRoutine.repetation,
              sets: CreateRoutine.sets,
              comment: CreateRoutine.comment,
              drill_id: CreateRoutine.drill_id,
              isCompleted: CreateRoutine.isCompleted,
              end_date: CreateRoutine.end_date,
              group: CreateRoutine.group,
              dates: dateArray,
            },
            response,
          },
        });
      })
      .catch((error) => {
        console.error("Error sending notification:", error);
        return res
          .status(500)
          .send({ status: false, message: "Error sending notification." });
      });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//=======================[Get Routine Count]=======================
const getRoutineCount = async function (req, res) {
  try {
    let queryDate = req.query.date;
    let userId = req.params.userId;

    let routines = await routineModel.find({ userId: userId });

    let allDates = [];
    let results = [];

    for (var i = 0; i < routines.length; i++) {
      var routine = routines[i];
      allDates = allDates.concat(routine.dates);
    }

    let uniqueDates = Array.from(new Set(allDates.map((date) => date.date)));
    if (queryDate) {
      uniqueDates = uniqueDates.filter((date) => date === queryDate);
    }

    for (let i = 0; i < uniqueDates.length; i++) {
      let date = uniqueDates[i];
      let routinesOnDate = routines.filter((routine) =>
        routine.dates.find((d) => d.date === date)
      );

      let groupIds = Array.from(
        new Set(routinesOnDate.map((r) => r.group))
      ).sort();

      for (let j = 0; j < groupIds.length; j++) {
        let groupId = groupIds[j];
        let routinesInGroup = routinesOnDate.filter(
          (routine) => routine.group === groupId
        );

        let categoryIds = Array.from(
          new Set(routinesInGroup.map((r) => r.category))
        ).sort();

        for (let k = 0; k < categoryIds.length; k++) {
          let categoryId = categoryIds[k];
          let routinesInCategory = routinesInGroup.filter(
            (routine) => routine.category === categoryId
          );

          let completedRoutines = routinesInCategory.filter((routine) =>
            routine.dates.find((d) => d.date === date && d.complete === true)
          );

          let repsDone = completedRoutines.reduce(
            (total, routine) => total + routine.repetation,
            0
          );
          let setsDone = completedRoutines.reduce(
            (total, routine) => total + routine.sets,
            0
          );

          results.push({
            group: groupId,
            category: categoryId,
            noOfRoutines: routinesInCategory.length,
            completedRoutines: completedRoutines.length,
            expected_reps: routinesInCategory.reduce(
              (total, routine) => total + routine.repetation,
              0
            ),
            expected_sets: routinesInCategory.reduce(
              (total, routine) => total + routine.sets,
              0
            ),
            reps_done: repsDone,
            sets_done: setsDone,
          });
        }
      }
    }

    if (results.length > 0) {
      return res.status(200).send({
        status: true,
        data: results,
      });
    } else {
      return res.status(200).send({
        status: true,
        data: [],
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========================[Calendar Counts ]===========================
const getCalendarCount = async function (req, res) {
  try {
    var userId = req.params.userId;
    var start_date = moment(req.query.date, "DD-MM-YYYY");
    var end_date = moment(req.query.end_date, "DD-MM-YYYY");
    var categories = {};

    routineModel.find(
      {
        userId: userId,
      },
      function (err, routines) {
        if (err) {
          res.status(500).send({ error: err });
        } else {
          routines.forEach(function (routine) {
            routine.dates.forEach(function (date) {
              if (
                moment(date.date, "DD-MM-YYYY").isBetween(
                  start_date,
                  end_date,
                  null,
                  "[]"
                )
              ) {
                if (!categories[date.date]) {
                  categories[date.date] = [routine.category];
                } else {
                  categories[date.date].push(routine.category);
                }
              }
            });
          });

          var result = [];
          for (var date in categories) {
            result.push({ date: date, categories: categories[date] });
          }
          return res.status(200).send({
            status: true,
            message: "Categories fetched successfully",
            data: result,
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//========================[Update Routine]==================
const updateRoutine = async function (req, res) {
  try {
    let routineId = req.body.routineId;

    let Routine = await routineModel.findById({ _id: routineId });

    if (Routine.isCompleted == false) {
      var routines = await routineModel.findByIdAndUpdate(
        { _id: routineId },
        { $set: { isCompleted: true } },
        { new: true }
      );
    }
    if (Routine.isCompleted == true) {
      var routines = await routineModel.findByIdAndUpdate(
        { _id: routineId },
        { $set: { isCompleted: false } },
        { new: true }
      );
    }

    return res.status(200).send({
      status: true,
      message: "Routine Updated Successfully",
      isCompleted: routines.isCompleted,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//=====================[Get Routine]==================================
const getRoutine = async function (req, res) {
  try {
    let queryDate = req.query.date;
    let userId = req.params.userId;

    let query = {};
    if (queryDate) {
      query.dates = { $elemMatch: { date: queryDate } };
    }

    let routines = await routineModel
      .find({ userId: userId, ...query })
      .sort({ date: 1 });

    if (routines.length > 0) {
      return res.status(200).send({
        status: true,
        message: "The routines are currently active",
        data: routines,
      });
    } else {
      return res.status(200).send({
        status: true,
        message: "No routines are currently active",
        data: [],
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==============================[Delete Routine]=========================================
const deleteRoutine = async function (req, res) {
  try {
    let routineId = req.query.routineId;

    let updateRoutine = await routineModel.findByIdAndDelete({
      _id: routineId,
    });

    res.status(200).send({ status: true, message: "sucessfully deleted" });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//============================[Get New Routine]===================================
const getNewRoutine = async function (req, res) {
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

    var allRoutines = await routineModel
      .find({
        userId: userid,
        $or: [filter],
      })
      .lean();

    let incompleteRoutines = allRoutines.filter((routine) => {
      return routine.dates.every((date) => !date.complete);
    });

    for (var i = 0; i < incompleteRoutines.length; i++) {
      let drills = await myDrillModel.find({
        routine_id: incompleteRoutines[i]._id,
      });
      incompleteRoutines[i].allDrill = drills;
    }

    return res.status(200).send({
      status: true,
      message: "success",
      data: incompleteRoutines,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//========================[Update Drill]=========================================
const updateDrill = async function (req, res) {
  try {
    let drillId = req.body.drillId;

    let drills = await myDrillModel.findByIdAndUpdate(
      { _id: drillId },
      { $set: { isCompleted: true } },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      message: "Drill Updated Successfully",
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//===================[Get Past Routines]======================================
const getPastRoutine = async function (req, res) {
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

    let routines = await routineModel
      .find({ userId: userid, $or: [filter] })
      .lean();

    let completedRoutines = routines.filter((routine) => {
      return routine.dates?.every((date) => date.complete);
    });

    for (var j = 0; j < completedRoutines.length; j++) {
      let allDrills = await myDrillModel.find({
        routine_id: completedRoutines[j]._id,
      });
      completedRoutines[j].allDrill = allDrills;
      for (var i = 0; i < allDrills.length; i++) {
        let userRecommendation = await recommendationModel
          .find({ userId: allDrills[i].userId })
          .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        completedRoutines[j].recommendation = userRecommendation;

        let userFeedback = await feedBackModel
          .find({ drill_id: allDrills[i]._id })
          .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        completedRoutines[j].feedback = userFeedback;

        let userScoreAndRemark = await scoreAndremarkModel
          .find({ drill_id: allDrills[i]._id })
          .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        completedRoutines[j].ScoreAndRemark = userScoreAndRemark;
      }
    }
    return res.status(200).send({
      status: true,
      message: "success",
      data: completedRoutines,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//==========================[Get Ongoing Routine]====================================
const getOngoingRoutine = async function (req, res) {
  try {
    let data = req.query;
    let userId = req.params.userId;

    let { category, title } = data;

    let filter = {};

    if (category) {
      filter.category = category;
    }
    if (title) {
      filter.title = title;
    }
    let routines = await routineModel.find({ userId, $or: [filter] }).lean();

    let incompleteRoutines = routines.filter((routine) => {
      let allDatesCompleted = routine.dates.every((date) => date.complete);
      let allDatesIncomplete = routine.dates.every((date) => !date.complete);
      return !allDatesCompleted && !allDatesIncomplete;
    });
    for (var i = 0; i < incompleteRoutines.length; i++) {
      console.log(incompleteRoutines[i].drill_id, "aaa");
      let drills = await myDrillModel.find({
        routine_id: incompleteRoutines[i]._id,
      });
      incompleteRoutines[i].allDrill = drills;
    }
    return res.status(200).send({
      status: true,
      message: "success",
      data: incompleteRoutines,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//************************************[ Acedemy/Coach Section]*************************************
//==========================[Acedmy/coach register]================================================
const createAcademy = async function (req, res) {
  try {
    let data = req.body;
    let { email, phone, join_as, academy_name, password } = data;

    if (await academy_coachModel.findOne({ phone: phone }))
      return res.status(400).send({ message: "Phone already exist" });

    if (await academy_coachModel.findOne({ email: email }))
      return res.status(400).send({ message: "Email already exist" });

    const encryptedPassword = bcrypt.hashSync(password, 12);
    req.body["password"] = encryptedPassword;

    let savedData = await academy_coachModel.create(data);
    res.status(201).send({ status: true, data: savedData });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//==========================[Acedmy/coach login]==============================
const AcademyLogin = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;

    let academy = await academy_coachModel.findOne({ email: email });

    if (!academy) {
      return res.status(400).send({
        status: false,
        msg: "Email and Password is Invalid",
      });
    }

    let compared = await bcrypt.compare(password, academy.password);
    if (!compared) {
      return res.status(400).send({
        status: false,
        message: "Your password is invalid",
      });
    }

    let token = jwt.sign(
      {
        userId: academy._id,
      },
      "project"
    );

    let AcademyProfile = await academyProfile
      .findOne({ userId: academy._id })
      .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    let type2 = AcademyProfile ? true : false;
    academy.academy_details_submit = type2;

    return res.status(200).send({
      status: true,
      msg: "User login successfull",
      data: {
        userId: academy._id,
        phone: academy.phone,
        join_as: academy.join_as,
        academy_name: academy.academy_name,
        email: academy.email,
        password: academy.password,
        academy_details_submit: academy.academy_details_submit,
        token: token,
        userProfile: AcademyProfile,
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

// =============================[Get AssignedBy Drills]============================================
const getAssignedByDrills = async function (req, res) {
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

    const assignedBydrills = await assignedByModel
      .find({ assignedBy: userid, $or: [data, filter] })
      .select({ createdAt: 0, updatedAt: 0, __v: 0 });

    let arr = [];
    for (let i = 0; i < assignedBydrills.length; i++) {
      arr.push(assignedBydrills[i]);
    }

    return res.status(200).send({
      status: true,
      message: "success",
      data: arr,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//========================[Get Personal Details]==================================
let getPersonal = async function (req, res) {
  try {
    let userid = req.params.userId;
    let user = await userModel.findById({ _id: userid });

    let UserProfile = await profileModel
      .findOne({ userId: user._id })
      .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    let Questions = await bow_batModel
      .findOne({ userId: user._id })
      .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    user.userQuestion = Questions;

    return res.status(200).send({
      status: true,
      msg: "User Personal Details",
      data: {
        userProfile: UserProfile,
        userQuestion: user.userQuestion,
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//=========================[Get User Progress ]=======================================
let getProgress = async function (req, res) {
  try {
    let userid = req.params.userId;
    let user = await userModel.findById({ _id: userid });

    let batting = await battingModel
      .findOne({ userId: user._id })
      .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0, userId: 0 });
    let bowling = await bowlingModel
      .findOne({ userId: user._id })
      .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0, userId: 0 });
    let wicket = await wicketModel
      .findOne({ userId: user._id })
      .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0, userId: 0 });

    return res.status(200).send({
      status: true,
      msg: "User Progress Details",
      data: {
        batting: batting,
        bowling: bowling,
        wicket: wicket,
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//=================================[Get All Coach's Users]==============================
let getAllUsers = async function (req, res) {
  try {
    let userid = req.params.userId;

    let allUser = await userModel.find({ academy_id: userid }).lean();

    for (let i = 0; i < allUser.length; i++) {
      let userProfile = await profileModel
        .findOne({ userId: allUser[i]._id })
        .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
      allUser[i].userProfile = userProfile;
    }

    return res.status(200).send({
      status: true,
      msg: "Get All User's",
      data: allUser,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========================[Update Coach Password]=================
const updateCoachPassword = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;

    let user2 = await academy_coachModel.findOne({ email: email });

    const encryptedPassword = bcrypt.hashSync(password, 12);
    data.password = encryptedPassword;

    let user = await academy_coachModel.findOneAndUpdate(
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
};

//=============[ get contact for coach ]=========================
const getContactCoach = async function (req, res) {
  try {
    let email = req.body.email;

    let user = await academy_coachModel.findOne({ email: email });

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
};

//==========================[Update category for Routine]==============
const updateCategoryRoutine = async function (req, res) {
  try {
    let data = req.query;
    let userId = req.params.userId;

    let { date, category, routineId } = data;

    let filter = {};

    if (date) {
      filter.date = date;
    }
    if (category) {
      filter.category = category;
    }
    if (routineId) {
      filter.routineId = routineId;
    }

    var routine = await routineModel.findById({
      _id: data.routineId,
      userId: userId,
    });

    let allDates = routine.dates;

    for (var i = 0; i < allDates.length; i++) {
      if (allDates[i].date === date) {
        var updateRoutine = await routineModel.findByIdAndUpdate(
          { _id: data.routineId },
          { category: data.category },
          { new: true }
        );
      }
    }

    return res.status(200).send({
      status: true,
      message: "Category Updated Successfully for Routines",
      data: updateRoutine,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//==========================[Create Score And Remarks]=================================
const scoreAndremark = async function (req, res) {
  try {
    let data = req.body;
    let userid = req.params.userId;

    let { userId, drill_id, remarks, score } = data;
    data.userId = userid;

    const scoreAndremarkCreated = await scoreAndremarkModel.create(data);

    return res.status(201).send({
      status: true,
      message: "Success",
      data: scoreAndremarkCreated,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//==========================[Create Routine for Player]==============================
const createPlayerRoutine = async function (req, res) {
  try {
    let data = req.body;
    let userId = req.params.userId;
    const category = 0;

    var { drills, date, time, end_date, drill_id } = data;
    data.userId = userId;
    data.category = category;

    var group = data.drill_id
      ? data.group
      : null || data.group
      ? data.group
      : null;

    let messaging = admin.messaging();
    let allRoutines = await routineModel.find({ userId }).lean();

    for (let i = 0; i < allRoutines.length; i++) {
      if (
        data.date === allRoutines[i].date &&
        data.time === allRoutines[i].time
      ) {
        return res.status(400).send({
          status: false,
          message: "You already have a routine set for this time",
        });
      }
    }

    let startDateString = data.date;
    let endDateString = data.end_date;
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
      dateArray.push({ date: dateString, complete: false });
    }
    if (dateArray.length === 0) {
      return res.status(400).send({
        status: false,
        message: "No valid dates in range",
      });
    }

    let newRoutine = {
      userId,
      drills,
      date,
      time,
      end_date,
      category,
      group,
      dates: dateArray,
    };

    let playerRoutine = await routineModel.create(newRoutine);

    let message = {
      data: {
        userId: playerRoutine.userId,
        topic: "Player",
        event: "ROUTINE_CREATED",
        title: "New Routine Created.",
        body: playerRoutine.drills,
        data: JSON.stringify({
          userId: playerRoutine.userId,
          topic: "Player",
          event: "ROUTINE_CREATED",
          title: "New Routine Created.",
          body: playerRoutine.drills,
          routine: JSON.stringify(playerRoutine),
        }),
      },
    };

    messaging
      .sendToTopic("Player", message)
      .then((response) => {
        return res.status(201).send({
          status: true,
          message: "Notification sent successfully!",
          data: {
            userId: playerRoutine.userId,
            topic: "Player",
            event: "ROUTINE_CREATED",
            title: "New Routine Created.",
            body: playerRoutine.drills,
            routine: {
              _id: playerRoutine._id,
              userId: playerRoutine.userId,
              drills: playerRoutine.drills,
              date: playerRoutine.date,
              time: playerRoutine.time,
              category: playerRoutine.category,
              isCompleted: playerRoutine.isCompleted,
              end_date: playerRoutine.end_date,
              group: playerRoutine.group,
              dates: dateArray,
            },
            response,
          },
        });
      })
      .catch((error) => {
        console.error("Error sending notification:", error);
        return res
          .status(500)
          .send({ status: false, message: "Error sending notification." });
      });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//==============================[Get New Drills]=================================================
const getNewDrill = async function (req, res) {
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

    let getNew = await myDrillModel.find({
      userId: userid,
      isCompleted: false,
      $or: [filter],
    });

    return res.status(201).send({
      status: true,
      message: "Success",
      data: getNew,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//==============================[Get Ongoing Drills]=================================================
const getOngoingDrill = async function (req, res) {
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

    let getOngoing = await myDrillModel.find({
      userId: userid,
      isCompleted: true,
      $or: [filter],
    });

    return res.status(201).send({
      status: true,
      message: "Success",
      data: getOngoing,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//=============================[Get Past Drills]============================
const getPastDrill = async function (req, res) {
  try {
    let data = req.query;
    let userId = req.params.userId;

    let { category, title } = data;

    let filter = {};

    if (category) {
      filter.category = category;
    }
    if (title) {
      filter.title = title;
    }

    let getPast = await myDrillModel
      .find({ userId: userId, isCompleted: true, $or: [filter] })
      .lean();

    let arr = [];

    for (var i = 0; i < getPast.length; i++) {
      data.videoId = getPast[i]._id;
      arr.push(data.videoId);
    }
    let arr2 = [];
    for (let i = 0; i < getPast.length; i++) {
      arr2.push(getPast[i]);
    }

    for (let i = 0; i < arr2.length; i++) {
      let userRecommendation = await recommendationModel
        .find({ userId: arr2[i].userId })
        .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
      arr2[i].recommendation = userRecommendation;
    }

    for (let i = 0; i < arr2.length; i++) {
      let userFeedback = await feedBackModel
        .find({ drill_id: arr2[i]._id })
        .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
      arr2[i].feedback = userFeedback;
    }

    for (let i = 0; i < arr2.length; i++) {
      let userScoreAndRemark = await scoreAndremarkModel
        .find({ drill_id: arr2[i]._id })
        .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
      arr2[i].ScoreAndRemark = userScoreAndRemark;
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
};

//========================[Update Date wise Routine]==================
const updateDate = async function (req, res) {
  try {
    let routineId = req.body.routineId;
    let { date, complete } = req.body;

    let routine = await routineModel.findById(routineId);

    let allDates = routine.dates;
    let updatedDates = allDates.map((d) => {
      if (d.date === date) {
        return {
          date: d.date,
          complete: complete,
        };
      } else {
        return d;
      }
    });

    let updatedRoutine = await routineModel.findByIdAndUpdate(
      { _id: routineId },
      { dates: updatedDates },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      message: "Routine updated successfully",
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==============[Update Complete for date and categories]====================
const updateComplete = async function (req, res) {
  try {
    let date = req.body.date;
    let category = req.body.category;
    let userId = req.params.userId;
    let group = req.body.group;

    let objectsToUpdate = await routineModel.find({ userId, category, group });

    objectsToUpdate.forEach(async (object) => {
      object.dates.forEach((d) => {
        if (d.date === date) {
          d.complete = true;
        }
      });
      await object.save();
    });

    return res.status(200).send({
      status: true,
      message: "Routine Updated Successfully",
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//===============[create otp]==============
const createOTP = async function (req, res) {
  try {
    const SMS_GATEWAY_API_KEY = "q1mabmkp";
    const SMS_GATEWAY_API_SECRET = "7xUZb5cN";
    const SMS_GATEWAY_SENDER = "IELEVR";
    const SMS_GATEWAY_ENDPOINT = "http://smpp.paasoo.com/json";

    const { phone } = req.body;
    const existingOTP = await otpModel.findOne({ phone });

    if (existingOTP) {
      let newOTP = Math.floor(1000 + Math.random() * 9000);
      let timestamp = moment().unix();
      let message = `${newOTP} is your verification OTP for signup into ElevareSport App. Thank you.`;
      let url = `${SMS_GATEWAY_ENDPOINT}?key=${SMS_GATEWAY_API_KEY}&secret=${SMS_GATEWAY_API_SECRET}&from=${SMS_GATEWAY_SENDER}&to=${phone}&text=${message}`;

      try {
        await axios.get(url);
        let updatedOTP = await otpModel.findOneAndUpdate(
          { phone },
          { otp: newOTP, timestamp },
          { new: true }
        );

        return res.status(200).send({
          status: true,
          message: "OTP updated successfully.",
          data: updatedOTP,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).send({
          status: false,
          message: "Failed to send OTP message.",
        });
      }
    } else {
      let OTP = Math.floor(1000 + Math.random() * 9000);
      let timestamp = moment().unix();
      let message = `${OTP} is your verification OTP for signup into ElevareSport App. Thank you.`;
      let url = `${SMS_GATEWAY_ENDPOINT}?key=${SMS_GATEWAY_API_KEY}&secret=${SMS_GATEWAY_API_SECRET}&from=${SMS_GATEWAY_SENDER}&to=${phone}&text=${message}`;

      try {
        await axios.get(url);
        let otpGenerate = await otpModel.create({
          phone,
          otp: OTP,
          timestamp,
        });

        return res.status(201).send({
          status: true,
          message: "OTP generated successfully.",
          data: otpGenerate,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).send({
          status: false,
          message: "Failed to send OTP message.",
        });
      }
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==============[Verify OTP]==================
const verifyOTP = async function (req, res) {
  try {
    let phone = req.body.phone;
    let otp = req.body.otp;

    let numberExist = await otpModel.findOne({ phone });
    if (!numberExist) {
      return res
        .status(400)
        .send({ success: false, message: "Phone number not found" });
    }

    if (numberExist.otp != otp) {
      return res.status(400).send({ success: false, message: "Invalid OTP" });
    }

    let timestamp = numberExist.timestamp;
    let currentTime = moment().unix();
    if (currentTime - timestamp > 300) {
      return res.status(400).send({ success: false, message: "OTP expired" });
    }
    res.status(200).send({ success: true, message: "OTP verified" });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==================[Create invites]==================
//Sports App Download Link : "https://elevaresport.page.link/sFn6WJZWNjwPoroQ9"
const createInvites = async function (req, res) {
  try {
    const SMS_GATEWAY_API_KEY = "q1mabmkp";
    const SMS_GATEWAY_API_SECRET = "7xUZb5cN";
    const SMS_GATEWAY_SENDER = "IELEVR";
    const SMS_GATEWAY_ENDPOINT = "http://smpp.paasoo.com/json";

    let data = req.body;
    let userId = req.params.userId;

    let feedbackArr = [];

    for (let i = 0; i < data.length; i++) {
      let { name, phone, email, dob, coach_id, url } = data[i];

      let urls = encodeURIComponent(url);

      let message = `Hey Cricketer! Your coach has added you to their squad in the ElevareSport app. Please click on ${urls} to download the ElevareSport app and JOIN your coach. A world class and scientific coaching awaits you. Join the squad and improve performance in cricket. ElevareSport! Coach's favourite app.`;

      let sendMessage = `${SMS_GATEWAY_ENDPOINT}?key=${SMS_GATEWAY_API_KEY}&secret=${SMS_GATEWAY_API_SECRET}&from=${SMS_GATEWAY_SENDER}&to=${phone}&text=${message}`;

      try {
        await axios.get(sendMessage);

        let inviteData = { name, phone, email, dob, coach_id: userId, url };
        let invite = await invitesModel.create(inviteData);
        feedbackArr.push(invite);
      } catch (err) {
        console.error(`Error sending SMS invite to ${phone}: ${err}`);
      }
    }

    return res.status(201).send({
      status: true,
      message: "Success",
      data: feedbackArr,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//************************************[SnC Player]**************************************
//==========================[SnC Player register]==============================
const createSnCPlayer = async function (req, res) {
  try {
    let data = req.body;
    let { name, phone, join_as, join_for, email, password } = data;

    if (await SnCPlayerModel.findOne({ phone: phone }))
      return res.status(400).send({ message: "Phone already exist" });

    if (await SnCPlayerModel.findOne({ email: email }))
      return res.status(400).send({ message: "Email already exist" });

    const encryptedPassword = bcrypt.hashSync(password, 12);
    req.body["password"] = encryptedPassword;

    var token = jwt.sign(
      {
        userId: SnCPlayerModel._id,
      },
      "project"
    );
    data.token = token;

    let savedData = await SnCPlayerModel.create(data);
    res.status(201).send({
      status: true,
      msg: "SnC Player Register successfull",
      data: {
        _id: savedData._id,
        name: savedData.name,
        phone: savedData.phone,
        join_as: savedData.join_as,
        join_for: savedData.join_for,
        email: savedData.email,
        password: savedData.password,
      },
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//==========================[SnC Player login]==============================
const SnCPlayerLogin = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;

    let user = await SnCPlayerModel.findOne({ email: email });

    if (!user) {
      return res.status(400).send({
        status: false,
        msg: "Email and Password is Invalid",
      });
    }

    let compared = await bcrypt.compare(password, user.password);
    if (!compared) {
      return res.status(400).send({
        status: false,
        message: "Your password is invalid",
      });
    }

    let PlayerProfile = await SnCPlayerProfile.findOne({
      userId: user._id,
    }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    let type = PlayerProfile ? "Yes" : "No";
    user.player_details_submit = type;

    var token = jwt.sign(
      {
        userId: user._id,
      },
      "project"
    );

    let updateToken = await SnCPlayerModel.findByIdAndUpdate(
      { _id: user._id },
      { token },
      { new: true }
    );
    user.token = updateToken.token;

    return res.status(200).send({
      status: true,
      msg: "SnC Player login successfull",
      data: {
        userId: user._id,
        name: user.name,
        phone: user.phone,
        join_as: user.join_as,
        join_for: user.join_for,
        email: user.email,
        password: user.password,
        player_details_submit: user.player_details_submit,
        playerProfile: PlayerProfile,
        token: updateToken.token,
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//==========================[part-2 (readinessSurveyModel)]===============================
const readinessSurvey = async function (req, res) {
  try {
    let data = req.body;
    let userId = req.params.userId;

    data.userId = userId;

    const createReadinessSurvey = await readinessSurveyModel.create(data);

    let obj = {};
    obj["userId"] = createReadinessSurvey.userId;
    obj["date"] = createReadinessSurvey.date;
    obj["Sleep"] = createReadinessSurvey.Sleep;
    obj["Mood"] = createReadinessSurvey.Mood;
    obj["Energy"] = createReadinessSurvey.Energy;
    obj["Stressed"] = createReadinessSurvey.Stressed;
    obj["Sore"] = createReadinessSurvey.Sore;
    obj["Heart_rate"] = createReadinessSurvey.Heart_rate;
    obj["Urine_color"] = createReadinessSurvey.Urine_color;

    return res.status(201).send({
      status: true,
      message: "Created successfully",
      data: obj,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==============================[part-2 (Test Details)]========================
const createPowerTest = async function (req, res) {
  try {
    let data = req.body;

    const powerTest = await powerTestModel.create(data);

    let obj = {};

    obj["vertical_jump"] = powerTest.vertical_jump;
    obj["squat_jump"] = powerTest.squat_jump;
    obj["standing_broad_jump"] = powerTest.standing_broad_jump;
    obj["ball_chest_throw"] = powerTest.ball_chest_throw;
    obj["hang_cleans"] = powerTest.hang_cleans;
    obj["cleans"] = powerTest.cleans;
    obj["power_cleans"] = powerTest.power_cleans;
    obj["snatch_floor"] = powerTest.snatch_floor;
    obj["hang_snatch"] = powerTest.hang_snatch;
    obj["split_jerk"] = powerTest.split_jerk;

    return res.status(201).send({
      status: true,
      message: "Created successfully",
      data: obj,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//====================================[part-2 (Stength Test)]======================
const createStrengthTest = async function (req, res) {
  try {
    let data = req.body;

    const strengthTest = await strengthTestModel.create(data);

    let obj = {};

    obj["back_squats"] = strengthTest.back_squats;
    obj["front_squats"] = strengthTest.front_squats;
    obj["conventional_deadlifts"] = strengthTest.conventional_deadlifts;
    obj["barbell_bench_press"] = strengthTest.barbell_bench_press;
    obj["barbell_bench_pulls"] = strengthTest.barbell_bench_pulls;

    return res.status(201).send({
      status: true,
      message: "Created successfully",
      data: obj,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//=========================[ part-2 (Workout)]================
const createWorkout = async function (req, res) {
  try {
    let data = req.body;
    let userId = req.params.userId;

    data.userId = userId;

    const Workout = await workoutModel.create(data);

    let obj = {};

    obj["userId"] = Workout.userId;
    obj["date"] = Workout.date;
    obj["intensity"] = Workout.intensity;
    obj["total_time"] = Workout.total_time;
    obj["minutes_batted"] = Workout.minutes_batted;
    obj["balls_bowled"] = Workout.balls_bowled;

    return res.status(201).send({
      status: true,
      message: "Created successfully",
      data: obj,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//================[SnC Test Category]========================
const TestCategory = async function (req, res) {
  try {
    let data = req.body;

    let categoryArr = [];

    for (let i = 0; i < data.length; i++) {
      let { id, title } = data[i];

      let testCategory = await testCategoryModel.create(data[i]);
      categoryArr.push(testCategory);
    }

    return res.status(201).send({
      status: true,
      message: "Test Category Created Successfully",
      data: categoryArr,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==================[Get SnC Test Category]================
const GetTestCategory = async function (req, res) {
  try {
    let body = req.query;
    let filter = {};

    if (body.id) {
      filter.id = body.id;
    }

    const Category = await testCategoryModel
      .find(filter)
      .select({ id: 1, title: 1, _id: 0 });

    return res.status(200).send({
      status: true,
      message: "Get Test Category Successfully",
      data: Category,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//====================[SnC Test]====================
const TestExport = async function (req, res) {
  try {
    let data = req.body;

    let TestExportArr = [];

    for (let i = 0; i < data.length; i++) {
      let { category, id, nonintegral, title, unit } = data[i];

      let testCategory = await testExportModel.create(data[i]);
      TestExportArr.push(testCategory);
    }

    return res.status(201).send({
      status: true,
      message: "Test Export Created Successfully",
      data: TestExportArr,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==================[Get SnC Test]================
const GetTestExports = async function (req, res) {
  try {
    let body = req.query;
    let filter = {};

    if (body.category) {
      filter.category = body.category;
    }

    const Category = await testExportModel.find(filter).select({
      category: 1,
      id: 1,
      nonintegral: 1,
      title: 1,
      unit: 1,
      _id: 0,
    });

    return res.status(200).send({
      status: true,
      message: "Get Test Exports Successfully",
      data: Category,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//=====================[Get UserId and Token]=============
const getUserToken = async function (req, res) {
  try {
    let email = req.body.email;
    let userId = req.params.userId;

    let getTokenAndId = await userModel.findOne({ email: email });
    if (getTokenAndId == null) {
      return res.status(200).send({
        status: false,
        message: "Get UserId And Token Successfully",
        data: null,
      });
    } else {
      let obj = {};
      obj._id = getTokenAndId._id;
      obj.token = getTokenAndId.token;

      return res.status(200).send({
        status: true,
        message: "Get UserId And Token Successfully",
        data: obj,
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//=======================[Get Test]==================
const getTest = async function (req, res) {
  try {
    let userId = req.params.userId;

    let getTestData = await testModel.find({ userId: userId });
    return res.status(200).send({
      status: true,
      message: "Get Test Data",
      data: getTestData,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//=================[Update Test]==========================
const updateTest = async function (req, res) {
  try {
    let testId = req.body._id;
    let data = req.body;
    let News = await testModel.findById({ _id: testId });

    if (News) {
      var updateNews = await testModel.findByIdAndUpdate(
        { _id: testId },
        { $set: data },
        { new: true }
      );
    }
    return res.status(200).send({
      status: true,
      message: "Post Update Successfully",
      data: updateNews,
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//=================[ Get Day Wise Time Spent]==============
const getDayWiseTimeSpent = async function (req, res) {
  try {
    let userId = req.params.userId;
    let queryDate = req.query.date;

    let routines = await routineModel.find({ userId: userId });

    let allDates = [];

    for (var i = 0; i < routines.length; i++) {
      var routine = routines[i];
      allDates = allDates.concat(routine.dates);
    }

    let uniqueDates = Array.from(new Set(allDates.map((date) => date.date)));
    if (queryDate) {
      uniqueDates = uniqueDates.filter((date) => date === queryDate);
    }

    let response = [];

    uniqueDates.forEach((date) => {
      let groups = {};

      routines.forEach((routine) => {
        let group = parseInt(routine.group);
        let trueCount = 0;

        routine.dates.forEach((date) => {
          if (date.date === queryDate && date.complete === true) {
            trueCount++;
          }
        });

        if (!groups[group]) {
          groups[group] = 0;
        }
        groups[group] += trueCount;
      });
      let data = Object.entries(groups).map(([group, complete]) => ({
        group: parseInt(group),
        complete,
      }));

      response.push({
        title: queryDate,
        data,
      });
    });

    if (response.length > 0) {
      return res.status(200).send({
        status: true,
        message: "Get Day Wise Time Spent data",
        data: response,
      });
    } else {
      return res.status(200).send({
        status: true,
        message: "Get Day Wise Time Spent data",
        data: [],
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//============[ Get Weekly Wise Time Spend ]===================
const getWeekWiseTimeSpent = async function (req, res) {
  try {
    let userId = req.params.userId;
    let routines = await routineModel.find({ userId: userId });

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

    let response = [];

    for (let j = 0; j < dateArray.length; j++) {
      let current_date = dateArray[j].date;
      let routinesInRange = routines.filter((routine) => {
        for (let j = 0; j < routine.dates.length; j++) {
          let routineDate = new Date(routine.dates[j].date);
          if (
            routineDate.toDateString() === new Date(current_date).toDateString()
          ) {
            return true;
          }
        }
        return false;
      });

      let groups = {};

      routinesInRange.forEach((routine) => {
        let group = parseInt(routine.group);
        let trueCount = 0;

        routine.dates.forEach((date) => {
          if (date.date === current_date && date.complete === true) {
            trueCount++;
          }
        });

        if (!groups[group]) {
          groups[group] = 0;
        }
        groups[group] += trueCount;
      });

      let data = Object.entries(groups).map(([group, complete]) => ({
        group: parseInt(group),
        complete,
      }));

      response.push({
        title: current_date,
        data,
      });
    }
    if (response.length > 0) {
      return res.status(200).send({
        status: true,
        message: "Get Week Wise Time Spent data",
        data: response,
      });
    } else {
      return res.status(200).send({
        status: true,
        message: "Get Week Wise Time Spent data",
        data: [],
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//==========[Get Monthly Wise Time Spent]============
const getMonthlyWiseTimeSpent = async function (req, res) {
  try {
    let userId = req.params.userId;
    let routines = await routineModel.find({ userId: userId });

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

    let response = [];
    let currentWeek = 1;
    let weeklyData = {};

    for (let j = 0; j < dateArray.length; j++) {
      let current_date = dateArray[j].date;
      let routinesInRange = routines.filter((routine) => {
        for (let j = 0; j < routine.dates.length; j++) {
          let routineDate = new Date(routine.dates[j].date);
          if (
            routineDate.toDateString() === new Date(current_date).toDateString()
          ) {
            return true;
          }
        }
        return false;
      });

      routinesInRange.forEach((routine) => {
        let group = parseInt(routine.group);
        let trueCount = 0;

        routine.dates.forEach((date) => {
          if (date.date === current_date && date.complete === true) {
            trueCount++;
          }
        });

        if (!weeklyData[currentWeek]) {
          weeklyData[currentWeek] = {};
        }
        if (!weeklyData[currentWeek][group]) {
          weeklyData[currentWeek][group] = 0;
        }
        weeklyData[currentWeek][group] += trueCount;
      });

      if ((j + 1) % 7 === 0 || j === dateArray.length - 1) {
        let weekData = Object.entries(weeklyData[currentWeek] || {}).map(
          ([group, complete]) => ({
            group: group === null ? null : parseInt(group),
            complete,
          })
        );

        response.push({
          title: `week${currentWeek}`,
          data: weekData,
        });

        weeklyData[currentWeek] = {};
        currentWeek++;
      }
    }

    return res.status(200).send({
      status: true,
      message: "Get Month Wise Time Spent data",
      data: {
        weeklyData: response,
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//=============[Get Recent And Long Average]======================
const getRecentAndLongTermAverage = async function (req, res) {
  try {
    let userId = req.params.userId;
    let count = 0;
    let totalSleep = 0;
    let totalMood = 0;
    let totalEnergy = 0;
    let totalStressed = 0;
    let totalSore = 0;
    let Readiness = await readinessSurveyModel
      .find({ userId: userId })
      .sort({ date: 1 });
    let startDateString = req.query.weekstartdate;
    let endDateString = req.query.weekend_date;
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
      let readinessData = Readiness.find((data) => data.date === current_date);
      if (readinessData) {
        totalSleep += readinessData.Sleep;
        totalMood += readinessData.Mood;
        totalEnergy += readinessData.Energy;
        totalStressed += readinessData.Stressed;
        totalSore += readinessData.Sore;
        count++;
      }
    }

    let averageSleep = count > 0 ? (totalSleep / count).toFixed(2) : null;
    let averageMood = count > 0 ? (totalMood / count).toFixed(2) : null;
    let averageEnergy = count > 0 ? (totalEnergy / count).toFixed(2) : null;
    let averageStressed = count > 0 ? (totalStressed / count).toFixed(2) : null;
    let averageSore = count > 0 ? (totalSore / count).toFixed(2) : null;

    let totalAvg =
      (parseFloat(averageSleep) || 0) +
      (parseFloat(averageMood) || 0) +
      (parseFloat(averageEnergy) || 0) +
      (parseFloat(averageStressed) || 0) +
      (parseFloat(averageSore) || 0);

    let recentAverage =
      dateArray.length > 0 ? (totalAvg / dateArray.length).toFixed(2) : null;

    // =======================[Long-term Average]===================

    let monthlyAverageSleep = 0;
    let monthlyAverageMood = 0;
    let monthlyAverageEnergy = 0;
    let monthlyAverageStressed = 0;
    let monthlyAverageSore = 0;
    let longTermAverage = null;
    let weeklyAverageSleep = [];
    let weeklyAverageMood = [];
    let weeklyAverageEnergy = [];
    let weeklyAverageStressed = [];
    let weeklyAverageSore = [];

    let Readinesss = await readinessSurveyModel.find({ userId: userId });

    let startDateStrings = req.query.month_start_date;
    let endDateStrings = req.query.month_end_date;
    let [startsDay, startsMonth, startsYear] = startDateStrings.split("-");
    let [endsDay, endsMonth, endsYear] = endDateStrings.split("-");

    let startsDateObj = new Date(`${startsYear}`, startsMonth - 1, startsDay);
    let endsDateObj = new Date(`${endsYear}`, endsMonth - 1, endsDay);

    let weekCount = Math.ceil(
      (endsDateObj - startsDateObj) / (7 * 24 * 60 * 60 * 1000)
    );

    let weeklySleepTotal = 0;
    let weeklySleepCount = 0;
    let weeklyMoodTotal = 0;
    let weeklyMoodCount = 0;
    let weeklyEnergyTotal = 0;
    let weeklyEnergyCount = 0;
    let weeklyStressedTotal = 0;
    let weeklyStressedCount = 0;
    let weeklySoreTotal = 0;
    let weeklySoreCount = 0;
    let totalWeeks = 0;

    let currentDate = new Date(startsDateObj);
    for (let i = 0; i < weekCount; i++) {
      let startDate = new Date(currentDate);
      let endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + 6);

      let startDateStrings = startDate
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .split("/")
        .join("-");

      let averageSleep = null;
      let averageMood = null;
      let averageEnergy = null;
      let averageStressed = null;
      let averageSore = null;

      for (let j = startDate; j <= endDate; j.setDate(j.getDate() + 1)) {
        let currentDate = j
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .split("/")
          .join("-");
        let readinessData = Readinesss.find((r) => r.date === currentDate);

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
      }
      //==========[sleep]=====================
      if (weeklySleepCount > 0) {
        averageSleep = (weeklySleepTotal / weeklySleepCount).toFixed(2);
        monthlyAverageSleep += parseFloat(averageSleep);
        totalWeeks++;
      }

      //===========[mood]========================
      if (weeklyMoodCount > 0) {
        averageMood = (weeklyMoodTotal / weeklyMoodCount).toFixed(2);
        monthlyAverageMood += parseFloat(averageMood);
      }

      //============[energy]===================
      if (weeklyEnergyCount > 0) {
        averageEnergy = (weeklyEnergyTotal / weeklyEnergyCount).toFixed(2);
        monthlyAverageEnergy += parseFloat(averageEnergy);
      }

      //============[stressed]===================
      if (weeklyStressedCount > 0) {
        averageStressed = (weeklyStressedTotal / weeklyStressedCount).toFixed(
          2
        );
        monthlyAverageStressed += parseFloat(averageStressed);
      }

      //============[sore]===========
      if (weeklySoreCount > 0) {
        averageSore = (weeklySoreTotal / weeklySoreCount).toFixed(2);
        monthlyAverageSore += parseFloat(averageSore);
      }

      weeklyAverageSleep.push({
        startDate: startDateStrings,
        average: averageSleep,
        week: i + 1,
      });

      weeklyAverageMood.push({
        startDate: startDateStrings,
        average: averageMood,
        week: i + 1,
      });

      weeklyAverageEnergy.push({
        startDate: startDateStrings,
        average: averageEnergy,
        week: i + 1,
      });

      weeklyAverageStressed.push({
        startDate: startDateStrings,
        average: averageStressed,
        week: i + 1,
      });

      weeklyAverageSore.push({
        startDate: startDateStrings,
        average: averageSore,
        week: i + 1,
      });

      weeklySleepTotal = 0;
      weeklySleepCount = 0;
      weeklyMoodTotal = 0;
      weeklyMoodCount = 0;
      weeklyEnergyTotal = 0;
      weeklyEnergyCount = 0;
      weeklyStressedTotal = 0;
      weeklyStressedCount = 0;
      weeklySoreTotal = 0;
      weeklySoreCount = 0;

      currentDate.setDate(currentDate.getDate() + 7);
    }

    if (totalWeeks > 0) {
      longTermAverage = (
        (monthlyAverageSleep +
          monthlyAverageMood +
          monthlyAverageEnergy +
          monthlyAverageStressed +
          monthlyAverageSore) /
        (totalWeeks * 5)
      ).toFixed(2);
    }

    return res.status(200).send({
      status: true,
      message: "Success",
      data: { recentAverage: recentAverage, longTermAverage: longTermAverage },
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

//************************************[ Snc/Coach Section]*************************************
//==========================[Snc/coach register]================================================
const createSncCoach = async function (req, res) {
  try {
    let data = req.body;
    let { email, phone, coach_name, password } = data;

    if (await Snc_coachModel.findOne({ phone: phone }))
      return res.status(400).send({ message: "Phone already exist" });

    if (await Snc_coachModel.findOne({ email: email }))
      return res.status(400).send({ message: "Email already exist" });

    const encryptedPassword = bcrypt.hashSync(password, 12);
    req.body["password"] = encryptedPassword;

    let savedData = await Snc_coachModel.create(data);
    res.status(201).send({ status: true, data: savedData });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//=============[Get All Users]=============================
const getsncCoach = async function (req, res) {
  try {
    let data = req.body;

    let user = await Snc_coachModel.find();

    return res.status(201).send({
      status: true,
      msg: "Get All Users",
      data: user,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//==========================[Update Snc id  And academy id]=================
const UpdateSncidAcademyid = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;
    let { academy_id, snc_id } = data;

    let user = await userModel.findOneAndUpdate(
      { _id: userId },
      { $set: { snc_id: snc_id, academy_id: academy_id } },
      { new: true }
    );
    return res.status(200).send({
      status: true,
      message: "Updated Successfully",
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

//==============[Create Session and Exercise]==============================
const createSessionExercise = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;

    let session_exerciseArr = [];

    for (let i = 0; i < data.length; i++) {
      let { session_id, Exercise_id, Exercise_title, Set, Reps, Load_Unit } =
        data[i];
      data[i].userId = userId;

      let session_exercise = await session_exerciseModel.create(data[i]);
      session_exerciseArr.push(session_exercise);
    }

    return res.status(201).send({
      status: true,
      message: "Session Exercise Created Successfully",
      data: session_exerciseArr,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
};

module.exports = {
  SnCPlayerLogin,
  createSnCPlayer,
  GetTestExports,
  TestExport,
  GetTestCategory,
  TestCategory,
  createInvites,
  verifyOTP,
  createOTP,
  updateComplete,
  updateDate,
  createFeedback,
  getPastDrill,
  getOngoingDrill,
  getNewDrill,
  createPlayerRoutine,
  scoreAndremark,
  updateCategoryRoutine,
  getCalendarCount,
  getRoutineCount,
  getOngoingRoutine,
  updateRoutine,
  getContactCoach,
  updateCoachPassword,
  getAllUsers,
  updateBat_Bow,
  getAssignedByDrills,
  AcademyLogin,
  createUser,
  userLogin,
  getContact,
  createBattings,
  updateBatting,
  createBowlings,
  updateBowling,
  createWickets,
  updateWicket,
  bow_bat,
  createRoutine,
  deleteRoutine,
  getRoutine,
  category,
  getCategory,
  getTags,
  tag,
  getNewRoutine,
  createAcademy,
  updateDrill,
  updatePassword,
  getPastRoutine,
  getPersonal,
  getProgress,
  getUsers,
  readinessSurvey,
  createPowerTest,
  createStrengthTest,
  createWorkout,
  getUserToken,
  getTest,
  updateTest,
  getDayWiseTimeSpent,
  getWeekWiseTimeSpent,
  getMonthlyWiseTimeSpent,
  getRecentAndLongTermAverage,
  createSncCoach,
  getsncCoach,
  UpdateSncidAcademyid,
  createSessionExercise,
};
