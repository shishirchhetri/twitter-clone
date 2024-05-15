import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { CiImageOn } from "react-icons/ci";
import { BsCheck2All } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ConversationSkeleton from "../../components/skeletons/ConversationSkeleton";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useSocket } from "../../context/socketContext";

const Conversations = ({ selectedConversation,setSelectedConversation }) => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);
  const messageEndRef = useRef(null);
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  //the id of the user to whom we want to send message
  const otherUserId = selectedConversation.otherUserId;

  //getting information of currently loggedin user
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  //send message mutation
  const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
    mutationFn: async ({ text, otherUserId, img }) => {
      try {
        const res = await fetch("api/messages/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientId: otherUserId,
            message: text,
            img,
          }),
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
      setImg("");
      queryClient.invalidateQueries({ queryKey: ["conversationLists"] });
      // await Promise.all[
      //   // (queryClient.invalidateQueries({ queryKey: ["messages"] }),
      // ];
    },
  });

  //handle imge upload
  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
        console.log("img: ", img);
      };
      reader.readAsDataURL(file);
    }
  };

  // for getting all the messages with the other user
  const {
    data: messages = [],
    isPending: isMessagePending,
    refetch: refetchMessages,
    isRefetching: isRefetchingMessage,
  } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      //do not run the query for the mock /new conversation
      if (selectedConversation.mock === true) {
        return messages;

      }

      try {
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

  //refetching all the messages on change of selected conversation
  useEffect(() => {
    refetchMessages();
  }, [selectedConversation.otherUserId]);

  //auto scroll to the end of the chat
  useEffect(() => {
    messageEndRef?.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  //message seen feature
  useEffect(() => {
    const lastMessageIsFromOtherUser =
      messages &&
      messages.length &&
      messages[messages?.length - 1].sender !== authUser._id;
    if (lastMessageIsFromOtherUser) {
      socket.emit("markMessagesAsSeen", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.otherUserId,
      });
    }

    socket.on("messagesSeen", ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        queryClient.setQueryData(["messages"], (prev) => {
          const updatedMessages = prev.map((message) => {
            if (!message.seen) {
              return {
                ...message,
                seen: true,
              };
            }
            return message;
          });
          return updatedMessages;
        });
      }
    });
  }, [socket, authUser._id, messages, selectedConversation]);

  //send message submit action
  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (text === "" && img === "") {
      return;
    }

    try {
      // Immediately update UI with the new message
      queryClient.setQueryData(["messages"], (prevMessages) => {
        if (!Array.isArray(prevMessages)) {
          prevMessages = [];
        }

        console.log("prevMessage:", prevMessages);

        return [
          ...prevMessages,
          { sender: authUser._id, text, img, seen: false },
        ];
      });

      // Send the message
      sendMessage({ text, img, otherUserId });
      setImg("");
      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  //delete conversation
  const handleDeleteConversation = async () => {
    if(selectedConversation._id === ('' || null || undefined)){
      return ;
    }
    if(selectedConversation.mock === true){
      return toast.error("You can't delete a conversation that you didn't start");
    }
    try {
      const res = await fetch(
        `/api/messages/delete/${selectedConversation._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error while deleting conversation");
      }
      setSelectedConversation({});
      queryClient.invalidateQueries({queryKey:['conversationLists']})
      toast.success('conversation deleted successfully!')
      return data;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("error deleting conversation");
    }
  };

  return (
    <div className="relative flex flex-col h-screen p-4 pt-2 border-r border-gray-700">
      {/* top arrow nav */}
      <div className="z-10 flex items-center justify-between p-2 border-b border-gray-700">
        <div className="flex gap-2 items-center">
          <FaArrowLeftLong size={14} className="cursor-pointer" />
          <img
            src={selectedConversation.userProfileImg || "/avatars/avatar.png"}
            alt="User Avatar"
            className="rounded-full w-8 h-8"
          />
          <p className="font-bold">{selectedConversation.username}</p>
        </div>
        <div>
          <FaTrash
            className="cursor-pointer hover:text-red-500 mt-3 mr-3"
            onClick={()=>document.getElementById('deleteConversation').showModal()}
          />
        </div>
      </div>

      {/* messages section */}
      <div className="flex flex-col overflow-y-scroll scrollbar">
        {/* chat messages section */}
        {(isMessagePending || isRefetchingMessage) &&
        !selectedConversation.mock ? (
          <ConversationSkeleton />
        ) : (
          <>
            {/* chat with person's details */}
            {/* <div className=" flex flex-col gap-2  items-center justify-center text-white py-4 px-2 mb-2 pb-8 border-b border-gray-700">
              <div className="flex items-center justify-center flex-col gap-1 mb-2">
                <img
                  src={
                    selectedConversation.userProfileImg || "/avatars/avatar.png"
                  }
                  alt="User Avatar"
                  className="rounded-full w-12 h-12"
                />
                <p className="font-bold">
                  {selectedConversation.fullName ||
                    selectedConversation.username}
                </p>
                <p className="text-gray-500 text-sm">
                  {selectedConversation.otherUsername}
                </p>
              </div>
              <p className="text-gray-500 text-sm">This is my bio</p>
              <p className="text-gray-500 text-sm">
                Joined May 2017 · 106 Followers
              </p>
            </div> */}

            <div className=" flex flex-col  mb-10 ">
              {messages?.map((message) => {
                return (
                  <div
                    key={message._id}
                    ref={
                      messages.length - 1 === messages.indexOf(message)
                        ? messageEndRef
                        : null
                    }
                  >
                    {authUser?._id !== message?.sender.toString() && (
                      <>
                        {/* the message from other user */}
                        <div className="chat chat-start ">
                          <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                              <img
                                alt="avatar"
                                src={
                                  selectedConversation.userProfileImg ||
                                  "/avatars/avatar.png"
                                }
                              />
                            </div>
                          </div>

                          {message.text && (
                            <div className="chat-bubble rounded-xl flex text-white">
                              {message.text}
                            </div>
                          )}
                          {/* make sure the sent image is scrolled properly */}
                          {message.img && !imageLoaded && (
                            <>
                              <img
                                src={message.img}
                                className="w-[60%] object-contain rounded-lg border border-gray-700"
                                alt=""
                                hidden
                                onLoad={() => setImageLoaded(true)}
                              />
                              <div className="skeleton w-[60%] object-contain rounded-lg border border-gray-700"></div>
                            </>
                          )}

                          {message.img && imageLoaded && (
                            <img
                              src={message.img}
                              className="w-[60%] object-contain rounded-lg border border-gray-700"
                              alt=""
                            />
                          )}
                          <div className="chat-footer opacity-50">
                            {/* <time className="text-xs opacity-50">12:46</time> */}
                          </div>
                        </div>
                      </>
                    )}

                    {authUser._id === message.sender && (
                      <>
                        {/* my messages */}
                        <div className="chat chat-end ">
                          {message.text && (
                            <div className="chat-bubble rounded-xl flex gap-2 justify-between items-center bg-blue-500 text-white">
                              {message.text}{" "}
                              <span>
                                {message.text !== "" && message.seen ? (
                                  <BsCheck2All className="fill-blue-900" />
                                ) : (
                                  <BsCheck2All className="fill-slate-200" />
                                )}
                              </span>
                            </div>
                          )}
                          {message.img && !imageLoaded && (
                            <>
                              <img
                                src={message.img}
                                className="w-[60%] object-contain rounded-lg border border-gray-700"
                                alt=""
                                hidden
                                onLoad={() => setImageLoaded(true)}
                              />
                              <div className="skeleton w-[60%] object-contain rounded-lg border border-gray-700"></div>
                            </>
                          )}

                          {message.img && imageLoaded && (
                            <>
                              <img
                                src={message.img}
                                className="w-[60%] object-contain rounded-lg border border-gray-700"
                                alt=""
                              />
                              {message.seen ? (
                                <BsCheck2All className="fill-blue-500" />
                              ) : (
                                <BsCheck2All className="fill-slate-500" />
                              )}
                            </>
                          )}
                          <div className="chat-footer opacity-50">
                            {/* Seen at 12:46 */}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
        {/* //delete conversatio confirmation */}
      <dialog
        id="deleteConversation"
        className="modal border-none bg-[rgba(155,218,239,0.3)]"
      >
        <div className="modal-box w-fit bg-black rounded-xl">
          <div className=" flex flex-col gap-5 ">
        <p className="font-semibold text-[18px]">Do you want to delete this conversation?</p>
            <div className="flex gap-4 justify-center items-center m-3">
              <button onClick={handleDeleteConversation} className="btn btn-primary rounded-full btn-sm text-white px-4 hover:bg-red-500">Delete</button>
              <form action="" method="dialog"> <button className="btn btn-primary rounded-full btn-sm text-white px-4">Cancel</button></form>
            </div>
          </div>
        </div>
        
      </dialog>

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
              {/* <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" /> */}
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
            <button
              className={`btn  btn-primary rounded-full btn-sm text-white px-4 ${
                isSendingMessage ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {isSendingMessage ? <LoadingSpinner size="xs" /> : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Conversations;
