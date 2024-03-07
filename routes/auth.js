const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User"); // Import the User model
// const sub = require('../models/User')
const bcrypt = require("bcrypt");
const session = require("express-session");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Define authentication-related routes here
router.use(express.json()); // Use JSON body parsing middleware
const nodemailer = require("nodemailer");

function sendEmail(receiverEmail, subject, text) {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // e.g., 'Gmail'
    auth: {
      user: "bookbazaar959@gmail.com",
      pass: "konr fuuw tfla pmoj",
    },
  });
  const mailOptions = {
    from: "bookbazaar959@gmail.com",
    to: receiverEmail,
    subject: subject,
    text: text,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}
// ----

// Registration route
router.post("/register", async (req, res) => {
  // Registration logic
  try {
    const { name, email, password } = req.body;

    // Validate the input (you can add more validation here)
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Check if the user with the same email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

    // Create a new user with the hashed password
    const newUser = new User({ name, email, password: hashedPassword });

    // Save the user to the database
    await newUser.save();

    // Send a confirmation email to the registered user
    sendEmail(
      email,
      "Registration Confirmation",
      "Thank you for registering on our website!"
    );

    res
      .status(200)
      .json({ success: true, message: "Registration successful!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
// Login route
router.post("/login", async (req, res) => {
  // Login logic
  try {
    const { email, password } = req.body;

    // Validate the input (you can add more validation here)
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    // Find the user by their email in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. User not found.",
      });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Incorrect password.",
      });
    }

    // If authentication is successful, you can generate a JWT token here
    // and send it to the client for future authenticated requests
    req.session.user = user;

    res.status(200).json({ success: true, message: "Login successful!" });

    // res.redirect('/dashboard');
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// In your isAuthenticated middleware
function isAuthenticated(req, res, next) {
  // console.log('Checking authentication...');
  if (req.session && req.session.user) {
    // User is authenticated
    // console.log("user found");
    return next();
  } else {
    // console.log('Session or user not found:', req.session);
    // User is not authenticated, redirect to the login page
    res.redirect("/");
  }
}

// In your /dashboard route
// router.get('/dashboard', isAuthenticated, (req, res) => {
//     const user = req.session.user;
//     res.render('dashboard', { user });
//     // res.redirect('/');
// });

// Logout route
router.post("/logout", (req, res) => {
  // Logout logic
  try {
    // Clear the user's session to log them out
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error logging out" });
      }

      res.status(200).json({ success: true, message: "Logout successful" });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// let user = {
//     id: "4e5r6t7y890876r",
//     email: 'ok@gmail.com',
//     password: "xcfgvhjkhggchjk"
// }

const JWT_SECERT = "some super secert...";
router.get("/forgot-password", (req, res, next) => {
  res.render("forgot-password");
});

router.post("/forgot-password", async (req, res) => {
  const user = req.session.user;
  const { email } = req.body;
  // console.log(email);
  // console.log(mail);
  // console.log(id);

  try {
    const userInDatabase = await User.findOne({ email });
    if (!userInDatabase) {
      res.status(404).send("User not registered");
      return;
    }
    //otp 15min
    const secret = JWT_SECERT + userInDatabase.password; // Use your JWT_SECRET, consider storing it in an environment variable
    const payload = {
      email: userInDatabase.email,
      id: userInDatabase._id,
    };
    const otpExpiration = 15 * 60;
    const token = jwt.sign(payload, secret, { expiresIn: otpExpiration });
    const link = `http://localhost:3000/auth/password-reset/${userInDatabase.id}/${token}`;
    // Send a confirmation email to the registered user
    sendEmail(email, "Reset Password", link);
    //  ??????????????  send mail
    console.log(link);
    res.send("Password reset link has been sent to ur email...");
  } catch (error) {
    // console.log(user.id)
    console.log(email);
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

let secert;
router.get("/password-reset/:id/:token", async (req, res, next) => {
  const { id, token } = req.params;
  try {
    const user = await User.findById(id);
    if (id !== user.id) {
      res.send("Invalid id...");
      return;
    }
    secert = JWT_SECERT + user.password;
    const payload = jwt.verify(token, secert);

    // res.send(user)
    res.render("password-reset", { email: user.email });
  } catch (error) {
    // console.log('idhar')
    console.log(error.message);
    res.send(error.message);
  }
});
router.post("/password-reset/:id/:token", async (req, res, next) => {
  const { id, token } = req.params;
  // res.send(user);
  const { password, passwords } = req.body;
  try {
    const user = await User.findById(id);
    const payload = jwt.verify(token, secert);
    // Ensure that the token corresponds to the correct user
    if (user._id.toString() !== payload.id) {
      res.status(401).send("Unauthorized");
      return;
    }
    // Use bcrypt to hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password with the hashed password
    user.password = hashedPassword;

    // Save the updated user to the database
    await user.save();

    res.send("Password reset successful");

    // res.send(user)
    // res.render('password-reset', { email: user.email })
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
});

// Create a mongoose schema
const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// Create a mongoose model
const Subscriber = mongoose.model("Subscriber", subscriberSchema);

// Handle subscription
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  try {
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();
    res.json({ message: "Subscription successful!" });
    sendEmail(
      email,
      "NewsLetter From Book Bazaar",
      "Thank you for subscribing on our website! You will Recieve all the Latest Updates"
    );
  } catch (error) {
    res.status(500).json({ message: "Error subscribing. Please try again." });
  }
});

// // Endpoint to handle successful payments
// router.post("/payment-success", async (req, res) => {
//   const { email, address, customerId } = req.body;
//   try {
//     res.json({ message: "owmer" });
//     sendEmail(
//       email,
//       "owmer Book Bazaar",
//       `Thank you for your purchase! Your order will be shipped to the following address: ${address}`
//     );
//   } catch (error) {
//     res.status(500).json({ message: "Error" });
//   }
// });

// Endpoint to handle successful payments
router.post("/payment-success", async (req, res) => {
  const { email, address } = req.body; // Extract email and address from the request body

  try {
    // Send an email to the customer
    sendEmail(
      email,
      "Thank You for Your Purchase!",
      `Thank you for your purchase! Your order will be shipped to the following address: ${address}`
    );

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Error sending email" });
  }
});

module.exports = router;
