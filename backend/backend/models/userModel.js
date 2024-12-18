import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    firstname: {
        type: String,
        required: false,
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
    blocked: {
      type: Boolean,
      default: false,
    },
    profileImageName: {
      type: String,
    },
    plate: {
      type: String,
      required: true,
    },
    telephone: {
      type: Number,
      required: true,
    },
    parking_id: {
        type: String,
        default: "0",
    },
    type_subscription: {
      type: mongoose.Schema.Types.ObjectId, // FK vers Subscription 
      ref: "Subscription", 
      default: null
    },
    subscription_end_date: {
        type: Date,
        default: null,
    },
    arrival_time: {
        type: Date,
        default: null
    },
    exit_time: {
      type: Date,
      default: null
    },
    requires_accessible_parking: {
        type: Boolean, 
        default: false, // Aucune souscription par défaut
    }

},{

    timestamps: true // This will automatically add timestamps for any operations done.

});


// ============= Password Hashing Middleware =============
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();

    // If the existing password in user schema was not modified, then avoid hashing and move to next middleware
    // This check is done here because the user schema will have other updates which dosen't involve password updation
    // in that case rehashing password will be skipped
  }

  const salt = await bcrypt.genSalt(10);

  // Hashing the new password using the salt generated by bcrypt
  this.password = await bcrypt.hash(this.password, salt);
});

// ============= Password Verifying Function =============
userSchema.methods.matchPassword = async function (userProvidedPassword) {
  const validPassword = await bcrypt.compare(
    userProvidedPassword,
    this.password
  );

  return validPassword;
};

// ============= Blocked Status Returning Function =============
userSchema.methods.isBlocked = function () {
  return this.blocked;
};

const User = mongoose.model("User", userSchema);

export default User;
