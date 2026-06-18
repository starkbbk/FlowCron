import sqlite3
import os

def migrate():
    # Detect db path (run from root or backend directory)
    db_paths = ["backend/flowcron.db", "flowcron.db"]
    db_path = None
    for path in db_paths:
        if os.path.exists(path) and os.path.isfile(path):
            db_path = path
            break
            
    if not db_path:
        # If it doesn't exist, it will be created automatically on startup by SQLAlchemy
        print("Database file does not exist yet. No migration needed.")
        return

    print(f"Using database file: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if clerk_id already exists in users
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "clerk_id" in columns:
        print("Database already has 'clerk_id' column. No migration needed.")
        conn.close()
        return
        
    print("Migrating 'users' table to support Clerk authentication...")
    try:
        # Start transaction
        cursor.execute("BEGIN TRANSACTION;")
        
        # Rename existing users table
        cursor.execute("ALTER TABLE users RENAME TO users_old;")
        
        # Recreate users table with nullable password_hash and added clerk_id column
        cursor.execute("""
        CREATE TABLE users (
            id CHAR(36) PRIMARY KEY,
            email VARCHAR NOT NULL UNIQUE,
            username VARCHAR NOT NULL UNIQUE,
            password_hash VARCHAR NULL,
            is_active BOOLEAN DEFAULT 1,
            profile_image TEXT NULL,
            clerk_id VARCHAR UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME
        );
        """)
        
        # Copy data from users_old to users (mapping old columns)
        # Note: SQLite table_info output: id, email, username, password_hash, is_active, profile_image, created_at, updated_at
        cursor.execute("""
        INSERT INTO users (id, email, username, password_hash, is_active, profile_image, created_at, updated_at)
        SELECT id, email, username, password_hash, is_active, profile_image, created_at, updated_at FROM users_old;
        """)
        
        # Drop old table
        cursor.execute("DROP TABLE users_old;")
        
        # Commit transaction
        conn.commit()
        print("Migration completed successfully!")
    except Exception as e:
        conn.rollback()
        print(f"Error during migration: {e}")
        raise e
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
