const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('#search-input');
const main = document.querySelector('.main');
const mainGallery = document.querySelector('#mainGallery');
// const galleryContext = mainGallery.getContext('2d');
const sidebar = document.querySelector('.sidebar');
const sidebarGallery = document.querySelector('.sidebarGallery');
const sidebarGalleryArray = [];
const toggleSidebarButton = document.querySelector('#toggleSidebarButton');

const filterCollapsible = document.querySelector('#filterCollapsible');
const filterOptions = document.querySelector('.filterOptions');
const filterContainer = document.querySelector('.filters');

const scoreSlider = document.querySelector('#scoreSlider');
const scoreLabel = document.querySelector('#scoreLabel');

const randomLabel = document.querySelector('#randomLabel');
const randomCheckbox = document.querySelector('#randomCheckbox');

const draggableDivs = [];
const draggableMedia = [];
let draggableIndex = 0, zIndex = 1, isMouseDown = false, isXPressed = false;

const access_token = "e9b35900-8edc-440d-b9ae-382d67c8a556";

let maxPageNum, randomPageNum, randomIndex;

const selectedElement = {
    div: '',
    index: '',
    mediaElmnt: ''
};

const stage = new Konva.Stage({
    container: 'mainGallery',
    width: window.innerWidth,
    height: window.innerHeight,
});

const layer = new Konva.Layer();
stage.add(layer);

window.addEventListener("resize", (e) => {
    stage.width(window.innerWidth);
    stage.height(window.innerHeight);
});

function drawImage(imageObj, type) {

    var img = new Konva.Image({
        image: imageObj,
        x: stage.width() / 4,
        y: stage.height() / 4,
        scaleX: 0.20,
        scaleY: 0.20,
        name: 'img',
        draggable: true
    });

    console.log('imgobj', imageObj);

    // if (type === 'video') {
    // imageObj.addEventListener('loadedmetadata', function () {
    //     console.log('loaded metadata');
    img.width(imageObj.videoWidth);
    img.height(imageObj.videoHeight);
    // });
    layer.add(img);
    // }

    var tr = new Konva.Transformer({
        centeredScaling: true,
        keepRatio: true,
        enabledAnchors: [
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
        ]
    });
    layer.add(tr);

    var selectionRectangle = new Konva.Rect({
        fill: 'rgba(0,0,255,0.5)',
        visible: false,
    });
    layer.add(selectionRectangle);

    var x1, y1, x2, y2;
    var selecting = false;
    stage.on('mousedown touchstart', (e) => {
        // do nothing if we mousedown on any shape
        if (e.target !== stage) {
            return;
        }
        e.evt.preventDefault();
        x1 = stage.getPointerPosition().x;
        y1 = stage.getPointerPosition().y;
        x2 = stage.getPointerPosition().x;
        y2 = stage.getPointerPosition().y;

        selectionRectangle.width(0);
        selectionRectangle.height(0);
        selecting = true;
    });

    stage.on('mousemove touchmove', (e) => {
        // do nothing if we didn't start selection
        if (!selecting) {
            return;
        }
        e.evt.preventDefault();
        x2 = stage.getPointerPosition().x;
        y2 = stage.getPointerPosition().y;

        selectionRectangle.setAttrs({
            visible: true,
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1),
        });
    });

    stage.on('mouseup touchend', (e) => {
        // do nothing if we didn't start selection
        selecting = false;
        if (!selectionRectangle.visible()) {
            return;
        }
        e.evt.preventDefault();
        // update visibility in timeout, so we can check it in click event
        selectionRectangle.visible(false);
        var shapes = stage.find('.img');
        var box = selectionRectangle.getClientRect();
        var selected = shapes.filter((shape) =>
            Konva.Util.haveIntersection(box, shape.getClientRect())
        );
        tr.nodes(selected);
    });

    // clicks should select/deselect shapes
    stage.on('click tap', function (e) {
        // if we are selecting with rect, do nothing
        if (selectionRectangle.visible()) {
            return;
        }

        // if click on empty area - remove all selections
        if (e.target === stage) {
            tr.nodes([]);
            return;
        }

        // do nothing if clicked NOT on our rectangles
        if (!e.target.hasName('img')) {
            return;
        }

        // do we pressed shift or ctrl?
        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = tr.nodes().indexOf(e.target) >= 0;

        if (!metaPressed && !isSelected) {
            // if no key pressed and the node is not selected
            // select just one
            tr.nodes([e.target]);
        } else if (metaPressed && isSelected) {
            // if we pressed keys and node was selected
            // we need to remove it from selection:
            const nodes = tr.nodes().slice(); // use slice to have new copy of array
            // remove node from array
            nodes.splice(nodes.indexOf(e.target), 1);
            tr.nodes(nodes);
        } else if (metaPressed && !isSelected) {
            // add the node into selection
            const nodes = tr.nodes().concat([e.target]);
            tr.nodes(nodes);
        }
    });
}
// var imageObj = new Image();
// imageObj.onload = function () {
//     drawImage(this);
// };
// imageObj.src = '/assets/darth-vader.jpg';

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

