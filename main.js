const API_URL = `https://e621.net/posts.json?limit=1&tags=score%3A%3E1000+order%3Arandom+-female+-feral+-intersex`;

const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('#search-input');
const gallery = document.querySelector('.gallery');
const sidebar = document.querySelector('.sidebar');
const sidebarArray = [];

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value;
    let newSearchTerm = searchTerm.replace(/:\s*/g, "%3A");
    newSearchTerm = newSearchTerm.replace(/ /g, "+");
    const searchUrl = `https://e621.net/posts.json?limit=1&tags=-cub+-loli+-shota+-young+-female+-feral+-intersex+-diaper+-scat+-watersports+-urine+-feces+-gore+${newSearchTerm}`;
    fetchImages(searchUrl);
});

function showImage(data) {
    gallery.innerHTML = '';
    console.log(data);
    const sourceUrlContainer = document.createElement('a');
    const sourceUrl = `https://e621.net/posts/${data.posts[0].id}`;
    sourceUrlContainer.href = sourceUrl;
    sourceUrlContainer.target = "_blank";
    sourceUrlContainer.innerHTML = `Source: ${sourceUrl}`;
    gallery.appendChild(sourceUrlContainer);
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
        vid.muted = true;
        vid.loop = true;
        gallery.appendChild(vid);
    } else {
        const img = document.createElement('img');
        img.src = data.posts[0].file.url;
        gallery.appendChild(img);
    }
}

function sidebarFunctionality(data) {
    const previewImg = document.createElement('img');
    previewImg.src = data.posts[0].preview.url;
    sidebar.appendChild(previewImg);
    sidebarArray.push(previewImg);
    sidebarArray[sidebarArray.length - 1].addEventListener("click", () => {
        showImage(data);
    });
}

function fetchImages(url) {
    gallery.innerHTML = '';
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            showImage(data);
            sidebarFunctionality(data);
        })
        .catch((error) => console.log(error));
}