import msaf
from io import BytesIO
import tempfile
import os

def process_audio(audio_content):
    # Create a temporary file to write the audio content
    audio_file = BytesIO(audio_content)

    # Process the audio file using MSAF
    boundaries, _ = msaf.process(audio_file, boundaries_id="scluster", feature='mfcc')

    # Convert the boundaries to mm:ss format
    converted_boundaries = []
    for boundary in boundaries:
        minutes = int(boundary // 60)
        seconds = int(boundary % 60)
        converted_boundaries.append(f"{minutes:02d}:{seconds:02d}")

    return converted_boundaries


if __name__ == '__main__':
    # The testing part is removed as it's not needed when used within the Express API.
    pass
