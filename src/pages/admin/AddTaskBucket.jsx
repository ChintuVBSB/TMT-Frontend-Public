import { useEffect, useState } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import toast from "react-hot-toast";
import BackButton from "../../components/BackButton";
import Loader from "../../components/Loader"; // 👈 Make sure this exists
import AdminNavbar from "../../components/navbars/AdminNavbar";
import {LayoutList,CheckLine} from "lucide-react";

function AddTaskBucket() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [buckets, setBuckets] = useState([]);

  useEffect(() => {
    fetchBuckets();
  }, []);

  const fetchBuckets = async () => {
    try {
      const res = await axios.get("/task-buckets", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setBuckets(res.data);
    } catch (err) {
      toast.error("Failed to fetch buckets");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "/task-buckets",
        { title },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Task Bucket added!");
      setTitle("");
      fetchBuckets(); // Refresh list
    } catch (err) {
      toast.error("Error adding task bucket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen px-4 pt-32 py-10 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-purple-700 mb-4">
            <LayoutList /> Add Task Bucket
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
            <input
              type="text"
              placeholder="Bucket Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="flex-1 px-4 py-2 border rounded-md w-full sm:w-auto"
            />
            <button
              type="submit"
              disabled={loading}
              className={`bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-md flex items-center justify-center gap-2 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader /> Adding...
                </>
              ) : (
                "Add Bucket"
              )}
            </button>
          </form>

          <h2 className="text-lg flex items-center gap-2 font-semibold text-gray-700 mb-2">
            <CheckLine /> Existing Task Buckets:
          </h2>
          {buckets.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              {buckets.map((bucket) => (
                <li key={bucket._id}>{bucket.title}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No task buckets available.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default AddTaskBucket;
