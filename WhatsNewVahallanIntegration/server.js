const express = require('express');
const path = require('path'); // Import the path module

const { Client } = require('@notionhq/client');

const app = express();
const PORT = process.env.PORT || 3000;

const blockId = "d92d6c9ff07b4e2a8257f311fb783d50";

const pageId = "4f325dd737604751b196aa75b2ece758";
const apiKey = "secret_AqQ03Sygyjhp2etf45Hvsisqe4lT0oZ6XgtF7P8TNEU";

const databaseId = "9d3af30c-39aa-443e-b54d-b591fe0b64d0"
const notion = new Client({ auth: apiKey });

app.use(express.static(path.join(__dirname, 'public')));


app.get('/.netlify/functions/fetchNotion', async (req, res) => {
    try {
        const response = await fetchWhatsNewList();
        res.json(response);
    } catch (error) {
        console.error('Error fetching data from Notion:', error);
        res.status(500).send('Internal server error');
    }
});


async function fetchWhatsNewList() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
        });
        return processWhatsNewList(response.results);
    } catch (error) {
        console.error('Error fetching data from Notion:', error);
        return [];
    }
}

function processWhatsNewList(whatsNewList) {
    return whatsNewList.map((entry) => {
        const nameData = entry.properties?.Name?.title?.[0]?.text?.content ?? '';
        const textData = entry.properties?.Text?.rich_text?.[0]?.text?.content ?? '';
        let photoUrl = null;

        //if (entry.properties.Photo && entry.properties.Photo.files && entry.properties.Photo.files.length > 0) {
        //    photoUrl = entry.properties.Photo.files[0].file.url;
        //}
        if (entry.properties.Photo && entry.properties.Photo.files && entry.properties.Photo.files.length > 0) {
            const file = entry.properties.Photo.files[0];
            console.log('File:', file);

            if (file && file.type === 'external' && file.external && file.external.url) {
                // If it's an embedded link, use the external URL directly
                photoUrl = file.external.url;
            } else if (file && file.file && file.file.url) {
                // If it's an image file, use the file URL
                photoUrl = file.file.url;
            }
        }
        return {
            name: nameData,
            text: textData,
            photo: photoUrl,
        };
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
