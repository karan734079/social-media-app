import React from 'react'
import { useSelector } from 'react-redux';
import Posts from './Posts';
import SuggestedUsers from './SuggestedUsers';

const MainFeed = () => {
  const { posts, suggestedUsers } = useSelector((state) => state.posts)
  return (
    <>
      <div className="px-5 flex space-x-5 mx-8 mt-10">
        <div className="flex-col h-screen">
          {posts.map((post) => (
            <Posts key={post.id} post={post} />
          ))}
        </div>
        <div className="ml-4 px-4 ">
          <SuggestedUsers suggestions={suggestedUsers} />
        </div>
      </div>
    </>
  );
}

export default MainFeed
