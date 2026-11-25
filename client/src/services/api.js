import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const uploadChatImage = async (imageFile) => {
  const formData = new FormData();

  formData.append("image", imageFile);

const response = await API.post("/message/upload-image", formData);
  return response.data.imageUrl;
};

export default API;