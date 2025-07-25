import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "../services/api";
import { MessageCircleMore, X } from "lucide-react";
const socket = io(import.meta.env.VITE_BASE_URL, {
  transports: ["websocket", "polling"]
}); // replace with env

const ChatBox = ({ projectId, user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!projectId || !user?._id) return;

    socket.emit("joinProjectRoom", { projectId, userId: user._id });

    socket.on("receiveMessage", (messageData) => {
      setMessages((prev) => [...prev, messageData]);

      // Play sound if the message is from someone else
      if (messageData?.sender?._id !== user._id) {
        playNotificationSound();
      }
    });

    return () => socket.off("receiveMessage");
  }, [projectId, user?._id]);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await axios.get(`/chat/${projectId}`);
      setMessages(res.data);
    };
    fetchMessages();
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const messageData = {
      sender: { _id: user._id },
      message: input,
      createdAt: new Date()
    };

    // Play sound when sending
    playNotificationSound();
    socket.emit("sendMessage", { projectId, messageData });
    setInput("");
  };

  const playNotificationSound = () => {
    const audio = new Audio("/mixkit-message-pop-alert-2354.mp3");
    audio.volume = 0.5; // Optional: Set volume from 0.0 to 1.0
    audio.play().catch((e) => console.log("Sound play failed:", e));
  };

  return (
    <div
      className="fixed top-[85px] right-0 w-full sm:w-[400px] h-[calc(90vh-85px)] 
                 bg-white shadow-lg z-50 flex flex-col border-l border-gray-200"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-blue-800 text-white shadow">
        <h2 className="text-lg flex items-center gap-2 font-semibold">
          <MessageCircleMore /> Project Chat
        </h2>
        <button
          onClick={onClose}
          className="text-white text-xl font-bold hover:scale-105"
        >
          <X />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gray-50">
        {messages.map((msg, index) => {
          const isSelf = msg?.sender?._id === user._id;
          return (
            <div
              key={index}
              className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 rounded-lg shadow text-sm 
                            ${isSelf ? "bg-blue-100 text-right" : "bg-gray-100 text-left"}`}
              >
                <p className="font-semibold text-gray-800">
                  {msg?.sender?.name || "Unknown"}{" "}
                  <span className="text-xs text-gray-500 italic">
                    (
                    {msg?.sender?.role === "team_lead"
                      ? "Team Leader"
                      : msg?.sender?.role}
                    )
                  </span>
                </p>
                <p className="text-gray-700 break-words">{msg.message}</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString()
                    : ""}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 bg-white flex gap-2 items-center">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
