import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const jsonFilePath =
  "/Users/ozelyilmazel/Documents/tunelink/tunelink-backend/data/dummy/MOCK_USER.json";

const apiEndpoint = "http://localhost:3000/api/upload/uploadUser";

const users = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

async function uploadUser(userData) {
  const formData = new FormData();

  if (userData.avatarFilePath) {
    formData.append("file", fs.createReadStream(userData.avatarFilePath));
  }

  formData.append("user", JSON.stringify(userData));

  try {
    const response = await axios.post(apiEndpoint, formData, {
      headers: formData.getHeaders(),
    });
    console.log(`User ${userData.id} uploaded successfully:`, response.data);
  } catch (error) {
    console.error(`Error uploading user ${userData.id}:`, error.response.data);
  }
}

async function uploadUsers(users) {
  for (const user of users) {
    await uploadUser(user);
  }
}

uploadUsers(users)
  .then(() => console.log("All users have been processed."))
  .catch((error) =>
    console.error("An error occurred during the upload process:", error)
  );
