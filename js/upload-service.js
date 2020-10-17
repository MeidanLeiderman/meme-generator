'use strict'

function downloadMeme(elLink) {
    updateCanvas('print')
    let imgContent = gCanvas.toDataURL();
    elLink.href = imgContent
}

function publishMeme(){
    updateCanvas('print')
    let meme = gCanvas.toDataURL();
    saveMeme(meme)
}