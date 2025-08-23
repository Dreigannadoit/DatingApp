"use client";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
// import { error } from "node:console";
import { Children, createContext, useContext, useEffect, useRef, useState } from "react";

interface AuthContextType {
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
  resetTimeout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const supabase = createClient();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const TIMEOUT_MS = 60 * 60 * 1000;


    const resetTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            console.log("Session expired due to inactivity");
            await signOut();
        }, TIMEOUT_MS);
    };

    useEffect(() => {
        async function checkUser() {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                setUser(session?.user ?? null);

                // listen to auth changes
                const {
                    data: { subscription },
                } = supabase.auth.onAuthStateChange((_event, session) => {
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        resetTimeout(); // start timeout on login
                    } else {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    }
                });

                return () => subscription.unsubscribe();
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        checkUser();
    }, []);

    useEffect(() => {
        if (!user) return;

        const events = ["click", "mousemove", "keydown"];
        events.forEach((event) => window.addEventListener(event, resetTimeout));

        resetTimeout();

        return () => {
            events.forEach((event) =>
                window.removeEventListener(event, resetTimeout)
            );
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [user]);

    async function signOut() {
        try {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            await supabase.auth.signOut()
        } catch (error) {
            console.error("A problem has occured while signing out", error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut, resetTimeout }}>
            {children}
        </AuthContext.Provider>
    )
}


export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}