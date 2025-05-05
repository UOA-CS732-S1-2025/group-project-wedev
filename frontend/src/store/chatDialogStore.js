import { create } from 'zustand';

export const useChatDialogStore = create((set) => ({
  isOpen: false,
  conversationId: null,
  otherUser: null,
  
  openDialog: (conversationId, otherUser) => set({ 
    isOpen: true, 
    conversationId, 
    otherUser 
  }),
  
  closeDialog: () => set({ 
    isOpen: false 
  })
}));