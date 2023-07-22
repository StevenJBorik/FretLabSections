const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const upload = multer();

const msafScriptPath = 'test.py'; // Replace with the path to the msaf.py script

app.post('/api/process-audio', upload.single('file'), (req, res) => {
  console.log('Received audio file:', req.file);
  const audioContent = req.file.buffer; // Get the audio file content from the request
  console.log('Received audio content:', audioContent);


  // Pass the audio file content to the msaf.py script using child_process.exec
  const command = `python ${msafScriptPath}`;
  const options = { input: audioContent };
  exec(command, options, (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing MSAF script:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log("boundaries pre trim", boundaries); 
    const boundaries = parseOutput(stdout);
    return res.json({ sections: boundaries });
  });
});

function parseOutput(output) {
  const boundaries = output
    .trim() // Remove any leading/trailing whitespace
    .split(',')
    .map((boundary) => parseFloat(boundary));
  
    console.log("boundaries post trim", boundaries);
  return boundaries;
}

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
