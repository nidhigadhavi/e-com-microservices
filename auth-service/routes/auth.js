const Router = require("express").Router;
const router = new Router();
const User = require("../models/User");
const OTPMaster = require("../models/OTPMst");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const config = require('../config');

router.post("/register", async (req, res) => {
	console.log("into the register", req.body);
	const { username, password, email, mobile } = req.body;
	// verify if username and password are not empty
	if (!username || !password || !email) {
		return res.status(400).json({
			message: "Please provide username, password and email",
		});
	}
	const user = await User.findOne({ username });

	if (user)
		return res
			.status(400)
			.json({ error: true, message: "User already exists" });

	const salt = await bcrypt.genSalt(Number(10));
	const hashedPassword = await bcrypt.hash(password, salt);
	await new User({ ...req.body, password: hashedPassword }).save();

	return res
		.status(201)
		.json({ error: false, message: "User created successfully" });
});

router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	// verify if username and password are not empty
	if (!email || !password) {
		return res.status(400).json({
			message: "Please provide email and password",
		});
	}
	// find user by username
	// verify if user exists
	const user = await User.findOne({ email });
	if (!user)
		return res
			.status(400)
			.json({ error: true, message: "User does not exist" });
	const isValidPassword = await bcrypt.compare(
		req.body.password,
		user.password
	);
	if (!isValidPassword)
		return res
			.status(400)
			.json({ error: true, message: "Invalid password" });
	// create token
	const payload = {
		email,
		username: user.username,
	};
	const token = jwt.sign(payload, "secret", { expiresIn: "1h" });
	res.json({
		message: "User logged in",
		token: token,
	});
});

router.post("/send-otp", async (req, res) => {
	console.log("into the send-otp", req.body);
	const { mobile } = req.body;
	// verify if username and password are not empty
	if (!mobile) {
		return res.status(400).json({
			message: "Please provide mobilenumber",
		});
	}
	const user = await User.findOne({ mobile });

	if (!user)
		return res
			.status(400)
			.json({ error: true, message: "User does not exists" });
	var otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
	console.log("otp is::", otp);
	// await new OTPMaster({
	//     ...req.body,
	//     otp: otp,
	//     expiresIn: new Date(ISODate().getTime() + 1000 * 60 * 10),
	// }).save();
	await new OTPMaster({
		...req.body,
		otp: otp,
		expiresIn: new Date(ISODate().getTime() + 1000 * 60 * 10),
	}).save();
	return res
		.status(201)
		.json({ error: false, message: "Opt send successfully", OTP: otp });
});

router.post("/resend-otp", async (req, res) => {
	console.log("into the resend-otp", req.body);
	const { mobile } = req.body;
	// verify if username and password are not empty
	if (!mobile) {
		return res.status(400).json({
			message: "Please provide mobilenumber",
		});
	}
	const user = await User.findOne({ mobile });

	if (!user)
		return res
			.status(400)
			.json({ error: true, message: "User does not exists" });
	const OTPMasterEntry = await OTPMaster.find({
		$and: [
			{ mobile: mobile },
			{
				createdAt: {                   
					$lt: new Date(new Date().getTime() - 1000 * 60 * 10),
				},
			},
		],
	});
	console.log("otp master", OTPMasterEntry);
	if (!OTPMasterEntry) {
		console.log("create new otp");
		var otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
		console.log("otp is::", otp);
		await new OTPMaster({
			...req.body,
			otp: otp,
			expiresIn: new Date(ISODate().getTime() + 1000 * 60 * 10),
		}).save();
		return res
			.status(201)
			.json({ error: false, message: "Opt send successfully", OTP: otp });
	} else {
		console.log("create send old otp");
		// db.getCollection('collectionName').find({timestamp : {$gte: new Date().getTime()-(60*60*1000) } } )
		return res.status(200).json({
			error: true,
			message: "Opt send old",
			otp: OTPMasterEntry,
		});
	}

	// var otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
	// console.log("otp is::", otp);
	// await new OTPMaster({ ...req.body, otp: otp }).save();
	// return res
	// 	.status(201)
	// 	.json({ error: false, message: "Opt send successfully", OTP: otp });
});

module.exports = router;
