import msaf
import sys
import os
import json

def process_audio(audio_file_path):
    print(f"Received file path: {audio_file_path}", file=sys.stderr)
    print(f"File exists: {os.path.exists(audio_file_path)}", file=sys.stderr)
    print(f"File size: {os.path.getsize(audio_file_path)}", file=sys.stderr)
    print(f"File permissions: {oct(os.stat(audio_file_path).st_mode)[-3:]}", file=sys.stderr)

    try:
        boundaries, _ = msaf.process(audio_file_path, boundaries_id="sf", feature='mfcc')
        converted_boundaries = []
        seen = set()
        for boundary in boundaries:
            minutes = int(boundary // 60)
            seconds = int(boundary % 60)
            formatted_time = f"{minutes:02d}:{seconds:02d}"
            
            if formatted_time not in seen:
                converted_boundaries.append(formatted_time)
                seen.add(formatted_time)

        print(json.dumps({"boundaries": converted_boundaries}))  # Print JSON to stdout
    except Exception as e:
        print(json.dumps({"error": str(e)}))  # Print error as JSON
        sys.exit(1)

if __name__ == '__main__':
    audio_file_path = os.path.abspath(sys.argv[1])
    process_audio(audio_file_path)