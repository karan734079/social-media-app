import React from 'react'
import Navbar from './Navbar'
import MainFeed from './MainFeed'
import Searchbar from './Searchbar'

const Body = () => {
  return (
    <div className='flex'>
      <Navbar />
      <div className='ml-52'>
      <Searchbar />
      <MainFeed />
      </div>
    </div>
  )
}

export default Body
