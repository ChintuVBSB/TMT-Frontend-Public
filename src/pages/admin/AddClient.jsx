import { useState, useEffect } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import AdminNavbar from "../../components/navbars/AdminNavbar";
import {
  Building2,
  Phone,
  ScrollText,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { MdEmail } from "react-icons/md";

function AddClient() {
  const [name, setName] = useState("");
  const [gstin, setGstin] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get("/clients", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setClients(res.data);
    } catch (err) {
      toast.error("Failed to fetch clients");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "/clients",
        { name, gstin, email },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success("Client added!");
      setName("");
      setGstin("");
      setEmail("");
      fetchClients(); // refresh list
    } catch (err) {
      toast.error("Error adding client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 pt-26 px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold text-purple-700 mb-6 flex items-center gap-2">
            <UserPlus className="w-6 h-6" /> Add Client
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
          >
            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                Client Name
              </label>
              <input
                placeholder="e.g. ABC Pvt Ltd"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <ScrollText className="w-4 h-4" />
                GSTIN
              </label>
              <input
                placeholder="e.g. 22AAAAA0000A1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <MdEmail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                placeholder="e.g. client@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 bg-purple-700 text-white px-4 py-2 rounded ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? <Loader /> : "Add Client"}
              </button>
            </div>
          </form>

          <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <UsersRound className="w-5 h-5" /> Existing Clients
          </h2>

          {clients.length > 0 ? (
            <ul className="divide-y text-sm">
              {clients.map((client) => (
                <li key={client._id} className="py-2">
                  <strong>{client.name}</strong> <br />
                  <span className="text-gray-600">
                    GSTIN: {client.gstin || "N/A"} | Contact:{" "}
                     {client.email || "N/A"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No clients added yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default AddClient;
