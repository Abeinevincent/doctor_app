const Doctor = require("../models/Doctor");
const DoctorsInDistrict = require("../models/DoctorsInDistrict");
const axios = require("axios");
const bcrypt = require("bcrypt");
const router = require("express").Router();

router.post("/register", async (req, res) => {
  // DESTRUCTURE REQ.BODY
  const {
    country,
    district,
    subCounty,
    fullName,
    email,
    hospital_speciality,
    hospital_name,
    primaryPhoneNumber,
    distanceFromTarmac,
    displayImage,
  } = req.body;

  //   GET COODINATES OF USER BY LOCATION
  try {
    try {
      const response = await axios.get(`${process.env.OPENCAGE_URL}`, {
        params: {
          key: process.env.OPENCAGE_API_KEY,
          q: `${subCounty}, ${district}, ${country}`,
        },
      });

      // Example coordinates in DMS format
      const latitude = Number(response.data.results[0].geometry.lat);
      const longitude = Number(response.data.results[0].geometry.lng);
      console.log(latitude, longitude);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const exists = await Doctor.findOne({ email });

      if (exists) {
        throw new Error("The email provided is already taken !");
      }

      const newdoctor = new Doctor({
        fullName,
        email,
        hospital_speciality,
        hospital_name,
        password: hashedPassword,
        location: {
          longitude,
          latitude,
          country,
          distanceFromTarmac,
          district,
          subCounty,
        },
        meta: {
          displayImage,
          primaryPhoneNumber,
        },
      });

      //   REGISTER DOCTOR IN DISTRICT HERE *******
      try {
        const existingField = await DoctorsInDistrict.findOneAndUpdate(
          { country, district },
          { $inc: { doctorCount: 1 } },
          { new: true }
        );
        if (existingField) {
          existingField.doctorCount += 1;
        } else {
          const doctorindistrict = new DoctorsInDistrict({
            country: req.body.country,
            district: req.body.district,
          });
          const saveddoctorindistrict = await doctorindistrict.save();
          console.log(saveddoctorindistrict);
        }
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }

      const doctor = await newdoctor.save();

      return res
        .status(200)
        .json({ message: "doctor registration successful.", doctor });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  } catch (error) {
    console.log(err);
    res.status(500).json(error);
  }
});

// LOGIN DR
router.post("/login", async (req, res) => {
  try {
    // Find user by email
    const user = await Doctor.findOne({ email: req.body.email });

    // Check whether the user exists in the database
    if (!user) {
      return res
        .status(404)
        .json(
          "Doctor with the provided email doesnot exist, please create an account!"
        );
    }

    // Compare passwords and if password is incorrect, tell the user to try again

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json("Incorrect password, please try again!");
    }

    // hide password from the database
    const { password, ...others } = user._doc;

    // If the request is succcessful, return success message and user details
    return res.status(200).json({
      message: "Doctor login successful",
      ...others,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const dr = await Doctor.findOne({ _id: req.params.id });
    return res.status(200).json(dr);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const dr = await Doctor.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: req.body,
      },

      { new: true }
    );
    return res.status(200).json(dr);
  } catch (err) {
    console.log(err);
    res.status(500).json(error);
  }
});

// GET ALL
router.get("/", async (req, res) => {
  try {
    const drs = await Doctor.find();
    return res.status(200).json(drs);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// GET DOCTORS IN A DISTRICT
// GET ALL
router.get("/findall/doctorsindistrict", async (req, res) => {
  try {
    const drs = await DoctorsInDistrict.find();
    return res.status(200).json(drs);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// FIND DRS IN A PARTICULAR DISTRICT
router.get("/findbydstrict/all/:district", async (req, res) => {
  try {
    const drs = await Doctor.find({ "location.district": req.params.district });
    return res.status(200).json(drs);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
// FIND DR IBY NAME
router.get("/finddr/byname/:doctorname", async (req, res) => {
  try {
    const dr = await Doctor.findOne({ fullName: req.params.doctorname });
    return res.status(200).json(dr);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
