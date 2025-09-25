import { create } from 'zustand';
import type { User } from '../types';

interface UserStore {
  users: User[];
  currentUser: User | null;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  setCurrentUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  currentUser: null,

  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),

  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updates } : user
      ),
      currentUser:
        state.currentUser?.id === id
          ? { ...state.currentUser, ...updates }
          : state.currentUser,
    })),

  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
      currentUser: state.currentUser?.id === id ? null : state.currentUser,
    })),

  getUserById: (id) => {
    return get().users.find((user) => user.id === id);
  },

  setCurrentUser: (user) =>
    set({ currentUser: user }),

  setUsers: (users) =>
    set({ users }),
}));