// handles the signup process
const handleSignup = async () => {
  // if these fields are not provided, return an error
  if (!email || !username || !password || !profilename) {
    console.error("All fields are required.");
    return;
  }

  // create a user object with the provided fields
  try {
    const user = {
      userName: username,
      profileName: profilename,
      followerCount: 0,
      following: [{}],
      totalLikeCount: 0,
      profileDescription: "this is a profile description",
      genres: [],
      ownedPosts: [{}],
    };

    // create a form data object with the user object
    const formData = new FormData();
    formData.append("user", JSON.stringify(user));

    const response = await fetch(
      "http://172.31.78.154:3000/api/upload/uploadUser",
      {
        method: "POST",
        body: formData,
      }
    );

    const responseData = await response.json();
    const userId = responseData.userId;
    console.log(responseData);

    if (response.ok) {
      navigation.navigate("Onboarding", { userId });
    } else {
      console.error("Server error:", response);
    }
  } catch (error) {
    console.error("Network request failed:", error);
  }
};
