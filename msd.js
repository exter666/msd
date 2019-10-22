/*!
 * Micro Service Diagram
 * 
 * Kochetov Aleksey
 * 
 * https://github.com/exter666/msd.git
 *
 * Date: 2018-06-01T00:00Z
 */

function MSD() {
    this.model = {};
    this.draw;
    this.scale = 1;
    this.COMPONENT_WIDTH = 150;
    this.COMPONENT_HEIGHT = 100;
    this.TEXT_PADDING = 40;
    this.REG_TEXT_PADDING = 20;
    this.COLOR_SELECTED = "#ff3600";
    this.COLOR_DEFAULT = "#fff";
    this.COLOR_DEFAULT_LINE = "#000";
    this.LINK_TO_OFFSET = 20;
    this.INFO_WIDTH = 600;
    this.INFO_HEIGHT = 600;
    this.startMoveX;
    this.startMoveY;
    this.isMouseDown = false;
    this.drawContainerId = "drawing";
    this.infoContainerId = "info";
    this.tableInfoRow = "tableInfoRow";
    this.circleRadius = 20;
    
    this.drawModel = {
        lines: [],
        group: null
    };

    this.componentSelected = [];

    this.drawModelDo = function(draw, model) {

        this.drawModel.group = draw.group()
    
        //region
        model.regions.forEach(region => {
    
            rect = draw.rect(region.width, region.height)
    
            rect.move(region.x, region.y)
    
            rect.attr(region.styleAttr)
    
            this.drawModel.group.add(rect)
    
            //text
            var text = draw
                .text(region.name)
    
            text.x(region.x + this.REG_TEXT_PADDING)
            text.y(region.y + this.REG_TEXT_PADDING)
    
            this.drawModel.group.add(text)
    
        })
    
        //links
        model.links.forEach(link => {
            var componentFrom = this.getNodeById(model.components, link.from.component)
            var componentTo = this.getNodeById(model.components, link.to.component)
            var line = this.drawLink(draw, componentFrom, componentTo, link)
    
            this.drawModel.lines.push({ from: componentFrom, to: componentTo, line: line, link: link })
            this.drawModel.group.add(line.line)
            this.drawModel.group.add(line.circle)
    
        })    
        
        model.components.forEach(component => {
    
            //component group
            var group = draw.group()
                .move(component.x, component.y)
                .draggable()
                .on('dragmove', function (e) {
    
                    component.x = e.currentTarget.instance.x();
                    component.y = e.currentTarget.instance.y();                    
    
                    var componentLines = this.getComponentLines(component, this.drawModel.lines)
    
                    this.redrawLink(componentLines, component)
    
                }.bind(this))
                .on("click", function (e) {
    
                    this.selectComponent(e.currentTarget.instance, component)
    
                }.bind(this))
    
            var polygon;
    
            switch (component.type) {
                case "db":
                    var offsetX = this.COMPONENT_WIDTH / 10
                    var offsetY = this.COMPONENT_HEIGHT / 10
                    polygon = draw.polygon(''
                        + 0 + ',' + offsetY + ' '
                        + offsetX + ',' + 0 + ' '
                        + (this.COMPONENT_WIDTH - offsetX) + ',' + 0 + ' '
                        + this.COMPONENT_WIDTH + ',' + offsetY + ' '
                        + (this.COMPONENT_WIDTH - offsetX) + ',' + (offsetY * 2) + ' '
                        + offsetX + ',' + (offsetY * 2) + ' '
                        + 0 + ',' + offsetY + ' '
                        + 0 + ',' + (this.COMPONENT_HEIGHT - offsetY) + ' '
                        + offsetX + ',' + (this.COMPONENT_HEIGHT) + ' '
                        + (this.COMPONENT_WIDTH - offsetX) + ',' + (this.COMPONENT_HEIGHT) + ' '
                        + (this.COMPONENT_WIDTH) + ',' + (this.COMPONENT_HEIGHT - offsetY) + ' '
                        + (this.COMPONENT_WIDTH) + ',' + offsetY + ' '
                        + this.COMPONENT_WIDTH + ',' + offsetY + ' '
                        + (this.COMPONENT_WIDTH - offsetX) + ',' + (offsetY * 2) + ' '
                        + offsetX + ',' + (offsetY * 2) + ' '
                        + 0 + ',' + offsetY + ' '
                    )
                    break;
                case "queue":
                    var offset = this.COMPONENT_WIDTH / 10
                    polygon = draw.polygon(''
                        + offset + ',' + this.COMPONENT_HEIGHT + ' '
                        + offset + ',' + 0 + ' '
                        + 0 + ',' + 0 + ' '
                        + 0 + ',' + this.COMPONENT_HEIGHT + ' '
                        + this.COMPONENT_WIDTH + ',' + this.COMPONENT_HEIGHT + ' '
                        + this.COMPONENT_WIDTH + ',' + 0 + ' '
                        + (this.COMPONENT_WIDTH - offset) + ',' + 0 + ' '
                        + (this.COMPONENT_WIDTH - offset) + ',' + this.COMPONENT_HEIGHT + ' '
                        + (this.COMPONENT_WIDTH - offset) + ',' + 0 + ' '
                        + offset + ',' + 0 + ' '
                    )
                    break;
                default:
                    polygon = draw.polygon(0 + ',' + 0 + ' '
                        + (this.COMPONENT_WIDTH) + ',' + 0 + ' '
                        + (this.COMPONENT_WIDTH) + ',' + (this.COMPONENT_HEIGHT) + ' '
                        + 0 + ',' + (this.COMPONENT_HEIGHT) + ' ')
                    break;
            }
            polygon.attr({ fill: this.COLOR_DEFAULT, stroke: this.COLOR_DEFAULT_LINE, "stroke-width": "2px" })
    
            group.add(polygon)
            component.group = group
    
            //text
            var text = draw
                .text(component.name)
    
            text.x((this.COMPONENT_WIDTH - text.length()) / 2)
            text.y(this.TEXT_PADDING)
    
            group.add(text)
    
            this.drawModel.group.add(group)
        });
    
    }
    
    this.selectComponentById = function(componentId) {

        this.model.components.forEach(component => {

            if (component.id == componentId)
                this.selectComponent(component.group, component)
        })
        
    }

    this.selectComponent = function(group, component) {
    
        var idx = this.componentSelected.indexOf(component)
    
        if (idx == -1) {
            this.componentSelected.push(component)
    
            this.markSelected(group, component, true)
        } else {
            this.componentSelected.splice(idx, 1)
    
            this.markSelected(group, component, false)
        }
    
    
        var data = []
    
        Array.from(this.componentSelected).forEach(component => {
    
            if (!component == null) return;

            var dataRow = []
            dataRow.push(["id", component.id])
            dataRow.push(["name", component.name])
    
            var from = {
                components: []
            }

            var to = {
                components: []
            }

            this.model.links.forEach(link => {
                
                var add = null

                if (component.id == link.from.component) {
                    var topic = link.to.topic ? "topic: " + link.to.topic : null
                    var group = link.to.group ? "group: " + link.to.group : null
                    add = (topic) ? topic : add
                    add = (topic && group) ? add + ", " + group : add
                    //to += "<b onClick='console.log(this.model)'>" + link.to.component + "</b>" + (add ? "(" + add + ")" : "") + ";<br>"

                    to.components.push({
                        component: link.to.component,
                        linkInfo: (add ? "(" + add + ")" : "") + ";"    
                    })

                }
    
                if (component.id == link.to.component) {
                    var topic = link.from.topic ? "topic: " + link.from.topic : null
                    var group = link.from.group ? "group: " + link.from.group : null
                    add = (topic) ? topic : add
                    add = (topic && group) ? add + ", " + group : add
                    //from += "<b>" + link.from.component + "</b>" + (add ? "(" + add + ")" : "") + ";<br>"

                    from.components.push({
                        component: link.from.component,
                        linkInfo: (add ? "(" + add + ")" : "") + ";"    
                    })
                }
    
            })
    
            dataRow.push(["from", from])
            dataRow.push(["to", to])
    
            if (component.customAttrs)
                Array.from(Object.keys(component.customAttrs)).forEach(key => {
    
                    dataRow.push([key, component.customAttrs[key]])
                })
    
            data.push(dataRow)
    
        })
    
    
        this.updateInfo(data)
    
    }
    
    this.markSelected = function(group, component, isMark) {
        Array.from(group.node.children).forEach(children => {
    
            if (children.nodeName == "polygon") SVG.get(children.id).attr({ fill: isMark ? this.COLOR_SELECTED : this.COLOR_DEFAULT })
        })
    
        var componentLines = this.getComponentLines(component, this.drawModel.lines)
    
        componentLines.forEach(componentLine => {
    
            var idx = this.componentSelected.indexOf(componentLine.to)
            var idx2 = this.componentSelected.indexOf(componentLine.from)
    
            var lineColor = this.COLOR_DEFAULT_LINE
            var lineWidth = 1
    
            if ((idx != -1 || idx2 != -1))
                lineColor = this.COLOR_SELECTED
    
            componentLine.line.line.stroke({ color: lineColor, width: lineWidth })
    
        })
    
    }
    
    this.getComponentLines = function(component, nodes) {
    
        var nodesFiltered = [];
    
        nodes.forEach(node => {
    
            if (node.from == component || node.to == component) {
                nodesFiltered.push(node);
    
            }
    
        })
    
        return nodesFiltered;
    }
    
    this.getNodeById = function(nodes, id) {
    
        var result = null
    
        nodes.forEach(node => {
    
            if (id == node.id)
                result = node
    
        })
    
        return result
    }
    
    this.redrawLink = function(componentLines, component) {
    
        componentLines.forEach(componentLine => {
    
            var line = componentLine.line.line
            var circle = componentLine.line.circle
            var link = componentLine.link
    
            if (componentLine.from == component) {
    
                var from = this.getLinkPositionXY(component, link.from.position)
    
                line.plot(from.x, from.y, line.node.x2.baseVal.value, line.node.y2.baseVal.value)
    
            }
    
            if (componentLine.to == component) {
    
                var to = this.getLinkPositionXY(component, link.to.position, true)
    
                line.plot(line.node.x1.baseVal.value, line.node.y1.baseVal.value, to.x, to.y)
                circle.move(to.x - (this.circleRadius / 2), to.y - (this.circleRadius / 2))
            }
    
        })
    }
    
    this.getLinkPositionXY = function(component, position, isTo) {
    
        var x, y = 0
        var offset = isTo ? this.LINK_TO_OFFSET : - this.LINK_TO_OFFSET
    
        switch (position) {
            case 1:
                x = component.x + this.COMPONENT_WIDTH / 2 + offset
                y = component.y
                break;
            case 2:
                x = component.x + this.COMPONENT_WIDTH
                y = component.y + this.COMPONENT_HEIGHT / 2 + offset
                break;
            case 3:
                x = component.x + this.COMPONENT_WIDTH / 2 + offset
                y = component.y + this.COMPONENT_HEIGHT
                break;
            case 4:
                x = component.x
                y = component.y + this.COMPONENT_HEIGHT / 2 + offset
                break;
        }
        return { x: x, y: y }
    }
    
    this.drawLink = function(draw, componentFrom, componentTo, link) {
        var from = this.getLinkPositionXY(componentFrom, link.from.position)
        var to = this.getLinkPositionXY(componentTo, link.to.position, true)
    
        line = draw.line(from.x, from.y, to.x, to.y).stroke({ width: 1, color: this.COLOR_DEFAULT_LINE }).back()
    
        var circle = draw.circle(this.circleRadius)
            .attr({ fill: this.COLOR_DEFAULT, stroke: this.COLOR_DEFAULT_LINE, "stroke-width": "1px" })
        circle.move(to.x - (this.circleRadius / 2), to.y - (this.circleRadius / 2))
    
        return { line: line, circle: circle };
    }
    
    this.init = function(properties) {

        Object.keys(properties).forEach(key => {

            if(this[key] != undefined){
                this[key] = properties[key]
            }

        }, this)        

        this.myWidth = document.body.clientWidth;
        this.myHeight = document.body.clientHeight;
    
        this.draw = SVG(this.drawContainerId).size(this.myWidth, this.myHeight)
    
        this.draw.node.addEventListener("wheel", this.onWheel.bind(this));
        this.draw.node.addEventListener("mousedown", this.onMousedown.bind(this));
        this.draw.node.addEventListener("mouseup", this.onMouseup.bind(this));
        this.draw.node.addEventListener("mousemove", this.onMousemove.bind(this));

        document.addEventListener("mouseout", this.onMouseOut.bind(this));

        this.drawModelDo.bind(this)(this.draw, this.model);
    
        this.initInfo();

        return this;
    }
    
    this.initInfo = function() {
        var left = document.body.clientWidth - this.INFO_WIDTH;
        var infoEl = document.querySelector("#info")
    
        infoEl.setAttribute("style", "left:" + left + "px;top:0px;")
    
    
        var hideBtn = document.querySelector('#hideBtn')
        hideBtn.addEventListener("click", function () {
    
            var tb = document.querySelector("#info #tableInfo");
            (tb.style.display == "none") ? tb.style.display = "" : tb.style.display = "none"
    
        });
    
    }
    
    this.updateInfo = function(data) {
    
        var tb = document.querySelector("#" + this.infoContainerId + " tbody");    

        //clear
        while (tb.firstChild) {
            tb.removeChild(tb.firstChild);
        }
    
        //fill
        Array.from(data).forEach(dataRow => {
    
            var t = document.querySelector('#' + this.tableInfoRow);
            td = t.content.querySelectorAll("td");
            td[0].textContent = "---";
            td[1].textContent = "---";
    
            var clone = document.importNode(t.content, true);
            tb.appendChild(clone);
    
            Array.from(dataRow).forEach(dataCol => {
    
                var t = document.querySelector('#' + this.tableInfoRow);
                td = t.content.querySelectorAll("td");
                td[0].textContent = ""
                td[1].textContent = ""
    
                td[0].textContent = dataCol[0];                
                    
                if (dataCol[1]) {
                    if (typeof  dataCol[1] == "string" && dataCol[1].startsWith('http')) {
                        var newA = document.createElement("a");
    
                        newA.href = dataCol[1];
                        newA.textContent = dataCol[1];
                        newA.target = "_blank";
    
                        td[1].appendChild(newA);
                        
                    } else if (typeof  dataCol[1] == "object") {
                        dataCol[1].components.forEach(direct => {

                            var newB = document.createElement("b");
                            newB.innerHTML = direct.component;

                            newB.addEventListener("click", function(){
                                this.selectComponentById(direct.component)
                            }, false);    

                            td[1].appendChild(newB);

                            var newSpan = document.createElement("span");
                            newSpan.innerHTML = direct.linkInfo;
                            td[1].appendChild(newSpan);

                            var newBr = document.createElement("br");
                            td[1].appendChild(newBr);

                        })
                    } else {                                                

                        td[1].innerHTML = dataCol[1]

                    }
                } else {
                    td[1].textContent = "";
                }
    
                var clone = document.importNode(t.content, true);
                tb.appendChild(clone);
            })
    
        })
    
    }
    
    this.onWheel = function(e) {
        e = e || window.event;
    
        // wheelDelta не дает возможность узнать количество пикселей
        var delta = e.deltaY || e.detail || e.wheelDelta;
    
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    
        var scaleLocal = delta < 0 ? this.scale + 0.1 : this.scale - 0.1
    
        var prevscale = this.scale
    
        this.scale = (0.1 < scaleLocal && scaleLocal < 2) ? scaleLocal : this.scale
    
        this.zoom(this.scale, prevscale, e.clientX, e.clientY)
    
    }
    
    this.zoom = function(scale, prevscale, x, y) {
    
        var nX = x - (this.drawModel.group.x() * -1 + x) / prevscale * scale
        var nY = y - (this.drawModel.group.y() * -1 + y) / prevscale * scale
    
        this.drawModel.group.node.setAttribute("transform", "translate(" + nX + "," + nY + ") scale(" + scale + ")")
    
    }
    
    this.onMousedown = function(e) {
        e = e || window.event;
    
        this.startMoveX = e.clientX
        this.startMoveY = e.clientY
    
        this.isMouseDown = true        

        e.preventDefault();
    
    }
    
    this.onMouseup = function(e) {
        e = e || window.event;
    
        this.isMouseDown = false

        e.preventDefault();
    
    }
    
    this.onMousemove = function(e) {
        e = e || window.event;
    
        if (this.isMouseDown) {
    
            deltaX = e.clientX - this.startMoveX
            deltaY = e.clientY - this.startMoveY
    
            this.startMoveX = e.clientX
            this.startMoveY = e.clientY
    
            var x = this.drawModel.group.x() + deltaX / this.scale
            var y = this.drawModel.group.y() + deltaY / this.scale
    
            this.drawModel.group.move(x, y)
    
        }

    }

    this.onMouseOut = function(e) {
        e = e || window.event;
    
        var from = e.relatedTarget || e.toElement;
        if (!from || from.nodeName == "HTML") {
            this.isMouseDown = false                        
        }
    
    }

}
