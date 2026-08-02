import { useState } from "react";
import {
  ColorPicker,
  parseColor,
  HStack,
  Box,
  Text,
  Input,
} from "@chakra-ui/react";
import { Toaster } from "./components/toaster"
import { Navbar } from "./components/navbar";
import { useColorModeValue } from "./components/ui/color-mode";

const DEFAULT_HEX = "#ff0000";

const normalizeHexInput = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  const prefixedValue = trimmedValue.startsWith("#") ? trimmedValue : `#${trimmedValue}`;

  return prefixedValue.slice(0, 7);
};

const isValidHex = (value: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);

function App() {
  const [value, setValue] = useState(parseColor(DEFAULT_HEX));
  const [hexInput, setHexInput] = useState(DEFAULT_HEX);

  const hex = value?.toString?.("hex") ?? "#ff0000";
  const shellBg = useColorModeValue(
    "linear-gradient(135deg, #f7f2ff 0%, #fcfaf7 58%, #eff6ff 100%)",
    "linear-gradient(135deg, #09090b 0%, #111827 55%, #1f2937 100%)",
  );
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.88)", "rgba(24, 24, 27, 0.86)");
  const cardBorder = useColorModeValue("rgba(130, 212, 255, 0.62)", "rgba(96, 165, 250, 0.72)");
  const cardGlow = useColorModeValue(
    "0 0 0 1px rgba(125, 211, 252, 0.48), 0 0 28px rgba(96, 165, 250, 0.26)",
    "0 0 0 1px rgba(96, 165, 250, 0.58), 0 0 28px rgba(59, 130, 246, 0.28)",
  );
  const pickerBg = useColorModeValue("gray.100", "gray.800");
  const pickerGlow = useColorModeValue(
    "0 0 0 1px rgba(125, 211, 252, 0.58), 0 0 22px rgba(96, 165, 250, 0.34)",
    "0 0 0 1px rgba(59, 130, 246, 0.7), 0 0 22px rgba(37, 99, 235, 0.36)",
  );
  const accentText = useColorModeValue("gray.900", "gray.50");
  const labelText = useColorModeValue("gray.800", "gray.100");
  const inputBg = useColorModeValue("white", "gray.900");
  const inputBorder = useColorModeValue("blue.200", "blue.500");
  const inputGlow = useColorModeValue(
    "0 0 0 1px rgba(96, 165, 250, 0.5), 0 0 20px rgba(96, 165, 250, 0.2)",
    "0 0 0 1px rgba(96, 165, 250, 0.55), 0 0 20px rgba(59, 130, 246, 0.18)",
  );
  const hexLineBorder = useColorModeValue("blue.200", "blue.500");

  return (
    <Box minH="100vh" w="100vw" p="6" bgImage={shellBg} position="relative" overflow="hidden" boxSizing="border-box">
      <Box
        position="absolute"
        inset="0"
        bgGradient="radial(circle at top left, rgba(255,255,255,0.22), transparent 40%), radial(circle at bottom right, rgba(168,85,247,0.16), transparent 35%)"
        pointerEvents="none"
      />

      <Box
        position="relative"
        zIndex="1"
        maxW="420px"
        minH="calc(100vh - 3rem)"
        w="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        ml="auto"
        mr="auto"
      >
        <Box
          w="full"
          p="5"
          rounded="xl"
          borderWidth="1px"
          borderColor={cardBorder}
          bg={cardBg}
          boxShadow={cardGlow}
          backdropFilter="blur(18px)"
        >
          <HStack mb="5" align="center" justify="center" gap="3" flexWrap="wrap">
            <Text fontSize="3xl" fontWeight="extrabold" color={labelText}>
              Hex Code:
            </Text>
            <Input
              value={hexInput}
              onChange={(event) => {
                const nextInput = normalizeHexInput(event.target.value);
                setHexInput(nextInput);

                if (isValidHex(nextInput)) {
                  setValue(parseColor(nextInput));
                }
              }}
              onBlur={() => {
                if (!isValidHex(hexInput)) {
                  setHexInput(hex);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && isValidHex(hexInput)) {
                  setValue(parseColor(hexInput));
                }
              }}
              size="lg"
              maxW="190px"
              minW="190px"
              textAlign="center"
              fontSize="2xl"
              fontWeight="bold"
              letterSpacing="0.08em"
              textTransform="uppercase"
              bg={inputBg}
              color={accentText}
              borderWidth="1px"
              borderColor={inputBorder}
              boxShadow={inputGlow}
              _focusVisible={{ borderColor: "blue.300", boxShadow: inputGlow }}
            />
          </HStack>

          <ColorPicker.Root
            open
            value={value}
            onValueChange={(e) => {
              if (e?.value) setValue(e.value);
              if (e?.value) setHexInput(e.value.toString("hex"));
            }}
            size="2xl"
          >
            <ColorPicker.HiddenInput />
            <ColorPicker.Content animation="none" shadow="xl" p="4" bg={pickerBg} boxShadow={pickerGlow} borderWidth="1px" borderColor={hexLineBorder}>
              <ColorPicker.Area />
              <HStack>
                <ColorPicker.EyeDropper size="md" variant="solid" bg={useColorModeValue("white", "gray.900")} color={useColorModeValue("gray.900", "white")} />
                <ColorPicker.Sliders />
                <ColorPicker.ValueSwatch />
              </HStack>
            </ColorPicker.Content>
          </ColorPicker.Root>
        </Box>
        <Navbar
          currentHex={hex}
          onSelectSavedColor={(savedHex) => setValue(parseColor(savedHex))}
          onRandomColor={(randomHex) => {
            setValue(parseColor(randomHex));
            setHexInput(randomHex);
          }}
          onCopyToClipboard={async (copyHex) => {
            const isTauri = "__TAURI_IPC__" in window;

            if (isTauri) {
              const { writeText } = await import("@tauri-apps/plugin-clipboard-manager");
              await writeText(copyHex);
            } else if (navigator.clipboard) {
              await navigator.clipboard.writeText(copyHex);
            } else {
              throw new Error("No clipboard API available");
            }
          }}
        />
      </Box>
      <Toaster />
    </Box>
  );
}

export default App;
