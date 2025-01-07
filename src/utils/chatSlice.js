// redux/chatSlice.js
import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [
      { text: "Hi! How can I help you today?", isSender: false },
      { text: "Hello! I have a question about your services.", isSender: true },
      { text: "Sure, feel free to ask!", isSender: false },
      { text: "What are your pricing plans?", isSender: true },
    ],
    selectedUsers: [],
    addUserModal: false,
    query: "",
    searchResults: [],
    isNotFound: false,
    selectedUser: null,
    unreadMessages: {},
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      state.messages.push(message);

      // Increment unread messages if not for the selected user
      if (
        message.receiver_id !== state.selectedUser?._id &&
        message.sender_id !== state.selectedUser?._id
      ) {
        const userId =
          message.sender_id === state.currentUserId
            ? message.receiver_id
            : message.sender_id;
        state.unreadMessages[userId] =
          (state.unreadMessages[userId] || 0) + 1;
      }
    },
    setSelectedUsers: (state, action) => {
      state.selectedUsers = action.payload;
    },
    toggleAddUserModal: (state) => {
      state.addUserModal = !state.addUserModal;
    },
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setIsNotFound: (state, action) => {
      state.isNotFound = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;

      // Reset unread count for the selected user
      if (action.payload?._id) {
        state.unreadMessages[action.payload._id] = 0;
      }
    },
    setUnreadMessages: (state, action) => {
      state.unreadMessages = action.payload;
    },
  },
});

export const {
  setMessages,
  addMessage,
  setSelectedUsers,
  toggleAddUserModal,
  setQuery,
  setSearchResults,
  setIsNotFound,
  setSelectedUser,
  setUnreadMessages,
} = chatSlice.actions;

export default chatSlice.reducer;
