import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '@/domain/types';

interface RoleState {
  role: Role;
  setRole: (role: Role) => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: 'Admin',
      setRole: (role) => set({ role }),
    }),
    {
      name: 'campusride-role-storage',
    }
  )
);
