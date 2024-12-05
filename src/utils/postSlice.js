/* eslint-disable no-empty-pattern */
import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [
      {
        id: 1,
        username: "Monty_123",
        image:
          "https://imgd.aeplcdn.com/370x208/n/cw/ec/139651/curvv-exterior-right-front-three-quarter.jpeg?isig=0&q=80",
        likes: 51,
        time: "14h",
      },
    ],
  },
  reducers: {},
});

export const {} = postSlice.actions;

export default postSlice.reducer;
