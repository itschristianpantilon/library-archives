# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` or `expo start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser
- `npm run lint` or `expo lint` - Run ESLint for code linting
- `npm run reset-project` - Move starter code to app-example and create blank app directory

**Note**: This project uses TypeScript for development but no test framework is currently configured.

## Architecture Overview

This is a React Native Expo application for a library archive system that allows users to upload, view, and manage academic documents (books, theses, magazines).

### Key Structure:

- **Database Layer**: SQLite database (`constants/db.js`) with functions for CRUD operations on library items
- **Navigation**: File-based routing with Expo Router using grouped routes: `(add)`, `(view)`, `(delete)`
- **Main Flow**: Home screen → Add/View/Delete operations → PDF reader for viewing documents
- **Styling**: NativeWind (Tailwind CSS for React Native) with custom Poppins fonts

### Core Features:

1. **Document Upload** (`app/(add)/index.jsx`): File picker integration with metadata entry (title, author, year, type)
2. **Document Viewing** (`app/(view)/index.jsx`): Browse and search uploaded documents
3. **Document Management** (`app/(delete)/index.jsx`): Delete functionality for library items
4. **PDF Reading** (`app/pdfReader.jsx`): Built-in PDF viewer for documents

### Database Schema:

The SQLite table `library` contains:
- id (PRIMARY KEY)
- title, author, yearPublished, type
- path (local file system path)
- uploadDate

### File Management:

Documents are stored locally using Expo FileSystem in the app's document directory. The database stores the local file paths for retrieval.

### UI Components:

Custom reusable components in `/components`:
- CustomButton: Styled button with icon support
- CloseButton: Navigation close button
- SearchInput: Search functionality for documents
- FlippingPage: Page transition animations