import React from 'react'

const SuggestedUsers = ({suggestions}) => {
  return(
    <div className="bg-white shadow-md p-5 rounded-md overflow-y-auto max-h-96 w-[400px] scroll-bar ">
      <h3 className="mb-2 font-extralight text-2xl">Suggested for you</h3>
      {suggestions.map((user) => (
        <div key={user.id} className="flex justify-start text-center mb-2 space-x-4">
          <div>{user.username}</div>
          <button className="text-blue-500">Follow</button>
        </div>
      ))}
    </div>
  );
}

export default SuggestedUsers
