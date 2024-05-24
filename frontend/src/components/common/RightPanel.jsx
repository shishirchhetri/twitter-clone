import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";

import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "./LoadingSpinner";

const RightPanel = () => {
  const [searchText, setSearchText] = useState("");
  const [searchForUser, setSearchForUser] = useState(false);
  // const [isSearchingUsers, setIsSearchingUsers] = useState("");
  // const [searchedUsers, setSearchedUsers] = useState([]);

  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      const res = await fetch("/api/users/suggested");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "faild to fetch suggested users!");
      }

      return data;
    },
  });

  const { follow, isPending } = useFollow();

  //do not stretch out the mid div to the end
  if (suggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>;

  //searchUser
  const {
    data: searchedUsers,
    isLoading: isSearchingUsers,
    refetch: searchUserAgain,
    isRefetching: isSearchingAgain,
  } = useQuery({
    queryKey: ["searchUser"],
    queryFn: async () => {
      if (searchText === "") {
        return;
      }
      try {
        const res = await fetch(`/api/users/search/${searchText}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const data = await res.json();
        if (!res.ok) {
          console.log("failed to search user", data.error);
          return toast.success("user not found");
        }

        return data;
      } catch (error) {
        console.log(error.message);
      }
    },
    enabled: searchForUser,
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchText === "") {
      return;
    }
    setSearchForUser(true);
    searchUserAgain();
  };

  return (
    <div>
      <div className="hidden lg:block mx-2 sticky top-0 w-full  ">
        {/* search for user form */}
        <form
          action=""
          onSubmit={handleSearch}
          className="flex gap-2 items-center w-full my-3 "
        >
          <input
            type="text"
            className=" w-full px-3 p-2 rounded-xl  border-none focus:outline-none"
            placeholder="Search user"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button className="btn btn-primary rounded-full btn-sm text-white px-4">
            {isSearchingUsers || isSearchingAgain ? (
              <LoadingSpinner size="xs" />
            ) : (
              "Search"
            )}
          </button>
        </form>

        {searchedUsers?.length === 0 && searchForUser ? (
          <div className="bg-[#16181C] p-4 rounded-md top-2 mb-4">
            <div className="font-bold  pb-2 flex justify-between items-center border-b border-slate-600">
              <p>Search results</p>
              <IoClose
                size={20}
                className="cursor-pointer"
                onClick={() => {
                  setSearchForUser(false);
                  setSearchText("");
                }}
              />
            </div>
            <div className="h-12 flex items-center justify-center bg-[#16181C]  rounded-md  text-red-400">
              User not found with that name!
            </div>
          </div>
        ) : (
          searchForUser && (
            <div className="bg-[#16181C] p-4 rounded-md top-2 mb-4">
              <div className="font-bold  pb-2 flex justify-between items-center border-b border-slate-600 mb-2">
                <p>Search results</p>
                <IoClose
                  size={20}
                  className="cursor-pointer"
                  onClick={() => {
                    setSearchForUser(false);
                    setSearchText("");
                  }}
                />
              </div>
              <div className="flex flex-col gap-4">
                {/* search results */}
                {isSearchingUsers && (
                  <>
                    <RightPanelSkeleton />
                    <RightPanelSkeleton />
                    <RightPanelSkeleton />
                    <RightPanelSkeleton />
                  </>
                )}
                <div
                  className={`max-h-[200px]  flex flex-col gap-2 ${
                    searchedUsers?.length > 4 ? "overflow-y-scroll pr-1" : ""
                  }`}
                >
                  {!isSearchingUsers &&
                    searchedUsers?.map((user) => (
                      <Link
                        to={`/profile/${user.username}`}
                        className="flex items-center justify-between gap-4"
                        key={user._id}
                      >
                        <div className="flex gap-2 items-center">
                          <div className="avatar">
                            <div className="w-8 rounded-full">
                              <img
                                src={
                                  user.profileImg || "/avatar-placeholder.png"
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold tracking-tight truncate w-28 capitalize">
                              {user.fullName}
                            </span>
                            <span className="text-sm text-slate-500">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                        <div>
                          <button
                            className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                            onClick={(e) => {
                              e.preventDefault();
                              follow(user._id);
                            }}
                          >
                            {isPending ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              "Follow"
                            )}
                          </button>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          )
        )}

        {/* suggested users section */}
        <div className={`bg-[#16181C] p-4 rounded-md`}>
          <p className="font-bold">Who to follow</p>
          <div className="flex flex-col gap-4">
            {/* item */}
            {isLoading && (
              <>
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
              </>
            )}
            {!isLoading &&
              suggestedUsers?.map((user) => (
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center justify-between gap-4"
                  key={user._id}
                >
                  <div className="flex gap-2 items-center">
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img
                          src={user.profileImg || "/avatar-placeholder.png"}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold tracking-tight truncate w-28 capitalize">
                        {user.fullName}
                      </span>
                      <span className="text-sm text-slate-500">
                        @{user.username}
                      </span>
                    </div>
                  </div>
                  <div>
                    <button
                      className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        follow(user._id);
                      }}
                    >
                      {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
                    </button>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default RightPanel;
