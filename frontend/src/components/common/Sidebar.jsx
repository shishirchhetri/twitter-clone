import XSvg from "../svgs/X";

import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";

const Sidebar = () => {
	const data = {
		fullName: "Spark",
		username: "spark",
		profileImg: "/avatars/boy2.png",
	};

    const links= [{
        id:1,
        link: '/',
        icon: <MdHomeFilled className='w-8 h-8' />,
        title: 'Home'
    },
    {
        id:2,
        link: '/notifications',
        icon: <IoNotifications className='w-6 h-6' />,
        title: 'Notifications'
    },
    {
        id:3,
        link: `/profile/${data.username}`,
        icon: <FaUser className='w-6 h-6' />,
        title: 'Profile'
    },
]

	return (
		<div className='md:flex-[2_2_0] w-18 max-w-52'>
			<div className='sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full'>
				<Link to='/' className='flex justify-center md:justify-start'>
					<XSvg className='px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900' />
				</Link>
				<ul className='flex flex-col gap-3 mt-4'>
					{links.map((link)=>{
                        return(
                            <li className='flex justify-center md:justify-start' key={link.id}>
						<Link
							to={link.link}
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							{link.icon}
							<span className='text-lg hidden md:block'>{link.title}</span>
						</Link>
					</li>
                        )
                    })}
					
				</ul>

                {/* profile and logout button */}
				{data && (
					<Link
						to={`/profile/${data.username}`}
						className='mt-auto mb-10 flex gap-2 items-center transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full'
					>
						<div className='avatar hidden md:inline-flex'>
							<div className='w-8 rounded-full'>
								<img src={data?.profileImg || "/avatar-placeholder.png"} />
							</div>
						</div>
						<div className='flex justify-between items-center flex-1'>
							<div className='hidden md:block'>
								<p className='text-white font-bold text-sm w-20 truncate'>{data?.fullName}</p>
								<p className='text-slate-500 text-sm'>@{data?.username}</p>
							</div>
							<BiLogOut className='w-5 h-5 cursor-pointer' />
						</div>
					</Link>
				)}
			</div>
		</div>
	);
};
export default Sidebar;