import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch all users (excluding current user)
export const fetchSuggestedUsers = createAsyncThunk(
  "users/fetchSuggestedUsers",
  async (_, { getState }) => {
    const token = localStorage.getItem("token");
    const { data } = await axios.get("http://localhost:5000/api/auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(data)
    return data;
  }
);

// Follow/unfollow user
export const toggleFollowUser = createAsyncThunk(
  "users/toggleFollowUser",
  async (userId, { getState }) => {
    const token = localStorage.getItem("token");
    const { data } = await axios.post(
      `http://localhost:5000/api/auth/users/${userId}/toggle-follow`,
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
        if (user) user.isFollowing = isFollowing;
      });
  },
});

export default userSlice.reducer;
