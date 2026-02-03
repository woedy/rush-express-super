import requests
import json

BASE_URL = "http://localhost:8000"

def test_auth_flow():
    # 1. Register
    print("Testing Registration...")
    reg_payload = {
        "username": "testuser_verif",
        "email": "testuser_verif@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User",
        "role": "CUSTOMER",
        "phone_number": "1234567890"
    }
    response = requests.post(f"{BASE_URL}/auth/register/", json=reg_payload)
    print(f"Status: {response.status_code}")
    if response.status_code != 201:
        print(f"Error: {response.text}")
        return
    
    data = response.json()
    verification_token = data.get("verification_token")
    print(f"User registered. Verification token: {verification_token}")

    # 2. Verify Email
    print("\nTesting Email Verification...")
    verif_payload = {"token": verification_token}
    response = requests.post(f"{BASE_URL}/auth/verify-email/", json=verif_payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

    # 3. Login
    print("\nTesting Login...")
    login_payload = {
        "username": "testuser_verif",
        "password": "testpassword123"
    }
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_payload)
    print(f"Status: {response.status_code}")
    if response.status_code != 200:
        print(f"Error: {response.text}")
        return
    
    tokens = response.json()
    access_token = tokens.get("access")
    print("Login successful.")

    # 4. Request Password Reset
    print("\nTesting Password Reset Request...")
    reset_req_payload = {"email": "testuser_verif@example.com"}
    response = requests.post(f"{BASE_URL}/auth/password-reset/", json=reset_req_payload)
    print(f"Status: {response.status_code}")
    reset_data = response.json()
    reset_token = reset_data.get("token")
    print(f"Reset token received: {reset_token}")

    # 5. Confirm Password Reset
    print("\nTesting Password Reset Confirm...")
    reset_confirm_payload = {
        "token": reset_token,
        "new_password": "newpassword456"
    }
    response = requests.post(f"{BASE_URL}/auth/password-reset-confirm/", json=reset_confirm_payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

    # 6. Login with new password
    print("\nTesting Login with new password...")
    login_payload["password"] = "newpassword456"
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("Login with new password successful!")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_auth_flow()
