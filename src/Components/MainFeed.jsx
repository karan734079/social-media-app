import React from 'react'
import SuggestedUsers from './SuggestedUsers';

const MainFeed = () => {
  return (
    <>
      <div className="px-5 flex space-x-5 mx-8 mt-10">
        <div className="ml-4 px-4 ">
          <SuggestedUsers />
        </div>
      </div>
    </>
  );
}

export default MainFeed
