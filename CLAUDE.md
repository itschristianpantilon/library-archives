# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` or `expo start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser
- `npm run lint` or `expo lint` - Run ESLint for code linting
- `npm run reset-project` - Move starter code to app-example and create blank app directory

**Note**: This project uses TypeScript types but JavaScript (.jsx) files. No test framework is currently configured.

## Key Dependencies

- **expo-sqlite** (v15.2.14) - Local SQLite database for file metadata storage
- **react-native-pdf** (v6.7.7) - PDF rendering with dual-page book mode support
- **expo-document-picker** (v13.1.6) - File selection from device
- **expo-file-system** (v18.1.11) - File operations and local storage
- **nativewind** (v4.1.23) - Tailwind CSS styling for React Native
- **expo-router** (v5.1.5) - File-based routing system
- **react-native-gesture-handler** (v2.24.0) - Gesture system for swipe navigation in PDF reader

## Architecture Overview

This is a React Native Expo application for a library archive system that allows users to upload, view, and manage academic documents (books, theses, magazines).

### Application Bootstrap Flow:

1. **Root Layout** (`app/_layout.jsx`): Initializes database via `initDB()`, loads custom Poppins fonts (9 variants + Magnifico-Daytime-ITC), wraps app in `GestureHandlerRootView`, and sets up Expo Router stack navigation
2. **Database Initialization** (`constants/db.js`): Creates SQLite database `library.db` and `library` table on first launch
3. **Navigation Structure**: File-based routing with grouped routes for different operations

### Core Architecture:

- **Database Layer** (`constants/db.js`): SQLite database with async functions:
  - `initDB()` - Opens database and creates table if not exists
  - `addFile({ title, author, yearPublished, type, path, uploadDate })` - Inserts new document
  - `getFiles()` - Returns all documents as array
  - `deleteFile(id)` - Deletes document by ID
- **Navigation**: Expo Router with grouped routes: `(add)`, `(view)`, `(delete)` - each has `_layout.jsx` and `index.jsx`
- **File Storage**: Documents copied to `FileSystem.documentDirectory` with absolute paths stored in database
- **Styling**: NativeWind (Tailwind CSS for React Native) with `global.css` and custom font variants

### Key Features & Files:

1. **Document Upload** (`app/(add)/index.jsx`):
   - Two-screen UI: Home screen with upload instructions, form screen for data entry
   - Uses `expo-document-picker` with `type: "*/*"` to accept any file
   - Copies files to app document directory via `FileSystem.copyAsync()`, preserving original filename
   - Stores metadata (title, author, yearPublished, type) in SQLite
   - **Upload date is auto-generated** using `new Date().toLocaleDateString()` on save
   - Supports 3 document types: `book`, `thesis`, `magazine`
   - Form validation requires all fields + file selection before save

2. **Document Viewing** (`app/(view)/index.jsx`):
   - Four category tabs: `book`, `thesis`, `magazine`, `reports`
   - **Reports tab is special**: Shows total counts per category + all files grouped by upload date (newest first)
   - Search functionality via `SearchInput` component (searches title, author, yearPublished)
   - Regular tabs show filtered list for that category with search support
   - Opens PDF reader on item selection, passing `filePath` and `title` as route params
   - Verifies file existence with `FileSystem.getInfoAsync()` before opening

3. **PDF Reader** (`app/pdfReader.jsx`):
   - **Critical component** - recently fixed, exercise caution when modifying
   - Uses `react-native-pdf` library with **dual-page "book mode" layout**
   - Displays two pages side-by-side (odd page left, even page right) with green borders
   - **Navigation advances by 2 pages** to show next spread via `goToNextPage()`/`goToPrevPage()`
   - Swipe gestures: swipe right on left page for previous, swipe left on right page for next
   - **Page count detection**:
     - Primary: `onLoadComplete` callback (handles multiple signature formats)
     - Secondary: `onPageChanged` callback
     - Fallback: 5-second timeout sets `totalPages=100` if detection fails
   - Supports TXT file viewing with scrollable text display
   - External app sharing via `expo-sharing`
   - **File URIs must include `file://` prefix** - auto-prepends if missing
   - Last page handling: Shows "End of Document" placeholder if right page exceeds total

4. **Document Deletion** (`app/(delete)/index.jsx`): Delete functionality for library items

### Database Schema:

SQLite table `library`:
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
title TEXT
author TEXT
yearPublished TEXT
type TEXT  -- "book" | "thesis" | "magazine" (NOT "reports")
path TEXT  -- Absolute path in FileSystem.documentDirectory
uploadDate TEXT -- Auto-generated via new Date().toLocaleDateString()
```

### Important Implementation Details:

- **PDF Viewer** (`app/pdfReader.jsx`): This component is complex and has been recently fixed. When modifying:
  - Page count detection logic handles multiple callback signatures from `react-native-pdf`
  - Book mode navigation advances by 2 pages for spreads
  - File URI formatting requires `file://` prefix
  - State management: `totalPages`, `currentPage`, `pdfReady`, `loading` flags
  - Timeout fallback (5000ms) prevents indefinite loading state

- **File Paths**: All document paths in database are absolute paths within `FileSystem.documentDirectory` (e.g., `/path/to/documentDirectory/filename.pdf`)

- **Custom Components** (`/components`):
  - `CustomButton`: Reusable button with optional icon support
  - `CloseButton`: Navigation close button for modals/pages
  - `SearchInput`: Debounced search input with filtering
  - `FlippingPage`: Page transition animations

- **Document Types**: The app supports exactly 3 document types for upload:
  - `book` - General books
  - `thesis` - Academic theses
  - `magazine` - Periodicals/magazines

  The 4th tab `reports` is **NOT a document type** - it's a summary/analytics view that shows:
  - Total count statistics for each of the 3 categories
  - All files grouped and sorted by `uploadDate` (newest first)
  - Files within each date group sorted by ID (newest first)

- **Font System**: Uses Poppins font family with 9 variants (Black, Bold, ExtraBold, ExtraLight, Light, Medium, Regular, SemiBold, Thin) plus Magnifico-Daytime-ITC for branding

- **Color Scheme**: Primary green color is `#084526` (dark forest green) used throughout for buttons, borders, active states