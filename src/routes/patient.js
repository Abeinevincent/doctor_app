const Patient = require("../models/Patient");
const bcrypt = require("bcrypt");
const Doctor = require("../models/Doctor");
const router = require("express").Router();

router.post("/register", async (req, res) => {
  // DESTRUCTURE REQ.BODY
  const {
    country,
    district,
    subCounty,
    fullName,
    email,
    primaryPhoneNumber,
    displayImage,
  } = req.body;

  //   GET COODINATES OF USER BY LOCATION
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const exists = await Patient.findOne({ email });

    if (exists) {
      throw new Error("The email provided is already taken !");
    }

    const newpatient = new Patient({
      fullName,
      email,
      password: hashedPassword,
      location: {
        country,
        district,
        subCounty,
      },
      meta: {
        displayImage,
        primaryPhoneNumber,
      },
    });

    const patient = await newpatient.save();

    return res
      .status(200)
      .json({ message: "patient registration successful.", patient });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    // Find user by email
    const user = await Patient.findOne({ email: req.body.email });

    // Check whether the user exists in the database
    if (!user) {
      return res
        .status(404)
        .json(
          "Patient with the provided email doesnot exist, please create an account!"
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
      message: "Patient login successful",
      ...others,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const dr = await Patient.findOne({ _id: req.params.id });
    return res.status(200).json(dr);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const dr = await Patient.findOneAndUpdate(
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
    const drs = await Patient.find();
    return res.status(200).json(drs);
  } catch (err) {
    console.log(err);
    res.status(500).json(error);
  }
});

// CREATE AN APPOINTMENT
router.put("/addbooking/new", async (req, res) => {
  try {
    const {
      patientId,
      doctor_name,
      sender_name,
      message_body,
      message_title,
      speciality,
    } = req.body;
    console.log(doctor_name);
    const availablePatient = await Patient.findOne({ _id: patientId });
    if (!availablePatient) {
      return res.status(400).json("Patient doesnot exist!");
    }

    // PATIENT
    const pt = await Patient.findOneAndUpdate(
      { _id: patientId },
      {
        $push: { appointments: req.body },
      },

      { new: true }
    );

    // DR
    const dr = await Doctor.findOneAndUpdate(
      { fullName: doctor_name },
      {
        $push: {
          appointments: {
            patient_name: availablePatient.fullName,
            patient_district: availablePatient.location.district,
            patient_subcounty: availablePatient.location.subCounty,
            patient_name: availablePatient.fullName,
            message_body,
            message_title,
            speciality,
          },

          notifications: {
            notication_message: `You have a new booking for ${speciality}. Open your bookings to confirm or reject.`,
            sender_name,
            sender_id: patientId,
          },
        },
      }
    );

    return res
      .status(200)
      .json({ message: "Appointment has been booked!", pt, dr });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// DOCTOR APPROVE OR REJECT APPOINTMENT
router.put(
  "/updateapt/:userId/appointments/:appointmentId",
  async (req, res) => {
    const { userId, appointmentId } = req.params;
    const {
      meeting_link,
      meeting_time,
      meeting_date,
      patientName,
      speciality,
      doctor_name,
    } = req.body;
    try {
      const dr = await Doctor.findById(userId);
      if (!dr) {
        return res.status(404).json({ error: "User not found" });
      }

      const appointment = dr.appointments.id(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      appointment.meeting_time = meeting_time;
      appointment.meeting_link = meeting_link;
      appointment.meeting_date = meeting_date;
      appointment.is_replied = true;

      console.log(appointment.meeting_link);

      await dr.save(); // Save the changes to the user document
      // The appointment was found, you can now use it

      // ALSO UPDATE PATIENT
      const pt = await Patient.findOneAndUpdate(
        { fullName: patientName },
        {
          $push: {
            notifications: {
              notication_message: `Your booking has been approved. Open your bookings to confirm time and meeting link.`,
              doctor_name,
            },
          },
        }
      );

      const ptAppointment = pt.appointments.find(
        (app) =>
          app.doctor_name === doctor_name && app.speciality === speciality
      );

      ptAppointment.meeting_time = meeting_time;
      ptAppointment.meeting_link = meeting_link;
      ptAppointment.meeting_date = meeting_date;
      ptAppointment.is_replied = true;

      await pt.save();

      console.log(ptAppointment);

      // FIRST SEND A NOTIFC

      // THEN UPDATE HIS NOTIFIC

      res.status(200).json(appointment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
