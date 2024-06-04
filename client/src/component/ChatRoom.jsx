import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client/dist/sockjs";
import Stomp from "stompjs";
import GetTime from "../utils/GetCurrentTimeFormatted";
import GetSimplifiedTime from "../utils/GetSimplifiedTimeFormat";
import { config } from "../utils/config";

const colors = [
  "#2196F3",
  "#32c787",
  "#00BCD4",
  "#ff5652",
  "#ffc107",
  "#ff85af",
  "#FF9800",
  "#39bbb0",
];

var stompClient = null;

const ChatRoom = ({ privateChats, setPrivateChats, tab }) => {
  const [publicChats, setPublicChats] = useState([]);
  const [userData, setUserData] = useState({
    username: "",
    receivername: "",
    connected: false,
    message: "",
  });
  const [messages, setMessages] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(null);
  const [now, setNow] = useState("");

  const messageAreaRef = useRef();

  useEffect(() => {
    // Scroll to the latest message
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }

    console.log(privateChats);

    setNow(GetTime());
  }, [messages, privateChats]);

  const connect = async (event) => {
    event.preventDefault();

    if (userData.username.trim()) {
      const socket = new SockJS(`http://${config.host_ip_address}:8080/ws`);
      stompClient = Stomp.over(socket);
      setConnecting(true);

      stompClient.connect(
        {},
        () => {
          // console.log("Connected to WebSocket server");
          onConnected();
        },
        (error) => {
          console.error("Error connecting to WebSocket server", error);
          onError(error);
        }
      );
    }
  };

  const onConnected = () => {
    setUserData({ ...userData, connected: true });
    stompClient.subscribe("/topic/public", onMessageReceived);
    stompClient.subscribe(
      "/user/" + userData.username + "/private",
      onPrivateMessage
    );

    stompClient.send(
      "/app/chat.addUser",
      {},
      JSON.stringify({ sender: userData.username, type: "JOIN" })
    );
    setConnecting(false);
    setIsConnected(true);
  };

  const onError = (error) => {
    console.error("error: " + error);
  };

  const sendMessage = (event) => {
    event.preventDefault();

    if (userData.message.trim() && stompClient) {
      const chatMessage = {
        sender: userData.username,
        content: userData.message,
        type: "CHAT",
        date_time_sent: now,
      };
      stompClient.send(
        "/app/chat.sendMessage",
        {},
        JSON.stringify(chatMessage)
      );
      setUserData({ ...userData, message: "" });
    }
  };

  const sendPrivateMessage = (event) => {
    event.preventDefault();

    if (userData.message.trim() && stompClient) {
      const chatMessage = {
        sender: userData.username,
        reciever: tab,
        content: userData.message,
        type: "CHAT",
        date_time_sent: now,
      };

      if (userData.username !== tab) {
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }

      stompClient.send(
        "/app/chat.sendMessage",
        {},
        JSON.stringify(chatMessage)
      );
      setUserData({ ...userData, message: "" });
    }
  };

  const onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);
    console.log(message);

    if (message.type === "JOIN") {
      message.content = message.sender + " joined!";

      if (!privateChats.get(message.sender)) {
        privateChats.set(message.sender, []);
        setPrivateChats(new Map(privateChats));
      }
    } else if (message.type === "LEAVE") {
      message.content = message.sender + " left!";
      privateChats.pop(message.sender);
    }

    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const onPrivateMessage = (payload) => {
    var payloadData = JSON.parse(payload.body);
    if (privateChats.get(payloadData.sender)) {
      privateChats.get(payloadData.sender).push(payloadData);
      setPrivateChats(new Map(privateChats));
    } else {
      let list = [];
      list.push(payloadData);
      privateChats.set(payloadData.sender, list);
      setPrivateChats(new Map(privateChats));
    }
  };

  const getAvatarColor = (messageSender) => {
    let hash = 0;
    for (let i = 0; i < messageSender.length; i++) {
      hash = 31 * hash + messageSender.charCodeAt(i);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  function getAvatarInitials(messageSender) {
    const words = messageSender.split(" ");
    let initials = "";

    // Take the first character of each word and limit to 2 characters
    for (let i = 0; i < words.length; i++) {
      initials += words[i].charAt(0);
      if (initials.length >= 2) {
        break;
      }
    }

    return initials.toUpperCase();
  }

  const handleUsername = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, username: value });
  };

  const handleMessage = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, message: value });
  };

  return (
    <div className="container w-5/6 bg-slate-50 text-slate-950 rounded-sm p-3">
      <div className="registration-page text-center" hidden={isConnected}>
        <h1 className=" text-3xl">Registration Page</h1>
        <form>
          <div className="my-3 flex flex-col items-center">
            <label className=" text-lg" htmlFor="username">
              Enter a Username:
            </label>
            <input
              className="border-2 rounded-sm text-sm p-1 w-3/6"
              type="text"
              name="username"
              id="username"
              value={userData.username}
              onChange={handleUsername}
            />
          </div>
          <div className="my-3">
            <button
              onClick={connect}
              className="border-2 rounded-sm p-1 hover:bg-slate-500"
              type="submit"
            >
              Join Chat
            </button>
          </div>
        </form>
      </div>

      <div className="chat-room" hidden={!isConnected}>
        <div className="room-header text-center border-b-slate-400 border-b-2 p-3">
          <h1 className=" text-3xl">CHAT ROOM</h1>
        </div>
        <div className="room-body">
          <div
            className="message-area flex-wrap overflow-y-scroll mt-2"
            style={{ maxHeight: "550px" }}
            ref={messageAreaRef}
          >
            <ul className="flex-col my-3">
              {messages.map((message, index) => {
                const isSameSenderAsPrevious =
                  index > 0 &&
                  messages[index - 1].type === "CHAT" &&
                  messages[index - 1].sender === message.sender;

                return (
                  <li key={index} className="py-1">
                    {message.type === "CHAT" ? (
                      <div className="list-message flex-col">
                        {!isSameSenderAsPrevious && (
                          <div className="text-center">
                            {GetSimplifiedTime(message.date_time_sent)}
                          </div>
                        )}
                        <div className="flex space-x-3">
                          {!isSameSenderAsPrevious && (
                            <div
                              style={{
                                backgroundColor: getAvatarColor(message.sender),
                              }}
                              className="avatar flex items-center justify-center bg-orange-400 text-white rounded-full h-12 w-12"
                            >
                              <i>{getAvatarInitials(message.sender)}</i>
                            </div>
                          )}
                          <div className="list-message-body">
                            {!isSameSenderAsPrevious && (
                              <h1>
                                <b>{message.sender}</b>
                              </h1>
                            )}
                            <p
                              className={
                                isSameSenderAsPrevious ? "samaPrevSender" : ""
                              }
                            >
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center">{message.content}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <form className="message-form">
            <div className="mt-3 flex space-x-2  p-2">
              <input
                value={userData.message}
                onChange={handleMessage}
                className=" border-2 rounded-sm text-sm p-1 w-full"
                type="text"
                name="messageInput"
                id="messageInput"
                placeholder="Enter message here"
              />
              <button
                onClick={sendMessage}
                className="border-2 rounded-sm p-1 hover:bg-slate-500"
                type="submit"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
