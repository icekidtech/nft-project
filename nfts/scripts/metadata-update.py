import json
import os
import random

# Get the project root directory (parent directory of the script directory)
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

# Configuration
image_dir_cid = "bafybeide2nutnh2sgayr5tdy6z2znf6dm226mcxeqowkbijghsdssv75te"
output_dir = os.path.join(project_root, "metadata")  # Absolute path to project root metadata dir
num_nfts = 104  # Total number of NFTs
image_extension = ".jpg"  # Image format
base_name = "Astral Pack Legend"  # Base name for NFTs

# Cosmic fantasy description templates based on screenshot themes
description_templates = [
    "A {color} {object} radiating {element}, suspended in a {context} of infinite stars.",
    "A celestial {object} glowing with {color} light, guarding a {context} of cosmic secrets.",
    "A {color} {object} pulsating with {element}, floating amidst a {context} of ethereal energy.",
    "A majestic {object} cloaked in {color} stardust, reigning over a {context} of galactic wonder.",
    "A {color} {object} forged in a {context}, shimmering with {element} of celestial origin.",
    "A radiant {object} bathed in {color} hues, emerging from a {context} of cosmic chaos.",
    "A {color} {object} channeling {element}, orbiting a {context} of astral beauty.",
    "A mystical {object} aglow with {color} essence, drifting through a {context} of nebulae.",
    "A {color} {object} imbued with {element}, standing sentinel in a {context} of cosmic void.",
    "A celestial {object} wrapped in {color} energy, illuminating a {context} of starlit dreams.",
]

# Themed elements inspired by the screenshot
cosmic_objects = [
    "guardian", "portal", "orb", "relic", "monolith", "amulet", "spire", "sentinel",
    "vortex", "crystal", "totem", "shard", "beacon", "obelisk", "diadem", "vessel",
    "specter", "construct", "entity", "flame"
]
cosmic_colors = [
    "azure", "crimson", "violet", "emerald", "golden", "silver", "amethyst", "sapphire",
    "ruby", "obsidian", "turquoise", "iridescent", "neon", "indigo", "celestial blue"
]
cosmic_elements = [
    "stardust", "plasma", "ether", "cosmic fire", "void essence", "lunar mist",
    "solar flares", "nebula wisps", "astral light", "quantum energy"
]
cosmic_contexts = [
    "nebula", "galactic rift", "star cluster", "cosmic storm", "etheric plane",
    "void expanse", "celestial abyss", "astral sea", "supernova remnant", "cosmic horizon"
]

# Generate unique descriptions
descriptions = []
for i in range(num_nfts):
    template = random.choice(description_templates)
    object_type = random.choice(cosmic_objects)
    color = random.choice(cosmic_colors)
    element = random.choice(cosmic_elements)
    context = random.choice(cosmic_contexts)
    description = template.format(object=object_type, color=color, element=element, context=context)
    descriptions.append(description)

# Shuffle for randomness
random.shuffle(descriptions)

# Create output directory if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Generate metadata for each NFT
for i in range(1, num_nfts + 1):
    # Format the image number with leading zeros (e.g., #001)
    image_number = f"#{i:03d}"
    metadata = {
        "name": f"{base_name} {image_number}",
        "description": descriptions[i - 1],
        "image": f"ipfs://{image_dir_cid}/Astral Pack Legends {image_number}{image_extension}",
        "attributes": [
            {"trait_type": "Number", "value": i},
            {"trait_type": "Theme", "value": "Cosmic Fantasy"},
        ]
    }
    
    # Write metadata to a JSON file with name matching the NFT name
    metadata_file = os.path.join(output_dir, f"{base_name} {image_number}.json")
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=4)
    
    print(f"Generated metadata for {base_name} {image_number}")

print(f"Metadata files saved in '{output_dir}' directory")