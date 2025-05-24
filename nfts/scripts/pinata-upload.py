import os
import requests
import json

# Pinata API credentials (replace with your own)
PINATA_API_KEY = "f433952210f28e20a015"  # Replace with your Pinata API Key
PINATA_API_SECRET = "8fc92cd73bbf7e927a9af598762b8c665d9abbe5519bf16ff8c512d8e38b8c48"  # Replace with your Pinata API Secret
PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1MDZlMjE5Ny1mYzliLTRjNjktODZjZi05OWQ0NDNmZGRiZGQiLCJlbWFpbCI6ImVkd2luaWRvcGlzZUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZjQzMzk1MjIxMGYyOGUyMGEwMTUiLCJzY29wZWRLZXlTZWNyZXQiOiI4ZmM5MmNkNzNiYmY3ZTkyN2E5YWY1OTg3NjJiOGM2NjVkOWFiYmU1NTE5YmYxNmZmOGM1MTJkOGUzOGI4YzQ4IiwiZXhwIjoxNzc5NTM3ODQzfQ.En__pUfaba9_fLsFnhFuTZsANiOM78SCf-2grcLMSTQ"  # Replace with your Pinata JWT

# Get the project root directory (parent directory of the script directory)
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

# Directory containing numbered images
IMAGE_DIR = os.path.join(project_root, "images")  # Points to /home/icekid/Projects/nft/images

# Pinata API endpoint for pinning files
PINATA_API_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"

def upload_folder_to_pinata(folder_path):
    headers = {
        "Authorization": f"Bearer {PINATA_JWT}"
    }
    
    # Prepare files for upload
    files = []
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(('.png', '.jpeg', '.jpg')):
            file_path = os.path.join(folder_path, filename)
            files.append(('pinataFiles', (filename, open(file_path, 'rb'), 'image/png')))
    
    # Make the API request
    try:
        response = requests.post(PINATA_API_URL, headers=headers, files=files)
        response.raise_for_status()  # Raise an error for bad responses
        result = response.json()
        
        # Extract CID
        cid = result.get("IpfsHash")
        if not cid:
            raise Exception("No CID returned from Pinata")
        
        print(f"Successfully uploaded images to Pinata. CID: {cid}")
        
        # Save CID to a file
        with open("image_folder_cid.txt", "w") as f:
            f.write(cid)
        print("CID saved to image_folder_cid.txt")
        
        return cid
    except Exception as e:
        print(f"Error uploading to Pinata: {str(e)}")
        return None

def main():
    if not PINATA_API_KEY or not PINATA_API_SECRET or not PINATA_JWT:
        print("Please set your Pinata API Key, API Secret, and JWT in the script.")
        return
    
    if not os.path.exists(IMAGE_DIR):
        print(f"Image directory {IMAGE_DIR} does not exist.")
        return
    
    print(f"Uploading images from {IMAGE_DIR} to Pinata...")
    cid = upload_folder_to_pinata(IMAGE_DIR)
    
    if cid:
        print(f"Upload complete! CID: {cid}")
    else:
        print("Upload failed. Please check the error messages above.")

if __name__ == "__main__":
    main()