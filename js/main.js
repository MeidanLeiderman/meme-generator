'use strict'

let gCanvas = document.querySelector('.my-canvas');
let gContext = gCanvas.getContext('2d');
let gCurrentIconIndex = 0;
let gSelectedElement = { type: null, element: null }

let dragOn = false;
let startX;
let startY;

const gImage = new Image;

function init() {
    gContext.fillStyle = 'rgba(255, 255, 255, 0)';
    renderGalleryByFilter();
    renderImageKeywords()
    renderPalette();
    document.querySelector('.meme-editor').style.display = "none"
    document.querySelector('.memes-container').style.display = "none"
}

function correctAspectRatio(img) {
    let sourceWidth = img.naturalWidth
    let sourceHeight = img.naturalHeight
    let maxWidth = 500
    let maxHeight = 500

    let aspectRatio = [maxWidth / sourceWidth, maxHeight / sourceHeight]
    aspectRatio = Math.min(aspectRatio[0], aspectRatio[1])
    gCanvas.width = sourceWidth * aspectRatio
    gCanvas.height = sourceHeight * aspectRatio
}

function renderImageKeywords(status = 'closed') {

    let images = getImages();
    let keywords = [];

    // get all keywords into a single array
    images.forEach((image) => {
        keywords.push(...image.keywords)
    })

    // create an key-value array
    let keywordCount = [];
    for (let i = 0; i < keywords.length; i++) {
        let count = keywordCount[keywords[i]]
        keywordCount[keywords[i]] = (count) ? count + 1 : 1;
    }

    // use values of each key to show keywords based on popularity
    let keysArray = []
    for (const keyword in keywordCount) {
        keysArray.push(`<span style="font-size:${100 * keywordCount[keyword]}%">${keyword}</span>`)
    }
    document.querySelector('.keywords-container').innerHTML = keysArray.join(' ');
}

function showAllKeywords() {
    document.querySelector('.keywords-container').classList.toggle('keywords-container-expanded')

}

function getScreenWidth() {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    return width
}

function renderGalleryByFilter(keyword) {
    let images = getImages();
    let galleryImages = images.map((image) => {
        if (!keyword) return `<img src=${image.url} alt="" data-id="${image.id}" onclick="initializeMemeEditor(this)">`
        if (keyword) {
            let keywords = image.keywords.toString()
            if (keywords.toLowerCase().includes(keyword.toLowerCase())) {
                return `<img src=${image.url} alt="" data-id="${image.id}" onclick="initializeMemeEditor(this)">`
            }
        }
    })
    document.querySelector('.gallery').innerHTML = galleryImages.join('')
}

function initializeMemeEditor(el) {
    document.querySelector('main').style.display = "none"
    document.querySelector('.memes-container').style.display = "none"
    document.querySelector('.meme-editor').style.display = "block"
    if (el.dataset.id) {
        let imageId = +el.dataset.id
        editImage(imageId)
        let image = getImage(imageId)
        gImage.src = image.url

        drawImg()
    } else {
        drawImg()
    }
    // scrollToTop();
    resetMeme();
    renderIcons();
    correctAspectRatio(gImage);
    updateCanvas();
}

function renderIcons() {
    const icons = getIcons()
    // to only show 3 icons
    if (gCurrentIconIndex > icons.length - 1) gCurrentIconIndex = 0
    if (gCurrentIconIndex < 0) gCurrentIconIndex = icons.length - 1
    let iconsArray1 = [];
    let iconsToShow = [];
    let lastIconToShow = gCurrentIconIndex + 3
    if (lastIconToShow > icons.length) {
        lastIconToShow = (lastIconToShow % icons.length)
        iconsArray1 = icons.slice(gCurrentIconIndex)
        let iconsArray2 = icons.slice(0, lastIconToShow)
        iconsToShow = iconsArray1.concat(iconsArray2)
    }
    else {
        iconsToShow = icons.slice(gCurrentIconIndex, lastIconToShow)
    }
    let stringIconsToShow = iconsToShow.map((icon) => {
        return `<img src=${icon.url} alt="" class="icon" onclick="onSetIcon('${icon.keyword}')">`
    })
    document.querySelector('.icon-container').innerHTML = stringIconsToShow.join('')
}

function onNextIcon(diff) {
    gCurrentIconIndex += diff
    renderIcons()
}

function openPublishedMemes() {
    document.querySelector('main').style.display = "none"
    document.querySelector('.meme-editor').style.display = "none"
    document.querySelector('.memes-container').style.display = "block"
    renderMemes();
}

