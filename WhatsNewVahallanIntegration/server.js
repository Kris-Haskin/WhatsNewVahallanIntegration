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
// Add a new route for testing the API key
//app.get('/testApiKey', async (req, res) => {
//    try {
//        const userInfo = await notion.users.me();
//        res.json(userInfo);
//    } catch (error) {
//        console.error('Error testing API key:', error);
//        res.status(500).send('Internal server error');
//    }
//});

//app.get('/getPageTitle', async (req, res) => {
//    try {
//        const page = await notion.pages.retrieve({ page_id: pageId });
//        const properties = page.properties;
//        const response = await notion.blocks.children;


//        res.json({ content: properties , databaseId: response});
//    } catch (error) {
//        console.error('Error fetching page content:', error);
//        res.status(500).json({ error: 'Internal server error' });
//    }
//});

//async function getAllBlocks(pageId) {
//    try {
//        const response = await notion.blocks.children.list({ block_id: pageId });

//        // Process the response to extract block IDs
//        const blockIds = response.results.map(block => ({
//            id: block.id,
//            type: block.type,
//        }));

//        // Recursively fetch children for each block if there are nested blocks
//        for (const block of response.results) {
//            if (block.has_children) {
//                const children = await getAllBlocks(block.id);
//                blockIds.push(...children);
//            }
//        }

//        return blockIds;
//    } catch (error) {
//        console.error('Error fetching blocks:', error);
//        return [];
//    }
//}

//// Example usage
//getAllBlocks(pageId)
//    .then(blocks => {
//        console.log(blocks);
//    })
//    .catch(error => {
//        console.error('Error:', error);
//    });

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
        const nameData = entry.properties.Name.title[0].text.content;
        const textData = entry.properties.Text.rich_text[0].text.content;
        let photoUrl = null;

        if (entry.properties.Photo && entry.properties.Photo.files && entry.properties.Photo.files.length > 0) {
            photoUrl = entry.properties.Photo.files[0].file.url;
        }

        return {
            name: nameData,
            text: textData,
            photo: photoUrl,
        };
    });
}
//app.get('/fetch-table-data', async (req, res) => {
//    try {
//        // Call fetchTableData to retrieve the table data
//        const tableData = await fetchTableData();

//        // Send the table data as JSON response
//        res.json(tableData);
//    } catch (error) {
//        console.error('Error handling fetch-table-data request:', error);
//        // Send an error response if something goes wrong
//        res.status(500).json({ error: 'Internal server error' });
//    }
//});

//async function fetchTableData() {
//    try {
//        // Fetch the children of the table block
//        const response = await notion.blocks.children.list({
//            block_id: blockId,
//            page_size: 50, // Adjust page size as needed
//        });
//        // Log the block types
//        response.results.forEach((block) => {
//            console.log('Block Type:', block.type);
//        });

//        // Parse the children to extract the data
//        const tableData = response.results.map((block) => {
//            if (block.type === "paragraph") {
//                // Assuming the table items are paragraphs
//                return block.paragraph.text[0].plain_text;
//            }
//            // Add conditions for other types of blocks if needed
//            return null;
//        });

//        // Filter out null values and return the table data
//        return tableData.filter(item => item !== null);
//    } catch (error) {
//        console.error('Error fetching table data from Notion:', error);
//        return [];
//    }
//}



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
