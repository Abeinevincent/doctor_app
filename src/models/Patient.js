// Import mongoose ORM
const mongoose = require("mongoose");

// Create Patient model
const PatientModel = new mongoose.Schema(
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

    location: {
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

          patientId: {
            type: String,
          },

          doctor_name: {
            type: String,
          },

          speciality: {
            type: String,
          },

          message_body: {
            type: String,
          },

          message_title: {
            type: String,
          },
        },
      ],
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

          time_sent: {
            type: String,
          },
        },
      ],
    },

    isPatient: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Export this model for import in the routes that will need to use it
module.exports = mongoose.model("Patient", PatientModel);
