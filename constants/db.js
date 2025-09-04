import * as SQLite from "expo-sqlite";

let db;

export const initDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("library.db");
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      author TEXT,
      yearPublished TEXT,
      type TEXT,
      path TEXT
    );
  `);
};

export const addFile = async ({ title, author, yearPublished, type, path }) => {
  if (!db) db = await SQLite.openDatabaseAsync("library.db");

  await db.runAsync(
    "INSERT INTO library (title, author, yearPublished, type, path) VALUES (?, ?, ?, ?, ?)",
    [title, author, yearPublished, type, path]
  );
};

export const getFiles = async () => {
  if (!db) db = await SQLite.openDatabaseAsync("library.db");

  return await db.getAllAsync("SELECT * FROM library");
};

export const deleteFile = async (id) => {
  if (!db) db = await SQLite.openDatabaseAsync("library.db");

  await db.runAsync("DELETE FROM library WHERE id = ?", [id]);
};
