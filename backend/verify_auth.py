from app.core import security

def verify():
    password = "test_password_123"
    print(f"Original: {password}")
    
    hashed = security.get_password_hash(password)
    print(f"Hashed: {hashed}")
    
    matches = security.verify_password(password, hashed)
    print(f"Matches: {matches}")
    
    if matches:
        print("AUTH_VERIFICATION_SUCCESS")
    else:
        print("AUTH_VERIFICATION_FAILED")

if __name__ == "__main__":
    verify()
