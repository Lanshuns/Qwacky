# Changelog

## 2.1.0

### Added
- **Convert to send address** - turn a selected recipient into a reverse alias straight from the right-click menu or with a keyboard shortcut (Alt+Shift+S)
- **Delete your Duck account** - you can now delete your DuckDuckGo account directly from Qwacky
- **Remove account local data** - delete an account's saved addresses and reverse aliases from this device and from sync, without touching your DuckDuckGo account
- **Appearance settings** - pick a light, dark, or system theme and switch between 12-hour and 24-hour time
- **Import from a text file** - bulk-import existing @duck.com addresses from a plain .txt list, one per line

### Fixed
- **DuckDuckGo sign-in** - logging in at duckduckgo.com/email no longer gets stuck when Qwacky is installed
- **Firefox references** - Firefox builds now point to Firefox Add-ons and describe sync storage correctly instead of showing Chrome and Google
- **Support link** - the heart icon and About page now open the correct readme section

### Changed
- **Manage your Duck account** - the "Change forwarding address" button is now "Manage your Duck account", where you can change your forwarding address or delete your account
- **Theme moved to settings** - the theme picker lives in the new Appearance section instead of the header

## 2.0.0

### Added
- **Send** - convert any email into a reverse alias to send emails privately from your @duck.com address, with history and notes
- **Tags** - organize addresses and reverse aliases with custom tags, filter by tag, group by tag, or view "Untagged"
- **Auto-Login** - automatically log in after you sign up in Qwacky
- **Firefox for Android support** - the extension now works on Firefox for Android ([#12](https://github.com/Lanshuns/Qwacky/pull/12) by [@Meterel](https://github.com/Meterel))
- **My Account page** - view your profile, email stats, and manage your forwarding address
- **About page** - version info, store links, and support the project
- **Popout window** - open Qwacky in a standalone window from the popup
- **Session sync** - restore your accounts on another device through cross-device sync
- **Granular sync options** - choose what to sync: addresses, reverse aliases, session data, and which accounts
- **Selective backup** - choose which accounts to include when exporting

### Fixed
- Popup layout centered properly on Android/fullscreen ([#12](https://github.com/Lanshuns/Qwacky/pull/12) by [@Meterel](https://github.com/Meterel))
- Sync no longer crashes in the background when saving theme preferences
- Clipboard copy now shows an error instead of silently failing
- Pending sync writes are saved before the extension suspends, preventing data loss

### Changed
- Popup width increased from 360px to 400px
- CSV export removed - JSON backup now includes everything (addresses, reverse aliases, notes, tags, session data)
- Redesigned theme with glass effects, improved shadows, and refined colors
- Improved error handling and validation across the board

## 1.2.1

### Added
- Cross-device sync (Experimental)
- Generate address using keyboard shortcut (Alt+Shift+Q)
- Sign up page
- Search & filter addresses and notes
- Account nickname customization

### Improved
- UI enhancements and redesigned settings page
- Performance optimizations with session storage caching (20x faster reads)
- Gzip compression for 3-5x storage capacity
- Timestamp-based conflict resolution for sync
- Enter key for saving notes
- Auto-focus on note editing

## 1.2.0

### Added
- Clear all addresses button
- Menu for switching between multiple accounts
- Permissions section in the settings
- Toggle controls for optional permissions

### Changed
- Remove extra spaces when pasting during login
- Remove special characters and spaces in the login input

### Improved
- Various UI enhancements
- Enhanced privacy by limiting permissions in the manifest file to only required domains
- Updated manifest to explicitly declare all required permissions for better transparency
- Added secure defaults for optional permissions

### Fixed
- Popup closes in Firefox when trying to import backup address, by making it uses paste the address instead

## 1.1.0

### Added
- Multiple accounts support
- System color theme detection
- Notes for each generated address
- Auto-save website domain in notes when generating address from context menu
- Address deletion functionality
- Export/import functionality (CSV & JSON) for backing up generated addresses with notes
- Confirmation dialogs before logout and address deletion
- Build number management
- Changelog popup and menu entry

### Fixed
- Various bug fixes and code improvements

## 1.0.1

### Changed
- Added cross-browser support 
- Updated build configuration

## 1.0.0
- Initial release of the extension