toggleSidebarButton.addEventListener('click', () => {
    if (sidebar.style.display === 'none') {
        sidebar.style.display = 'flex'
        toggleSidebarButton.innerHTML = "<";
    }
    else {
        sidebar.style.display = 'none';
        toggleSidebarButton.innerHTML = ">";
    }
});

function showImage(data) {
    // mainGallery.innerHTML = '';
    const sourceUrlContainer = document.createElement('a');
    const sourceUrl = `https://e621.net/posts/${data.posts[0].id}`;
    sourceUrlContainer.href = sourceUrl;
    sourceUrlContainer.target = "_blank";
    sourceUrlContainer.innerHTML = `Source: ${sourceUrl}`;
    // mainGallery.appendChild(sourceUrlContainer);
    const fileUrl = data.posts[0].file.url;
    const fileExt = data.posts[0].file.ext;
    createDraggable(fileUrl, fileExt, data);
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
    // mainGallery.innerHTML = '';
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
    // mainGallery.innerHTML = '';
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
    // mainGallery.innerHTML = '';
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
    // mainGallery.appendChild(sourceUrlContainer);

    const fileUrl = data.cover;
    const fileExt = "";
    createDraggable(fileUrl, fileExt, data);

    const previewImg = document.createElement('img');
    previewImg.src = data.cover;
    sidebarGallery.appendChild(previewImg);
    sidebarGalleryArray.push(previewImg);
}

