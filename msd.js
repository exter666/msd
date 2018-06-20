/*!
 * Micro Service Diagram
 * 
 * Kochetov Aleksey
 * 
 * https://github.com/exter666/msd.git
 *
 * Date: 2018-06-01T00:00Z
 */
var draw
var scale = 1
const COMPONENT_WIDTH = 150;
const COMPONENT_HEIGHT = 100;
const TEXT_PADDING = 40;
const COLOR_SELECTED = "#ff3600";
const COLOR_DEFAULT = "#fff";
const COLOR_DEFAULT_LINE = "#000";
const LINK_TO_OFFSET = 20;
const INFO_WIDTH = 600;
const INFO_HEIGHT = 600;
var startMoveX
var startMoveY
var isMouseDown = false
var drawContainerId = "drawing"
var infoContainerId = "info"
var tableInfoRow = "tableInfoRow"
var circleRadius = 20

var drawModel = {
    lines: [],
    group: null
}

var componentSelected = []

function drawModelDo(draw, model) {

    drawModel.group = draw.group()

    model.components.forEach(component => {

        //component group
        var group = draw.group()
            .move(component.x, component.y)
            .draggable()
            .on('dragmove', function (e) {

                component.x = this.x();
                component.y = this.y();

                var componentLines = getComponentLines(component, drawModel.lines)

                redrawLink(componentLines, component)

            })
            .on("click", function (e) {

                selectComponent(this, component)

            })

        var polygon;

        switch (component.type) {
            case "db":
                var offsetX = COMPONENT_WIDTH / 10
                var offsetY = COMPONENT_HEIGHT / 10
                polygon = draw.polygon(''
                    + 0 + ',' + offsetY + ' '
                    + offsetX + ',' + 0 + ' '
                    + (COMPONENT_WIDTH - offsetX) + ',' + 0 + ' '
                    + COMPONENT_WIDTH + ',' + offsetY + ' '
                    + (COMPONENT_WIDTH - offsetX) + ',' + (offsetY * 2) + ' '
                    + offsetX + ',' + (offsetY * 2) + ' '
                    + 0 + ',' + offsetY + ' '
                    + 0 + ',' + (COMPONENT_HEIGHT - offsetY) + ' '
                    + offsetX + ',' + (COMPONENT_HEIGHT) + ' '
                    + (COMPONENT_WIDTH - offsetX) + ',' + (COMPONENT_HEIGHT) + ' '
                    + (COMPONENT_WIDTH) + ',' + (COMPONENT_HEIGHT - offsetY) + ' '
                    + (COMPONENT_WIDTH) + ',' + offsetY + ' '
                    + COMPONENT_WIDTH + ',' + offsetY + ' '
                    + (COMPONENT_WIDTH - offsetX) + ',' + (offsetY * 2) + ' '
                    + offsetX + ',' + (offsetY * 2) + ' '
                    + 0 + ',' + offsetY + ' '
                )
                break;
            case "queue":
                var offset = COMPONENT_WIDTH / 10
                polygon = draw.polygon(''
                    + offset + ',' + COMPONENT_HEIGHT + ' '
                    + offset + ',' + 0 + ' '
                    + 0 + ',' + 0 + ' '
                    + 0 + ',' + COMPONENT_HEIGHT + ' '
                    + COMPONENT_WIDTH + ',' + COMPONENT_HEIGHT + ' '
                    + COMPONENT_WIDTH + ',' + 0 + ' '
                    + (COMPONENT_WIDTH - offset) + ',' + 0 + ' '
                    + (COMPONENT_WIDTH - offset) + ',' + COMPONENT_HEIGHT + ' '
                    + (COMPONENT_WIDTH - offset) + ',' + 0 + ' '
                    + offset + ',' + 0 + ' '
                )
                break;
            default:
                polygon = draw.polygon(0 + ',' + 0 + ' '
                    + (COMPONENT_WIDTH) + ',' + 0 + ' '
                    + (COMPONENT_WIDTH) + ',' + (COMPONENT_HEIGHT) + ' '
                    + 0 + ',' + (COMPONENT_HEIGHT) + ' ')
                break;
        }
        polygon.attr({ fill: COLOR_DEFAULT, stroke: COLOR_DEFAULT_LINE, "stroke-width": "2px" })

        group.add(polygon)

        //text
        var text = draw
            .text(component.name)

        text.x((COMPONENT_WIDTH - text.length()) / 2)
        text.y(TEXT_PADDING)

        group.add(text)

        drawModel.group.add(group)
    });

    //links
    model.links.forEach(link => {
        var componentFrom = getNodeById(model.components, link.from.component)
        var componentTo = getNodeById(model.components, link.to.component)
        var line = drawLink(draw, componentFrom, componentTo, link)

        drawModel.lines.push({ from: componentFrom, to: componentTo, line: line, link: link })
        drawModel.group.add(line.line)
        drawModel.group.add(line.circle)

    })
}

