import { ReactNode, createContext, useContext, useState } from 'react';
import { IUser } from '../interfaces/IUser';

interface IAuthContext {
  user?: IUser;
  login: (user: IUser) => void;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | undefined>(undefined);

  const login = (user: IUser) => {
    setUser(user);
  };

  const logout = () => {
    setUser(undefined);
  };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): IAuthContext => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within a AuthContextProvider');
  }

  return context;
};
