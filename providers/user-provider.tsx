"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type UserOption = {
  id: string;
  name: string;
  role: string;
  email: string;
};

type UserApiResponse = {
  users: UserOption[];
  activeUserId: string | null;
};

type UserContextValue = {
  users: UserOption[];
  activeUserId: string | null;
  activeUser: UserOption | null;
  isLoading: boolean;
  isSwitching: boolean;
  isLoggingOut: boolean;
  refreshUsers: () => Promise<void>;
  switchUser: (userId: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
};

const UserContext = createContext<UserContextValue | null>(null);

type UserProviderProps = {
  children: React.ReactNode;
  initialUsers?: UserOption[];
  initialActiveUserId?: string | null;
};

export function UserProvider({
  children,
  initialUsers = [],
  initialActiveUserId = null,
}: UserProviderProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserOption[]>(initialUsers);
  const [activeUserId, setActiveUserId] = useState<string | null>(
    initialActiveUserId,
  );
  const [isLoading, setIsLoading] = useState(
    initialUsers.length === 0 && initialActiveUserId === null,
  );
  const [isSwitching, setIsSwitching] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const refreshUsers = useCallback(async () => {
    const response = await fetch("/api/users", { method: "GET" });
    if (!response.ok) {
      throw new Error("Failed to load users");
    }

    const result = (await response.json()) as UserApiResponse;
    setUsers(result.users ?? []);
    setActiveUserId(result.activeUserId ?? null);
  }, []);

  useEffect(() => {
    if (initialUsers.length > 0 || initialActiveUserId !== null) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const run = async () => {
      try {
        await refreshUsers();
      } catch (error) {
        if (isMounted) {
          setUsers([]);
          setActiveUserId(null);
        }
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void run();
    return () => {
      isMounted = false;
    };
  }, [initialActiveUserId, initialUsers.length, refreshUsers]);

  const switchUser = useCallback(
    async (userId: string) => {
      if (isSwitching || userId === activeUserId) {
        return false;
      }

      setIsSwitching(true);
      try {
        const response = await fetch("/api/users/active", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (!response.ok) {
          throw new Error("Failed to switch active user");
        }

        setActiveUserId(userId);
        router.replace("/");
        return true;
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        setIsSwitching(false);
      }
    },
    [activeUserId, isSwitching, router],
  );

  const logout = useCallback(async () => {
    if (isLoggingOut) {
      return false;
    }

    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/users/logout", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      setActiveUserId(null);
      router.refresh();
      router.push("/");
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, router]);

  const activeUser = useMemo(
    () => users.find((user) => user.id === activeUserId) ?? null,
    [activeUserId, users],
  );

  const value = useMemo(
    () => ({
      users,
      activeUserId,
      activeUser,
      isLoading,
      isSwitching,
      isLoggingOut,
      refreshUsers,
      switchUser,
      logout,
    }),
    [
      users,
      activeUserId,
      activeUser,
      isLoading,
      isSwitching,
      isLoggingOut,
      refreshUsers,
      switchUser,
      logout,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }

  return context;
}
