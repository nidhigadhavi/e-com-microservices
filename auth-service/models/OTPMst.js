const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OTPMasterSchema = new Schema(
	{
		otp: {
			type: Number,
			required: true,
		},
		mobile: {
			type: Number,
		},
		expiresIn: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("OTPMaster", OTPMasterSchema);
