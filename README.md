<p align="center">
  <img src="assets/icons/qwacky.png" alt="Qwacky Logo" width="128" height="128">
</p>

# Why Qwacky?

I've been using [DuckDuckGo Email Protection](https://duckduckgo.com/email) service for a while and really appreciate it. However, the requirement to install the full DuckDuckGo extension came with some challenges:

- You can't disable the tracking protection feature globally
- You need to manually disable tracking protection for each website
- The extension changes your default search engine to DuckDuckGo
- No way to use just the email protection service standalone

That's why I created Qwacky - initially for personal use, but I realized others might face the same issues. As someone who always wanted to contribute to the open-source community with helpful tools, I decided to share this project publicly.

## Download

<p align="center">
<a href="https://chromewebstore.google.com/detail/qwacky/kieehbhdbincplacegpjdkoglfakboeo"><img src="https://user-images.githubusercontent.com/585534/107280622-91a8ea80-6a26-11eb-8d07-77c548b28665.png" alt="Get Qwacky for Chrome"></a>
<a href="https://addons.mozilla.org/en-US/firefox/addon/qwacky/"><img src="https://user-images.githubusercontent.com/585534/107280546-7b9b2a00-6a26-11eb-8f9f-f95932f4bfec.png" alt="Get Qwacky for Firefox"></a>
</p>

## Features
- Generate and manage private @duck.com email addresses
- Copy the generated address to the clipboard
- Auto-fill and copy addresses in input fields from context menu for a quick address generation
- Store the generated addresses locally
- Multiple accounts support
- Notes for each generated address
- Export/import settings (CSV & JSON)
- And more!

### Browser Compatibility

Qwacky is designed to work seamlessly on both Chrome and Firefox. The build process automatically handles browser-specific requirements:

- **Chrome**: Uses service workers for background scripts (Manifest V3)
- **Firefox**: Uses background scripts with polyfill support (Manifest V3)

Both versions maintain feature parity while adhering to each browser's best practices and security models.

## Screenshots
![Qwacky Banner](assets/images/banner2.png)
> **A big thanks to [@m.miriam12398](https://www.instagram.com/m.miriam12398/) for contributing by making such a cool designs for the project!**

# Security & Privacy
- Uses minimal permissions required for functionality
- All data is stored locally on your device
- No tracking or analytics
- Manifest V3 for better security
- Open source for transparency

### Permissions
- `Storage`: Required to store your generated addresses and settings locally
- `Context Menu Autofill`: This toggle enables generating aliases from the context menu, auto-detecting email fields, It requires the following optional permissions:
  - `contextMenus`: Enables the context menu for quick address generation
  - `activeTab`: Required to access and inject scripts into the current tab only when you explicitly interact with the extension (e.g., using the context menu to fill email addresses)
  - `clipboardWrite`: Needed to copy the generated address to the clipboard
  - `scripting`: Required for programmatically injecting the content script when using the context menu

### Browser-Specific Permission Handling and Limitations

Firefox and Chrome differ in how they manage and display extension permissions like `contextMenus`:

- **Firefox** requires `contextMenus` to be listed in the manifest's `permissions` block at install time. Unlike Chrome, Firefox **does not support** requesting `contextMenus` as an optional permission in Manifest V3. This is because the permission directly affects browser UI elements (like the right-click menu), and Firefox enforces that such changes be explicitly declared up front.
- **Chrome**, on the other hand, allows `contextMenus` to be declared in `optional_permissions` and requested at runtime. However, even after removing permissions programmatically using `chrome.permissions.remove()`, they may still appear under `chrome://extensions` as "granted"—even if they're no longer active.

To maintain compatibility and avoid unexpected behavior:
- We include `contextMenus` in the required permissions for Firefox.
- We still use runtime permission requests for Chrome where possible, in line with its model.

This difference in behavior is a known limitation in Chrome and has been discussed by the Chromium team:
- [Chromium Extensions Group – Optional Permission Removal Behavior](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/tqbVLwgVh58)
- [Chrome Developers Documentation – Optional Permissions](https://developer.chrome.com/docs/extensions/mv3/declare_permissions/#optional-permissions)
- [Mozilla Discourse – `contextMenus` as an optional permission is not supported in Firefox](https://discourse.mozilla.org/t/contextmenus-as-an-optional-permission/64181)

# Manual Installation

#### Chrome
1. Download the latest release from the [GitHub Releases](https://github.com/Lanshuns/Qwacky/releases) page
2. Unzip the downloaded file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the unzipped folder

#### Firefox
1. Download the Firefox version (.xpi file) from the [GitHub Releases](https://github.com/Lanshuns/Qwacky/releases) page
2. Open Firefox and go to `about:addons`
3. Click the gear icon and select "Install Add-on From File..."
4. Select the downloaded .xpi file

# Development

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Setup
```bash
# 1. Clone the repository
git clone https://github.com/Lanshuns/Qwacky.git
cd qwacky
# 2. Install dependencies
npm install
```

### Development Mode

```bash
# For Chrome
npm run dev
# For Firefox
npm run dev:firefox
```

### Production Build

```bash
# For Chrome
npm run build
# For Firefox
npm run build:firefox
```

The built extension will be available in the `dist` directory.

> **Note**: For development and temporary installation in Firefox, you can use `about:debugging` method:
> 1. Go to `about:debugging`
> 2. Click "This Firefox" in the left sidebar
> 3. Click "Load Temporary Add-on"
> 4. Select the `manifest.json` file from the unzipped folder

# Acknowledgments

This project is a derivative work based on DuckDuckGo's Email Protection service, which is licensed under the Apache License 2.0. The original work's copyright notice:

Copyright (c) 2010-2021 Duck Duck Go, Inc.

For the full license text, see [APACHE-LICENSE](https://github.com/duckduckgo/duckduckgo-privacy-extension/blob/main/LICENSE.md).