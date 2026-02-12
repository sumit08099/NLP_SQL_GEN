import requests

url = "http://localhost:8000/signup"
# Testing with special characters and long password
data = {
    "username": "special_user_7",
    "email": "special7@example.com",
    "password": "Strong@Pass#123!_With_Spaces"
}

try:
    response = requests.post(url, data=data)
    print(f"Testing password: {data['password']}")
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
