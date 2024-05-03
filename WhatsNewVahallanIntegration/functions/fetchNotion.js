const { Client } = require('@notionhq/client');

const databaseId = "9d3af30c-39aa-443e-b54d-b591fe0b64d0";
const pageId = "4f325dd737604751b196aa75b2ece758";
const apiKey = "secret_AqQ03Sygyjhp2etf45Hvsisqe4lT0oZ6XgtF7P8TNEU";
const notion = new Client({ auth: apiKey });
exports.handler = async function (event, context) {
    console.log('fetchNotion.js function is running!');

    try {
        const response = await fetchWhatsNewList();
        const htmlResponse = generateHTML(response);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/html',
            },
            body: htmlResponse,
        };
    } catch (error) {
        console.error('Error fetching data from Notion:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

async function fetchWhatsNewList() {
    const response = await notion.databases.query({
        database_id: databaseId,
    });
    return processWhatsNewList(response.results);
}
function processWhatsNewList(whatsNewList) {
    const processedList = whatsNewList.map((entry) => {
        let nameData = null;
        let textData = null;
        let photoUrl = null;


        if (entry.properties.Name && entry.properties.Name.title.length > 0) {
            const nameContent = entry.properties.Name.title[0].text.content;
            if (nameContent.trim() !== '') {
                nameData = nameContent;
            }
        }

        if (entry.properties.Text && entry.properties.Text.rich_text.length > 0) {
            const textContent = entry.properties.Text.rich_text[0].text.content;
            if (textContent.trim() !== '') {
                textData = textContent;
            }
        }


        //if (entry.properties.Photo && entry.properties.Photo.files && entry.properties.Photo.files.length > 0) {
        //    const file = entry.properties.Photo.files[0];
        //    if (file && file.file && file.file.url) {
        //        photoUrl = file.file.url;
        //    }
        //    else if (entry.properties.Photo && entry.properties.Photo.type === 'external' && entry.properties.Photo.external.url) {
        //        // If the photo is an external link, use the URL from the link
        //        photoUrl = entry.properties.Photo.external.url;
        //    }
        //}

        //if (entry.properties.Photo) {
        //    if (entry.properties.Photo.type === 'external' && entry.properties.Photo.external.url) {
        //        // If the photo is an external link, use the URL from the external object
        //        photoUrl = entry.properties.Photo.external.url;
        //    } else if (entry.properties.Photo.files && entry.properties.Photo.files.length > 0) {
        //        // If the photo is an uploaded file, use the URL from the file object
        //        const file = entry.properties.Photo.files[0];
        //        if (file && file.file && file.file.url) {
        //            photoUrl = file.file.url;
        //        }
        //    }
        //}

        if (entry.properties.Photo && entry.properties.Photo.files && entry.properties.Photo.files.length > 0) {
            const file = entry.properties.Photo.files[0];

            if (file && file.type === 'external' && file.external && file.external.url) {
                // If it's an embedded link, use the external URL directly
                photoUrl = file.external.url;
            } else if (file && file.file && file.file.url) {
                // If it's an image file, use the file URL
                photoUrl = file.file.url;
            }
        }

        return {
            name: nameData || '',
            text: textData || '',
            photo: photoUrl,
        };
    }).filter(item => !(item.name === '' && item.text === '' && item.photo === null));

    return processedList;
}
function generateHTML(data) {
    const slidesHTML = data.map(item => {
        return `
            <div class="slide">
                <h2>${item.name}</h2>
                ${item.photo ? `<img src="${item.photo}" alt="${item.name}">` : ''}
                <p>${item.text}</p>
            </div>
        `;
    });

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Notion Page Display</title>
            <style>
    /* CSS styles for the slideshow here */
        * {
    box-sizing: border-box;
}
        body {
            font-family: Arial, sans-serif;
            background-color: #333; /* Dark gray background */
            color: #ffffff; /* White text color */
            margin: 0; /* Remove default margin */
            padding: 0; /* Remove default padding */
                            text-align: center; /* Center-align text */
                            display: flex;


        }

        h2 {
            font-size: 1.5em; /* 150% of the default font size */
            margin-bottom: 10px;
                text-align: center; /* Center-align text */

        }

        p {
            font-size: 1.2em; /* 120% of the default font size */
            margin-bottom: 15px;
                text-align: center; /* Center-align text */

        }

#slide-container {
    display: flex;
    position: fixed;
    top: 8%; /* Adjust top position as needed */
    height: 90%; /* Set height to 60% of the body height */
    z-index: 0;
        left: 0;
    right: 0;
    margin-left: 15%; /* Center the container horizontally */
    margin-right: 15%; /* Center the container horizontally */
   
}


        .slide img {
            display: block; /* Ensure the image is displayed as a block element */
            margin: auto; /* Center the image horizontally */
            max-width: 90%; /* Set width to 100% */
            max-height: calc(100% - 100px); /* Set max-height to 100% minus the space occupied by the text */
            object-fit: contain; /* Cover the entire slide with the image */
            border-radius: 5px; /* Add rounded corners to images */
        }

        .slide {
            width: 100%; /* Set width to 100% */
            height: 100%; /* Set height to 100% */
            overflow: hidden; /* Hide overflowing content */
            background-color: #222; /* Darker gray background for each slide */
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* Add shadow effect */
            display: flex; /* Use flexbox layout */
            flex-direction: column; /* Arrange child elements vertically */
            justify-content: center; /* Center content vertically */
            align-items: center; /* Center content horizontally */

        }


            #logo {
            width: 200px; /* Adjust width as needed */
              display: block;
    margin: 0 auto; /* Center the logo horizontally */


        }
            </style>
        </head>
 
        <body>
        
           <img src="/vahallanlogo.png" alt="Vahallan Logo" id ="logo" >
        
           <div id="slide-container">${slidesHTML.join('')}
            <script>
                // JavaScript code for controlling the slideshow
                const slides = document.querySelectorAll('.slide');
                let currentIndex = 0;

                // Hide all slides except the first one
                for (let i = 1; i < slides.length; i++) {
                    slides[i].style.display = 'none';
                }

                const displayNextSlide = () => {
                    slides[currentIndex].style.display = 'none'; // Hide current slide
                    currentIndex = (currentIndex + 1) % slides.length; // Move to next slide
                    slides[currentIndex].style.display = 'block'; // Show next slide
                };

            setTimeout(() => {
                displayNextSlide(); // Display the first slide after a delay
                setInterval(displayNextSlide, 3000); // Switch to the next slide every 3 seconds
            }, 3000); // Delay for 3 seconds before starting the slideshow

        </script>
        </div>
        </body>
        </html>
    `;
}