function selectComponent(group, component) {

    var idx = componentSelected.indexOf(component)

    if (idx == -1) {
        componentSelected.push(component)

        markSelected(group, component, true)
    } else {
        componentSelected.splice(idx, 1)

        markSelected(group, component, false)
    }


    var data = []

    Array.from(componentSelected).forEach(component => {

        var dataRow = []
        dataRow.push(["id", component.id])
        dataRow.push(["name", component.name])

        var from = ""
        var to = ""
        model.links.forEach(link => {
            if (component.id == link.from.component) {
                var topic = link.to.topic ? "topic: " + link.to.topic : null
                var group = link.to.group ? "group: " + link.to.group : null
                var add = null
                add = (topic) ? topic : add
                add = (topic && group) ? add + ", " + group : add
                to += link.to.component + (add ? "(" + add + ")" : "") + "; "
            }

            if (component.id == link.to.component) {
                var topic = link.from.topic ? "topic: " + link.from.topic : null
                var group = link.from.group ? "group: " + link.from.group : null
                var add = null
                add = (topic) ? topic : add
                add = (topic && group) ? add + ", " + group : add
                from += link.from.component + (add ? "(" + add + ")" : "") + "; "
            }

        })

        dataRow.push(["from", from])
        dataRow.push(["to", to])
        dataRow.push(["specApi", component.specApi])

        data.push(dataRow)

    })


    updateInfo(data)

}

function markSelected(group, component, isMark) {
    Array.from(group.node.children).forEach(children => {

        if (children.nodeName == "polygon") SVG.get(children.id).attr({ fill: isMark ? COLOR_SELECTED : COLOR_DEFAULT })
    })

    var componentLines = getComponentLines(component, drawModel.lines)

    componentLines.forEach(componentLine => {

        var idx = componentSelected.indexOf(componentLine.to)
        var idx2 = componentSelected.indexOf(componentLine.from)

        var lineColor = COLOR_DEFAULT_LINE
        var lineWidth = 1

        if ((idx != -1 || idx2 != -1))
            lineColor = COLOR_SELECTED

        componentLine.line.line.stroke({ color: lineColor, width: lineWidth })

    })

}

function getComponentLines(component, nodes) {

    var nodesFiltered = [];

    nodes.forEach(node => {

        if (node.from == component || node.to == component) {
            nodesFiltered.push(node);

        }

    })

    return nodesFiltered;
}

function getNodeById(nodes, id) {

    var result = null

    nodes.forEach(node => {

        if (id == node.id)
            result = node

    })

    return result
}

function redrawLink(componentLines, component) {

    componentLines.forEach(componentLine => {

        var line = componentLine.line.line
        var circle = componentLine.line.circle
        var link = componentLine.link

        if (componentLine.from == component) {

            var from = getLinkPositionXY(component, link.from.position)

            line.plot(from.x, from.y, line.node.x2.baseVal.value, line.node.y2.baseVal.value)

        }

        if (componentLine.to == component) {

            var to = getLinkPositionXY(component, link.to.position, true)

            line.plot(line.node.x1.baseVal.value, line.node.y1.baseVal.value, to.x, to.y)
            circle.move(to.x - (circleRadius / 2), to.y - (circleRadius / 2))
        }

    })
}

function getLinkPositionXY(component, position, isTo) {

    var x, y = 0
    var offset = isTo ? LINK_TO_OFFSET : - LINK_TO_OFFSET

    switch (position) {
        case 1:
            x = component.x + COMPONENT_WIDTH / 2 + offset
            y = component.y
            break;
        case 2:
            x = component.x + COMPONENT_WIDTH
            y = component.y + COMPONENT_HEIGHT / 2 + offset
            break;
        case 3:
            x = component.x + COMPONENT_WIDTH / 2 + offset
            y = component.y + COMPONENT_HEIGHT
            break;
        case 4:
            x = component.x
            y = component.y + COMPONENT_HEIGHT / 2 + offset
            break;
    }
    return { x: x, y: y }
}

