import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useFollow = () => {
  const queryClient = useQueryClient();

  const {
    mutate: follow,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`/api/users/follow/${userId}`, {
          method: 'POST',
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'failed to follow the user!');
        }

        return data;
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    },
    onSuccess: () => {
      //invalidate follow user so that the user will be removed from suggested user list
      queryClient.invalidateQueries({
        queryKey: ['suggestedUsers'],
      });

      //invalidating the logged in user data as we use the follow field from the database
      //so that we can implement follow unfollow button on the user's profile and update
      //suggestedUsers list
      queryClient.invalidateQueries({
        queryKey: ['authUser'],
      });
    },
    onError: () => {
      toast.error(error.message);
    },
  });

  return { follow, isPending };
};

export default useFollow;
