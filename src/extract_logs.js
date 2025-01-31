const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "logs_2024.log");
const OUTPUT_DIR = path.join(__dirname, "..", "output");

// Ensure output directory exists synchronously (simple for CLI)
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const targetDate = process.argv[2];
if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    console.error("Usage: node extract_logs.js YYYY-MM-DD");
    process.exit(1);
}

const outputFilePath = path.join(OUTPUT_DIR, `output_${targetDate}.txt`);
const outputStream = fs.createWriteStream(outputFilePath, { highWaterMark: 1024 * 1024 }); // 1MB write buffer

console.log(`Extracting logs for ${targetDate}...`);

const targetDateBuffer = Buffer.from(targetDate);
const targetDateLength = targetDateBuffer.length;

const readStream = fs.createReadStream(LOG_FILE, {
    highWaterMark: 1024 * 1024 * 4, // 4MB read buffer
    encoding: null // Read as binary buffers
});

let remainder = null;

readStream.on("data", (chunk) => {
    if (remainder) {
        chunk = Buffer.concat([remainder, chunk]);
        remainder = null;
    }

    let start = 0;
    while (true) {
        const newlinePos = chunk.indexOf("\n", start);
        if (newlinePos === -1) {
            remainder = chunk.slice(start);
            break;
        }

        let lineBuffer = chunk.slice(start, newlinePos);
        // Trim trailing \r if present (for CRLF)
        if (lineBuffer.length > 0 && lineBuffer[lineBuffer.length - 1] === 0x0D) {
            lineBuffer = lineBuffer.slice(0, -1);
        }

        // Check if line starts with target date
        if (lineBuffer.length >= targetDateLength && 
            lineBuffer.slice(0, targetDateLength).equals(targetDateBuffer)) {
            // Write line + \n as a buffer
            const lineWithNewline = Buffer.concat([lineBuffer, Buffer.from("\n")]);
            if (!outputStream.write(lineWithNewline)) {
                // Pause read stream if write buffer is full
                readStream.pause();
                outputStream.once("drain", () => readStream.resume());
            }
        }

        start = newlinePos + 1;
    }
});

readStream.on("end", () => {
    // Process remaining data after last newline
    if (remainder && remainder.length >= targetDateLength && 
        remainder.slice(0, targetDateLength).equals(targetDateBuffer)) {
        outputStream.write(Buffer.concat([remainder, Buffer.from("\n")]));
    }
    outputStream.end();
});

readStream.on("error", (err) => {
    console.error("Error reading log file:", err.message);
    process.exit(1);
});

outputStream.on("error", (err) => {
    console.error("Error writing to output file:", err.message);
    process.exit(1);
});

outputStream.on("finish", () => {
    console.log(`Logs saved to ${outputFilePath}`);
});