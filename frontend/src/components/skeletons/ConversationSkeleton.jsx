import React from "react";

const ConversationSkeleton = () => {
  return (
    <div className=" flex flex-col mb-10">
      <>
          {/* the message from other user */}
          <div className=" chat chat-start">
            <div className=" chat-image avatar">
              <div className="skeleton w-10 h-10 rounded-full">
              </div>
            </div>
            <div className="skeleton chat-bubble rounded-xl w-14"></div>
          </div>

          {/* my messages */}
          <div className="chat chat-end">
            <div className=" skeleton chat-bubble rounded-xl w-14"></div>
          </div>
      </>

      <>
          {/* the message from other user */}
          <div className=" chat chat-start">
            <div className=" chat-image avatar">
              <div className="skeleton w-10 h-10 rounded-full">
              </div>
            </div>
            <div className="skeleton chat-bubble rounded-xl w-14"></div>
          </div>

          {/* my messages */}
          <div className="chat chat-end">
            <div className=" skeleton chat-bubble rounded-xl w-14"></div>
          </div>
      </> 

      <>
          {/* the message from other user */}
          <div className=" chat chat-start">
            <div className=" chat-image avatar">
              <div className="skeleton w-10 h-10 rounded-full">
              </div>
            </div>
            <div className="skeleton chat-bubble rounded-xl w-14"></div>
          </div>

          {/* my messages */}
          <div className="chat chat-end">
            <div className=" skeleton chat-bubble rounded-xl w-14"></div>
          </div>
      </>

      <>
          {/* the message from other user */}
          <div className=" chat chat-start">
            <div className=" chat-image avatar">
              <div className="skeleton w-12 h-12 rounded-full">
              </div>
            </div>
            <div className="skeleton chat-bubble rounded-xl w-14">
              <div className="skeleton"></div>
            </div>
          </div>

          {/* my messages */}
          <div className="chat chat-end">
            <div className=" skeleton chat-bubble rounded-xl w-14">
            </div>
          </div>
      </>

     
    </div>
  );
};

export default ConversationSkeleton;
