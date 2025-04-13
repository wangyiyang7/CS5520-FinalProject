// Create an AuthContext
import { createContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/Firebase/firebaseSetup";

export const AuthContext = createContext<{
  currentUser: User | null;
  loading: boolean;
}>({ currentUser: null, loading: true });

type ContextProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: ContextProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