function openGallery() {
    document.querySelector('main').style.display = "block"
    document.querySelector('.meme-editor').style.display = "none"
    document.querySelector('.memes-container').style.display = "none"
}

function renderMemes() {
    let memes = getAllMemes();
    let memesToShow = memes.map((meme) => {
        return `<img src=${meme.data64} alt="" class="meme-image">`
        // need to implement a function that will keep the width-height ratio of the photo and reduce its size accordingly to show smaller versions of the meme but maintain aspect ratio
    })
    document.querySelector('.memes-container').innerHTML = memesToShow.join('')
}

function onImgInput(ev) {
    loadImageFromInput(ev, initializeMemeEditor)
}

function loadImageFromInput(ev, onImageReady) {
    document.querySelector('.share-container').innerHTML = ''
    var reader = new FileReader();

    reader.onload = function (event) {

        gImage.onload = onImageReady.bind(null, gImage)
        gImage.src = event.target.result;
    }
    reader.readAsDataURL(ev.target.files[0]);
}


function onChangeText(text) {
    editText(text);
    updateCanvas()
}

function onEditTextSize(el) {
    let diff = el === '+' ? 2 : -2
    editTextSize(diff)
    updateCanvas()
}

function onAlignText(textPosition) {
    let element = getSelectedElement()
    if (element.type === 'text') {
        let text = element.data.line
        let posX;
        if (textPosition === 'left') posX = 20
        else if (textPosition === 'right') {
            posX = gCanvas.width - 20 - gContext.measureText(text).width
        }
        else {
            posX = (gCanvas.width - gContext.measureText(text).width) / 2
        }
        alignText(posX)
        updateCanvas()
    } else return
}

function onSwitchLine() {
    updateActiveText()
    updateInputBox()
}

function onAddTextLine() {
    let canvasHeight = gCanvas.height
    addTextLine(canvasHeight)
    updateCanvas()
}

function onRemoveElement() {
    removeElement()
    updateCanvas()
}

var palette = false
function togglePalette() {
    if (!palette) {
        renderPalette();
        document.querySelector('.palette-container').style.visibility = 'visible';
        palette = true;
    }
    else {
        document.querySelector('.palette-container').style.visibility = 'hidden';
        palette = false;
    }
}

function renderPalette() {
    const colours = ['black', 'red', 'orange', 'yellow', 'green', 'purple', 'brown', 'white', 'deepskyblue', 'deeppink', '#ee2c2c', '#848200']
    let coloursToDisplay = colours.map((colour) => {
        return `<div class="colour-icon" style="background-color:${colour};" onClick="onSetColour('${colour}')"></div>`
    })
    document.querySelector(".palette-container").innerHTML = coloursToDisplay.join('')
}

function onSetColour(colour) {
    setColour(colour);
    updateCanvas();
}

function onSetFont(font) {
    setFont(font)
    updateCanvas()
}

function onSetIcon(icon) {
    addIcon(icon)
    updateCanvas()
}

function updateInputBox(text) {
    let inputField = document.querySelector('.textbox')
    inputField.value = text
}

function mouseDown(e) {
    e.preventDefault();
    e.stopPropagation();

    let txts = getMeme().txts;
    let icons = getMeme().icons

    let offsetX = gCanvas.offsetLeft
    let offsetY = gCanvas.offsetTop

    let mx = parseInt(e.clientX - offsetX);
    let my = parseInt(e.clientY - offsetY);
    let selectedElement = getSelectedElement();


    dragOn = false;
    // for icons
    if (icons.length) {
        for (var y = 0; y < icons.length; y++) {
            let icon = icons[y]
            if (selectedElement.data.id === icon.id) {
                // THERE IS A PROBLEM WITH THE RESIZER - DOES NOT RECOGNIZE WHEN YOU HIT INSIDE THE CORNER
                draggingResizer = anchorHitTest(icon, mx, my)
                console.log('draggingResizer', draggingResizer)
            }
            // console.log('position of click',my)
            // console.log('icon top',icon.y)
            // console.log('icon end',icon.y+icon.height)
            // console.log('gCanvas.height', gCanvas.height)

            if (mx > icon.x && mx < icon.x + icon.width && my > icon.y && my < icon.y + icon.height) {
                setSelectedElement('icon', icon)
                dragOn = true;
                icon.isDragging = true;
            }
        }
    }

    // for texts
    for (var i = 0; i < txts.length; i++) {
        let text = txts[i];
        let width = gContext.measureText(text.line).width
        let y = text.height - text.size
        let heightY = text.size + (text.size * 0.25)

        if (mx > text.posX && mx < text.posX + width && my > y && my < y + heightY) {
            setSelectedElement('text', text)
            dragOn = true;
            text.isDragging = true;

        }
    }
    updateCanvas()
    // save the current mouse position
    startX = mx;
    startY = my;
}

