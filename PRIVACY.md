# Privacy Policy

Last updated: September 23, 2026

Qwacky is a browser extension for managing DuckDuckGo Email Protection addresses. It has no servers of its own, no analytics and no tracking. This page explains what the extension stores and who it talks to.

## What Qwacky stores

Everything below is kept in your browser's extension storage on your device:

- Your Duck username and the access token DuckDuckGo issues when you sign in
- The addresses and send addresses you create, with any notes and tags you add
- Your settings, such as theme, time format, compact mode and account colours

The statistics on the Home tab are calculated from this data on your device. Nothing is sent anywhere to produce them.

If you turn off History in Settings, new addresses and send addresses are copied to your clipboard only and are not stored.

## Who Qwacky talks to

- **DuckDuckGo** (`quack.duckduckgo.com`): to sign you in, generate addresses and read your account details. These requests are covered by [DuckDuckGo's privacy policy](https://duckduckgo.com/privacy).
- **Your browser's sync service**, only if you turn on sync in Settings. Your data is then stored in your Google or Mozilla account through the browser's own sync, and you choose what is included. Firefox encrypts synced data end to end. Chrome does so only if you set a sync passphrase.

Qwacky makes no other network requests. It does not collect, sell or share any data, and the developer never receives any of it.

## Permissions

- **Storage**: to keep the data listed above
- **quack.duckduckgo.com**: the only site Qwacky connects to
- **duckduckgo.com/email**: lets you sign in there using your Qwacky session
- **Context menu, active tab, scripting and clipboard** (optional, off until you enable autofill): to fill an address into the page you are on when you use the right-click menu or the keyboard shortcut, and to copy it

On Firefox the context menu permission has to be granted at install, because Firefox does not allow it as an optional permission.

## Removing your data

Use "Remove account local data" on the My Account page to delete an account's data from the device and from sync. Uninstalling the extension deletes everything it stored locally.

## Changes

Changes to this policy are published in this file, and its history is visible on [GitHub](https://github.com/Lanshuns/Qwacky/commits/main/PRIVACY.md).

## Contact

Questions can be asked by opening an issue on [GitHub](https://github.com/Lanshuns/Qwacky/issues).
