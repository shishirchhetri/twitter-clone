import ConversationList from "./ConversationList";
import Conversations from "./Conversations";
import EmptyConversation from "./EmptyConversation";
import { useState } from "react";

const ChatPage = () => {
  const [activeConversation, setActiveConversation] = useState(null)
  function truncate(str, maxLength) {
    if (str.length <= maxLength) {
      return str; // Return the original string if it's already shorter than or equal to the maxLength
    } else {
      return str.slice(0, maxLength) + "..."; // Return the truncated string with ellipsis
    }
  }

  const message =
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, ipsum.";
  return (
    <>
      <div className="flex-[1.1] border-l border-r border-gray-700 min-h-screen ">
        <ConversationList setActiveConversation={setActiveConversation}/>
      </div>

      {/* conversation right panel */}
      <div className="flex-[2]">
        {activeConversation === null ? <EmptyConversation /> : <Conversations />}
      </div>
    </>
  );
};

export default ChatPage;
