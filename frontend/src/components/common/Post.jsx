import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import LoadingSpinner from "./LoadingSpinner.jsx";
import { formatPostDate } from "../../utils/data/index.js";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();
  const [imageLoaded, setImageLoaded] = useState(false);

  //get the information about the currently logged in user
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  //check if the post was from current user or not
  const postOwner = post.user;

  //check if the current user has liked the post or not
  const isLiked = post.likes.includes(authUser._id);

  //check if the post is the currently logged in user's or not
  const isMyPost = authUser._id === post.user._id;

  const formattedDate = formatPostDate(post.createdAt);

  //for deleting the post state
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "failed to delete post!");
        }

        return data;
      } catch (error) {
        console.log("failed to delete the post!");
      }
    },
    onSuccess: () => {
      toast.success("post deleted successfully!");
      //invalidate the post i.e remove the deleted  posts from the feed
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  //for updating the like state
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${post._id}`, {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "failed to like post");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (updatedLikes) => {
      //invalidating the post but it will refetch the posts that will reload the page
      //which is poor user experience
      /* queryClient.invalidateQueries({
        queryKey: ['posts'],
      }); */

      //instead update the cache of that post so that like number will be updated
      //without refreshing the page
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  //for updating the comment state
  const { mutate: commentOnPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: comment }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "failed to comment");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    //pass the 'updatedComments' as an argument to get new comments without refreshing
    //which we get as data from the mutation function above
    onSuccess: () => {
      toast.success("Comment posted successfully");
      setComment("");

      //invalidate the queryKey post so that new comments are loaded
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      //another method to show the new comment without refreshing by updating
      //the cache directly
      /*   queryClient.setQueryData(['posts'], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, comments: updatedComments };
          }
          return p;
        });
      }); */
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  //for updating the comment state
  const { mutate: repost, isPending: isReposting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/repost/${post._id}`, {
          method: "POST",
         });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "failed to repost");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (data) => {
      toast.success(data.message);

      //invalidate the queryKey post so that new repost as posts are loaded
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeletePost = () => {
    deletePost();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) {
      return;
    }
    commentOnPost();
  };

  const handleLikePost = () => {
    if (isLiking) return;
    likePost();
  };

  const handleRepost = () => {
    if (isReposting) return;
    repost();
  };

  console.log('post', post)

  return (
    <>
    {post.isRepost && (
          <div className="ml-5">
            <h1>{post.user.username === authUser.username ? 'You' : post.user.username} reposted</h1>
          </div>
        )}
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        {/* postOwner image and username  */}
        
        <>
          <div className="avatar">
            <Link
              to={`/profile/${postOwner.username}`}
              className="w-8 h-8 rounded-full overflow-hidden"
            >
              <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
            </Link>
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex gap-2 items-center">
              <Link to={`/profile/${postOwner.username}`} className="font-bold">
                {postOwner.fullName}
              </Link>
              <span className="text-gray-700 flex gap-1 text-sm">
                <Link to={`/profile/${postOwner.username}`}>
                  @{postOwner.username}
                </Link>
                <span>·</span>
                <span>{formattedDate}</span>
              </span>
              {isMyPost && (
                <span className="flex justify-end flex-1">
                  {isDeleting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <FaTrash
                      className="cursor-pointer hover:text-red-500"
                      onClick={handleDeletePost}
                    />
                  )}
                </span>
              )}
            </div>
            {/* post image */}
            <div className="flex flex-col gap-3 overflow-hidden">
              <span>{post.text}</span>

              {post.img && !imageLoaded && (
                <>
                  <img
                    src={post.img}
                    className="max-h-80 w-full object-contain rounded-lg border border-gray-700"
                    alt=""
                    hidden
                    onLoad={() => setImageLoaded(true)}
                  />
                  <div className="skeleton max-h-80 w-full object-contain rounded-lg border border-gray-700"></div>
                </>
              )}

              {post.img && imageLoaded && (
                <img
                  src={post.img}
                  className="max-h-80 max-w-full object-contain rounded-lg border border-gray-700"
                  alt=""
                />
              )}
            </div>
            <div className="flex justify-between mt-3">
            {/* comment modal */}
              <div className="flex gap-4 items-center w-2/3 justify-between">
                {/* as we have set the different id for the differnt comment box we have
              to pass the correct id so that only the comment modal of the respective
              post is opened */}
                <div
                  className="flex gap-1 items-center cursor-pointer group"
                  onClick={() =>
                    document
                      .getElementById("comments_modal" + post._id)
                      .showModal()
                  }
                >
                  <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                  <span className="text-sm text-slate-500 group-hover:text-sky-400">
                    {post.comments.length}
                  </span>
                </div>
                {/* this modal is from Daisy UI, we're passing the id so that  
                the model for the comment in different post is also differnt */}
                <dialog
                  id={`comments_modal${post._id}`}
                  className="modal border-none outline-none"
                >
                  <div className="modal-box rounded border border-gray-600">
                    <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                    <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                      {post.comments.length === 0 && (
                        <p className="text-sm text-slate-500">
                          No comments yet 🤔 Be the first one 😉
                        </p>
                      )}
                      {post.comments.map((comment) => (
                        <div
                          key={comment._id}
                          className="flex gap-2 items-start"
                        >
                          <div className="avatar">
                            <div className="w-8 rounded-full">
                              <img
                                src={
                                  comment.user.profileImg ||
                                  "/avatar-placeholder.png"
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="font-bold">
                                {/*  {comment.user.fullName} */}
                                {comment.user.username === authUser.username
                                  ? "You"
                                  : comment.user.fullName}
                              </span>
                              <span className="text-gray-700 text-sm">
                                @{comment.user.username}
                              </span>
                            </div>
                            <div className="text-sm">{comment.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* new comment */}
                    <form
                      className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                      onSubmit={handlePostComment}
                    >
                      <textarea
                        className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                        {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
                      </button>
                    </form>
                  </div>
                  <form method="dialog" className="modal-backdrop">
                    <button className="outline-none">close</button>
                  </form>
                </dialog>
                <div className="flex gap-1 items-center group cursor-pointer">
                  <BiRepost
                    className="w-6 h-6  text-slate-500 group-hover:text-green-500"
                    onClick={handleRepost}
                  />
                  <span className="text-sm text-slate-500 group-hover:text-green-500">
                    {post.reposts.length || 0}
                  </span>
                </div>
                <div
                  className="flex gap-1 items-center group cursor-pointer"
                  onClick={handleLikePost}
                >
                  {/* isLiking state */}
                  {isLiking && <LoadingSpinner size="sm" />}

                  {!isLiked && !isLiking && (
                    <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                  )}
                  {isLiked && !isLiking && (
                    <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
                  )}

                  <span
                    className={`text-sm  group-hover:text-pink-500 ${
                      isLiked ? "text-pink-500" : "text-slate-500"
                    }`}
                  >
                    {post.likes.length}
                  </span>
                </div>
              </div>
              <div className="flex w-1/3 justify-end gap-2 items-center">
                <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
              </div>
            </div>
          </div>
        </>
      </div>
    </>
  );
};
export default Post;
