import httpStatus from "http-status";
import { User } from "../models/User.model.js";
import bcript from "bcrypt";
import crypto from "crypto";

const register = async (req, res) => {
    const { name, username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User is already exist" });
        }


        const hashpassword = await bcript.hash(password,10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashpassword
        })

        await newUser.save();

        return res.status(httpStatus.CREATED).json({ message: "User register" })
    }

    catch (e) {
        res.json({ message: `Something went wrog ${e}` });
    }
}


const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(httpStatus.NO_CONTENT).json({ message: "Please enter the username and password." });
        }

        const foundUser = await User.findOne({ username }); // Use 'foundUser' instead of 'user'
        if (!foundUser) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Your username is not found." });
        }

        if (await bcript.compare(password, foundUser.password)) {
            let token = crypto.randomBytes(20).toString("hex");
            foundUser.token = token;

            await foundUser.save();
            return res.status(httpStatus.OK).json({ token: token });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Incorrect password." });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${error}` });
    }
};



export { login, register };