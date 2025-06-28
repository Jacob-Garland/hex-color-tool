import { useState } from "react";
import {
  ColorPicker,
  parseColor,
  HStack,
  Box,
  Code,
  Text,
  Button
} from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/toaster"
import { writeText as tauriWriteText } from "@tauri-apps/plugin-clipboard-manager";

function App() {
  const [value, setValue] = useState(parseColor("#ff0000"));

  const hex = value?.toString?.("hex") ?? "#ff0000";

  const copyToClipboard = async (hex: string) => {
    try {
      console.log("Copying hex:", hex); // Debug log
      if (!hex || typeof hex !== "string") {
        throw new Error("Invalid hex value");
      }

      // Detect if running in Tauri
      const isTauri = "__TAURI_IPC__" in window;

      if (isTauri) {
        await tauriWriteText(hex);
        console.log("Copied using Tauri clipboard");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(hex);
        console.log("Copied using browser clipboard");
      } else {
        throw new Error("No clipboard API available");
      }

      toaster.create({
        title: "Copied!",
        description: `${hex} copied to clipboard`,
        type: "success",
        duration: 1500,
        closable: true,
      });
    } catch (err) {
      toaster.create({
        title: "Error",
        description: "Failed to copy to clipboard",
        type: "error",
        duration: 1500,
        closable: true,
      });
      console.error("Clipboard error:", err);
    }
  };

  return (
      <Box p="7" bg={"#BA6CD4"} maxWidth={'420px'} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
        <Text fontSize={"3xl"} fontWeight={"extrabold"} color={"black"} >
          Hex Code:
        </Text>
        <HStack mb={"3"}>
          <Code p={"3"} bg={"gray.600"} color={"white"} fontSize={"2xl"}>
            {/* Printed hex value passed from user selecting color in picker */}
            <b>{hex}</b>
          </Code>
          {/* Copy button */}
          <Button
            color={"white"}
            variant={"solid"}
            size={"md"}
            onClick={() => copyToClipboard(hex)}
          > Copy </Button>
        </HStack>

        {/* Color Picker */}
        <ColorPicker.Root 
          open 
          defaultValue={value} 
          onValueChange={(e) => {
            if (e?.value) setValue(e.value);
          }}
          size={"2xl"}
          >
          <ColorPicker.HiddenInput />
          <ColorPicker.Content animation="none" shadow="xl" p="4" bg={"gray.500"}>
            <ColorPicker.Area />
              <HStack>
                <ColorPicker.EyeDropper size="md" variant="solid" bg={"white"} color={"black"} />
                <ColorPicker.Sliders />
                <ColorPicker.ValueSwatch />
              </HStack>
          </ColorPicker.Content>
        </ColorPicker.Root>
        <Toaster />
      </Box>
  );
}

export default App;
