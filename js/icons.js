'use strict'

var resizerRadius = 4
var rr = resizerRadius * resizerRadius
var draggingResizer;
var pi2 = Math.PI * 2


function drawIconAnchors(icon){
    drawIconAnchor(icon.x, icon.y)
    drawIconAnchor(icon.x + icon.width, icon.y)
    drawIconAnchor(icon.x, icon.y + icon.height)
    drawIconAnchor(icon.x + icon.width, icon.y + icon.height)
}

function drawIconAnchor(x, y) {
    gContext.beginPath();
    gContext.arc(x, y, resizerRadius, 0, pi2, false);
    gContext.closePath();
    gContext.fill();
}

function anchorHitTest(icon, x, y) {
    var dx, dy;
    var iconX = icon.x
    var iconY = icon.y
    var iconWidth = icon.width
    var iconHeight = icon.height
    var iconRight = iconX + iconWidth
    var iconBottom = iconY + iconHeight

    //top-left
    dx = x - iconX
    dy = y - iconY
    if (dx * dx + dy * dy <= rr) {
        icon.isResizing = true
        return 0
    }

    //top-right
    dx = x - iconRight
    dy = y - iconY
    if (dx * dx + dy * dy <= rr) {
        icon.isResizing = true
        return 1
    }

    //bottom-right
    dx = x - iconRight
    dy = y - iconBottom
    if (dx * dx + dy * dy <= rr) {
        icon.isResizing = true
        return 2
    }

    //bottom-left
    dx = x - iconX
    dy = y - iconBottom
    if (dx * dx + dy * dy <= rr) {
        icon.isResizing = true
        return 3
    }
    return -1
}

function resizeIcon(icon, dx, dy) {

    var iconX = icon.x
    var iconY = icon.y
    var iconWidth = icon.width
    var iconHeight = icon.height
    var iconRight = iconX + iconWidth
    var iconBottom = iconY + iconHeight

    //resize the icon
    switch (draggingResizer) {
        case 0:

            //top-left
            // iconX = dx;
            icon.x = dx
            icon.width = iconRight - dx
            iconY = dy;
            icon.y = dy
            icon.height = iconBottom-dy

            break;
        case 1:
            //top-right
            icon.y = dy
            icon.width = dx-iconX
            icon.height = iconBottom - dy
            break;
        case 2:
            //bottom-right
            icon.width = dx - iconX
            iconHeight = dy - iconY;
            icon.height = dy - iconY
            break;
        case 3:
            //bottom-left
            icon.x = dx
            icon.width = iconRight - dx
            icon.height = dy - iconY
            break;
    }
    iconRight = iconX + iconWidth;
    iconBottom = iconY + iconHeight;
}
