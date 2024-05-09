import { useMutation, useQuery } from "@tanstack/react-query";
import ConversationList from "./ConversationList";
import Conversations from "./Conversations";
import EmptyConversation from "./EmptyConversation";
import { useState } from "react";
import toast from "react-hot-toast";
import { IoSettingsOutline } from "react-icons/io5";
import ConversationListSkeleton from "../../components/skeletons/ConversationListSkeleton";

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState({});

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

  //getting all the messages betweent the loggedin user and other users
  // const { data: messages, isPending: isMessageLoading } = useQuery({
  //   queryKey: ["messages"],
  //   queryFn: async () => {
  //     try {
  //       const res = await fetch(
  //         `/api/messages/${selectedConversation.otherUserId}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  //       const data = await res.json();

  //       if (!res.ok) {
  //         throw new Error(data.error || "failed to get messages");
  //       }
  //       return data;

  //     } catch (error) {
  //       console.log(error);
  //       toast.error(error.message);
  //     }
  //   },
  // });
  console.log("conversations: ", conversations);
  console.log("selectedConversation: ", selectedConversation);

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
      <div className="flex-[1.1] border-l border-r border-gray-700 min-h-screen ">
        <div className="flex justify-between items-center p-4  border-b border-gray-700">
          <p className="font-bold">Messages</p>

          <div className="relative inline-block">
            <IoSettingsOutline className="w-4" />
          </div>
        </div>

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
            />
          </>
        )}
      </div>
    </>
  );
};

export default ChatPage;
