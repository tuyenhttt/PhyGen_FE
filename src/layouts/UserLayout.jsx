import { Outlet } from 'react-router-dom';

const UserLayout = () => {
  return (
    <div className='flex'>
      {/* <UserSidebar /> */}

      <div className='flex-1'>
        <main className='mt-20 px-6 py-4 min-h-screen'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
