import requests

BASE_URL = "http://localhost:8081/api"

def test_delete_user(user_id):
    try:
        # Note: This will fail if no token is provided, but we can check the error code.
        response = requests.delete(f"{BASE_URL}/users/{user_id}")
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_delete_user(999) # Test with non-existent user
