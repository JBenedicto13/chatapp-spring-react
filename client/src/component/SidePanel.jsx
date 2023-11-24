import React from "react";

const SidePanel = ({ privateChats, tab, setTab }) => {
  return (
    <>
      {/* <div className="container w-2/12 bg-slate-50 text-slate-950 text-center">
      <h1>IN THIS CHAT</h1>
      <ul>
        {activeUsers.map((user, index) => {
          return <li key={index}>{user}</li>;
        })}
      </ul>
    </div> */}
      <div className="member-list container w-2/12 bg-slate-50 text-slate-950 text-center">
        <ul>
          <li
            onClick={() => {
              setTab("CHATROOM");
            }}
            className={`member ${tab === "CHATROOM" && "active"}`}
          >
            In this chat
          </li>
          {[...privateChats.keys()].map((name, index) => (
            <li
              onClick={() => {
                setTab(name);
              }}
              className={` hover:cursor-pointer p-4 member ${
                tab === name && "active"
              }`}
              key={index}
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SidePanel;
