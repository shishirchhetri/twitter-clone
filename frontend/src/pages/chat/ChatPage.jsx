import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { TbMessagePlus } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { FaArrowLeftLong } from "react-icons/fa6";

import ConversationList from "./ConversationList";
import Conversations from "./Conversations";
import EmptyConversation from "./EmptyConversation";
import ConversationListSkeleton from "../../components/skeletons/ConversationListSkeleton";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useSocket } from "../../context/socketContext";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState({});
  const [searchText, setSearchText] = useState("");
  const [isSearchingConvo, setIsSearchingConvo] = useState(false);
  const [showConversations, setShowConversations] = useState(false); // New state for toggling views

  const { onlineUsers, socket } = useSocket();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["messages"],
  });

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  // Fetch all conversations
  const { data: conversationLists, isPending: isConversationListLoading } =
    useQuery({
      queryKey: ["conversationLists"],
      queryFn: async () => {
        try {
          const res = await fetch("/api/messages/conversations", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "failed to fetch all conversations");
          }
          return data;
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      },
    });

  // Search for conversations
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchText === "") {
      return;
    }
    try {
      setIsSearchingConvo(true);
      const res = await fetch(`api/users/profile/${searchText}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const searchedUser = await res.json();

      if (!res.ok) {
        throw new Error(searchedUser.error || "failed to search for users");
      }

      // Check if the user is trying to message themselves
      const messagingYourself = searchedUser._id === authUser._id;
      if (messagingYourself) {
        return toast.error("you can't message yourself!");
      }

      // Check if the conversation already exists
      const conversationAlreadyExists = conversationLists.find(
        (conversation) => conversation.participants[0]?._id === searchedUser._id
      );

      if (conversationAlreadyExists) {
        setSelectedConversation({
          _id: conversationAlreadyExists?._id,
          otherUserId: searchedUser._id,
          username: searchedUser.username,
          fullName: searchedUser.fullName,
          userProfileImg: searchedUser.profileImg,
        });
        setShowConversations(true); // Show conversation view
        return;
      }

      const mockConversation = {
        mock: true,
        lastMessage: {
          text: "",
          sender: "",
        },
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            fullName: searchedUser.fullName,
            profileImg: searchedUser.profileImg,
          },
        ],
      };
      // setSelectedConversation(mockConversation);
      await Promise.all[
        queryClient.setQueryData(["conversationLists"], (oldData) => [
          ...oldData,
          mockConversation,
        ])
      ];
    
      setSearchText("");
      refetchMessages();
      setShowConversations(true); // Show conversation view
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsSearchingConvo(false);
    }
  };

  // Handle new messages
  useEffect(() => {
    socket?.on("newMessage", (message) => {
      if (selectedConversation._id === message.conversationId) {
        queryClient.setQueryData(["messages"], (prevMessages) => [
          ...prevMessages,
          message,
        ]);
      }

      queryClient.setQueryData(["conversationLists"], (prev) => {
        const updatedConversation = prev.map((conversation) => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                text: message.text,
                sender: message.sender,
              },
            };
          } else {
            return conversation;
          }
        });
        return updatedConversation;
      });
    });

    return () => socket?.off("newMessage");
  }, [messages, socket]);

  // Handle seen messages
  useEffect(() => {
    socket?.on("messagesSeen", ({ conversationId }) => {
      queryClient.setQueryData(["conversationLists"], (prev) => {
        const updatedConversation = prev.map((conversation) => {
          if (conversation._id === conversationId && conversation.lastMessage) {
            return {
              ...conversation,
              lastMessage: {
                ...conversation.lastMessage,
                seen: true,
              },
            };
          }
          return conversation;
        });
        return updatedConversation;
      });
    });
  }, [socket, conversationLists]);

  const goToHome = ()=>{
    navigate('/')
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen ">
      {/* Left Panel */}
      <div
        className={`flex-[1.1] border-l border-r border-gray-700 max-h-full overflow-y-hidden flex flex-col ${
          showConversations ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
          <FaArrowLeftLong size={14} className="cursor-pointer" onClick={goToHome} />
          <p className="font-bold">Messages</p>
          </div>
          <div className="relative flex items-center gap-2">
            <IoSettingsOutline className="w-4 cursor-pointer" />
            <TbMessagePlus
              className="w-5 cursor-pointer"
              onClick={() => document.getElementById("new-message").showModal()}
            />
          </div>
        </div>

        {/* Search Bar */}
        <form
          action=""
          onSubmit={handleSearch}
          className="flex gap-2 items-center w-full px-2 p-4"
        >
          <input
            type="text"
            className="w-full px-3 p-2 rounded-xl border-none focus:outline-none"
            placeholder="Search direct message"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button className="btn btn-primary rounded-full btn-sm text-white px-4">
            {isSearchingConvo ? <LoadingSpinner size="xs" /> : "Search"}
          </button>
        </form>

        {/* Conversation Lists */}
        <div className="flex-1 overflow-y-auto">
          {isConversationListLoading && <ConversationListSkeleton />}
          {conversationLists?.length === 0 ? (
            <div className="h-full p-2 flex items-center justify-center gap-3 hover:bg-stone-900 cursor-pointer">
              <h1>No conversations</h1>
            </div>
          ) : (
            <div>
              {conversationLists?.map((conversation) => (
                <ConversationList
                  conversation={conversation}
                  key={conversation._id}
                  setSelectedConversation={(convo) => {
                    setSelectedConversation(convo);
                    setShowConversations(true); // Show conversation view
                  }}
                  selectedConversation={selectedConversation}
                  isOnline={onlineUsers.includes(
                    conversation.participants[0]?._id
                  )}
                  refetchMessages={refetchMessages}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New message dialog */}
      <dialog
        id="new-message"
        className="modal border-none bg-[rgba(155,218,239,0.3)]"
      >
        <div className="modal-box h-[90vh] bg-black rounded-xl">
          <div className="text-white">
            <form
              action=""
              onSubmit={handleSearch}
              className="flex gap-2 items-center w-full px-2 p-4"
            >
              <input
                type="text"
                className="w-full px-3 p-2 rounded-xl border-none focus:outline-none"
                placeholder="Search direct message"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                {isSearchingConvo ? <LoadingSpinner size="xs" /> : "Search"}
              </button>
            </form>
            {conversationLists?.map((conversation) => (
              <ConversationList
                conversation={conversation}
                key={conversation._id}
                setSelectedConversation={(convo) => {
                  setSelectedConversation(convo);
                  setShowConversations(true); // Show conversation view
                }}
                selectedConversation={selectedConversation}
                isSeen={conversation.lastMessage.seen}
              />
            ))}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <h1 className="text-xl">New message</h1>
          <button>Close</button>
        </form>
      </dialog>

      {/* Right Panel */}
      <div className={`flex-[2] ${showConversations ? "flex" : "hidden md:flex"} flex-col h-full`}>
        {!selectedConversation._id ? (
          <EmptyConversation className='hidden md:block'/>
        ) : (
          <Conversations
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            setShowConversations={setShowConversations} // Pass down the state setter
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
