'use client'
import { useEffect, useState, ReactNode, useContext } from "react";
import { createContext } from "react";

interface ThemeContextProps {
  theme: string;
  toggleTheme: () => void;
}
export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);
// const prefer = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
const ThemeProvider = ({ children }: { children: ReactNode }) =>{
    const [isDark,setIsDark] = useState(true);
    const theme = isDark ? 'dark' : 'light'
    const toggleTheme = ()=>{
        setIsDark((prevTheme)=>!prevTheme);
    }
    const preferChange = (e:MediaQueryListEvent) =>{
        setIsDark(e.matches);
    }
    
    useEffect(()=>{
        document.documentElement.setAttribute("data-theme",theme);
        console.log("Theme:",theme);
        // prefer.addEventListener('change', preferChange);
        
        // Clean up the event listener on unmount
        return () => {
            // prefer.removeEventListener('change', preferChange);
        };
    },[isDark,theme])
    
    const value = {
        theme,
        toggleTheme
    }
    return <ThemeContext.Provider value={value}>
        {children}
    </ThemeContext.Provider>
}
export default ThemeProvider;
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
      throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
  };