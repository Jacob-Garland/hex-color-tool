import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react"
import { ColorModeProvider } from "./components/ui/color-mode"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {},
    },
  },
})

const system = createSystem(defaultConfig, config)

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ColorModeProvider>
      <ChakraProvider value={system}>
        <App />
      </ChakraProvider>
    </ColorModeProvider>
  </React.StrictMode>,
);
