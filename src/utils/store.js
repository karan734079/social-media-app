import { configureStore } from "@reduxjs/toolkit";
import postSlice from './postSlice';
import userSlice from './userSlice'

const store = configureStore({
    reducer : {
        posts : postSlice,
        users : userSlice,
    }
})

export default store;