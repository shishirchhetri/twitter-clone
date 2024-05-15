import { useQuery } from "@tanstack/react-query";
import React from "react";
import { BsCheck2All } from "react-icons/bs";

const ConversationList = ({
  conversation,
  setSelectedConversation,
  selectedConversation,
  isOnline,
  isSeen
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
      return str.slice(0, switchConversationmaxLength) + "..."; // Return the truncated string with ellipsis
    }
  }

  const switchConversation = () => {
    console.log('selectedConversation before',selectedConversation)

    setSelectedConversation({
      _id: conversation._id,
      otherUserId: conversation.participants[0]._id,
      userProfileImg: conversation.participants[0].profileImg,
      username: conversation.participants[0].username,
      fullName: conversation.participants[0].fullName,
      mock: conversation.mock,
    });
    console.log('selectedConversation after',selectedConversation)
  };


  return (
    <div
      className={`py-4 p-2 flex items-center gap-3 border-y border-gray-700 hover:bg-stone-900 cursor-pointer ${
        selectedConversation?._id === conversation._id ? "bg-stone-900" : ""
      }`}
      onClick={switchConversation}
    >
      <div className="relative ">
        <img
          src={conversation.participants[0].profileImg || "/avatars/avatar.png"}
          alt="avatar"
          className="h-12 w-12 rounded-full shrink-0 "
        />
        <div className={`z-10 h-[10px] w-[10px] rounded-full absolute top-0 right-0 ${isOnline ? 'bg-green-300' : ''} `}></div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-1">
          <p className="font-bold">
            {conversation.participants[0].username} <span>·</span>{" "}
            <span className="font-semibold">2 hr</span>
          </p>
        </div>
        <p className="text-gray-500 text-sm flex gap-3 items-center">
          {authUser._id === conversation.lastMessage.sender ? "You: " : ""}
          {truncate(conversation.lastMessage.text, 24)} <span>{conversation.lastMessage.text!=='' && isSeen ? <BsCheck2All className="fill-blue-500"/> : <BsCheck2All className="fill-slate-500"/>}</span>
        </p>
      </div>
    </div>
  );
};

export default ConversationList;
