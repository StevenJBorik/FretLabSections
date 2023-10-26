const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs'); // Import the 'fs' module

const app = express();
const upload = multer();

const msafScriptPath = 'test.py'; // Replace with the path to the msaf.py script

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
