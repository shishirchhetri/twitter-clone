import { useQuery } from "@tanstack/react-query";
import ConversationList from "./ConversationList";
import Conversations from "./Conversations";
import EmptyConversation from "./EmptyConversation";
import { useState } from "react";
import toast from "react-hot-toast";
import { IoSettingsOutline } from "react-icons/io5";
import ConversationListSkeleton from "../../components/skeletons/ConversationListSkeleton";
import SearchInput from "../../components/common/SearchInput";
import { TbMessagePlus } from "react-icons/tb";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState({});
  const [searchText, setSearchText] = useState("");
  const [isSearchingConvo, setIsSearchingConvo] = useState(false);
  //for loading the messages only after clicking the certain list
  const [openMessages, setOpenMessages] = useState(false);

  // //getting all the lists of conversations
  const { data: conversations, isPending: isConversationsLoading } = useQuery({
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
        return data;
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    },
  });

  // console.log("conversations: ", conversations);
  console.log("selectedConversation: ", selectedConversation);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchText === "") {
      return;
    }
    console.log("searched text: ", searchText);
    try {
      const res = await fetch(`api/users/profile/${searchText}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const searchedUser = await res.json();
      console.log("sarched user", searchedUser);

      if (!res.ok) {
        throw new Error(searchedUser.error || "failed to search for users");
      }

      //check if the user is trying to search himself
      const messagingYourself = searchedUser._id === authUser._id;
      if (messagingYourself) {
        toast.error("you can't message yourself!");
      }

      //check if the conversation already exists
      const conversationAlreadyExists = conversations.find(
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

        return;
      }
      console.log(
        "From search, selected convo after check: ",
        selectedConversation
      );

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
            profileImg: searchedUser.profileImg,
          },
        ],
      };
      conversations.push(mockConversation);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }finally{
      setIsSearchingConvo(false);
    }
  };

  //truncate the message to specific length
  function truncate(str, maxLength) {
    if (str.length <= maxLength) {
      return str; // Return the original string if it's already shorter than or equal to the maxLength
    } else {
      return str.slice(0, maxLength) + "..."; // Return the truncated string with ellipsis
    }
  }

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
              <SearchInput />
              {conversations?.map((conversation) => {
                return (
                  <ConversationList
                    conversation={conversation}
                    key={conversation._id}
                    setSelectedConversation={setSelectedConversation}
                    selectedConversation={selectedConversation}
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
        {isConversationsLoading && <ConversationListSkeleton />}
        {/* show this if list of all the conversations is empty*/}
        {conversations?.length === 0 ? (
          <div
            className=" h-full p-2 flex items-center justify-center gap-3  hover:bg-stone-900 cursor-pointer"
            onClick={() => setSelectedConversation(1)}
          >
            <h1>No conversations</h1>
          </div>
        ) : (
          conversations?.map((conversation) => {
            return (
              <ConversationList
                conversation={conversation}
                key={conversation._id}
                setSelectedConversation={setSelectedConversation}
                selectedConversation={selectedConversation}
                setOpenMessages={setOpenMessages}
              />
            );
          })
        )}
      </div>

      {/* conversation right panel */}
      <div className="flex-[2]">
        {/* show empty message section if user donot select any conversation from list */}
        {!selectedConversation._id ? (
          <EmptyConversation />
        ) : (
          <>
            <Conversations
              selectedConversation={selectedConversation}
              openMessages={openMessages}
            />
          </>
        )}
      </div>
    </>
  );
};

export default ChatPage;
