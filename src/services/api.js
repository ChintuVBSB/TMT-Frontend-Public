import axios from "axios";
 


const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});
  
export default instance;


// import.meta.env.VITE_BASE_URL 