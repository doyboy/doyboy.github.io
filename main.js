const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('#search-input');
const mainGallery = document.querySelector('.mainGallery');
const sidebarGallery = document.querySelector('.sidebarGallery');
const sidebarGalleryArray = [];

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value;
    let newSearchTerm = searchTerm.replace(/:\s*/g, "%3A");
    newSearchTerm = newSearchTerm.replace(/ /g, "+");
    const searchUrl = `https://e621.net/posts.json?limit=1&tags=-cub+-loli+-shota+-young+-female+-feral+-intersex+-diaper+-scat+-watersports+-urine+-feces+-gore+-syuro+-plushie+-kiske_7key+-loreking+-scruffythedeer+${newSearchTerm}`;
    console.log(`searchUrl = ${searchUrl}`);
    fetchImages(searchUrl);
});

function showImage(data) {
    mainGallery.innerHTML = '';
    console.log(data);
    const sourceUrlContainer = document.createElement('a');
    const sourceUrl = `https://e621.net/posts/${data.posts[0].id}`;
    sourceUrlContainer.href = sourceUrl;
    sourceUrlContainer.target = "_blank";
    sourceUrlContainer.innerHTML = `Source: ${sourceUrl}`;
    mainGallery.appendChild(sourceUrlContainer);
    const fileUrl = data.posts[0].file.url;
    const fileExt = data.posts[0].file.ext;
    if (fileExt === "webm") {
        console.log("this is a video");
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