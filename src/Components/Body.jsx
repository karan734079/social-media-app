import React from 'react'
import MainFeed from './MainFeed'
import Searchbar from './Searchbar'

const Body = () => {
  return (
    <div className=''>
      <Searchbar />
      <div className='flex justify-start'>
        <MainFeed />
      </div>
    </div>
  )
}

export default Body