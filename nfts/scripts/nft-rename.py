import os

# Get the project root directory (parent directory of the script directory)
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

# Define the directory containing your images - now using absolute path to project root
image_dir = os.path.join(project_root, "images")  # Points to /home/icekid/Projects/nft/images
output_dir = image_dir  # Output to the same directory

name_prefix = "Astral Pack Legends"  # Customize the prefix if needed

# Create output directory if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Get list of image files (supporting .png and .jpeg)
image_files = [f for f in os.listdir(image_dir) if f.lower().endswith(('.png', '.jpeg', '.jpg'))]

# Sort files to ensure consistent numbering
image_files.sort()

# Rename files
for i, filename in enumerate(image_files, 1):
    # Get file extension
    ext = os.path.splitext(filename)[1].lower()
    # Create new filename with padded number (e.g., NFT #001.png)
    new_filename = f"{name_prefix} #{i:03d}{ext}"
    # Full paths
    old_file = os.path.join(image_dir, filename)
    new_file = os.path.join(output_dir, new_filename)
    # Copy or rename file
    os.rename(old_file, new_file)
    print(f"Renamed: {filename} -> {new_filename}")

print(f"Renamed {len(image_files)} images in {output_dir}")