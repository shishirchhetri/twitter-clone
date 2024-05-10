import React from "react";
import SearchInput from "../components/common/SearchInput";
import ConversationList from "../pages/chat/ConversationList";

const SearchUserModel = () => {
  return (
    <dialog
      id="new-message"
      className="modal border-none bg-[rgba(155,218,239,0.3)]"
    >
      <div className="modal-box h-[90vh] bg-secondary rounded-xl">
        <div className=" text-white ">
          <h1 className="text-xl">New message</h1>
          <SearchInput />
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default SearchUserModel;
