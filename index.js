const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static("public"));

const compilationQueue = [];
let isCompiling = false; 

const processQueue = () => {
    if (compilationQueue.length === 0 || isCompiling) {
        return;
    }
    isCompiling = true;
    const { cppCode, res } = compilationQueue.shift();
    fs.writeFileSync("code.cpp", cppCode);
    exec("g++ code.cpp -o ./output && ./output", (error, stdout, stderr) => {
        isCompiling = false;

        if (error) {
            return res.json({ output: stderr });
        }

        res.json({ output: stdout });
        processQueue();
    });
};

app.post("/compile", (req, res) => {
    const cppCode = req.body.code;
    compilationQueue.push({ cppCode, res });
    processQueue();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/download', (req, res) => {
    res.redirect("https://danengine.tech");
  });

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
