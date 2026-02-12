import requests

url = "http://localhost:8000/signup"
data = {
    "username": "tester123",
    "email": "tester123@example.com",
    "password": "password123"
}

try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
