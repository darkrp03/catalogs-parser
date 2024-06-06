import axios from "axios";
import path from "node:path";
import fs from "node:fs";

export async function downloadPdf(url) {
    const name = path.basename(url);

    const response = await axios.get(url, {
        responseType: 'stream'
    });

    const writeStream = fs.createWriteStream(name);
    response.data.pipe(writeStream);

    writeStream.on('finish', () => {
        console.log(`Successfull downloaded pdf: ${name}`);
    });

    writeStream.on('error', (err) => {
        console.log(err);
    })
}