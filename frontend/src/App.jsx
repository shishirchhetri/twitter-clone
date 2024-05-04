import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import LogInPage from './pages/auth/login/LogInPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';
import { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  //sending get request using tanstack query
  //getting the logged in status of the user
  const { data: authUser, isLoading } = useQuery({
    //setting the queryKey so that we can use it while we need the set value
    //in other comps without running the function written below
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        //to remove the falsy value that is sending empty object so that we can
        //validate the authUser in the logout path
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || 'error getting user');
        }
        console.log('Auth user: ', data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    //remove default try to request to the server for getting query
    //for 3 times and set default time to 1
    retry: false,
  });

  //loading state
  if (isLoading) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='xl' />
      </div>
    );
  }

  return (
    <>
      <div className='flex max-w-6xl mx-auto'>
        {authUser && <Sidebar />}
        <Routes>
          <Route
            path='/'
            element={authUser ? <HomePage /> : <Navigate to='/login' />}
          />
          <Route
            path='/login'
            element={!authUser ? <LogInPage /> : <Navigate to='/' />}
          />
          <Route
            path='/signup'
            element={authUser ? <Navigate to='/' /> : <SignUpPage />}
          />
          <Route
            path='/notifications'
            element={
              !authUser ? <Navigate to='/login' /> : <NotificationPage />
            }
          />
          <Route
            path='/profile/:username'
            element={!authUser ? <Navigate to='/login' /> : <ProfilePage />}
          />
        </Routes>
        {authUser && <RightPanel />}
        <Toaster />
      </div>
    </>
  );
}

export default App;
