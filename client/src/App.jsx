import { useState } from "react";
import "./App.css";
import ChatRoom from "./component/ChatRoom";
import SidePanel from "./component/SidePanel";

function App() {
  const [privateChats, setPrivateChats] = useState(new Map());
  const [tab, setTab] = useState("CHATROOM");

  return (
    <div className="app flex justify-center items-center mt-6">
      <ChatRoom
        privateChats={privateChats}
        setPrivateChats={setPrivateChats}
        tab={tab}
      />
      <SidePanel privateChats={privateChats} tab={tab} setTab={setTab} />
    </div>
  );
}

export default App;
