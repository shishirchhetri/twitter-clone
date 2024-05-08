import React from "react";

const EmptyConversation = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 border-r border-gray-700">
      <div className="flex flex-col gap-2 w-[70%] justify-center">
        <h1 className=" text-4xl font-bold ">Select a message</h1>
        <p className="text-gray-500 flex gap-1 text-sm">
          Choose from your existing conversations, start a new one, or just keep
          swimming.
        </p>
      </div>
      <div>
        <button className="btn btn-primary rounded-full btn-md text-white px-4   items-center my-auto">
          New Message
        </button>
      </div>
    </div>
  );
};

export default EmptyConversation;
