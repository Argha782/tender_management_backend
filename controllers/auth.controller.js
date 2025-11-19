import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynchandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import twilio from "twilio";
import crypto from "crypto";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// REGISTER
export const registerUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      role,
      verificationMethod,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password ||
      !role ||
      !verificationMethod
    ) {
      return next(new ApiError("All fields are required.", 400));
    }
    const validatePhoneNumber = (phoneNumber) => {
      const phoneRegex = /^\+91\d{10}$/;
      return phoneRegex.test(phoneNumber);
    };

    if (!validatePhoneNumber(phoneNumber)) {
      throw new ApiError(400, "Invalid Phone Number.");
    }

    // const existingUser = await User.findOne({ email });
    const existingUser = await User.findOne({
      $or: [
        {
          email,
          accountVerified: true,
        },
        {
          phoneNumber,
          accountVerified: true,
        },
      ],
    });
    if (existingUser)
      // return res.status(400).json({ message: "User already exists" });
      return next(new ApiError(400, "Phone or Email already used."));

    const registerationAttemptsByUser = await User.find({
      $or: [
        { phoneNumber, accountVerified: false },
        { email, accountVerified: false },
      ],
    });

    if (registerationAttemptsByUser.length > 3) {
      return next(
        new ApiError(
          "You have exceeded the maximum number of attempts (3). Please try again after an hour.",
          400
        )
      );
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      role,
    });

    const verificationCode = await user.generateVerificationCode();
    await user.save();
    sendVerificationCode(
      verificationMethod,
      verificationCode,
      firstName,
      lastName,
      email,
      phoneNumber,
      res
    );
    // const token = generateToken(user);
    // return res.status(201).json({
    //   token,
    //   user: {
    //     id: user._id,
    //     firstName: user.firstName,
    //     lastName: user.lastName,
    //     role: user.role,
    //     email: user.email,
    //     phoneNumber: user.phoneNumber,
    //   },
    // });
  } catch (err) {
    console.error("Error during registration:", err);
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
    // next(new ApiError("Failed to register", 500));
  }
};

async function sendVerificationCode(
  verificationMethod,
  verificationCode,
  firstName,
  lastName,
  email,
  phoneNumber,
  res
) {
  try {
    if (verificationMethod === "email") {
      const message = generateEmailTemplate(verificationCode);
      sendEmail({ email, subject: "Your Verification Code", message });
      res.status(200).json({
        success: true,
        message: `Verification email successfully sent to ${firstName} ${lastName}`,
      });
    } else if (verificationMethod === "phoneNumber") {
      const verificationCodeWithSpace = verificationCode
        .toString()
        .split("")
        .join(" ");
      await client.calls.create({
        twiml: `<Response><Say>Your verification code is ${verificationCodeWithSpace}. Your verification code is ${verificationCodeWithSpace}.</Say></Response>`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
      res.status(200).json({
        success: true,
        message: `OTP sent.`,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Invalid verification method.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Verification code failed to send.",
    });
  }
}

function generateEmailTemplate(verificationCode) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
      <p style="font-size: 16px; color: #333;">Dear User,</p>
      <p style="font-size: 16px; color: #333;">Your verification code is:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #e8f5e9;">
          ${verificationCode}
        </span>
      </div>
      <p style="font-size: 16px; color: #333;">Please use this code to verify your email address. The code will expire in 5 minutes.</p>
      <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
      <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #999;">
        <p>Thank you,<br>Your Company Team</p>
        <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply to this email.</p>
      </footer>
    </div>
  `;
}

// Verify OTP
export const verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, otp, phoneNumber } = req.body;

  try {
    // Validate phone number format if present
    const validatePhoneNumber = (phoneNumber) => {
      const phoneRegex = /^\+91\d{10}$/;
      return phoneRegex.test(phoneNumber);
    };

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      return next(new ApiError("Invalid Phone Number format.", 400));
    }

    // Ensure at least one identifier is present
    if (!email && !phoneNumber) {
      return next(new ApiError("Email or Phone Number is required.", 400));
    }

    // Search for the most recent unverified user entry
    const userAllEntries = await User.find({
      $or: [
        { email, accountVerified: false },
        { phoneNumber, accountVerified: false },
      ],
    }).sort({ createdAt: -1 });

    if (!userAllEntries) {
      return next(new ApiError("User not found or account already verified.", 404));
    }

    const user = userAllEntries[0];
    // let user = userAllEntries[0];

    // Delete duplicate unverified users
    if (userAllEntries.length > 1) {
      await User.deleteMany({
        _id: { $ne: user._id },
        $or: [
          { email, accountVerified: false },
          { phoneNumber, accountVerified: false },
        ],
      });
    }

    // Check OTP match
    if (!user.verificationCode || user.verificationCode !== Number(otp)) {
      return next(new ApiError("Incorrect OTP. Please try again.", 400));
    }

    // Check OTP expiration
    const currentTime = Date.now();
    const expireTime = new Date(user.verificationCodeExpire).getTime();

    if (currentTime > expireTime) {
      return next(new ApiError("OTP has expired.", 400));
    }

    // Mark user as verified
    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;
    await user.save({ validateModifiedOnly: true });

    // Send success response with token
    sendToken(user, 200, "Account Verified.", res);

  } catch (error) {
    console.error("OTP verification error:", error);
    return next(new ApiError("Internal Server Error during OTP verification.", 500));
  }
});


// LOGIN
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      // return next(new ApiError("Email and password are required.", 400));
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email, accountVerified: true }).select(
    // const user = await User.findOne({ email}).select(
      "+password"
    );
    if (!user) {
      // return next(new ApiError("User not found. Please check your email.", 400));
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      // return next(new ApiError("Incorrect email or password. Please try again.", 400));
       return res.status(401).json({ message: "Email or password is incorrect" })
    }
    sendToken(user, 200, "User logged in successfully.", res);

    // const token = generateToken(user);
    // res.status(200).json({
    //   message: "User logged in successfully",
    //   token,
    //   user: {
    //     id: user._id,
    //     firstName: user.firstName,
    //     lastName: user.lastName,
    //     role: user.role,
    //     email: user.email,
    //   },
    // });
  } catch (err) {
    console.error("Error during login:", err);
    // res.status(500).json({ message: "Login failed", error: err.message });
    return next(new ApiError("Internal Server Error.", 500));
  }
};

export const logoutUser = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully.",
    });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });
  if (!user) {
    // return next(new ApiError("User not found.", 404));
    return res.status(404).json({ message: "User not found" });
  }
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  // const resetPasswordUrl = `http://localhost:5173/password/reset/${resetToken}`;

  const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;

  try {
    sendEmail({
      email: user.email,
      subject: "RESET PASSWORD",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ApiError(
        error.message ? error.message : "Cannot send reset password token.",
        500
      )
    );
  }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ApiError(
        "Reset password token is invalid or has been expired.",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ApiError("Password & confirm password do not match.", 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, "Reset Password Successfully.", res);
});
