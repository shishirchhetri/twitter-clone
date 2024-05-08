import React from "react";
import { IoSettingsOutline } from "react-icons/io5";


const Chat = ({setActiveConversation}) => {
  function truncate(str, maxLength) {
    if (str.length <= maxLength) {
      return str; // Return the original string if it's already shorter than or equal to the maxLength
    } else {
      return str.slice(0, maxLength) + "..."; // Return the truncated string with ellipsis
    }
  }

  const message =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia quis architecto illum quidem vitae provident accusamus non quos alias nihil.";

  return (
    <div className="flex-[1.1] border-l border-r border-gray-700 min-h-screen ">

    <div className="flex justify-between items-center p-4  border-b border-gray-700">
      <p className="font-bold">Messages</p>

      <div className="relative inline-block">
          <IoSettingsOutline className="w-4" />
      </div>
    </div>

    <div className=" py-4 p-2 flex items-center gap-3 border-y border-gray-700 hover:bg-stone-900 cursor-pointer"
    onClick={()=> setActiveConversation(1)}
    >
      <div className="h-9 w-9">
        <img src="/avatars/boy1.png" alt="" className="" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-1">
          <p className="font-bold">Full Name</p>
          <p className="text-gray-700 text-sm">
            @username <span>·</span>{" "}
            <span className="font-semibold">2 hr</span>
          </p>
        </div>
        <p className="text-gray-500 text-sm">
          {truncate(message, 25)}
        </p>
      </div>
    </div>
  </div>
  );
};

export default Chat;