function mouseUp(e) {
    e.preventDefault();
    e.stopPropagation();

    let txts = getMeme().txts;
    dragOn = false;
    for (var i = 0; i < txts.length; i++) {
        txts[i].isDragging = false;
    }

    let icons = getMeme().icons
    for (var y = 0; y < icons.length; y++) {
        icons[y].isDragging = false
        icons[y].isResizing = false
    }
}

function mouseMove(e) {
    e.preventDefault();
    e.stopPropagation();

    let txts = getMeme().txts;
    let icons = getMeme().icons
    let offsetX = gCanvas.offsetLeft
    let offsetY = gCanvas.offsetTop
    let mx = parseInt(e.clientX - offsetX);
    let my = parseInt(e.clientY - offsetY);

    // calculate the distance the mouse has moved since the last mousemove
    let dx = mx - startX;
    let dy = my - startY;

    if (draggingResizer > -1) {
        for (var y = 0; y < icons.length; y++) {
            let icon = icons[y];

            if (icon.isResizing) { resizeIcon(icon, mx, my) }
        }
    }

    if (dragOn) {

        //for text dragging
        for (var i = 0; i < txts.length; i++) {
            let t = txts[i];

            // FIGURE THIS OUT - how to exit if mouse steps out of the canvas while dragging
            // if(e.clientX-gCanvas.offsetLeft<0 || e.clientX-gCanvas.offsetLeft>500 || e.clientY-gCanvas.offsetTop<0 || e.clientY-gCanvas.offsetTop>500) {
            //     t.isDragging=false
            // }
            if (t.isDragging) {
                t.posX += dx;
                t.height += dy;
            }
        }

        // for icon dragging
        for (var y = 0; y < icons.length; y++) {
            let icon = icons[y];

            // FIGURE THIS OUT - how to exit if mouse steps out of the canvas while dragging
            // if(e.clientX-gCanvas.offsetLeft<0 || e.clientX-gCanvas.offsetLeft>500 || e.clientY-gCanvas.offsetTop<0 || e.clientY-gCanvas.offsetTop>500) {
            //     t.isDragging=false
            // }
            if (icon.isDragging) {
                icon.x += dx;
                icon.y += dy;
            }
        }
    }
    updateCanvas();
    // reset the starting mouse position for the next mousemove
    startX = mx;
    startY = my;
}

function highlightSelectedElement(element) {
    if (element.type === 'text') {
        let { line, size, height, posX } = element.data
        let width = gContext.measureText(line).width + 20
        if (width < 150) width = 150
        let y = height - size
        let heightY = size + (size * 0.25)
        drawRect(posX, y, width, heightY)
        updateInputBox(element.data.line)
    }
    else if (element.type === 'icon') {
        drawIconAnchors(element.data)
        updateInputBox(element.data.keyword)
    }
}

function updateCanvas(print) {
    let meme = getMeme()
    clearCanvas();
    drawImg();
    drawTexts(meme.txts);
    drawIcons(meme.icons);
    if (!print) highlightSelectedElement(meme.selectedElement)
}

function drawIcons(icons) {
    icons.forEach((icon) => {
        drawIcon(icon)
    })
}

function drawIcon(icon) {
    const iconToDraw = new Image
    iconToDraw.src = icon.url
    gContext.drawImage(iconToDraw, icon.x, icon.y, icon.width, icon.height)

}

function drawImg() {
    gContext.drawImage(gImage, 0, 0, gCanvas.width, gCanvas.height)
}

function drawTexts(txts) {
    txts.forEach((txt) => {
        drawText(txt)
    })
}

function drawText(txt) {
    let { line, size, height, color, posX, font } = txt
    gContext.font = `${size}px ${font}`;
    gContext.fillStyle = color
    gContext.fillText(line, posX, height);
}


function drawRect(x, y, w, h) {
    gContext.strokeStyle = "#FF0000";
    gContext.strokeRect(x, y, w, h);
}

function clearCanvas() {
    gContext.fillStyle = 'rgba(255, 255, 255, 0)'
    gContext.fillRect(0, 0, gCanvas.width, gCanvas.height)
    gContext.clearRect(0, 0, gCanvas.width, gCanvas.height)
}

// function scrollToTop(){
//     window.scrollTo({ top: 0, behavior: 'smooth' });
// }