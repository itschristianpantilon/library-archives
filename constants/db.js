import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("library.db"); // ✅ use the sync API

// Initialize table
export const initDB = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS library (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        yearPublished TEXT,
        type TEXT,
        path TEXT
      );`
    );
  });
};

// Insert item
export const addFile = (data, callback) => {
  const { title, author, yearPublished, type, path } = data;
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO library (title, author, yearPublished, type, path) VALUES (?, ?, ?, ?, ?)",
      [title, author, yearPublished, type, path],
      (_, result) => callback && callback(result),
      (_, error) => console.log("Insert error:", error)
    );
  });
};

// Get all items
export const getFiles = (callback) => {
  db.transaction((tx) => {
    tx.executeSql("SELECT * FROM library", [], (_, { rows }) => {
      callback(rows._array);
    });
  });
};

// Delete item
export const deleteFile = (id, callback) => {
  db.transaction((tx) => {
    tx.executeSql("DELETE FROM library WHERE id = ?", [id], (_, result) => {
      callback && callback(result);
    });
  });
};
