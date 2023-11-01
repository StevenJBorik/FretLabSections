  // const express = require('express');
  // const multer = require('multer');
  // const { exec } = require('child_process');
  // const path = require('path');
  // const fs = require('fs'); // Import the 'fs' module
  // const cors = require('cors');
  // const app = express();
  // const upload = multer();

  const { create: createYoutubeDl } = require('youtube-dl-exec');
  const youtubedl = createYoutubeDl('/Users/stev/Dev/FretLabSections-1/node_modules/youtube-dl-exec/bin/yt-dlp');

  // app.use(express.json());
  // app.use(cors());

  // const msafScriptPath = 'test.py'; // Replace with the path to the msaf.py script

  // app.post('/api/process-youtube-link', async (req, res) => {
  //   console.log("Received API request.");

  //   const link = req.body.link;
  //   console.log("Processing link:", link);
    
  //   try {
  //       console.log("Executing yt-dlp...");
  //       const output = await youtubedl(link, {
  //           x: true,
  //           'audio-format': 'mp3',
  //           'output': './temp/%(title)s [%(id)s].%(ext)s'
  //       });

  //       console.log("yt-dlp executed successfully. Output:", output);

  //       const mp3Match = output.match(/\[ExtractAudio\] Destination: (.+?\.mp3)/);
  //       const mp3FilePath = mp3Match && mp3Match[1];
          
  //       if (!mp3FilePath) {
  //           console.error("MP3 file path not found in yt-dlp output.");
  //           return res.status(500).send({ error: "Could not locate the MP3 file path in the yt-dlp output." });
  //       }
  //       console.log("Found MP3 file path:", mp3FilePath);

  //       console.log("Reading MP3 file from path:", mp3FilePath);
  //       fs.readFile(mp3FilePath, (err, data) => {
  //           if (err) {
  //               console.error("Error reading MP3 file:", err);
  //               return res.status(500).send({ error: "Failed to read the MP3 file." });
  //           }

  //           console.log("Sending MP3 data to client.");
  //           res.setHeader('Content-Type', 'audio/mpeg'); // Set the appropriate header
  //           res.send(data); // Send the buffer directly

  //           console.log("Attempting to delete MP3 file:", mp3FilePath);
  //           fs.unlink(mp3FilePath, (err) => {
  //               if (err) {
  //                   console.error("Failed to delete the MP3 file:", err);
  //               } else {
  //                   console.log("MP3 file deleted successfully:", mp3FilePath);
  //               }
  //           });
  //       });
  //   } catch (error) {
  //       console.error("Failed to run yt-dlp:", error);
  //       return res.status(500).send({ error: "Failed to convert YouTube link to MP3." });
  //   }
  // });

  // app.post('/api/process-audio', upload.single('file'), (req, res) => {
  //   console.log('Received audio file:', req.file);
  //   const audioContent = req.file.buffer;
  //   console.log('Received audio content:', audioContent);

  //   const tempDir = path.join(__dirname, 'temp');
  //   if (!fs.existsSync(tempDir)) {
  //     fs.mkdirSync(tempDir);
  //   }

  //   const tempFilePath = path.join(tempDir, req.file.originalname);
  //   fs.writeFileSync(tempFilePath, audioContent);
  //   console.log(`Audio file written to: ${tempFilePath}`);

  //   const command = `python3 "${msafScriptPath}" "${tempFilePath}"`;
  //   const childProcess = exec(command, (error, stdout, stderr) => {
  //     if (error) {
  //       console.error('Error executing MSAF script:', error);
  //       return res.status(500).json({ error: 'Internal server error' });
  //     }
  //     console.log('Python script output:', stdout);
  //     const boundaries = parseOutput(stdout);
  //     return res.json({ sections: boundaries });
  //   });

  //   childProcess.stdout.on('data', (data) => {
  //     console.log('Python script stdout:', data);
  //   });
  //   childProcess.stderr.on('data', (data) => {
  //     console.error('Python script stderr:', data);
  //   });
  // });

  // function parseOutput(output) {
  //   return output.trim().split(',');
  // }

  const express = require('express');
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');
  const cors = require('cors');
  // const ytdl = require('@distube/ytdl-core');
  const { exec } = require('child_process');
  const app = express();
  const upload = multer();
  
  app.use(express.json());
  app.use(cors());
  
  const msafScriptPath = 'test.py';
  
  // app.post('/api/process-youtube-link', async (req, res) => {
  //   console.log("Received API request.");
  //   const link = req.body.link;
  //   console.log("Processing link:", link);
  
  //   try {
  //     const info = await ytdl.getInfo(link);
  //     const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      
  //     if (!audioFormats.length) {
  //       return res.status(500).send({ error: "No suitable audio format found." });
  //     }
  
  //     // Sort to get the highest bitrate format
  //     const highestQualityAudioFormat = audioFormats.sort((a, b) => b.audioBitrate - a.audioBitrate)[0];
  
  //     const videoID = new URL(link).searchParams.get("v");
  //     const outputFilePath = `./temp/${videoID}.mp3`;
  
  //     ytdl.downloadFromInfo(info, { format: highestQualityAudioFormat.format_id })
  //       .pipe(fs.createWriteStream(outputFilePath))
  //       .on('finish', () => {
  //         console.log("MP3 file created at:", outputFilePath);
  
  //         fs.readFile(outputFilePath, (err, data) => {
  //           if (err) {
  //             console.error("Error reading MP3 file:", err);
  //             return res.status(500).send({ error: "Failed to read the MP3 file." });
  //           }
  
  //           console.log("Sending MP3 data to client.");
  //           res.setHeader('Content-Type', 'audio/mpeg');
  //           res.send(data);
  
  //           console.log("Attempting to delete MP3 file:", outputFilePath);
  //           fs.unlink(outputFilePath, (err) => {
  //             if (err) {
  //               console.error("Failed to delete the MP3 file:", err);
  //             } else {
  //               console.log("MP3 file deleted successfully:", outputFilePath);
  //             }
  //           });
  //         });
  //       })
  //       .on('error', error => {
  //         console.error("Error during streaming:", error);
  //         return res.status(500).send({ error: "Failed to download the MP3." });
  //       });
  
  //   } catch (error) {
  //     console.error("Error fetching video info:", error);
  //     return res.status(500).send({ error: "Failed to fetch video info." });
  //   }
  // });
  
  
  // app.post('/api/process-audio', upload.single('file'), (req, res) => {
  //   console.log('Received audio file:', req.file);
  //   const audioContent = req.file.buffer;
  //   console.log('Received audio content:', audioContent);
  
  //   const tempDir = path.join(__dirname, 'temp');
  //   if (!fs.existsSync(tempDir)) {
  //     fs.mkdirSync(tempDir);
  //   }
  
  //   const tempFilePath = path.join(tempDir, req.file.originalname);
  //   fs.writeFileSync(tempFilePath, audioContent);
  //   console.log(`Audio file written to: ${tempFilePath}`);
  
  //   const command = `python3 "${msafScriptPath}" "${tempFilePath}"`;
  //   const childProcess = exec(command, (error, stdout, stderr) => {
  //     if (error) {
  //       console.error('Error executing MSAF script:', error);
  //       return res.status(500).json({ error: 'Internal server error' });
  //     }
  //     console.log('Python script output:', stdout);
  //     const boundaries = parseOutput(stdout);
  //     return res.json({ sections: boundaries });
  //   });
  
  //   childProcess.stdout.on('data', (data) => {
  //     console.log('Python script stdout:', data);
  //   });
  //   childProcess.stderr.on('data', (data) => {
  //     console.error('Python script stderr:', data);
  //   });
  // });
  
  // function parseOutput(output) {
  //   return output.trim().split(',');
  // }
  
  app.post('/api/process-youtube-link', async (req, res) => {
    console.log("Received API request.");

    const link = req.body.link;
    console.log("Processing link:", link);
    
    try {
        console.log("Executing yt-dlp...");
        
        // Use custom binary to convert YouTube link to MP3
        const output = await youtubedl(link, {
            x: true,
            'audio-format': 'mp3'
        });

        console.log("yt-dlp executed successfully. Output:", output);

        const mp3Match = output.match(/\[download\] (.+?\.mp3)/);
        const mp3FilePath = mp3Match && mp3Match[1];
        
        if (!mp3FilePath) {
            console.error("MP3 file path not found in yt-dlp output.");
            return res.status(500).send({ error: "Could not locate the MP3 file path in the yt-dlp output." });
        }
        console.log("Found MP3 file path:", mp3FilePath);
        
        console.log("Reading MP3 file from path:", mp3FilePath);
        fs.readFile(mp3FilePath, (err, data) => {
            if (err) {
                console.error("Error reading MP3 file:", err);
                return res.status(500).send({ error: "Failed to read the MP3 file." });
            }

            console.log("Sending MP3 data to client.");
            res.send({ mp3: data });

            // Delete the file after sending the data to the client
            console.log("Attempting to delete MP3 file:", mp3FilePath);
            fs.unlink(mp3FilePath, (err) => {
                if (err) {
                    console.error("Failed to delete the MP3 file:", err);
                } else {
                    console.log("MP3 file deleted successfully:", mp3FilePath);
                }
            });
        });
    } catch (error) {
        console.error("Failed to run yt-dlp:", error);
        return res.status(500).send({ error: "Failed to convert YouTube link to MP3." });
    }
  });


  app.post('/api/process-audio', upload.single('file'), (req, res) => {
    console.log('Received audio file:', req.file);
    const audioContent = req.file.buffer; // Get the audio file content from the request
    console.log('Received audio content:', audioContent);

    // Create the 'temp' directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Create a temporary file to write the audio content
    const tempFilePath = path.join(tempDir, req.file.originalname);
    fs.writeFileSync(tempFilePath, audioContent);
    console.log(`Audio file written to: ${tempFilePath}`);

    // Pass the audio file path to the msaf.py script using child_process.exec
    const command = `python3 "${msafScriptPath}" "${tempFilePath}"`;
    const childProcess = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing MSAF script:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      console.log('Python script output:', stdout); // Log the output from the Python script
      const boundaries = parseOutput(stdout);
      return res.json({ sections: boundaries });
    });

    // Log any output from the Python script to the console
    childProcess.stdout.on('data', (data) => {
      console.log('Python script stdout:', data);
    });

    childProcess.stderr.on('data', (data) => {
      console.error('Python script stderr:', data);
    });
  });

  function parseOutput(output) {
    // No need to parse the output further, return it as is
    return output.trim().split(',');
  }


  const port = 4000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
