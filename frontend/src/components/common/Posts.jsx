import Post from './Post';
import PostSkeleton from '../skeletons/PostSkeleton';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const Posts = ({ feedType, username, userId }) => {
  const getPostEndPoint = () => {
    switch (feedType) {
      case 'forYou':
        return '/api/posts/all';
      case 'following':
        return '/api/posts/following';
      case 'posts':
        return `/api/posts/user/${username}`;
      case 'likes':
        return `/api/posts/likes/${userId}`;
      default:
        return '/api/posts/all';
    }
  };

  const postEndpoint = getPostEndPoint();

  //isRefetcing is a boolean type which shows the state of the queryFn
  //refetch is a function which is to be run if some changes on it's feedType
  //is needed eg: while we click the following tab in the home page, it should
  //refetch the data of the 'following' endpoint which we get from above change
  //in feedType
  const {
    data: posts,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        const res = await fetch(postEndpoint);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'failed to fetch posts!');
        }

        return data;
      } catch (error) {
        console.error(error);
      }
    },
  });

  //using useEffect so that we get the desired feed
  //on the different feedTypes changes
  useEffect(() => {
    refetch();
  }, [refetch, feedType, username]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className='flex flex-col justify-center'>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className='text-center my-4 mt-3'>
          This user has no posts!, Switch to likes 👻
        </p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
