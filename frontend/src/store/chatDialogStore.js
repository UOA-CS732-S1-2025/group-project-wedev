import { create } from 'zustand';

export const useChatDialogStore = create((set) => ({
  conversationId: null,
  otherUser: null,
  
  openDialog: (conversationId, otherUser) => set({ 
    conversationId, 
    otherUser 
  }),
  
  closeDialog: () => set({ 
    conversationId: null,
    otherUser: null
  })
}));