function raindropSidebarFunctionality(data, sourceUrlContainer) {
    // mainGallery.innerHTML = '';
    let sourceUrl = data.link;

    sourceUrlContainer.href = sourceUrl;
    sourceUrlContainer.target = "_blank";
    sourceUrlContainer.innerHTML = `Source: ${sourceUrl}`;
    // mainGallery.appendChild(sourceUrlContainer);

    const fileUrl = data.cover;
    const fileExt = "";
    createDraggable(fileUrl, fileExt, data);

    const previewImg = document.createElement('img');
    previewImg.src = data.cover;
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function createDraggable(url, ext, data) {
    if (ext == "webm") {
        console.log('adding video');
        const newFileUrl = data.posts[0].sample.alternates.original.urls[1];
        const imageObj = document.createElement('video');
        imageObj.src = newFileUrl;
        imageObj.controls = true;
        imageObj.autoplay = true;
        console.log('before function');
        imageObj.onloadedmetadata = function () {
            console.log('running function');
            drawImage(this, 'video');
        };
        // const newFileUrl = data.posts[0].sample.alternates.original.urls[1]
        // const vid = new Image();
        // vid.onload = () => {
        //     galleryContext.drawImage(vid, 0, 0);
        //     galleryContext.fillStyle = "rgba(0, 0, 0, 0)";
        //     galleryContext.fillRect(200, 200, 1000, 1000);
        // };
        // vid.src = url;
        // vid.src = newFileUrl;
        // vid.controls = true;
        // vid.controlsList = "nofullscreen";
        // vid.autoplay = true;
        // vid.loop = true;
        // divWrapper.classList.add("drag");
        // divWrapper.style.width = "40%";
        // divWrapper.style.zIndex = zIndex;
        // divWrapper.appendChild(vid);
        // draggableDivs.push(divWrapper);
        // draggableMedia.push(vid);
        // mainGallery.appendChild(divWrapper);
        // dragElement(draggableDivs[draggableIndex]);
        // draggableIndex += 1;
    } else {
        console.log('adding img');
        const imageObj = document.createElement('img');
        imageObj.src = url;
        imageObj.onload = function () {
            drawImage(this, 'img');
        };
        // const img = new Image();
        // img.onload = () => {
        //     galleryContext.drawImage(img, 0, 0);
        //     galleryContext.fillStyle = "rgba(0, 0, 0, 0)";
        //     galleryContext.fillRect(200, 200, 1000, 1000);
        // };
        // img.src = url;
        // img.classList.add("drag");
        // divWrapper.style.width = "40%";
        // divWrapper.style.zIndex = zIndex;
        // divWrapper.appendChild(img);
        // draggableDivs.push(divWrapper);
        // draggableMedia.push(img);
        // mainGallery.appendChild(divWrapper);
        // dragElement(draggableDivs[draggableIndex]);
        // draggableIndex += 1;
    }
}

function fitDivToMedia(divElmnt, mediaElmnt) {
    console.log('starting fit div function');
    mediaElmnt.onload = () => {
        console.log('media loaded');
        console.log('offset width', mediaElmnt.offsetWidth);
        divElmnt.style.width = mediaElmnt.offsetWidth + "px";
        divElmnt.style.height = mediaElmnt.offsetHeight + "px";
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Delete") {
        delete draggableDivs[draggableDivs.indexOf(selectedElement.div)];
        selectedElement.remove();
        console.log('draggableDivs after removing:', draggableDivs);
    } else if (e.ctrlKey && e.key === "c") {
        // console.log('copying image');
        // copyImgToClipboard(selectedElement.mediaElmnt.src);
    }
});

async function copyImgToClipboard(imgUrl) {
    try {
        const data = await fetch(imgUrl);
        const blob = await data.blob();
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob,
            }),
        ]);
        console.log('Image copied.');
    } catch (err) {
        console.error(err.name, err.message);
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "x") {
        isXPressed = true;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "x") {
        isXPressed = false;
    }
});

function dragElement(elmnt) {
    elmnt.addEventListener("mousedown", (e) => {
        elmnt.classList.add("selected");
        selectedElement.div = elmnt;
        selectedElement.mediaElmnt = elmnt.children[0];
        console.log('selected element div:', selectedElement.div);
        console.log('selected element media:', selectedElement.mediaElmnt);
        elmnt.style.zIndex = zIndex;
        zIndex += 1;
        if (zIndex > 99997) {
            draggableDivs.forEach(e => {
                e.style.zIndex = null;
            });
            zIndex = 1;
        }
        isMouseDown = true;
        if (e.ctrlKey && e.altKey) {
            // console.log('pressing ctrl');
            dragMouseDownCtrlAlt(e);
        } else {
            dragMouseDown(e);
        }

        if (isXPressed) elmnt.remove();
    });

    elmnt.addEventListener("mouseup", () => {
        isMouseDown = false;
        elmnt.classList.remove("selected");
    });

    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    function dragMouseDown(e) {
        e = e || window;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        console.log('dragging');
        e = e || window;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function dragMouseDownCtrlAlt(e) {
        e = e || window;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = resizeElement;
    }

    function resizeElement(e) {
        console.log('resizing');
        e = e || window;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        console.log('pos1', -pos1);
        pos3 = e.clientX;

        console.log('element that is being resized:', elmnt);

        // set the element's new size:
        let widthNum = parseFloat(elmnt.style.width.split("%")[0]);

        elmnt.style.width = (widthNum - (pos1 * widthNum / 200)) + "%";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}