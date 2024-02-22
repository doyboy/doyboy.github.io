const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('#search-input');
const mainGallery = document.querySelector('.mainGallery');
const sidebarGallery = document.querySelector('.sidebarGallery');
const sidebarGalleryArray = [];

const filterCollapsible = document.querySelector('#filterCollapsible');
const filterOptions = document.querySelector('.filterOptions');
const filterContainer = document.querySelector('.filters');

const scoreSlider = document.querySelector('#scoreSlider');
const scoreLabel = document.querySelector('#scoreLabel');

const randomLabel = document.querySelector('#randomLabel');
const randomCheckbox = document.querySelector('#randomCheckbox');

const consumer_key = "108962-e892860bef60c3b7579c4c1";
const access_token = "d814badc-31ec-31f8-25af-09dd52";

const pocketUrl = "https://getpocket.com/v3/get";

const params = {
    consumer_key: consumer_key,
    access_token: access_token,
    detailType: "simple"
};

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value;
    if (searchTerm == "pocket") {
        fetchPocket();
    }
    else {
        let newSearchTerm = searchTerm.replace(/:\s*/g, "%3A");
        newSearchTerm = newSearchTerm.concat(`+score:>${scoreSlider.value}`);
        if (randomCheckbox.checked) newSearchTerm = newSearchTerm.concat(`+order:random`)
        newSearchTerm = newSearchTerm.replace(/ /g, "+");
        const searchUrl = `https://e621.net/posts.json?limit=1&tags=-cub+-loli+-shota+-young+-female+-feral+-intersex+-diaper+-scat+-watersports+-urine+-feces+-gore+-syuro+-plushie+-kiske_7key+-loreking+-scruffythedeer+${newSearchTerm}`;
        console.log(`searchUrl = ${searchUrl}`);
        fetchImages(searchUrl);
    }
});

scoreSlider.addEventListener('input', () => {
    scoreLabel.innerHTML = `Score: ${scoreSlider.value}`;
});

filterCollapsible.addEventListener('click', () => {
    if (filterOptions.style.display === "block") {
        filterOptions.style.display = "none";
        sidebarGallery.style.height = "75%";
        filterContainer.style.height = "5%";
    } else {
        filterOptions.style.display = "block";
        sidebarGallery.style.height = "60%";
        filterContainer.style.height = "20%";
    }
});

function showImage(data) {
    mainGallery.innerHTML = '';
    const sourceUrlContainer = document.createElement('a');
    const sourceUrl = `https://e621.net/posts/${data.posts[0].id}`;
    sourceUrlContainer.href = sourceUrl;
    sourceUrlContainer.target = "_blank";
    sourceUrlContainer.innerHTML = `Source: ${sourceUrl}`;
    mainGallery.appendChild(sourceUrlContainer);
    const fileUrl = data.posts[0].file.url;
    const fileExt = data.posts[0].file.ext;
    if (fileExt === "webm") {
        const newFileUrl = data.posts[0].sample.alternates.original.urls[1]
        console.log(`fileUrl = ${newFileUrl}`);
        const vid = document.createElement('video');
        vid.src = newFileUrl;
        vid.controls = true;
        vid.autoplay = true;
        vid.loop = true;
        mainGallery.appendChild(vid);
    } else {
        const img = document.createElement('img');
        img.src = fileUrl;
        mainGallery.appendChild(img);
    }
}

function sidebarGalleryFunctionality(data) {
    const previewImg = document.createElement('img');
    previewImg.src = data.posts[0].preview.url;
    sidebarGallery.appendChild(previewImg);
    sidebarGalleryArray.push(previewImg);
    sidebarGalleryArray[sidebarGalleryArray.length - 1].addEventListener("click", () => {
        showImage(data);
    });
}

function fetchImages(url) {
    mainGallery.innerHTML = '';
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            showImage(data);
            sidebarGalleryFunctionality(data);
        })
        .catch((error) => console.log(error));
}

const fetchData = async () => {
    try {
        const response = await fetch(pocketUrl, {
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

function fetchPocket() {
    console.log("fetching pocket");
    mainGallery.innerHTML = '';

    // getRandomBookmark().then(bookmark => {
    //     console.log(bookmark);
    // });
    window.open('https://getpocket.com/random', '_blank');
}