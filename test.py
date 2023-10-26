import msaf
import sys
import os

def process_audio(audio_file_path):
    # Process the audio file using MSAF
    try:
        boundaries, _ = msaf.process(audio_file_path, boundaries_id="sf", feature='tonnetz')
    except Exception as e:
        print(f"MSAF error: {e}")
        sys.exit(1)

    # Convert the boundaries to mm:ss format and remove duplicates
    converted_boundaries = []
    seen = set()
    for boundary in boundaries:
        minutes = int(boundary // 60)
        seconds = int(boundary % 60)
        formatted_time = f"{minutes:02d}:{seconds:02d}"
        
        if formatted_time not in seen:
            converted_boundaries.append(formatted_time)
            seen.add(formatted_time)

    return converted_boundaries

if __name__ == '__main__':
    # The first command line argument will be the file path
    audio_file_path = sys.argv[1]
    # Check if the provided file path exists
    print(f"Received audio file path: {audio_file_path}")
    if not os.path.exists(audio_file_path):
        print(f"Error: File not found: {audio_file_path}")
        sys.exit(1)
    
    # Process the audio file and print the converted boundaries
    converted_boundaries = process_audio(audio_file_path)
    print(converted_boundaries)


