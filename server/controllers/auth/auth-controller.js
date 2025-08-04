
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const IncognitoUser = require("../../models/IncognitoUser");
const sendEmail = require("../../helpers/send-email");


const CLIENT_SECRET_KEY = process.env.CLIENT_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Helper function to determine category based on chest size
const determineCategory = (chestSize) => {
  if (chestSize >= 38 && chestSize <= 40) {
    return "Author";
  } else if (chestSize >= 41 && chestSize <= 43) {
    return "Bravo";
  } else if (chestSize > 43) {
    return "Hector";
  } else {
    return "Author"; // Default category for smaller sizes
  }
};

const registerUser = async (req, res) => {
  const { userName, email, password, age, height, chestSize, bodyLength, shoulderLength } = req.body;

  try {
    // Check if the user already exists
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.json({
        success: false,
        message: "User already exists with the same email! Please try again.",
      });
    }

    // Determine category based on chest size
    const category = determineCategory(chestSize);

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      age,
      height,
      chestSize,
      bodyLength,
      shoulderLength,
      category
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Registration successful.",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration.",
    });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check in regular users first
    let checkUser = await User.findOne({ email });
    let isIncognito = false;

    // If not found in regular users, check in incognito users
    if (!checkUser) {
      checkUser = await IncognitoUser.findOne({ email });
      isIncognito = !!checkUser;

      if (!checkUser) {
        return res.json({
          success: false,
          message: "User doesn't exist! Please register first.",
        });
      }
    }

    const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
    if (!checkPasswordMatch) {
      return res.json({
        success: false,
        message: "Incorrect password! Please try again.",
      });
    }

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
        category: checkUser.category,
        isIncognito
      },
      CLIENT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { id: checkUser._id, isIncognito },
      CLIENT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      accessToken,
      refreshToken,
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
        category: checkUser.category,
        isIncognito
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login.",
    });
  }
};

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "No refresh token provided.",
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, CLIENT_SECRET_KEY);

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      CLIENT_SECRET_KEY,
      { expiresIn: "1d" } // Access token expires in 15 minutes
    );

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Error verifying refresh token:", error.message);
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token.",
    });
  }
};


const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; 

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user! No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, CLIENT_SECRET_KEY);
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("Error verifying token:", error.message);
    res.status(401).json({
      success: false,
      message: "Unauthorized user! Invalid or expired token.",
    });
  }
};

const logoutUser = (req, res) => {

  res.status(200).json({
    success: true,
    message: "Logged out successfully. Please clear your session on the client.",
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If a user with that email exists, you will receive password reset instructions.",
      });
    }

    const resetToken = jwt.sign({ id: user._id }, CLIENT_SECRET_KEY, { expiresIn: "1h" });
    const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`;


    const message = `
    <div style="font-family: Arial, sans-serif; color: #2c3315; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #eeeeee; padding: 20px; text-align: center; color: #2c3315;">
        <img src="https://res.cloudinary.com/dkqt39aad/image/upload/v1754300738/logo_pa0nq0.png" alt="Logo" style="max-width: 150px; margin-bottom: 10px;">
        <h2 style="margin-bottom: 5px;">Reset Your Password</h2>
        <p style="font-size: 16px; margin-top: 0;">We received a request to reset your password.</p>
      </div>
      
      <div style="padding: 20px;">
        <p style="font-size: 14px; color: #2c3315; text-align: center;">Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin-top: 20px;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #eeeeee; color: #2c3315; padding: 14px 28px; font-size: 16px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        
        <p style="font-size: 12px; color: #777; text-align: center; margin-top: 20px;">
          If the button above doesn't work, copy and paste the following link in your browser:
        </p>
        
        <p style="word-wrap: break-word; font-size: 12px; text-align: center; color: #777; background-color: #f3f4f6; padding: 10px; border-radius: 5px; margin: 15px auto; display: inline-block;">
          ${resetUrl}
        </p>
        
        <p style="font-size: 12px; color: #777; text-align: center; margin-top: 20px;">
          This link is valid for 1 hour. If you didn't request this, please ignore this email or contact our support team.
        </p>
      </div>
      
      <div style="background-color: #f7f7f7; padding: 12px; text-align: center; font-size: 12px; color: #777;">
        <p>If you need help, please contact our support team.</p>
      </div>
    </div>
