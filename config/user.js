import * as mongoose from "mongoose";

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userAvatarUrl: { type: String, default: "" },
  userName: { type: String, required: true },
  profileName: { type: String, required: true },
  followerCount: { type: Number, default: 0 },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  totalLikeCount: { type: Number, default: 0 },
  profileDescription: { type: String, default: "" },
  genres: [{ type: String }],
  ownedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "posts" }],
});

export default mongoose.model("users", UserSchema);
