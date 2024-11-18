const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Fetch movie links
async function getMovieLinks() {
    const url = 'https://animationscreencaps.com/movie-directory/';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const movieLinks = [];
    $('.responsive .tagindex .links li a').each((_, element) => {
        const link = $(element).attr('href');
        movieLinks.push(link);
    });

    return movieLinks;
}

// Fetch the total number of pages for a movie
async function getNumberOfPages(movieUrl) {
    try {
        const response = await axios.get(movieUrl);
        const $ = cheerio.load(response.data);

        // Extract the text content inside the div.wp-pagenavi
        const pageText = $('.wp-pagenavi').text().trim();
        // console.log(`Pagination Text for ${movieUrl}: "${pageText}"`); // Debugging log

        // Match "Page: x of y" and extract the second number (y)
        const match = pageText.match(/Page:\s*\d+\s*of\s*(\d+)/i);
        // console.log(`Extracted Match for ${movieUrl}:`, match); // Debugging log

        return match ? parseInt(match[1], 10) : 1; // Return the max number of pages or default to 1
    } catch (err) {
        console.error(`Failed to fetch the number of pages for ${movieUrl}:`, err.message);
        return 0; // Return 0 if there's an error
    }
}

// Fetch screencap links from the specified range of pages for a movie
async function getScreencaps(movieUrl, pagesStart, pagesEnd) {
    let page = pagesStart;
    const screencapLinks = [];

    while (page <= pagesEnd) {
        try {
            const response = await axios.get(`${movieUrl}/page/${page}`);
            const $ = cheerio.load(response.data);

            // Collect "a" href links that are NOT inside div.wp-pagenavi and NOT with class "pixcode"
            const links = $('div[align="center"] a:not(.wp-pagenavi a):not(.pixcode)')
                .map((_, a) => $(a).attr('href'))
                .get();

            if (links.length === 0) break; // Exit if no more links
            screencapLinks.push(...links);
            page++;
        } catch (err) {
            console.error(`Failed to fetch page ${page} for ${movieUrl}:`, err.message);
            break;
        }
    }

    return screencapLinks;
}

// Save screencap links to a text file in screencap-urls folder
async function saveToFile(fileIndex, data) {
    try {
        const folderPath = path.join(__dirname, 'screencap-urls');
        const filePath = path.join(folderPath, `${fileIndex}.txt`);

        // Ensure the screencap-urls directory exists
        fs.mkdirSync(folderPath, { recursive: true });

        // Write the screencap links to the numbered text file
        fs.writeFileSync(filePath, data.join('\n'), 'utf8');
        console.log(`Screencap links saved to ${filePath}`);
    } catch (err) {
        console.error('Error writing to file:', err.message);
    }
}

// Parse command-line arguments
function parseArguments(args, totalMovies) {
    if (args.includes('all')) {
        return {
            movieStart: 1,
            movieEnd: totalMovies,
            pagesStart: 1,
            pagesEnd: Infinity,
        };
    }

    const movieStart = parseInt(args.find(arg => arg.startsWith('movieStart='))?.split('=')[1], 10) || 1;
    const movieEndArg = args.find(arg => arg.startsWith('movieEnd='))?.split('=')[1] || 'max';
    const movieEnd = ['all', 'max', 'end'].includes(movieEndArg) ? totalMovies : parseInt(movieEndArg, 10);

    const pagesStart = parseInt(args.find(arg => arg.startsWith('pagesStart='))?.split('=')[1], 10) || 1;
    const pagesEndArg = args.find(arg => arg.startsWith('pagesEnd='))?.split('=')[1] || 'max';
    const pagesEnd = ['all', 'max', 'end'].includes(pagesEndArg) ? Infinity : parseInt(pagesEndArg, 10);

    if (isNaN(movieStart) || isNaN(movieEnd) || isNaN(pagesStart) || isNaN(pagesEnd)) {
        throw new Error('Invalid arguments. Ensure movieStart, movieEnd, pagesStart, and pagesEnd are valid numbers.');
    }

    return { movieStart, movieEnd, pagesStart, pagesEnd };
}

// Main function to handle modes and fetch data
async function runTest() {
    try {
        const movieLinks = await getMovieLinks();

        const args = process.argv.slice(2);
        if (args.length === 0) {
            console.log(`Usage:
1. Specify range:
   node test.js movieStart=1 movieEnd=3 pagesStart=1 pagesEnd=5
2. Fetch number of pages for the first movie:
   node test.js getPages=true
3. All movies and all pages:
   node test.js all`);
            return;
        }

        if (args.includes('getPages=true')) {
            const firstMovieLink = movieLinks[0];
            console.log(`Fetching the total number of pages for the first movie: ${firstMovieLink}`);
            const totalPages = await getNumberOfPages(firstMovieLink);
            console.log(`Total pages for the first movie: ${totalPages}`);
            return;
        }

        const { movieStart, movieEnd, pagesStart, pagesEnd } = parseArguments(args, movieLinks.length);

        // Determine whether to use "All" for pagesEnd
        const pagesEndLabel = pagesEnd === Infinity ? "All" : pagesEnd;

        console.log(`Processing movies from #${movieStart} to #${movieEnd}, pages ${pagesStart} to ${pagesEndLabel}...`);

        for (let i = movieStart - 1; i < movieEnd; i++) {
            const movieLink = movieLinks[i];
            console.log(`Fetching screencaps for Movie ${i + 1}: ${movieLink}`);

            // Dynamically calculate pagesEnd if set to "max"
            const maxPages = pagesEnd === Infinity ? await getNumberOfPages(movieLink) : pagesEnd;

            console.log(`Processing pages ${pagesStart} to ${maxPages} for Movie ${i + 1}`);
            const screencapLinks = await getScreencaps(movieLink, pagesStart, maxPages);

            if (screencapLinks.length > 0) {
                await saveToFile(i + 1, screencapLinks); // Save each movie's text file immediately
            } else {
                console.log(`No screencaps found for Movie ${i + 1}`);
            }
        }
    } catch (err) {
        console.error('Error running the test:', err.message);
    }
}

runTest();
