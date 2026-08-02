"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Box,
  HStack,
  IconButton,
  Menu,
  Text,
  VStack,
} from "@chakra-ui/react"
import { message } from "@tauri-apps/plugin-dialog"
import { load } from "@tauri-apps/plugin-store"
import { Clipboard, CircleHelp, Dice5, History, MoonStar, Palette, Save, SunMedium } from "lucide-react"
import { toaster } from "./toaster"
import { useColorMode } from "./ui/color-mode"
import { useColorModeValue } from "./ui/color-mode"

type NavbarProps = {
  currentHex: string
  onSelectSavedColor: (hex: string) => void
  onRandomColor: (hex: string) => void
  onCopyToClipboard: (hex: string) => Promise<void>
}

type StoreFile = Awaited<ReturnType<typeof load>>

const STORE_FILE = "hex-color-tool-history.json"
const HISTORY_KEY = "saved-hex-history"
const MAX_HISTORY = 5

const normalizeHistory = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as string[]
  }

  return value
    .filter((item): item is string => typeof item === "string" && item.startsWith("#"))
    .slice(0, MAX_HISTORY)
}

export const Navbar = ({ currentHex, onSelectSavedColor, onRandomColor, onCopyToClipboard }: NavbarProps) => {
  const [history, setHistory] = useState<string[]>([])
  const [isStoreReady, setIsStoreReady] = useState(false)
  const storeRef = useRef<StoreFile | null>(null)
  const { colorMode, toggleColorMode } = useColorMode()

  const panelBg = useColorModeValue("rgba(255, 255, 255, 0.84)", "rgba(15, 23, 42, 0.86)")
  const panelBorder = useColorModeValue("rgba(130, 212, 255, 0.62)", "rgba(96, 165, 250, 0.72)")
  const panelShadow = useColorModeValue(
    "0 0 0 1px rgba(125, 211, 252, 0.42), 0 0 28px rgba(96, 165, 250, 0.22)",
    "0 0 0 1px rgba(59, 130, 246, 0.5), 0 0 28px rgba(37, 99, 235, 0.24)",
  )
  const triggerBg = useColorModeValue("white", "gray.900")
  const triggerColor = useColorModeValue("gray.800", "gray.50")
  const menuBg = useColorModeValue("white", "gray.900")
  const menuBorder = useColorModeValue("gray.200", "whiteAlpha.200")
  const menuText = useColorModeValue("gray.900", "gray.50")
  const menuMuted = useColorModeValue("gray.600", "gray.400")
  const menuHoverBg = useColorModeValue("blue.50", "blue.900")
  const menuHoverColor = useColorModeValue("blue.700", "blue.100")
  const menuHoverBorder = useColorModeValue("blue.200", "blue.500")

  const ensureStore = async () => {
    if (!storeRef.current) {
      storeRef.current = await load(STORE_FILE, { autoSave: false })
    }

    return storeRef.current
  }

  useEffect(() => {
    let isMounted = true

    const hydrateHistory = async () => {
      try {
        const store = await ensureStore()
        const storedHistory = await store.get<string[]>(HISTORY_KEY)

        if (!isMounted) {
          return
        }

        setHistory(normalizeHistory(storedHistory))
      } catch (error) {
        console.error("Failed to load saved color history", error)
      } finally {
        if (isMounted) {
          setIsStoreReady(true)
        }
      }
    }

    hydrateHistory()

    return () => {
      isMounted = false
    }
  }, [])

  const saveCurrentColor = async () => {
    try {
      const store = await ensureStore()
      const nextHistory = [currentHex, ...history.filter((hex) => hex !== currentHex)].slice(0, MAX_HISTORY)

      setHistory(nextHistory)
      await store.set(HISTORY_KEY, nextHistory)
      await store.save()

      toaster.create({
        title: "Saved",
        description: `${currentHex} was added to your history`,
        type: "success",
        duration: 1400,
        closable: true,
      })
    } catch (error) {
      console.error("Failed to save color history", error)
      toaster.create({
        title: "Save failed",
        description: "The color history could not be stored",
        type: "error",
        duration: 1500,
        closable: true,
      })
    }
  }

  const copyCurrentColor = async () => {
    try {
      await onCopyToClipboard(currentHex)

      toaster.create({
        title: "Copied",
        description: `${currentHex} copied to clipboard`,
        type: "success",
        duration: 1400,
        closable: true,
      })
    } catch (error) {
      console.error("Failed to copy color", error)
      toaster.create({
        title: "Copy failed",
        description: "The color could not be copied",
        type: "error",
        duration: 1500,
        closable: true,
      })
    }
  }

  const showAbout = async () => {
    await message(
      "Hex Color Tool helps you pick, copy, save, and revisit hex colors. Your saved colors persist through app restarts, and the right-side controls keep the app compact.",
      {
        title: "About Hex Color Tool",
        kind: "info",
      },
    )
  }

  const randomHex = () => {
    const randomColor = Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()

    const nextHex = `#${randomColor}`

    onRandomColor(nextHex)

    toaster.create({
      title: "Randomized",
      description: `${nextHex} generated`,
      type: "info",
      duration: 1400,
      closable: true,
    })
  }

  const historyItems = useMemo(
    () =>
      history.map((hex) => (
        <Menu.Item
          key={hex}
          value={hex}
          onSelect={() => {
            onSelectSavedColor(hex)
            toaster.create({
              title: "Loaded",
              description: `${hex} applied to the picker`,
              type: "info",
              duration: 1400,
              closable: true,
            })
          }}
          _highlighted={{ bg: menuHoverBg, color: menuHoverColor, borderColor: menuHoverBorder }}
        >
          <HStack gap="3" width="full" justify="space-between">
            <HStack gap="3">
              <Box width="3" height="3" rounded="full" borderWidth="1px" bg={hex} borderColor="whiteAlpha.300" />
              <Text>{hex}</Text>
            </HStack>
            <Text fontSize="xs" color={menuMuted}>
              reuse
            </Text>
          </HStack>
        </Menu.Item>
      )),
    [history, menuMuted, onSelectSavedColor],
  )

  return (
    <Box
      position="absolute"
      right="6"
      top="50%"
      transform="translateY(-42%)"
      zIndex="20"
      bg={panelBg}
      borderWidth="1px"
      borderColor={panelBorder}
      boxShadow={panelShadow}
      backdropFilter="blur(18px)"
      rounded="3xl"
      p="2"
      w="72px"
    >
      <VStack gap="2" align="stretch">
        <IconButton
          aria-label="Copy current color"
          title="Copy current color"
          variant="subtle"
          bg={triggerBg}
          color={triggerColor}
          onClick={copyCurrentColor}
        >
          <Clipboard />
        </IconButton>

        <IconButton
          aria-label="Save current color"
          title="Save current color"
          variant="subtle"
          bg={triggerBg}
          color={triggerColor}
          onClick={saveCurrentColor}
        >
          <Save />
        </IconButton>

        <IconButton
          aria-label="Random color"
          title="Random color"
          variant="subtle"
          bg={triggerBg}
          color={triggerColor}
          onClick={randomHex}
        >
          <Dice5 />
        </IconButton>

        <Menu.Root positioning={{ placement: "left-end" }}>
          <Menu.Trigger asChild>
            <IconButton
              aria-label="Open saved history"
              title="Open saved history"
              variant="subtle"
              bg={triggerBg}
              color={triggerColor}
            >
              <History />
            </IconButton>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content
              bg={menuBg}
              borderWidth="1px"
              borderColor={menuBorder}
              boxShadow="lg"
              rounded="2xl"
              p="1"
              color={menuText}
            >
              <Menu.ItemGroup>
                <Menu.ItemGroupLabel color={menuMuted}>Saved colors</Menu.ItemGroupLabel>
                {historyItems.length > 0 ? (
                  historyItems
                ) : (
                  <Menu.Item value="empty-history" disabled color={menuMuted}>
                    No saved colors yet
                  </Menu.Item>
                )}
              </Menu.ItemGroup>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>

        <Menu.Root positioning={{ placement: "left-end" }}>
          <Menu.Trigger asChild>
            <IconButton
              aria-label="Open app menu"
              title="Open app menu"
              variant="subtle"
              bg={triggerBg}
              color={triggerColor}
            >
              <Palette />
            </IconButton>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content
              bg={menuBg}
              borderWidth="1px"
              borderColor={menuBorder}
              boxShadow="lg"
              rounded="2xl"
              p="1"
              color={menuText}
            >
              <Menu.Item
                value="toggle-theme"
                onSelect={() => {
                  toggleColorMode()
                }}
                color={menuText}
                _highlighted={{ bg: menuHoverBg, color: menuHoverColor, borderColor: menuHoverBorder }}
              >
                <HStack gap="3" justify="space-between" width="full">
                  <HStack gap="3">
                    {colorMode === "light" ? <MoonStar size={16} /> : <SunMedium size={16} />}
                    <Text>{colorMode === "light" ? "Dark mode" : "Light mode"}</Text>
                  </HStack>
                  <Text fontSize="xs" color={menuMuted}>
                    theme
                  </Text>
                </HStack>
              </Menu.Item>
              <Menu.Item
                value="about"
                onSelect={() => {
                  void showAbout()
                }}
                color={menuText}
                _highlighted={{ bg: menuHoverBg, color: menuHoverColor, borderColor: menuHoverBorder }}
              >
                <HStack gap="3" justify="space-between" width="full">
                  <HStack gap="3">
                    <CircleHelp size={16} />
                    <Text>Help / About</Text>
                  </HStack>
                  <Text fontSize="xs" color={menuMuted}>
                    info
                  </Text>
                </HStack>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </VStack>
      {!isStoreReady ? (
        <Text mt="2" fontSize="xs" color={menuMuted} textAlign="center">
          loading history
        </Text>
      ) : null}
    </Box>
  )
}