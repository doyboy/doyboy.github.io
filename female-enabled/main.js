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

const access_token = "e9b35900-8edc-440d-b9ae-382d67c8a556";

let maxPageNum, randomPageNum, randomIndex;

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value;
    if (searchTerm == "raindrop" || searchTerm == "random" || searchTerm == "pocket") {
        fetchRaindrop();
    }
    else {
        let newSearchTerm = searchTerm.replace(/:\s*/g, "%3A");
        newSearchTerm = newSearchTerm.concat(`+score:>${scoreSlider.value}`);
        if (randomCheckbox.checked) newSearchTerm = newSearchTerm.concat(`+order:random`)
        newSearchTerm = newSearchTerm.replace(/ /g, "+");
        const searchUrl = `https://e621.net/posts.json?limit=1&tags=-cub+-loli+-shota+-young+-feral+-diaper+-scat+-watersports+-urine+-feces+-gore+-syuro+-plushie+-kiske_7key+-loreking+-scruffythedeer+${newSearchTerm}`;
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
        console.log('data after clicking', data);
        showImage(data);
    });
}

function fetchImages(url) {
    mainGallery.innerHTML = '';
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log('e621 data:', data);
            showImage(data);
            sidebarGalleryFunctionality(data);
        })
        .catch((error) => console.log(error));
}

function fetchRaindrop() {
    mainGallery.innerHTML = '';
    const allBookmarksUrl = `https://api.raindrop.io/rest/v1/raindrops/0?access_token=${access_token}`
    console.log("starter url", allBookmarksUrl);
    fetch(allBookmarksUrl)
        .then((response) => response.json())
        .then((data) => {
            maxPageNum = Math.floor(data.count / 25);
            randomPageNum = getRandomInt(0, maxPageNum);

            const newBookmarksUrl = `https://api.raindrop.io/rest/v1/raindrops/0?access_token=${access_token}&page=${randomPageNum}`;
            console.log('new url', newBookmarksUrl);

            fetch(newBookmarksUrl)
                .then((response) => response.json())
                .then((data) => {
                    randomIndex = getRandomInt(0, data.items.length);
                    let randomFetch = data.items[randomIndex];
                    let parsedLink = randomFetch.link.split('.');
                    parsedLink = parsedLink[0].split('/');
                    parsedLink = parsedLink[2];
                    showRandomImage(randomFetch, parsedLink);
                })
                .catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));
}

function showRandomImage(data, dataType) {
    mainGallery.innerHTML = '';
    const sourceUrlContainer = document.createElement('a');
    if (dataType == "e621") {
        let postId = data.link.split('/');
        postId = postId[postId.length - 1].split('?')[0];
        postId = parseInt(postId) + 1;

        let searchUrl = `https://e621.net/posts.json?limit=1&page=b${postId}`;
        console.log('searchUrl', searchUrl);
        fetch(searchUrl)
            .then((response) => response.json())
            .then((data) => {
                console.log('e621 data:', data);
                showImage(data);
                sidebarGalleryFunctionality(data);
            })
            .catch((error) => console.log(error));
    }
    else if (dataType == "api") {
        raindropMainFunctionality(data, sourceUrlContainer);
        sidebarGalleryArray[sidebarGalleryArray.length - 1].addEventListener("click", () => {
            raindropSidebarFunctionality(data, sourceUrlContainer);
        });
    }
    else {
        console.log('wrong data type', data);
    }
}

function raindropMainFunctionality(data, sourceUrlContainer) {
    let sourceUrl = data.link;

    sourceUrlContainer.href = sourceUrl;
    sourceUrlContainer.target = "_blank";
    sourceUrlContainer.innerHTML = `Source: ${sourceUrl}`;
    mainGallery.appendChild(sourceUrlContainer);

    const fileUrl = data.cover;
    const img = document.createElement('img');
    img.src = fileUrl;
    mainGallery.appendChild(img);

    const previewImg = document.createElement('img');
    previewImg.src = data.cover;
    sidebarGallery.appendChild(previewImg);
    sidebarGalleryArray.push(previewImg);
}

function raindropSidebarFunctionality(data, sourceUrlContainer) {
    mainGallery.innerHTML = '';
    let sourceUrl = data.link;

    sourceUrlContainer.href = sourceUrl;
    sourceUrlContainer.target = "_blank";
    sourceUrlContainer.innerHTML = `Source: ${sourceUrl}`;
    mainGallery.appendChild(sourceUrlContainer);

    const fileUrl = data.cover;
    const img = document.createElement('img');
    img.src = fileUrl;
    mainGallery.appendChild(img);

    const previewImg = document.createElement('img');
    previewImg.src = data.cover;
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}