import React, { Fragment, useEffect, useRef, useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ConversationSkeleton from "../../components/skeletons/ConversationSkeleton";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Conversations = ({ selectedConversation, openMessages }) => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const imgRef = useRef(null);
  const messageEndRef = useRef(null);
  const queryClient = useQueryClient();
  const otherUserId = selectedConversation.otherUserId;

  //getting information of currently loggedin user
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  //send message mutation
  const {
    mutate: sendMessage,
    isPending: isSendingMessage,
    refetch: loadMessage,
    isRefetching: messageLoading,
  } = useMutation({
    mutationFn: async ({ text, otherUserId }) => {
      try {
        const res = await fetch("api/messages/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipientId: otherUserId, message: text }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "failed to send message");
        }

        return data;
      } catch (error) {
        console.log(error);
        throw new Error(error.message);
      }
    },
    onSuccess: async (data) => {
      setText("");

      await Promise.all[
        queryClient.invalidateQueries({ queryKey: ["messages"] }),
        queryClient.invalidateQueries({ queryKey: ["conversationList"] })
      ];
    },
  });

  //send message submit action
  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (text === "") {
      return;
    }
    sendMessage({ text, otherUserId });
  };

  //handle imge upload
  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // for getting all the messages with the other user
  const {
    data: messages,
    isPending: isMessagePending,
    isLoading:isMessageLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      try {
        if(selectedConversation.mock){
          console.log('Mock conversation')
          return;
        }
        const res = await fetch(
          `/api/messages/${selectedConversation.otherUserId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "failed to get messages");
        }
        return data;
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    },
   
  });

  useEffect(() => {
    messageEndRef.current.scrollIntoView({ behavior: "auto" });
    refetch();
  }, [refetch, selectedConversation.otherUserId, messages]);

  // console.log("messages lists", messages);

  return (
    <div className="relative flex flex-col  h-screen p-4 border-r border-gray-700">
      {/* top arrow nav */}
      <div className="z-10 flex gap-6 items-center p-2 border-b border-gray-700">
        <FaArrowLeftLong size={14} className="cursor-pointer" />
        <img
          src={selectedConversation.userProfileImg || "/avatars/boy3.png"}
          alt="User Avatar"
          className="rounded-full w-8 h-8"
        />
        <p className="font-bold">{selectedConversation.username}</p>
      </div>

      {/* messages section */}
      <div
        className="flex flex-col overflow-y-scroll scrollbar"
        ref={messageEndRef}
      >
        {/* chat with person's details */}
        <div className=" flex flex-col gap-2  items-center justify-center text-white py-4 px-2 mb-2 pb-8 border-b border-gray-700">
          {/* image username section */}
          <div className="flex items-center justify-center flex-col gap-1 mb-2">
            <img
              src={selectedConversation.userProfileImg || "/avatars/boy3.png"}
              alt="User Avatar"
              className="rounded-full w-12 h-12"
            />
            <p className="font-bold">{selectedConversation.fullName}</p>
            <p className="text-gray-500 text-sm">
              {selectedConversation.otherUsername}
            </p>
          </div>
          <p className="text-gray-500 text-sm">This is my bio</p>
          <p className="text-gray-500 text-sm">
            Joined May 2017 · 106 Followers
          </p>
        </div>

        {/* chat messages section */}
        {isMessagePending ? (
          <ConversationSkeleton />
        ) : (
          <div className=" flex flex-col mb-10">
            {messages?.map((message) => {
              return (
                <Fragment key={message._id}>
                  {authUser?._id !== message?.sender.toString() && (
                    <>
                      {/* the message from other user */}
                      <div className="chat chat-start">
                        <div className="chat-image avatar">
                          <div className="w-10 rounded-full">
                            <img
                              alt="Tailwind CSS chat bubble component"
                              src={
                                selectedConversation.userProfileImg ||
                                "/avatars/boy3.png"
                              }
                            />
                          </div>
                        </div>

                        <div className="chat-bubble rounded-xl">
                          {message.text}
                        </div>
                        <div className="chat-footer opacity-50">
                          <time className="text-xs opacity-50">12:46</time>
                        </div>
                      </div>
                    </>
                  )}

                  {authUser._id === message.sender && (
                    <>
                      {/* my messages */}
                      <div className="chat chat-end">
                        <div className="chat-bubble rounded-xl">
                          {message.text}
                        </div>
                        <div className="chat-footer opacity-50">
                          Seen at 12:46
                        </div>
                      </div>
                    </>
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* send message / Input field */}
      <div className="mt-3 z-20 bg-black absolute bottom-1 right-1 left-1 border-t border-gray-700">
        <form
          className="flex flex-col gap-2 w-full px-2"
          onSubmit={handleMessageSubmit}
        >
          {img && (
            <div className="relative w-72 mx-auto">
              <IoCloseSharp
                className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
                onClick={() => {
                  setImg(null);
                  imgRef.current.value = null;
                }}
              />
              <img
                src={img}
                className="w-full mx-auto h-72 object-contain rounded"
              />
            </div>
          )}

          <div className="flex justify-between  py-2">
            <div className="flex gap-1 items-center">
              <CiImageOn
                className="fill-primary w-6 h-6 cursor-pointer"
                onClick={() => imgRef.current.click()}
              />
              <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
            </div>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={imgRef}
              onChange={handleImgChange}
            />
            <input
              type="text"
              className=" w-full px-3 rounded-xl  mx-1  resize-none border-none focus:outline-none"
              placeholder="Start a new message"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="btn btn-primary rounded-full btn-sm text-white px-4">
              {isSendingMessage ? <LoadingSpinner size="xs" /> : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Conversations;
