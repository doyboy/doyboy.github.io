const API_URL = `https://e621.net/posts.json?limit=1&tags=score%3A%3E1000+order%3Arandom+-female+-feral+-intersex`;

const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('#search-input');
const gallery = document.querySelector('.gallery');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value;
    console.log(`search term before change: ${searchTerm}`);
    let newSearchTerm = searchTerm.replace(/:\s*/g, "%3A");
    newSearchTerm = newSearchTerm.replace(/ /g, "+");
    console.log(`search term after change: ${newSearchTerm}`);
    const searchUrl = `https://e621.net/posts.json?limit=1&tags=-cub+-loli+-shota+-young+-female+-feral+-intersex+-diaper+-scat+-watersports+-urine+-feces+-gore+${newSearchTerm}`;
    const testElement = document.createElement('div');
    testElement.innerHTML = searchUrl;
    fetchImages(searchUrl);
});

// fetchImages(API_URL);

function fetchImages(url) {
    gallery.innerHTML = '';
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            const fileUrl = data.posts[0].file.url;
            const arr = fileUrl.split(".");
            if (arr[arr.length - 1] === "webm") {
                console.log("this is a video");
                const vid = document.createElement('video');
                vid.src = fileUrl;
                vid.controls = true;
                vid.autoplay = true;
                vid.muted = true;
                vid.loop = true;
                gallery.appendChild(vid);
            } else {
                const img = document.createElement('img');
                img.src = data.posts[0].file.url;
                gallery.appendChild(img);
            }

        })
        .catch((error) => console.log(error));
}

// fetch(API_URL)
//     .then((response) => response.json())
//     .then((data) => {
//         // console.log(data);
//         const img = document.createElement('img');
//         img.src = data.posts[0].preview.url;
//         gallery.appendChild(img);
//     })
//     .catch((error) => console.log(error));