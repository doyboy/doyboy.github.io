const consumer_key = "108962-e892860bef60c3b7579c4c1";
const access_token = "d814badc-31ec-31f8-25af-09dd52";

// Define Pocket API endpoint
const url = "https://getpocket.com/v3/get";

// Parameters for API request
const params = {
    consumer_key: consumer_key,
    access_token: access_token,
    detailType: "simple"
};

// Function to fetch data from Pocket API
const fetchData = async () => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

// Function to get random bookmark
const getRandomBookmark = async () => {
    const data = await fetchData();
    if (data && data.list) {
        const bookmarkIds = Object.keys(data.list);
        const randomBookmarkId = bookmarkIds[Math.floor(Math.random() * bookmarkIds.length)];
        return data.list[randomBookmarkId];
    } else {
        console.log("No bookmarks found.");
    }
};

// Example usage
getRandomBookmark().then(bookmark => {
    console.log(bookmark);
});