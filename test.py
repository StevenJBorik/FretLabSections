import msaf
import sys
import os

def process_audio(audio_file_path):
    # Process the audio file using MSAF
    boundaries, _ = msaf.process(audio_file_path, boundaries_id="scluster", feature='mfcc')

    # Convert the boundaries to mm:ss format
    converted_boundaries = []
    for boundary in boundaries:
        minutes = int(boundary // 60)
        seconds = int(boundary % 60)
        converted_boundaries.append(f"{minutes:02d}:{seconds:02d}")

    return converted_boundaries

if __name__ == '__main__':
    # The first command line argument will be the file path
    audio_file_path = sys.argv[1]
    # Check if the provided file path exists
    if not os.path.exists(audio_file_path):
        print(f"Error: File not found: {audio_file_path}")
        sys.exit(1)
    
    # Process the audio file and print the converted boundaries
    converted_boundaries = process_audio(audio_file_path)
    print("Converted boundaries (mm:ss):", converted_boundaries)
