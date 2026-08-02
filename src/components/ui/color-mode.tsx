"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

type ColorMode = "light" | "dark"

type ColorModeContextValue = {
  colorMode: ColorMode
  setColorMode: (mode: ColorMode) => void
  toggleColorMode: () => void
}

const STORAGE_KEY = "hex-color-tool-color-mode"

const ColorModeContext = createContext<ColorModeContextValue | null>(null)

export const ColorModeProvider = ({ children }: { children: ReactNode }) => {
  const [colorMode, setColorModeState] = useState<ColorMode>("light")

  useEffect(() => {
    const storedMode = window.localStorage.getItem(STORAGE_KEY)

    if (storedMode === "light" || storedMode === "dark") {
      setColorModeState(storedMode)
      return
    }

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
    setColorModeState(prefersDark ? "dark" : "light")
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, colorMode)
    document.documentElement.dataset.theme = colorMode
    document.documentElement.style.colorScheme = colorMode
  }, [colorMode])

  const value = useMemo<ColorModeContextValue>(
    () => ({
      colorMode,
      setColorMode: setColorModeState,
      toggleColorMode: () => {
        setColorModeState((currentMode) => (currentMode === "light" ? "dark" : "light"))
      },
    }),
    [colorMode],
  )

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>
}

export const useColorMode = () => {
  const context = useContext(ColorModeContext)

  if (!context) {
    throw new Error("useColorMode must be used within a ColorModeProvider")
  }

  return context
}

export const useColorModeValue = <T,>(lightValue: T, darkValue: T) => {
  const { colorMode } = useColorMode()

  return colorMode === "dark" ? darkValue : lightValue
}