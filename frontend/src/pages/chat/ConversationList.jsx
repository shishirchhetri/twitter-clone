import { useQuery } from "@tanstack/react-query";
import React, { useCallback } from "react";
import { BsCheck, BsCheck2All } from "react-icons/bs";

const ConversationList = ({
  conversation,
  setSelectedConversation,
  selectedConversation,
}) => {
  //getting the info of current logged in user
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  //truncate the long messages
  function truncate(str, maxLength) {
    if (str.length <= maxLength) {
      return str; // Return the original string if it's already shorter than or equal to the maxLength
    } else {
      return str.slice(0, maxLength) + "..."; // Return the truncated string with ellipsis
    }
  }

  const switchConversation = () => {
    setSelectedConversation({
      _id: conversation._id,
      otherUserId: conversation.participants[0]._id,
      userProfileImg: conversation.participants[0].profileImg,
      fullName: conversation.participants[0].fullName,
    });
    console.log('otherUserId',conversation.participants[0]._id)
  };

  return (
    <div
      className={`py-4 p-2 flex items-center gap-3 border-y border-gray-700 hover:bg-stone-900 cursor-pointer ${
        selectedConversation?._id === conversation._id ? "bg-stone-900" : ""
      }`}
      onClick={switchConversation}
    >
      <div className="">
        <img
          src={conversation.participants[0].profileImg || "/avatars/boy3.png"}
          alt=""
          className="h-12 w-12 rounded-full shrink-0"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-1">
          <p className="font-bold">
            {conversation.participants[0].fullName} <span>·</span>{" "}
            <span className="font-semibold">2 hr</span>
          </p>
        </div>
        <p className="text-gray-500 text-sm flex gap-3 items-center">
          {authUser._id === conversation.lastMessage.sender ? "You: " : ""}
          {truncate(conversation.lastMessage.text, 24)}
        </p>
      </div>
    </div>
  );
};

export default ConversationList;
