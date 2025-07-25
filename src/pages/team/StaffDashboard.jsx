// StaffDashboard.jsx
import { useEffect, useState, useMemo } from "react";
import axios from "../../services/api";
import { getToken } from "../../utils/token";
import debounce from "lodash.debounce";
import RejectModal from "../../components/RejectModal";
import StaffNavbar from "../../components/navbars/StaffNavbar";
import {
  Calendar,
  Tag,
  User,
  ListTodo,
  CheckCircle,
  XCircle,
  Building
} from "lucide-react";
import NotificationBell from "../tasks/NotificationBell";
import BlurText from "./BlurText";
import toast from "react-hot-toast";
import { Dialog } from "@headlessui/react";
import RewardCard from "../../components/RewardCard";

function StaffDashboard() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("To Do");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [user, setUser] = useState({});
  const [filterMode, setFilterMode] = useState("7days");
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [remarkTaskId, setRemarkTaskId] = useState(null);
  const [delayReason, setDelayReason] = useState("");
  const [isRetryRequest, setIsRetryRequest] = useState(false);

  const fetchMyTasks = async () => {
    try {
      const params = {};
      if (activeTab === "Completed") {
        const today = new Date();
        let start = new Date();
        start.setDate(today.getDate() - (filterMode === "7days" ? 7 : 30));
        params.completedAfter = start.toISOString();
      }

      const res = await axios.get("/assign/tasks/my", {
        headers: { Authorization: `Bearer ${getToken()}` },
        params
      });
      setTasks(res.data.tasks);
      setFilteredTasks(res.data.tasks);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get("/auth/profile", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user", err);
    }
  };

  const handleAccept = async (taskId) => {
    try {
      await axios.patch(
        `/assign/tasks/accept/${taskId}`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      fetchMyTasks();
    } catch (err) {
      console.error("Error accepting task", err);
    }
  };

  const handleReject = async (reason) => {
    try {
      await axios.patch(
        `/assign/tasks/reject/${selectedTaskId}`,
        { reason },
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      setShowRejectModal(false);
      fetchMyTasks();
    } catch (err) {
      console.error("Error rejecting task", err);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await axios.patch(
        `/assign/tasks/complete/${taskId}`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      fetchMyTasks();
    } catch (err) {
      console.error("Error completing task", err);
    }
  };

  const handleRemarkSubmit = async () => {
    try {
      if (isRetryRequest) {
        await axios.post(
          `/assign/tasks/retry-request/${remarkTaskId}`,
          {
            remark: remarkText,
            delayReason
          },
          {
            headers: { Authorization: `Bearer ${getToken()}` }
          }
        );
        toast.success("Retry request sent!");
      } else {
        await axios.post(
          `/assign/tasks/remark/${remarkTaskId}`,
          {
            remark: remarkText,
            delayReason
          },
          {
            headers: { Authorization: `Bearer ${getToken()}` }
          }
        );
        toast.success("Remark submitted!");
      }

      setShowRemarkModal(false);
      setRemarkText("");
      setRemarkTaskId(null);
      setDelayReason("");
      setIsRetryRequest(false);
      fetchMyTasks();
    } catch (err) {
      toast.error("Failed to submit.");
      console.error("Error submitting", err);
    }
  };

  const debouncedFilter = useMemo(
    () =>
      debounce((query) => {
        const filtered = tasks.filter((task) =>
          task.title.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredTasks(filtered);
      }, 500),
    [tasks]
  );

  useEffect(() => {
    fetchMyTasks();
    fetchUser();
  }, [activeTab, filterMode]);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredTasks(tasks);
    } else {
      debouncedFilter(search);
    }
  }, [search, tasks]);

  const handleRetryRequest = async (taskId) => {
    try {
      await axios.post(
        `/assign/tasks/retry-request/${taskId}`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      fetchMyTasks();
      toast.success("Retry request sent!");
    } catch (err) {
      toast.error("Failed to send retry request.");
      console.error("Error requesting retry", err);
    }
  };

  const filteredByTab = filteredTasks.filter((task) => {
    if (activeTab === "To Do") return task.status === "Pending";
    if (activeTab === "In Progress") return task.status === "In Progress";
    if (activeTab === "Completed") return task.status === "Completed";
    return true;
  });

  return (
    <>
      <RewardCard />

      {/* Modals */}
      <Dialog
        open={showRemarkModal}
        onClose={() => {
          setShowRemarkModal(false);
          setIsRetryRequest(false);
        }}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
            <Dialog.Title className="text-lg font-bold mb-2">
              Task Remark
            </Dialog.Title>

            <select
              className="w-full border border-gray-300 rounded p-2 mb-4"
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              required
            >
              <option value="">Select Delay Reason</option>
              <option value="Client Delay">Delay by Client</option>
              <option value="Staff Delay">Delay by Me</option>
              <option value="Technical Issue">Technical/System Issue</option>
            </select>

            <textarea
              className="w-full border border-gray-300 rounded p-2 mb-4"
              rows={4}
              placeholder="Enter reason for unable to do this task..."
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowRemarkModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleRemarkSubmit}
                disabled={!remarkText.trim() || !delayReason}
              >
                Submit
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onSubmit={handleReject}
      />

      <StaffNavbar />

      <div className="max-w-7xl pt-24 mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <BlurText
            text={`Welcome, ${user?.name || "User"}`}
            delay={100}
            animateBy="words"
            direction="top"
            className="text-2xl font-bold"
          />
          <NotificationBell
            tasks={tasks.filter((task) => task.status !== "Remarked")}
          />
        </div>

        <input
          type="text"
          placeholder="Search tasks..."
          className="w-full p-3 pl-4 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex space-x-8 mb-6 text-base font-semibold text-gray-700 border-b border-gray-200">
          {["To Do", "In Progress", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 transition-all ${
                activeTab === tab
                  ? "border-b-4 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Completed" && (
          <div className="flex gap-3 mb-4">
            {["7days", "30days"].map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`text-sm px-3 py-1 rounded ${
                  filterMode === mode
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Last {mode === "7days" ? "7" : "30"} Days
              </button>
            ))}
          </div>
        )}

        {filteredByTab.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No tasks found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Title
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Due Date
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Client
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Tags
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Assigned By
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredByTab.map((task) => {
                  const isExpired = (() => {
                    const due = new Date(task.due_date);
                    due.setHours(23, 59, 59, 999); // Allow full day
                    return due < new Date();
                  })();
                  return (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 capitalize">{task.title}</td>
                      <td className="px-4 py-3">
                        {new Date(task.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{task.description}</td>
                      <td className="px-4 py-3">
                        {task.client?.name || "---"}
                      </td>
                      <td className="px-4 py-3">{task.tags}</td>
                      <td className="px-4 py-3">{task.assigned_by?.name}</td>

                      <td className="px-4 py-3 space-x-2">
                        {task.status === "Pending" && !isExpired && (
                          <>
                            <button
                              onClick={() => handleAccept(task._id)}
                              className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTaskId(task._id);
                                setShowRejectModal(true);
                              }}
                              className="bg-gray-500 text-white px-3 py-1 text-sm rounded hover:bg-gray-600"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {task.status === "Pending" && isExpired && (
                          <>
                            {/* Remove Remark (Expired) button */}
                            {task.retryRequested ? (
                              <span className="text-blue-600 text-sm font-medium">
                                Retry Requested
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setRemarkTaskId(task._id);
                                  setShowRemarkModal(true);
                                  setIsRetryRequest(true);
                                }}
                                className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700"
                              >
                                Request Retry
                              </button>
                            )}
                          </>
                        )}

                        {task.status === "In Progress" && (
                          <button
                            onClick={() => handleComplete(task._id)}
                            className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default StaffDashboard;
