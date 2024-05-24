import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { IoSettingsOutline } from 'react-icons/io5';
import { FaComment, FaTrash, FaUser } from 'react-icons/fa';
import { FaHeart } from 'react-icons/fa6';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const NotificationPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen((prevState) => !prevState);
  };

  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch('/api/notifications', {
          method: 'DELETE',
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Something went wrong');
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success('Notifications deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: deleteSingleNotification } = useMutation({
    mutationFn: async (notificationId) => {
      try {
        const res = await fetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Something went wrong');
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen mb-14 md:mb-0'>
        <div className=' sticky top-0 z-10 bg-black flex justify-between items-center p-4 border-b border-gray-700'>
          <p className='font-bold'>Notifications</p>

          <div className='relative inline-block'>
            <div
              tabIndex={0}
              role='button'
              className='m-1 cursor-pointer'
              onClick={toggleDropdown}
            >
              <IoSettingsOutline className='w-4' />
            </div>
            {isOpen && (
              <ul className='absolute right-0  z-[1] menu p-2 shadow bg-base-100 rounded-box w-48'>
                <li>
                  <a onClick={deleteNotifications}>Delete all notifications</a>
                </li>
              </ul>
            )}
          </div>
        </div>
        {isLoading && (
          <div className='flex justify-center h-full items-center'>
            <LoadingSpinner size='lg' />
          </div>
        )}
        {notifications?.length === 0 && (
          <div className='text-center p-4 font-bold'>No new notifications 🤔</div>
        )}
        {notifications?.map((notification) => (
          <div className='border-b border-gray-700' key={notification._id}>
            <div className='flex justify-between '>
              <div className='flex  gap-2 p-4'>
              {notification.type === 'follow' && (
                <FaUser className='w-7 h-7 text-primary' />
              )}
              {notification.type === 'like' && (
                <FaHeart className='w-7 h-7 text-red-500' />
              )}
              {notification.type === 'comment' && (
                <FaComment className='w-7 h-7 text-primary' />
              )}
              <Link to={`/profile/${notification.from.username}`}>
                <div className='avatar'>
                  <div className='w-8 rounded-full'>
                    <img
                      src={
                        notification.from.profileImg ||
                        '/avatar-placeholder.png'
                      }
                    />
                  </div>
                </div>
                <div className='flex gap-1'>
                  <span className='font-bold'>
                    @{notification.from.username}
                  </span>{' '}
                  {notification.type === 'follow'
                    && 'followed you'
                    }
                    {notification.type === 'like'
                    && 'liked your post'
                    }
                    {notification.type === 'comment' &&
                     'commented on your post'
                    }
                </div>
              </Link>
              </div>
              <FaTrash
                    className='cursor-pointer hover:text-red-500 mt-3 mr-3'
                    onClick={()=> {deleteSingleNotification(notification._id)}}
                  />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default NotificationPage;
