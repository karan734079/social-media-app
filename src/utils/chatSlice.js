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
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      if (!state.messages.some((msg) => msg.id === action.payload.id)) {
        state.messages.push(action.payload);
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
} = chatSlice.actions;

export default chatSlice.reducer;
