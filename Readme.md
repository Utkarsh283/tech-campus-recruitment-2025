# Extract Logs by Date

## Overview
This Node.js script extracts log entries for a specific date from a large log file (`logs_2024.log`) and saves them in a separate output file. The script efficiently processes the log file using streams to handle large files without excessive memory consumption.

## Features
- Efficiently reads and processes large log files using streams.
- Extracts only the log entries that match the specified date (in `YYYY-MM-DD` format).
- Saves the filtered logs to an output file in the `output` directory.
- Uses buffers for optimized read and write operations.
- Handles errors gracefully.

## Prerequisites
- Node.js installed on your system.
- The log file `logs_2024.log` should be present in the same directory as the script.

## Installation
1. Clone or download the repository containing this script.
2. Navigate to the script's directory.

## Usage
1. Open a terminal and navigate to the script directory.
2. Run the following command:

   ```sh
   node extract_logs.js YYYY-MM-DD
   ```

   Replace `YYYY-MM-DD` with the desired date to extract logs from.

### Example
To extract logs for `2024-02-15`, run:

```sh
node extract_logs.js 2024-02-15
```

This will create an output file in the `output` directory named `output_2024-02-15.txt` containing all log entries from that date.

## How It Works
1. The script verifies the provided date format (`YYYY-MM-DD`).
2. It ensures the `output` directory exists; if not, it creates it.
3. It reads the `logs_2024.log` file in chunks (4MB at a time) using a stream.
4. It processes each chunk and extracts lines that start with the specified date.
5. The filtered lines are written to an output file using a stream (with a 1MB buffer for optimized writing).
6. When the reading process ends, any remaining matching data is written to the file, and the file is saved.

## Optimizations
- **Stream-based processing:** Uses streams to read and write data in chunks, reducing memory usage for large log files.
- **Buffered reading and writing:** Implements a 4MB read buffer and a 1MB write buffer to optimize disk I/O operations.
- **Efficient date matching:** Uses `Buffer.slice` and `Buffer.equals` for fast date comparison without unnecessary string conversions.
- **Backpressure handling:** Pauses reading when the write buffer is full and resumes once it drains, ensuring smooth data flow.
- **Minimal memory footprint:** Avoids storing the entire file in memory, keeping only necessary chunks and remainders.

## Error Handling
- If the log file is missing, the script throws an error.
- If the provided date is in the wrong format, the script exits with a usage message.
- If an error occurs while reading or writing files, it logs an error message and exits.

## Notes
- The script assumes logs are stored in the format `YYYY-MM-DD ...` at the beginning of each line.
- Works best for logs with structured date prefixes.
- Handles large log files efficiently using streams and buffer management.


