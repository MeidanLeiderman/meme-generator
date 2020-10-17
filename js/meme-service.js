'use strict'

let gMemes = [];
let gKeywords = { 'happy': 12, 'funny puk': 1 }
let gIcons = [{ url: 'icons/cap.png', keyword: 'cap' }, { url: 'icons/crown.png', keyword: 'crown' }, { url: 'icons/gift.png', keyword: 'gift' }, { url: 'icons/thriller.png', keyword: 'thriller' }]
let gImages = [{ id: 1, url: 'img/trump.jpg', keywords: ['stupid'] }, { id: 2, url: 'img/clown.jpg', keywords: ['funny'] }, { id: 3, url: 'img/2.jpg', keywords: ['vista'] }, { id: 4, url: 'img/004.jpg', keywords: ['cute', 'dog'] }, { id: 5, url: 'img/005.jpg', keywords: ['adorable', 'cute', 'dog'] }, { id: 6, url: 'img/5.jpg', keywords: ['winning'] }, { id: 7, url: 'img/9.jpg', keywords: ['sneaky'] }, { id: 8, url: 'img/Ancient-Aliens.jpg', keywords: ['aliens'] }, { id: 9, url: 'img/patrick.jpg', keywords: ['cringe'] }, { id: 10, url: 'img/Oprah.jpg', keywords: ['oprah'] }, { id: 11, url: 'img/One-Does-Not-Simply.jpg', keywords: ['boromir']}, { id: 12, url: 'img/putin.jpg', keywords: ['putin'] }];

let gMeme = {
    selectedImgId: 0,
    selectedTxtIdx: 0,
    selectedElement: {},
    selectedIconIdx: null,
    txts: [],
    icons: []
}

function updateActiveText(index) {
    if (index || index === 0) gMeme.selectedTxtIdx = index
    else if (gMeme.selectedTxtIdx === gMeme.txts.length - 1) gMeme.selectedTxtIdx = 0
    else gMeme.selectedTxtIdx++
}

function setSelectedElement(type, data) {
    gMeme.selectedElement.type = type
    gMeme.selectedElement.data = data
}

function getSelectedElement(){
    return gMeme.selectedElement
}

function removeElement() {
    let element = gMeme.selectedElement
    if (element.type === 'text') {
        let index = gMeme.txts.findIndex(text => text.id === element.data.id)
        let prevIndex = (index <= 0) ? 0 : (index - 1)
        gMeme.txts.splice(index, 1)
        gMeme.selectedElement.data = gMeme.txts[prevIndex]
    }
    else {
        let index = gMeme.icons.findIndex(icon => icon.id === element.data.id)
        gMeme.icons.splice(index, 1)
        gMeme.selectedElement.type = 'text'
        gMeme.selectedElement.data = gMeme.txts[0]
    }
    if (!gMeme.txts.length) {
        createText(50)
        gMeme.selectedElement.type = 'text'
        gMeme.selectedElement.data = gMeme.txts[0]
    }

}

function createText(height = 50) {
    let newText = { id: makeId(), line: '', size: 20, posX: 20, color: 'black', height, font: 'Ariel', isDragging: false }
    gMeme.txts.push(newText)
    setSelectedElement('text', gMeme.txts[gMeme.txts.length - 1])
}

function addTextLine(height) {
    if (gMeme.txts.length < 2) {
        createText(height-50)
    }
    else if (gMeme.txts.length === 2) {
        createText(height/2)
    }
    else if (gMeme.txts.length === 3) {
        createText(height/2+50)
    }
    else return true;
}

function editText(text) {
    let activeTxt = gMeme.selectedElement.data
    let index = gMeme.txts.findIndex(text => text.id === activeTxt.id)
    gMeme.txts[index].line = text
}

function editTextSize(diff) {
    let activeTxt = gMeme.selectedElement.data
    let index = gMeme.txts.findIndex(text => text.id === activeTxt.id)
    gMeme.txts[index].size += diff
}

function editTextHeight(diff) {
    let activeTxt = gMeme.selectedElement.data
    let index = gMeme.txts.findIndex(text => text.id === activeTxt.id)
    gMeme.txts[index].height += diff
}

function alignText(position) {
    let activeTxt = gMeme.selectedElement.data
    let index = gMeme.txts.findIndex(text => text.id === activeTxt.id)
    gMeme.txts[index].posX = position
}

function setColour(colour) {
    let activeTxt = gMeme.selectedElement.data
    let index = gMeme.txts.findIndex(text => text.id === activeTxt.id)
    gMeme.txts[index].color = colour
}

function setFont(font) {
    let activeTxt = gMeme.selectedElement.data
    let index = gMeme.txts.findIndex(text => text.id === activeTxt.id)
    gMeme.txts[index].font = font
}

function addIcon(iconName) {
    let iconToAdd = gIcons.find(icon => icon.keyword === iconName)
    if (iconToAdd) {
        let newIcon = JSON.parse(JSON.stringify(iconToAdd))
        newIcon.id = makeId()
        newIcon.x = gCanvas.width/2
        newIcon.y = gCanvas.height/2
        newIcon.width = 40
        newIcon.height = 40
        newIcon.isDragging = false
        newIcon.isResizing = false
        gMeme.icons.push(newIcon)
    }
    setSelectedElement('icon', gMeme.icons[gMeme.icons.length - 1])
}

function editImage(id) {
    gMeme.selectedImgId = id
}

function getImage(id) {
    let index = gImages.findIndex(image => image.id === id)
    return gImages[index]
}

function getImages() {
    return gImages
}

function getIcons() {
    return gIcons
}

function getMeme() {
    return gMeme
}

function saveMeme(meme){
    gMemes.push({data64: meme})
}

function resetMeme(){
    gMeme = {
        selectedImgId: 0,
        selectedTxtIdx: 0,
        selectedElement: {},
        selectedIconIdx: null,
        txts: [],
        icons: []
    }
    createText()
}

function getAllMemes(){
    return gMemes
}