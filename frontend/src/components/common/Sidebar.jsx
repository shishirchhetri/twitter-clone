import XSvg from '../svgs/X';
import { Link } from 'react-router-dom';
import { BiLogOut } from 'react-icons/bi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';

import { MdOutlineEmail, MdOutlineHome } from 'react-icons/md';
import { MdHome } from 'react-icons/md';
import { IoNotifications } from 'react-icons/io5';
import { IoNotificationsOutline } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import { FaRegUser } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

const Sidebar = () => {
  const [active, setActive] = useState(1);
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({
    queryKey: ['authUser'],
  });

  const links = [
    {
      id: 1,
      link: '/',
      icon: <MdOutlineHome className='w-7 h-7' />,
      activeIcon: <MdHome className='w-7 h-7' />,
      title: 'Home',
    },
    {
      id: 2,
      link: '/notifications',
      activeIcon: <IoNotifications className='w-6 h-6' />,
      icon: <IoNotificationsOutline className='w-6 h-6' />,
      title: 'Notifications',
    },
    {
      id: 3,
      link: `/profile/${authUser.username}`,
      icon: <FaRegUser className='w-6 h-6' />,
      activeIcon: <FaUser className='w-6 h-6' />,
      title: 'Profile',
    },
    {
      id: 4,
      link: `/conversations`,
      icon: <MdOutlineEmail className='w-6 h-6' />,
      activeIcon: <MdEmail className='w-6 h-6' />,
      title: 'Message',
    },
  ];

  //use mutation function from tanstack query
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch('/api/auth/logout', {
          method: 'POST',
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'failed to logout!');
        }
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success('successfully logged out!');
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
    onError: () => {
      toast.error('failed to logout!');
    },
  });

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <div className='md:flex-[2_2_0] w-18 max-w-52 '>
      <div className='sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-19 md:w-full '>
        <Link to='/' className='flex justify-center md:justify-start'>
          <XSvg className='px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900' />
        </Link>
        <ul className='flex flex-col gap-3 mt-4'>
          {links.map((link) => {
            return (
              <li
                className='flex justify-center md:justify-start'
                key={link.id}
                onClick={() => setActive(link.id)}
              >
                <Link
                  to={link.link}
                  className={`flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 px-2 max-w-fit cursor-pointer 
${active === link.id ? 'bg-stone-900 font-semibold' : ''}`}
                >
                  {active === link.id ? link.activeIcon : link.icon}
                  <span className='text-lg hidden md:block'>{link.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* profile and logout button */}
        {authUser && (
          <Link
            to={`/profile/${authUser.username}`}
            className='mt-auto mb-10 flex gap-2 items-center transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full'
          >
            <div className='avatar hidden md:inline-flex'>
              <div className='w-8 rounded-full'>
                <img src={authUser?.profileImg || '/avatar-placeholder.png'} />
              </div>
            </div>
            <div className='flex justify-between items-center flex-1'>
              <div className='hidden md:block'>
                <p className='text-white font-bold text-sm w-20 truncate'>
                  {authUser?.fullName}
                </p>
                <p className='text-slate-500 text-sm'>@{authUser?.username}</p>
              </div>
              <BiLogOut
                className='w-5 h-5 cursor-pointer'
                onClick={handleLogout}
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
