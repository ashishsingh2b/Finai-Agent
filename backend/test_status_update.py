import requests
import sys

# Configuration
API_URL = "http://localhost:8000/api/v1"
ANALYSIS_ID = 4  # Using ID 4 as seen in user screenshot
LOGIN_DATA = {
    "username": "test_persist@gmail.com",
    "password": "password123"
}

def test_update():
    # 1. Login to get token
    print(f"Logging in as {LOGIN_DATA['username']}...")
    try:
        response = requests.post(f"{API_URL}/auth/login", data=LOGIN_DATA)
        response.raise_for_status()
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
    except Exception as e:
        print(f"Login failed: {e}")
        return

    # 2. Get current status
    print(f"Fetching current status for analysis {ANALYSIS_ID}...")
    res = requests.get(f"{API_URL}/analysis/{ANALYSIS_ID}", headers=headers)
    current = res.json()
    print(f"Current Status: {current.get('application_status')}")

    # 3. Perform update
    new_status = "APPROVED" if current.get("application_status") != "APPROVED" else "REJECTED"
    print(f"Updating status to: {new_status}...")
    
    update_res = requests.patch(
        f"{API_URL}/analysis/{ANALYSIS_ID}/status",
        headers=headers,
        json={"application_status": new_status, "payment_behavior": "NA"}
    )
    
    if update_res.status_code == 200:
        print("Update response successful.")
        print(f"Response status: {update_res.json().get('application_status')}")
    else:
        print(f"Update failed with status {update_res.status_code}: {update_res.text}")
        return

    # 4. Verify persistence
    print("Verifying persistence with a fresh GET...")
    verify_res = requests.get(f"{API_URL}/analysis/{ANALYSIS_ID}", headers=headers)
    final_status = verify_res.json().get("application_status")
    print(f"Final Status: {final_status}")

    if final_status == new_status:
        print("\nSUCCESS: Status update persisted!")
    else:
        print("\nFAILURE: Status update did not persist.")

if __name__ == "__main__":
    test_update()
