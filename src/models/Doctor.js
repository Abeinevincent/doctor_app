// Import mongoose ORM
const mongoose = require("mongoose");

// Create Doctor model
const DoctorModel = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    hospital_name: {
      type: String,
    },

    notifications: {
      type: [
        {
          notication_message: {
            type: String,
          },

          sender_name: {
            type: String,
          },

          senderId: {
            type: String,
          },
        },
      ],
    },

    hospital_speciality: {
      type: String,
    },

    location: {
      longitude: {
        type: Number,
        required: true,
      },

      latitude: {
        type: Number,
        required: true,
      },

      country: {
        type: String,
        required: true,
      },

      district: {
        type: String,
        required: true,
      },

      subCounty: {
        type: String,
        required: true,
      },

      distanceFromTarmac: {
        type: String,
        required: true,
      },
    },

    meta: {
      displayImage: {
        type: String,
      },

      primaryPhoneNumber: {
        type: String,
        required: true,
      },
    },

    appointments: {
      type: [
        {
          patient_name: {
            type: String,
          },

          patient_district: {
            type: String,
          },

          patient_subcounty: {
            type: String,
          },

          message_body: {
            type: String,
          },

          speciality: {
            type: String,
          },

          message_title: {
            type: String,
          },

          patientId: {
            type: String,
          },

          is_replied: {
            type: Boolean,
            default: false,
          },

          meeting_time: {
            type: String,
          },

          meeting_date: {
            type: String,
          },

          meeting_link: {
            type: String,
          },

          date_replied: {
            type: String,
          },
        },
      ],
    },

    isDoctor: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Export this model for import in the routes that will need to use it
module.exports = mongoose.model("Doctor", DoctorModel);
