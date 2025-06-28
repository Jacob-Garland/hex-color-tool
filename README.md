# Hex Color Tool

## Description

This simple and small desktop application is something I threw together in a couple days with Chakra UI's color picker component and Tauri
to quickly generate hex codes for custom colors when developing. The app allows you to freely browse the color spectrum, and when a color
is selected by the user, the hex code is printed at the top. After realizing the pains of drag-and-click to copy the hex code, I also
created a button feature using the Tauri Clipboard plugin API that allows for one click copying of the hex to quickly paste in any editor.

## Screenshot

![screenshot](./public/Screenshot%202025-06-28%20135933.png)

## Installation & Usage

To install this app and use it for yourself*, follow my step-by-step instructions below:

1. Clone this repository to your local machine.
2. Make sure to visit https://v2.tauri.app/ and follow instructions to properly install Tauri and Rust and configure your local machine.
3. Open your terminal and navigate to the project root directory.
4. Run 'npm install -D' to ensure all dependancies and dev dependancy packages are installed.
5. Run 'npm run tauri dev' and Tauri will make a release build that will hot reload with Vite as you make any changes.
6. Alternatively, use 'npm run tauri build' to build my base version or after you're done with the changes.
7. Once Tauri has completed the build, you can find a packaged version of the app in "./src-tauri/target/release/".

The app will be the three files in the release folder, and depending on your OS, select the appropriate app and copy it anywhere on your device.
The Windows application is the .exe file. When you open your system's appropriate application file, the app window will open on your desktop.

## Credits

- [Chakra UI](https://chakra-ui.com/)
- [Tauri](https://v2.tauri.app/)
- Jacob Garland, application creator

## License

![Static Badge](https://img.shields.io/badge/License-MIT-blue)

This project is licensed under the MIT License. Please refer to the LICENSE.txt file for full license details.
