using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Text;

namespace HitsterFunction
{
    public class MusicPlayerFunction
    {
        private readonly ILogger<MusicPlayerFunction> _logger;

        public MusicPlayerFunction(ILogger<MusicPlayerFunction> logger)
        {
            _logger = logger;
        }

        [Function("MusicPlayer")]
        public IActionResult Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req)
        {
            _logger.LogInformation("MusicPlayer function triggered.");

            var html = GetMusicPlayerHtml();
            return new ContentResult
            {
                Content = html,
                ContentType = "text/html",
                StatusCode = 200
            };
        }

        [Function("GetAudio")]
        public IActionResult GetAudio(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "audio/{filename}")] HttpRequest req,
            string filename)
        {
            _logger.LogInformation($"GetAudio function triggered for file: {filename}");

            try
            {
                var audioPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filename);
                if (!File.Exists(audioPath))
                {
                    _logger.LogWarning($"Audio file not found: {audioPath}");
                    return new NotFoundResult();
                }

                var fileBytes = File.ReadAllBytes(audioPath);
                return new FileContentResult(fileBytes, "audio/mpeg");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error serving audio file");
                return new StatusCodeResult(500);
            }
        }

        private string GetMusicPlayerHtml()
        {
            return @"<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Hitster Music Player</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 600px;
            width: 100%;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            text-align: center;
            font-size: 2.5em;
        }
        
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        
        .player-section {
            margin: 30px 0;
            padding: 25px;
            background: #f8f9fa;
            border-radius: 12px;
        }
        
        .player-section h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        audio {
            width: 100%;
            margin-top: 10px;
            outline: none;
        }
        
        .youtube-section {
            margin-top: 20px;
        }
        
        .input-group {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        
        input[type=""text""] {
            flex: 1;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1em;
            transition: border-color 0.3s;
        }
        
        input[type=""text""]:focus {
            outline: none;
            border-color: #667eea;
        }
        
        button {
            padding: 12px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1em;
            cursor: pointer;
            transition: background 0.3s;
            font-weight: 600;
        }
        
        button:hover {
            background: #5568d3;
        }
        
        .video-container {
            margin-top: 20px;
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            border-radius: 12px;
        }
        
        .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 12px;
        }
        
        .info {
            margin-top: 20px;
            padding: 15px;
            background: #e3f2fd;
            border-left: 4px solid #667eea;
            border-radius: 4px;
            color: #333;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class=""container"">
        <h1>🎵 Hitster</h1>
        <p class=""subtitle"">Your personal music streaming experience</p>
        
        <div class=""player-section"">
            <h2>📻 Embedded Audio</h2>
            <p>Listen to the embedded sample track:</p>
            <audio controls>
                <source src=""/api/audio/sample.mp3"" type=""audio/mpeg"">
                Your browser does not support the audio element.
            </audio>
        </div>
        
        <div class=""player-section youtube-section"">
            <h2>🎬 YouTube Music</h2>
            <p>Enter a YouTube video ID or URL to stream:</p>
            <div class=""input-group"">
                <input type=""text"" id=""youtubeInput"" placeholder=""e.g., dQw4w9WgXcQ or full YouTube URL"">
                <button onclick=""loadYouTube()"">Load</button>
            </div>
            <div id=""videoPlayer""></div>
        </div>
        
        <div class=""info"">
            <strong>💡 Tip:</strong> You can paste a full YouTube URL or just the video ID. 
            Try one of these: dQw4w9WgXcQ, jNQXAC9IVRw, or paste any YouTube link!
        </div>
    </div>
    
    <script>
        function loadYouTube() {
            const input = document.getElementById('youtubeInput').value.trim();
            if (!input) {
                alert('Please enter a YouTube video ID or URL');
                return;
            }
            
            // Extract video ID from URL or use as-is if it's just an ID
            let videoId = input;
            const urlPatterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
                /youtube\.com\/embed\/([^&\s]+)/
            ];
            
            for (const pattern of urlPatterns) {
                const match = input.match(pattern);
                if (match) {
                    videoId = match[1];
                    break;
                }
            }
            
            const playerDiv = document.getElementById('videoPlayer');
            playerDiv.innerHTML = `
                <div class=""video-container"">
                    <iframe 
                        src=""https://www.youtube.com/embed/${videoId}?autoplay=0""
                        allow=""accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture""
                        allowfullscreen>
                    </iframe>
                </div>
            `;
        }
        
        // Load a default video on page load (optional)
        // document.getElementById('youtubeInput').value = 'dQw4w9WgXcQ';
    </script>
</body>
</html>";
        }
    }
}