function drawLink(draw, componentFrom, componentTo, link) {
    var from = getLinkPositionXY(componentFrom, link.from.position)
    var to = getLinkPositionXY(componentTo, link.to.position, true)

    line = draw.line(from.x, from.y, to.x, to.y).stroke({ width: 1, color: COLOR_DEFAULT_LINE }).back()

    var circle = draw.circle(circleRadius)
        .attr({ fill: COLOR_DEFAULT, stroke: COLOR_DEFAULT_LINE, "stroke-width": "1px" })
    circle.move(to.x - (circleRadius / 2), to.y - (circleRadius / 2))

    return { line: line, circle: circle };
}

SVG.on(document, 'DOMContentLoaded', function () {

    myWidth = document.body.clientWidth;
    myHeight = document.body.clientHeight;

    draw = SVG(drawContainerId).size(myWidth, myHeight)

    draw.node.addEventListener("wheel", onWheel);
    draw.node.addEventListener("mousedown", onMousedown);
    draw.node.addEventListener("mouseup", onMouseup);
    draw.node.addEventListener("mousemove", onMousemove);

    drawModelDo(draw, model)

    initInfo()
})

function initInfo() {
    var left = document.body.clientWidth - INFO_WIDTH;
    var infoEl = document.querySelector("#info")

    infoEl.setAttribute("style", "left:" + left + "px;top:0px;")


    var hideBtn = document.querySelector('#hideBtn')
    hideBtn.addEventListener("click", function () {

        var tb = document.querySelector("#info #tableInfo");
        (tb.style.display == "none") ? tb.style.display = "" : tb.style.display = "none"

    });
    /*
        var zoomBtn = document.querySelector('#zoom')
        zoomBtn.addEventListener("click", function(){
            zoom(1)
        });
    */

}

function updateInfo(data) {

    var tb = document.querySelector("#" + infoContainerId + " tbody");

    //clear
    while (tb.firstChild) {
        tb.removeChild(tb.firstChild);
    }

    //fill
    Array.from(data).forEach(dataRow => {

        var t = document.querySelector('#' + tableInfoRow);
        td = t.content.querySelectorAll("td");
        td[0].textContent = "---";
        td[1].textContent = "---";

        var clone = document.importNode(t.content, true);
        tb.appendChild(clone);

        Array.from(dataRow).forEach(dataCol => {

            var t = document.querySelector('#' + tableInfoRow);
            td = t.content.querySelectorAll("td");
            td[0].textContent = ""
            td[1].textContent = ""

            td[0].textContent = dataCol[0];

            if (dataCol[1]) {
                if (dataCol[1].startsWith('http')) {
                    var newA = document.createElement("a");

                    newA.href = dataCol[1];
                    newA.textContent = dataCol[1];
                    newA.target = "_blank";

                    td[1].appendChild(newA);
                } else {
                    td[1].textContent = dataCol[1];
                }
            } else {
                td[1].textContent = "";
            }

            var clone = document.importNode(t.content, true);
            tb.appendChild(clone);
        })

    })

}

function onWheel(e) {
    e = e || window.event;

    // wheelDelta не дает возможность узнать количество пикселей
    var delta = e.deltaY || e.detail || e.wheelDelta;

    e.preventDefault ? e.preventDefault() : (e.returnValue = false);

    var scaleLocal = delta < 0 ? scale + 0.1 : scale - 0.1

    var prevscale = scale

    scale = (0.1 < scaleLocal && scaleLocal < 2) ? scaleLocal : scale

    zoom(scale, prevscale, e.clientX, e.clientY)

}

function zoom(scale, prevscale, x, y) {

    var nX = x - (drawModel.group.x() * -1 + x) / prevscale * scale
    var nY = y - (drawModel.group.y() * -1 + y) / prevscale * scale

    drawModel.group.node.setAttribute("transform", "translate(" + nX + "," + nY + ") scale(" + scale + ")")

}

function onMousedown(e) {
    e = e || window.event;

    startMoveX = e.clientX
    startMoveY = e.clientY

    isMouseDown = true

    //document.body.style.cursor = "move"

    e.preventDefault();

}

function onMouseup(e) {
    e = e || window.event;

    isMouseDown = false

    //document.body.style.cursor = "default"

}

function onMousemove(e) {
    e = e || window.event;

    if (isMouseDown) {
        //document.body.style.cursor = "move"

        deltaX = e.clientX - startMoveX
        deltaY = e.clientY - startMoveY

        startMoveX = e.clientX
        startMoveY = e.clientY

        var x = drawModel.group.x() + deltaX / scale
        var y = drawModel.group.y() + deltaY / scale

        drawModel.group.move(x, y)

    }

}
