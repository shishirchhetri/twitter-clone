import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { TbMessagePlus } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";

import ConversationList from "./ConversationList";
import Conversations from "./Conversations";
import EmptyConversation from "./EmptyConversation";
import ConversationListSkeleton from "../../components/skeletons/ConversationListSkeleton";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useSocket } from "../../context/socketContext";

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState({});
  const [searchText, setSearchText] = useState("");
  const [isSearchingConvo, setIsSearchingConvo] = useState(false);
  const [conversationLists, setConversationLists] = useState();
  const [allMessages, setAllMessages] = useState([]);
  
  const { onlineUsers, socket} = useSocket();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });


  //getting all the lists of conversations
  const { data: allConversationLists, isPending: isConversationListLoading } =
    useQuery({
      queryKey: ["conversationList"],
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
          setConversationLists(data);
          return data;
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      },
    });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchText === "") {
      return;
    }
    try {
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

      //check if the user is trying to search himself
      const messagingYourself = searchedUser._id === authUser._id;
      if (messagingYourself) {
        toast.error("you can't message yourself!");
      }

      //check if the conversation already exists
      const conversationAlreadyExists = conversationLists.find(
        (conversation) => conversation.participants[0]._id === searchedUser._id
      );

      if (conversationAlreadyExists) {
        setSelectedConversation({
          _id: conversationAlreadyExists._id,
          otherUserId: searchedUser._id,
          username: searchedUser.username,
          fullName: searchedUser.fullName,
          userProfileImg: searchedUser.profileImg,
        });
        console.log(
          "From search, selected convo after check: ",
          selectedConversation
        );
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
            fullName: searchText.fullName,
            profileImg: searchedUser.profileImg,
          },
        ],
      };
      setConversationLists((conversationList) => [
        ...conversationList,
        mockConversation,
      ]);
      console.log("conversationlist after pushing mock: ", conversationLists);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsSearchingConvo(false);
    }
  };

  useEffect(() => {
    socket?.on("newMessage", (message) => {

      if(selectedConversation._id === message.conversationId){
        setAllMessages((prevMessages) => [...prevMessages, message]);
      }

      setConversationLists((prev) => {
        const updatedConversation = prev.map((conversation) => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                text: message.text,
                sender: message.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversation;
      });
    });

    //remove the event after unmounting
    return () => socket?.off("newMessage");
  }, [allMessages, socket]);

  useEffect(()=>{
    socket?.on('messagesSeen', ({conversationId})=>{
       setConversationLists( prev => {
        const updatedConversation = prev.map((conversation)=>{
          if(conversation._id === conversationId){
            return{
              ...conversation,
              lastMessage:{
                ...conversation.lastMessage,
                seen: true
              }
            }
          }
          return conversation;

        })
        return updatedConversation;
       })
    })
  },[socket, setConversationLists])

  return (
    <>
      <div className="flex-[1.5] border-l border-r border-gray-700 min-h-screen ">
        <div className="flex justify-between items-center p-4  border-b border-gray-700">
          <p className="font-bold">Messages</p>

          <div className="relative flex items-center gap-2 ">
            <IoSettingsOutline className="w-4 cursor-pointer " />
            <TbMessagePlus
              className="w-5 cursor-pointer"
              onClick={() => document.getElementById("new-message").showModal()}
            />
          </div>
        </div>
        {/* <SearchUserModel /> */}
        <dialog
          id="new-message"
          className="modal border-none bg-[rgba(155,218,239,0.3)]"
        >
          <div className="modal-box h-[90vh] bg-black rounded-xl">
            <div className=" text-white ">
              <h1 className="text-xl">New message</h1>
              {conversationLists?.map((conversation) => {
                return (
                  <ConversationList
                    conversation={conversation}
                    key={conversation._id}
                    setSelectedConversation={setSelectedConversation}
                    selectedConversation={selectedConversation}
                    isSeen = {conversation.lastMessage.seen}
                  />
                );
              })}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        {/* searchbar */}
        <form
          action=""
          onSubmit={handleSearch}
          className="flex gap-2 items-center w-full px-2 p-4 "
        >
          <input
            type="text"
            className=" w-full px-3 p-2 rounded-xl  border-none focus:outline-none"
            placeholder="Search direct message"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button className="btn btn-primary rounded-full btn-sm text-white px-4">
            {isSearchingConvo ? <LoadingSpinner size="xs" /> : "Search"}
          </button>
        </form>

        {/* conversation lists */}
        {isConversationListLoading && <ConversationListSkeleton />}
        {/* show this if list of all the conversations is empty*/}
        {conversationLists?.length === 0 ? (
          <div
            className=" h-full p-2 flex items-center justify-center gap-3  hover:bg-stone-900 cursor-pointer"
            onClick={() => setSelectedConversation(1)}
          >
            <h1>No conversations</h1>
          </div>
        ) : (
          conversationLists?.map((conversation) => {
            return (
              <ConversationList
                conversation={conversation}
                key={conversation._id}
                setSelectedConversation={setSelectedConversation}
                selectedConversation={selectedConversation}
                isOnline={onlineUsers.includes(
                  conversation.participants[0]._id
                )}
              />
            );
          })
        )}
      </div>

      {/* conversation right panel */}
      <div className="flex-[2]">
        {/* show empty message section if user donot select any conversation from list by default*/}
        {!selectedConversation._id ? (
          <EmptyConversation />
        ) : (
          <>
            <Conversations selectedConversation={selectedConversation}
            setConversationLists={setConversationLists}
            allMessages={allMessages}
            setAllMessages={setAllMessages }
            />
          </>
        )}
      </div>
    </>
  );
};

export default ChatPage;
