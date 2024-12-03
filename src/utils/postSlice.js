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
      {
        id: 2,
        username: "Monty_123",
        image:
          "https://imgd.aeplcdn.com/370x208/n/cw/ec/139651/curvv-exterior-right-front-three-quarter.jpeg?isig=0&q=80",
        likes: 61,
        time: "9h",
      },
      {
        id: 3,
        username: "Monty_123",
        image:
          "https://imgd.aeplcdn.com/370x208/n/cw/ec/139651/curvv-exterior-right-front-three-quarter.jpeg?isig=0&q=80",
        likes: 58,
        time: "16h",
      },
      {
        id: 4,
        username: "Monty_123",
        image:
          "https://imgd.aeplcdn.com/370x208/n/cw/ec/139651/curvv-exterior-right-front-three-quarter.jpeg?isig=0&q=80",
        likes: 55,
        time: "5h",
      },
    ],
    suggestedUsers: [
      { id: 1, username: "johnrakesh31" },
    ],
  },
  reducers: {},
});

export const {} = postSlice.actions;

export default postSlice.reducer;
