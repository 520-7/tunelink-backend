const user = {
  userName: "newname3",
  profileName: "oyilmazel",
  following: [],
  totalLikeCount: 0,
  followerCount: 1000,
  profileDescription: "Fuck corpos",
  genres: ["Metal"],
  ownedPosts: [],
};

const formData = new FormData();
formData.append("user", JSON.stringify(user)); // the user object should have the required fields, you can see a template of it in the json test data
// formData.append("userAvatar", avatarFile); // Again buffer
const res = await fetch("http://localhost:3000/api/upload/uploadUser", {
  method: "POST",
  body: formData,
});

console.log(res);