`;

  

    // Send the reset email using the internal email utility.
    await sendEmail({
      email: user.email,
      subject: "Password Reset Instructions",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Password reset instructions have been sent to your email.",
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};


const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
      return res.status(400).json({
          success: false,
          message: "Token and new password are required.",
      });
  }
  try {
      // Verify the password reset token.
      const decoded = jwt.verify(token, CLIENT_SECRET_KEY);
      // Find the user using the ID from the token.
      const user = await User.findById(decoded.id);
      if (!user) {
          return res.status(400).json({
              success: false,
              message: "Invalid token or user no longer exists.",
          });
      }

      // Hash the new password before saving it.
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
          success: true,
          message: "Password reset successful.",
      });
  } catch (error) {
      console.error("Error in resetPassword:", error);
      res.status(400).json({
          success: false,
          message: "Invalid or expired token.",
      });
  }
};

// Register an incognito user (created by another user)
const registerIncognitoUser = async (req, res) => {
  const { userName, email, password, age, height, chestSize, bodyLength, shoulderLength } = req.body;

  try {
    // Verify the creator is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to create an incognito user.",
      });
    }

    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    const existingIncognitoUser = await IncognitoUser.findOne({ email });

    if (existingUser || existingIncognitoUser) {
      return res.json({
        success: false,
        message: "Email is already in use. Please try a different email.",
      });
    }

    // Determine category based on chest size
    const category = determineCategory(chestSize);

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 12);

    // Create a new incognito user
    const newIncognitoUser = new IncognitoUser({
      userName,
      email,
      password: hashPassword,
      age,
      height,
      chestSize,
      bodyLength,
      shoulderLength,
      category,
      createdBy: req.user.id
    });

    await newIncognitoUser.save();

    res.status(200).json({
      success: true,
      message: "Incognito user registration successful.",
    });
  } catch (error) {
    console.error("Error during incognito registration:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration.",
    });
  }
};

// Get incognito users created by the current user
const getIncognitoUsers = async (req, res) => {
  try {
    // Verify the user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find all incognito users created by this user
    const incognitoUsers = await IncognitoUser.find({ createdBy: req.user.id })
      .select('_id userName email category');

    res.status(200).json({
      success: true,
      incognitoUsers,
    });
  } catch (error) {
    console.error("Error fetching incognito users:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching incognito users.",
    });
  }
};

const loginAsMainUser = async (req, res) => {
  // The client sends the stored mainAccessToken in the authorization header.
  const mainToken = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null;
  if (!mainToken) {
    return res.status(401).json({
      success: false,
      message: "Main account credentials not provided.",
    });
  }

  try {
    // Verify the provided main token.
    const decoded = jwt.verify(mainToken, CLIENT_SECRET_KEY);
    // Find the main user by id.
    const mainUser = await User.findById(decoded.id);
    if (!mainUser) {
      return res.status(404).json({
        success: false,
        message: "Main user not found.",
      });
    }
    // Generate new tokens for the main user.
    const accessToken = jwt.sign(
      {
        id: mainUser._id,
        role: mainUser.role,
        email: mainUser.email,
        userName: mainUser.userName,
        category: mainUser.category,
        isIncognito: false,
      },
      CLIENT_SECRET_KEY,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { id: mainUser._id, isIncognito: false },
      CLIENT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Switched to main account successfully.",
      accessToken,
      refreshToken,
      user: {
        email: mainUser.email,
        role: mainUser.role,
        id: mainUser._id,
        userName: mainUser.userName,
        category: mainUser.category,
        isIncognito: false,
      },
    });
  } catch (err) {
    console.error("Error in loginAsMainUser:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired main account credentials.",
    });
  }
};


// Login as an incognito user
const loginAsIncognitoUser = async (req, res) => {
  try {
    const { incognitoUserId } = req.body;
console.log('Received incognitoUserId:', incognitoUserId);
    // Verify the user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find the incognito user
    const incognitoUser = await IncognitoUser.findOne({
      _id: incognitoUserId,
      createdBy: req.user.id
    });

    if (!incognitoUser) {
      return res.status(404).json({
        success: false,
        message: "Incognito user not found or not created by you",
      });
    }

    // Generate tokens for the incognito user
    const accessToken = jwt.sign(
      {
        id: incognitoUser._id,
        role: incognitoUser.role,
        email: incognitoUser.email,
        userName: incognitoUser.userName,
        category: incognitoUser.category,
        isIncognito: true,
        createdBy: req.user.id
      },
      CLIENT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { id: incognitoUser._id, isIncognito: true, createdBy: req.user.id },
      CLIENT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Logged in as incognito user successfully.",
      accessToken,
      refreshToken,
      user: {
        email: incognitoUser.email,
        role: incognitoUser.role,
        id: incognitoUser._id,
        userName: incognitoUser.userName,
        category: incognitoUser.category,
        isIncognito: true,
        createdBy: req.user.id
      },
    });
  } catch (error) {
    console.error("Error logging in as incognito user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while logging in as incognito user.",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    // req.user is set by the authMiddleware
    const userId = req.user.id;

    // Find the user by ID but exclude the password field
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Return the user profile data
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching user profile."
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  authMiddleware,
  forgotPassword,
  resetPassword,
  registerIncognitoUser,
  getIncognitoUsers,
  loginAsIncognitoUser,
  loginAsMainUser,
  getUserProfile,
};
