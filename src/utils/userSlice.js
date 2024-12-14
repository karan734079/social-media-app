import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch all users (excluding current user)
export const fetchSuggestedUsers = createAsyncThunk(
  "users/fetchSuggestedUsers",
  async (_, { getState }) => {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}api/auth/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }
);

export const fetchUserPosts = createAsyncThunk(
  "users/fetchUserPosts",
  async (userId, { getState }) => {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_URL}api/auth/getPosts?filter=userId&userId=${userId}`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
    );
    return { userId, posts: data };
  }
);

// Follow/unfollow user
export const toggleFollowUser = createAsyncThunk(
  "users/toggleFollowUser",
  async (userId, { getState }) => {
    const token = localStorage.getItem("token");
    const { data } = await axios.post(
      `${process.env.REACT_APP_BASE_URL}api/auth/users/${userId}/toggle-follow`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { userId, isFollowing: data.isFollowing };
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    suggestedUsers: [],
    userPosts: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuggestedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestedUsers = action.payload;
      })
      .addCase(fetchSuggestedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(toggleFollowUser.fulfilled, (state, action) => {
        const { userId, isFollowing } = action.payload;
        const user = state.suggestedUsers.find((u) => u._id === userId);
        if (user) {
          user.isFollowing = isFollowing; // Update the isFollowing state
        }
      })
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        const { userId, posts } = action.payload;
        state.loading = false;
        state.userPosts[userId] = posts; // Store posts for the specific user
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
