"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface IUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  createdAt: string;
}

interface IUserContext {
  user: IUser | null;
  setUser: (user: IUser) => void;
  clearUser: () => void;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<IUser | null>(null);

  const setUser = (user: IUser) => setUserState(user);
  const clearUser = () => setUserState(null);

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser павінен выкарыстоўвацца ў межах UserProvider");
  }
  return context;
};
