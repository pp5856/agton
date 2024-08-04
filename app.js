import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

//models.
import User from './models/User.js';

dotenv.config();

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to DB"));

const app = express();

app.use(cors());
app.use(express.json());


//회원가입 API


app.post('/signup', async (req, res) => {
    const { username, password } = req.body; //전달받음

    try {
        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 생성
        const newUser = new User({ 
            username, 
            password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(400).json({ message: 'Error creating user', error: err });
    }
});


//로그인 API

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 사용자 찾기
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // 비밀번호 확인
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // JWT 생성
        const token = jwt.sign(
            { id: user._id }, 
            'your_jwt_secret', 
            { expiresIn: '1h' 

            });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});


app.listen(3000, () => console.log("Server started"));