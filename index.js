const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static("public"));

// Queue to hold pending requests
const compilationQueue = [];
let isCompiling = false; // Flag to indicate if a compilation is in progress

// Function to process the compilation queue
const processQueue = () => {
    if (compilationQueue.length === 0 || isCompiling) {
        return; // Exit if the queue is empty or if already compiling
    }

    isCompiling = true; // Set flag to indicate compilation is in progress
    const { cppCode, res } = compilationQueue.shift(); // Get the first request from the queue

    // Write the C++ code to a file
    fs.writeFileSync("code.cpp", cppCode);

    // Compile the C++ code using g++ (MinGW on Windows)
    exec("g++ code.cpp -o output && ./output", (error, stdout, stderr) => {
        isCompiling = false; // Reset flag after compilation is done

        if (error) {
            // If there's an error in compilation, return the stderr output as JSON
            return res.json({ output: stderr });
        }

        // Return the program's stdout output as JSON
        res.json({ output: stdout });

        // Process the next request in the queue
        processQueue();
    });
};

// POST route to compile C++ code
app.post("/compile", (req, res) => {
    const cppCode = req.body.code;

    // Add the request to the compilation queue
    compilationQueue.push({ cppCode, res });

    // Start processing the queue if not already doing so
    processQueue();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/download', (req, res) => {
    res.redirect("https://danengine.tech");
  });

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
