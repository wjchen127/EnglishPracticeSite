import sys, json
from youtube_transcript_api import YouTubeTranscriptApi
result = YouTubeTranscriptApi.get_transcript(sys.argv[1], languages=['en'])
print(json.dumps(result))