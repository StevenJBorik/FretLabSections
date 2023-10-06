import msaf
import sys
import os

# def process_audio(audio_file_path):
#     # Process the audio file using MSAF
#     boundaries, _ = msaf.process(audio_file_path, boundaries_id="scluster", feature='mfcc')

#     # Convert the boundaries to mm:ss format
#     converted_boundaries = []
#     for boundary in boundaries:
#         minutes = int(boundary // 60)
#         seconds = int(boundary % 60)
#         converted_boundaries.append(f"{minutes:02d}:{seconds:02d}")

#     return converted_boundaries

# if __name__ == '__main__':
#     # The first command line argument will be the file path
#     audio_file_path = sys.argv[1]
#     # Check if the provided file path exists
#     if not os.path.exists(audio_file_path):
#         print(f"Error: File not found: {audio_file_path}")
#         sys.exit(1)
    
#     # Process the audio file and print the converted boundaries
#     converted_boundaries = process_audio(audio_file_path)
#     print(converted_boundaries)


import msaf

def process_audio(audio_file_path):
    algorithms = ["scluster", "olda", "foote", "cnmf", "sf"]
    features = ["mfcc", "tonnetz", "cqt", "pcp", "tempogram"]

    results = {}

    for alg in algorithms:
        for feat in features:
            try:
                boundaries, _ = msaf.process(audio_file_path, boundaries_id=alg, feature=feat)
                converted_boundaries = [convert_to_time(b) for b in boundaries]
                converted_boundaries = list(dict.fromkeys(converted_boundaries))
                combo_name = f"{alg}_{feat}"
                results[combo_name] = converted_boundaries
            except Exception as e:
                print(f"Error processing {alg} with {feat}: {e}")

    return results

def convert_to_time(boundary):
    minutes = int(boundary // 60)
    seconds = int(boundary % 60)
    return f"{minutes:02d}:{seconds:02d}"

if __name__ == '__main__':
    # The first command line argument will be the file path
    audio_file_path = sys.argv[1]
    # Check if the provided file path exists
    if not os.path.exists(audio_file_path):
        print(f"Error: File not found: {audio_file_path}")
        sys.exit(1)
    
    # Process the audio file and print the results
    results = process_audio(audio_file_path)
    
    for combo, boundaries in results.items():
        print(f"Algorithm-Feature Combination: {combo}")
        print(boundaries)
        print("----------")


## Very Ape Ear Timestamp

# 7s, 22s, 27s, 42s, 51s, 1m4s, 1m19s, 1m29s, 1m55s

#1 Algorithm-Feature Combination: sf_tonnetz
## ['00:00', '00:21', '00:48', '01:08', '01:26', '01:42', '01:55']

# 0, 23s, 52s, 1:25, 1:52 solo, 2:17, 2:51

#1 Algorithm-Feature Combination: sf_tonnetz
# ['00:00', '00:12', '01:00', '01:28', '01:52', '02:17', '02:51', '03:40']