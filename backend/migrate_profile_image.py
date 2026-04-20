import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "flowcron.db")
print(f"Opening database at: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if column exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if "profile_image" not in columns:
        print("Adding profile_image column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN profile_image TEXT")
        conn.commit()
        print("Success!")
    else:
        print("profile_image column already exists.")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
