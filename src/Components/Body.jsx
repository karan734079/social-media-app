import React from 'react'
import MainFeed from './MainFeed'
import Searchbar from './Searchbar'

const Body = () => {
  return (
    <div className='mr-64'>
      <Searchbar />
      <MainFeed />
    </div>
  )
}

export default Body