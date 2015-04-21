(function(){
var d3plus_old = window.d3plus_old || {};

d3plus_old.version = "0.0.8";

window.d3plus_old = d3plus_old;

d3plus_old.timing = 600; // milliseconds for animations

d3plus_old.ie = /*@cc_on!@*/false;

d3plus_old.evt = {}; // stores all mouse events that could occur

// Modernizr touch events
if (Modernizr && Modernizr.touch) {
  d3plus_old.evt.click = "touchend"
  d3plus_old.evt.down = "touchstart"
  d3plus_old.evt.up = "touchend"
  d3plus_old.evt.over = "touchstart"
  d3plus_old.evt.out = "touchend"
  d3plus_old.evt.move = "touchmove"
} else {
  d3plus_old.evt.click = "click"
  d3plus_old.evt.down = "mousedown"
  d3plus_old.evt.up = "mouseup"
  if (d3plus_old.ie) {
    d3plus_old.evt.over = "mouseenter"
    d3plus_old.evt.out = "mouseleave"
  }
  else {
    d3plus_old.evt.over = "mouseover"
    d3plus_old.evt.out = "mouseout"
  }
  d3plus_old.evt.move = "mousemove"
}
d3plus_old.utils = {};

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Random color generator (if no color is given)
//-------------------------------------------------------------------

d3plus_old.utils.color_scale = d3.scale.category20()
d3plus_old.utils.rand_color = function() {
  var rand_int = Math.floor(Math.random()*20)
  return d3plus_old.utils.color_scale(rand_int);
}

//===================================================================

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Returns appropriate text color based off of a given color
//-------------------------------------------------------------------

d3plus_old.utils.text_color = function(color) {
  var hsl = d3.hsl(color),
      light = "#ffffff",
      dark = "#333333";
  if (hsl.l > 0.65) return dark;
  else if (hsl.l < 0.48) return light;
  return hsl.h > 35 && hsl.s >= 0.3 && hsl.l >= 0.41 ? dark : light;
}

//===================================================================

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Darkens a color if it's too light to appear on white
//-------------------------------------------------------------------

d3plus_old.utils.darker_color = function(color) {
  var hsl = d3.hsl(color)
  if (hsl.s > .9) hsl.s = .9
  if (hsl.l > .4) hsl.l = .4
  return hsl.toString();
}

//===================================================================

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Returns list of unique values
//-------------------------------------------------------------------

d3plus_old.utils.uniques = function(data,value) {
  return d3.nest().key(function(d) {
    return d[value]
  }).entries(data).reduce(function(a,b,i,arr){
    return a.concat(parseInt(b['key']))
  },[])
}

//===================================================================

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Merge two objects to create a new one with the properties of both
//-------------------------------------------------------------------

d3plus_old.utils.merge = function(obj1, obj2) {
  var obj3 = {};
  for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
  for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
  return obj3;
}

//===================================================================

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// for SVGs word wrapping is not built in, so here we must creat this
// function ourselves
//-------------------------------------------------------------------

d3plus_old.utils.wordwrap = function(params) {

  var parent = params.parent,
      padding = params.padding ? params.padding : 10,
      width = params.width ? params.width-(padding*2) : 20000,
      height = params.height ? params.height : 20000,
      resize = params.resize,
      font_max = params.font_max ? params.font_max : 40,
      font_min = params.font_min ? params.font_min : 10;

  if (params.text instanceof Array) wrap(String(params.text.shift()).split(" "))
  else wrap(String(params.text).split(" "))

  function wrap(words) {

    if (resize) {

      // Start by trying the largest font size
      var size = font_max
      size = Math.floor(size)
      d3.select(parent).attr('font-size',size)

      // Add each word to it's own line (to test for longest word)
      d3.select(parent).selectAll('tspan').remove()
      for(var i=0; i<words.length; i++) {
        if (words.length == 1) var t = words[i]
        else var t = words[i]+"..."
        d3.select(parent).append('tspan').attr('x',0).text(t)
      }

      // If the longest word is too wide, make the text proportionately smaller
      if (parent.getBBox().width > width) size = size*(width/parent.getBBox().width)

      // If the new size is too small, return NOTHING
      if (size < font_min) {
        d3.select(parent).selectAll('tspan').remove();
        if (typeof params.text == "string" || params.text.length == 0) return;
        else wrap(String(params.text.shift()).split(/[\s-]/))
        return;
      }

      // Use new text size
      size = Math.floor(size)
      d3.select(parent).attr("font-size",size);

      // Flow text into box
      flow();

      // If text doesn't fit height-wise, shrink it!
      if (parent.childNodes.length*parent.getBBox().height > height) {
        var temp_size = size*(height/(parent.childNodes.length*parent.getBBox().height))
        if (temp_size < font_min) size = font_min
        else size = temp_size
        size = Math.floor(size)
        d3.select(parent).attr('font-size',size)
      } else finish();

    }

    flow();
    truncate();
    finish();

    function flow() {

      d3.select(parent).selectAll('tspan').remove()

      var x_pos = parent.getAttribute('x')

      var tspan = d3.select(parent).append('tspan')
        .attr('x',x_pos)
        .text(words[0])

      for (var i=1; i < words.length; i++) {

        tspan.text(tspan.text()+" "+words[i])

        if (tspan.node().getComputedTextLength() > width) {

          tspan.text(tspan.text().substr(0,tspan.text().lastIndexOf(" ")))

          tspan = d3.select(parent).append('tspan')
            .attr('x',x_pos)
            .text(words[i])

        }
      }

    }

    function truncate() {
      var cut = false
      while (parent.childNodes.length*parent.getBBox().height > height && parent.lastChild && !cut) {
        parent.removeChild(parent.lastChild)
        if (parent.childNodes.length*parent.getBBox().height < height && parent.lastChild) cut = true
      }
      if (cut) {
        tspan = parent.lastChild
        words = d3.select(tspan).text().split(/[\s-]/)

        var last_char = words[words.length-1].charAt(words[words.length-1].length-1)
        if (last_char == ',' || last_char == ';' || last_char == ':') words[words.length-1] = words[words.length-1].substr(0,words[words.length-1].length-1)

        d3.select(tspan).text(words.join(' ')+'...')

        if (tspan.getComputedTextLength() > width) {
          if (words.length > 1) words.pop(words.length-1)
          last_char = words[words.length-1].charAt(words[words.length-1].length-1)
          if (last_char == ',' || last_char == ';' || last_char == ':') words[words.length-1].substr(0,words[words.length-1].length-2)
          d3.select(tspan).text(words.join(' ')+'...')
        }
      }
    }
  }

  function finish() {
    d3.select(parent).selectAll('tspan').attr("dy", d3.select(parent).style('font-size'));
    return;
  }

}

//===================================================================
d3plus_old.tooltip = {};

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Create a Tooltip
//-------------------------------------------------------------------

d3plus_old.tooltip.create = function(params) {

  var default_width = params.fullscreen ? 250 : 200
  params.width = params.width || default_width
  params.max_width = params.max_width || 386
  params.id = params.id || "default"
  params.size = params.fullscreen || params.html ? "large" : "small"
  params.offset = params.offset || 0
  params.arrow_offset = params.arrow ? 8 : 0
  params.x = params.x || 0
  params.y = params.y || 0
  params.color = params.color || "#333"
  params.parent = params.parent || d3.select("body")
  params.background = params.background || "#ffffff"
  params.style = params.style || "default"

  d3plus_old.tooltip.remove("d3plus_tooltip_id_"+params.id)

  params.anchor = {}
  if (params.fullscreen) {
    params.anchor.x = "center"
    params.anchor.y = "center"
    params.x = params.parent ? params.parent.node().offsetWidth/2 : window.innerWidth/2
    params.y = params.parent ? params.parent.node().offsetHeight/2 : window.innerHeight/2
  }
  else if (params.align) {
    var a = params.align.split(" ")
    params.anchor.y = a[0]
    if (a[1]) params.anchor.x = a[1]
    else params.anchor.x = "center"
  }
  else {
    params.anchor.x = "center"
    params.anchor.y = "top"
  }

  var title_width = params.width - 30

  if (params.fullscreen) {
    var curtain = params.parent.append("div")
      .attr("id","d3plus_tooltip_curtain_"+params.id)
      .attr("class","d3plus_tooltip_curtain")
      .style("background-color",params.background)
      .on(d3plus_old.evt.click,function(){
        d3plus_old.tooltip.remove(params.id)
      })
  }

  var tooltip = params.parent.append("div")
    .datum(params)
    .attr("id","d3plus_tooltip_id_"+params.id)
    .attr("class","d3plus_tooltip d3plus_tooltip_"+params.size)
    .on(d3plus_old.evt.out,function(){
      d3plus_old.tooltip.close()
    })

  if (params.max_height) {
    tooltip.style("max-height",params.max_height+"px")
  }

  if (params.fixed) {
    tooltip.style("z-index",500)
    params.mouseevents = true
  }
  else {
    tooltip.style("z-index",2000)
  }

  var container = tooltip.append("div")
    .datum(params)
    .attr("class","d3plus_tooltip_container")

  if (params.fullscreen && params.html) {

    w = params.parent ? params.parent.node().offsetWidth*0.75 : window.innerWidth*0.75
    h = params.parent ? params.parent.node().offsetHeight*0.75 : window.innerHeight*0.75

    container
      .style("width",w+"px")
      .style("height",h+"px")

    var body = container.append("div")
      .attr("class","d3plus_tooltip_body")
      .style("width",params.width+"px")

  }
  else {

    if (params.width == "auto") {
      var w = "auto"
      container.style("max-width",params.max_width+"px")
    }
    else var w = params.width-14+"px"

    var body = container
      .style("width",w)

  }

  if (params.title || params.icon) {
    var header = body.append("div")
      .attr("class","d3plus_tooltip_header")
  }

  if (params.fullscreen) {
    var close = tooltip.append("div")
      .attr("class","d3plus_tooltip_close")
      .style("background-color",d3plus_old.utils.darker_color(params.color))
      .html("\&times;")
      .on(d3plus_old.evt.click,function(){
        d3plus_old.tooltip.remove(params.id)
      })
  }

  if (!params.mouseevents) {
    tooltip.style("pointer-events","none")
  }
  else if (params.mouseevents !== true) {

    var oldout = d3.select(params.mouseevents).on(d3plus_old.evt.out)

    var newout = function() {

      var target = d3.event.toElement || d3.event.relatedTarget
      if (target) {
        var c = typeof target.className == "string" ? target.className : target.className.baseVal
        var istooltip = c.indexOf("d3plus_tooltip") == 0
      }
      else {
        var istooltip = false
      }
      if (!target || (!ischild(tooltip.node(),target) && !ischild(params.mouseevents,target) && !istooltip)) {
        oldout(d3.select(params.mouseevents).datum())
        d3plus_old.tooltip.close()
        d3.select(params.mouseevents).on(d3plus_old.evt.out,oldout)
      }
    }

    var ischild = function(parent, child) {
       var node = child.parentNode;
       while (node != null) {
         if (node == parent) {
           return true;
         }
         node = node.parentNode;
       }
       return false;
    }

    d3.select(params.mouseevents).on(d3plus_old.evt.out,newout)
    tooltip.on(d3plus_old.evt.out,newout)

    var move_event = d3.select(params.mouseevents).on(d3plus_old.evt.move)
    if (move_event) {
      tooltip.on(d3plus_old.evt.move,move_event)
    }

  }

  if (params.arrow) {
    var arrow = tooltip.append("div")
      .attr("class","d3plus_tooltip_arrow")
  }

  if (params.icon) {
    var title_icon = header.append("div")
      .attr("class","d3plus_tooltip_icon")
      .style("background-image","url("+params.icon+")")

    if (params.style == "knockout") {
      title_icon.style("background-color",params.color)
    }

    title_width -= title_icon.node().offsetWidth
  }

  if (params.title) {
    var title = header.append("div")
      .attr("class","d3plus_tooltip_title")
      .style("width",title_width+"px")
      .text(params.title)
  }

  if (params.description) {
    var description = body.append("div")
      .attr("class","d3plus_tooltip_description")
      .text(params.description)
  }

  if (params.data || params.html && !params.fullscreen) {

    var data_container = body.append("div")
      .attr("class","d3plus_tooltip_data_container")
  }

  if (params.data) {

    var val_width = 0, val_heights = {}

    var last_group = null
    params.data.forEach(function(d,i){

      if (d.group) {
        if (last_group != d.group) {
          last_group = d.group
          data_container.append("div")
            .attr("class","d3plus_tooltip_data_title")
            .text(d.group)
        }
      }

      var block = data_container.append("div")
        .attr("class","d3plus_tooltip_data_block")
        .datum(d)

      if (d.highlight) {
        block.style("color",d3plus_old.utils.darker_color(params.color))
      }

      var name = block.append("div")
          .attr("class","d3plus_tooltip_data_name")
          .html(d.name)
          .on(d3plus_old.evt.out,function(){
            d3.event.stopPropagation()
          })

      var val = block.append("div")
          .attr("class","d3plus_tooltip_data_value")
          .text(d.value)
          .on(d3plus_old.evt.out,function(){
            d3.event.stopPropagation()
          })

      if (params.mouseevents && d.desc) {
        var desc = block.append("div")
          .attr("class","d3plus_tooltip_data_desc")
          .text(d.desc)
          .on(d3plus_old.evt.out,function(){
            d3.event.stopPropagation()
          })

        var dh = desc.node().offsetHeight

        desc.style("height","0px")

        var help = name.append("div")
          .attr("class","d3plus_tooltip_data_help")
          .text("?")
          .on(d3plus_old.evt.over,function(){
            var c = d3.select(this.parentNode.parentNode).style("color")
            d3.select(this).style("background-color",c)
            desc.style("height",dh+"px")
          })
          .on(d3plus_old.evt.out,function(){
            d3.event.stopPropagation()
          })

        name
          .style("cursor","pointer")
          .on(d3plus_old.evt.over,function(){
            d3plus_old.tooltip.close()
            var c = d3.select(this.parentNode).style("color")
            help.style("background-color",c)
            desc.style("height",dh+"px")
          })

        block.on(d3plus_old.evt.out,function(){
          d3.event.stopPropagation()
          d3plus_old.tooltip.close()
        })
      }

      var w = parseFloat(val.style("width"),10)
      if (w > params.width/2) w = params.width/2
      if (w > val_width) val_width = w

      if (i != params.data.length-1) {
        if ((d.group && d.group == params.data[i+1].group) || !d.group && !params.data[i+1].group)
        data_container.append("div")
          .attr("class","d3plus_tooltip_data_seperator")
      }

    })

    data_container.selectAll(".d3plus_tooltip_data_name")
      .style("width",function(){
        var w = parseFloat(d3.select(this.parentNode).style("width"),10)
        return (w-val_width-30)+"px"
      })

    data_container.selectAll(".d3plus_tooltip_data_value")
      .style("width",val_width+"px")
      .each(function(d){
        var h = parseFloat(d3.select(this).style("height"),10)
        val_heights[d.name] = h
      })

    data_container.selectAll(".d3plus_tooltip_data_name")
      .style("min-height",function(d){
        return val_heights[d.name]+"px"
      })

  }

  if (params.html && !params.fullscreen) {
    data_container.append("div")
      .html(params.html)
  }

  var footer = body.append("div")
    .attr("class","d3plus_tooltip_footer")

  if (params.footer) {
    footer.html(params.footer)
  }

  params.height = tooltip.node().offsetHeight

  if (params.html && params.fullscreen) {
    var h = params.height-12
    var w = tooltip.node().offsetWidth-params.width-44
    container.append("div")
      .attr("class","d3plus_tooltip_html")
      .style("width",w+"px")
      .style("height",h+"px")
      .html(params.html)
  }

  params.width = tooltip.node().offsetWidth

  if (params.anchor.y != "center") params.height += params.arrow_offset
  else params.width += params.arrow_offset

  if (params.data || (!params.fullscreen && params.html)) {

    if (!params.fullscreen && params.html) {
      var parent_height = params.parent.node().offsetHeight
      var limit = params.fixed ? parent_height-params.y-10 : parent_height-10
      var h = params.height < limit ? params.height : limit
    }
    else {
      var h = params.height
    }
    h -= parseFloat(container.style("padding-top"),10)
    h -= parseFloat(container.style("padding-bottom"),10)
    if (header) {
      h -= header.node().offsetHeight
      h -= parseFloat(header.style("padding-top"),10)
      h -= parseFloat(header.style("padding-bottom"),10)
    }
    if (footer) {
      h -= footer.node().offsetHeight
      h -= parseFloat(footer.style("padding-top"),10)
      h -= parseFloat(footer.style("padding-bottom"),10)
    }
    data_container
      .style("max-height",h+"px")
  }

  params.height = tooltip.node().offsetHeight

  d3plus_old.tooltip.move(params.x,params.y,params.id);

}

d3plus_old.tooltip.arrow = function(arrow) {
  arrow
    .style("bottom", function(d){
      if (d.anchor.y != "center" && !d.flip) return "-5px"
      else return "auto"
    })
    .style("top", function(d){
      if (d.anchor.y != "center" && d.flip) return "-5px"
      else if (d.anchor.y == "center") return "50%"
      else return "auto"
    })
    .style("left", function(d){
      if (d.anchor.y == "center" && d.flip) return "-5px"
      else if (d.anchor.y != "center") return "50%"
      else return "auto"
    })
    .style("right", function(d){
      if (d.anchor.y == "center" && !d.flip) return "-5px"
      else return "auto"
    })
    .style("margin-left", function(d){
      if (d.anchor.y == "center") {
        return "auto"
      }
      else {
        if (d.anchor.x == "right") {
          var arrow_x = -d.width/2+d.arrow_offset/2
        }
        else if (d.anchor.x == "left") {
          var arrow_x = d.width/2-d.arrow_offset*2 - 5
        }
        else {
          var arrow_x = -5
        }
        if (d.cx-d.width/2-5 < arrow_x) {
          arrow_x = d.cx-d.width/2-5
          if (arrow_x < 2-d.width/2) arrow_x = 2-d.width/2
        }
        else if (-(window.innerWidth-d.cx-d.width/2+5) > arrow_x) {
          var arrow_x = -(window.innerWidth-d.cx-d.width/2+5)
          if (arrow_x > d.width/2-11) arrow_x = d.width/2-11
        }
        return arrow_x+"px"
      }
    })
    .style("margin-top", function(d){
      if (d.anchor.y != "center") {
        return "auto"
      }
      else {
        if (d.anchor.y == "bottom") {
          var arrow_y = -d.height/2+d.arrow_offset/2 - 1
        }
        else if (d.anchor.y == "top") {
          var arrow_y = d.height/2-d.arrow_offset*2 - 2
        }
        else {
          var arrow_y = -9
        }
        if (d.cy-d.height/2-d.arrow_offset < arrow_y) {
          arrow_y = d.cy-d.height/2-d.arrow_offset
          if (arrow_y < 4-d.height/2) arrow_y = 4-d.height/2
        }
        else if (-(window.innerHeight-d.cy-d.height/2+d.arrow_offset) > arrow_y) {
          var arrow_y = -(window.innerHeight-d.cy-d.height/2+d.arrow_offset)
          if (arrow_y > d.height/2-22) arrow_y = d.height/2-22
        }
        return arrow_y+"px"
      }
    })
}

//===================================================================

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Close ALL Descriptions
//-------------------------------------------------------------------

d3plus_old.tooltip.close = function() {
  d3.selectAll("div.d3plus_tooltip_data_desc").style("height","0px")
  d3.selectAll("div.d3plus_tooltip_data_help").style("background-color","#ccc")
}

//===================================================================

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Destroy Tooltips
//-------------------------------------------------------------------

d3plus_old.tooltip.remove = function(id) {

  d3.selectAll("div#d3plus_tooltip_curtain_"+id).remove()
  if (id) d3.select("div#d3plus_tooltip_id_"+id).remove()
  else d3.selectAll("div.d3plus_tooltip").remove()

}

//===================================================================

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Get X and Y position for Tooltip
//-------------------------------------------------------------------

d3plus_old.tooltip.move = function(x,y,id) {

  if (!id) var tooltip = d3.select("div#d3plus_tooltip_id_default")
  else var tooltip = d3.select("div#d3plus_tooltip_id_"+id)

  if (tooltip.node()) {

    var d = tooltip.datum()

    d.cx = x
    d.cy = y

    if (!d.fixed) {

      // Set initial values, based off of anchor
      if (d.anchor.y != "center") {

        if (d.anchor.x == "right") {
          d.x = d.cx - d.arrow_offset - 4
        }
        else if (d.anchor.x == "center") {
          d.x = d.cx - d.width/2
        }
        else if (d.anchor.x == "left") {
          d.x = d.cx - d.width + d.arrow_offset + 2
        }

        // Determine whether or not to flip the tooltip
        if (d.anchor.y == "bottom") {
          d.flip = d.cy + d.height + d.offset <= window.innerHeight
        }
        else if (d.anchor.y == "top") {
          d.flip = d.cy - d.height - d.offset < 0
        }

        if (d.flip) {
          d.y = d.cy + d.offset + d.arrow_offset
        }
        else {
          d.y = d.cy - d.height - d.offset - d.arrow_offset
        }

      }
      else {

        d.y = d.cy - d.height/2

        // Determine whether or not to flip the tooltip
        if (d.anchor.x == "right") {
          d.flip = d.cx + d.width + d.offset <= window.innerWidth
        }
        else if (d.anchor.x == "left") {
          d.flip = d.cx - d.width - d.offset < 0
        }

        if (d.anchor.x == "center") {
          d.flip = false
          d.x = d.cx - d.width/2
        }
        else if (d.flip) {
          d.x = d.cx + d.offset + d.arrow_offset
        }
        else {
          d.x = d.cx - d.width - d.offset
        }
      }

      // Limit X to the bounds of the screen
      if (d.x < 0) {
        d.x = 0
      }
      else if (d.x + d.width > window.innerWidth) {
        d.x = window.innerWidth - d.width
      }

      // Limit Y to the bounds of the screen
      if (d.y < 0) {
        d.y = 0
      }
      else if (d.y + d.height > window.innerHeight) {
        d.y = window.innerHeight - d.height
      }

    }

    tooltip
      .style("top",d.y+"px")
      .style("left",d.x+"px")

    if (d.arrow) {
      tooltip.selectAll(".d3plus_tooltip_arrow")
        .call(d3plus_old.tooltip.arrow)
    }

  }

}

//===================================================================
d3plus_old.error = function(vars) {

  var error = d3.select("g.parent").selectAll("g.d3plus-error")
    .data([vars.error])

  error.enter().append("g")
    .attr("class","d3plus-error")
    .attr("opacity",0)
    .append("text")
      .attr("x",vars.svg_width/2)
      .attr("font-size","30px")
      .attr("fill","#888")
      .attr("text-anchor", "middle")
      .attr("font-family", vars.font)
      .style("font-weight", vars.font_weight)
      .style(vars.info_style)
      .each(function(d){
        d3plus_old.utils.wordwrap({
          "text": d,
          "parent": this,
          "width": vars.svg_width-20,
          "height": vars.svg_height-20,
          "resize": false
        })
      })
      .attr("y",function(){
        var height = d3.select(this).node().getBBox().height
        return vars.svg_height/2-height/2
      })

  error.transition().duration(d3plus_old.timing)
    .attr("opacity",1)

  error.select("text").transition().duration(d3plus_old.timing)
    .attr("x",vars.svg_width/2)
    .each(function(d){
      d3plus_old.utils.wordwrap({
        "text": d,
        "parent": this,
        "width": vars.svg_width-20,
        "height": vars.svg_height-20,
        "resize": false
      })
    })
    .attr("y",function(){
      var height = d3.select(this).node().getBBox().height
      return vars.svg_height/2-height/2
    })

  error.exit().transition().duration(d3plus_old.timing)
    .attr("opacity",0)
    .remove()

}
d3plus_old.viz = function() {

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Public Variables with Default Settings
  //-------------------------------------------------------------------

  var vars = {
    "active_var": "active",
    "arc_angles": {},
    "arc_inners": {},
    "arc_sizes": {},
    "attrs": {},
    "background": "#ffffff",
    "boundaries": null,
    "click_function": null,
    "color_var": "color",
    "color_domain": [],
    "color_range": ["#ff0000","#888888","#00ff00"],
    "color_scale": d3.scale.sqrt().interpolate(d3.interpolateRgb),
    "connections": null,
    "coords": null,
    "coord_change": false,
    "csv_columns": null,
    "data": null,
    "depth": null,
    "descs": {},
    "dev": false,
    "donut": true,
    "else_var": "elsewhere",
    "error": "",
    "filter": [],
    "filtered_data": null,
    "font": "sans-serif",
    "font_weight": "lighter",
    "footer": false,
    "graph": {"timing": 0},
    "group_bgs": true,
    "grouping": "name",
    "highlight": null,
    "highlight_color": "#cc0000",
    "icon_style": "default",
    "id_var": "id",
    "init": true,
    "keys": [],
    "labels": true,
    "layout": "value",
    "links": null,
    "margin": {"top": 0, "right": 0, "bottom": 0, "left": 0},
    "mirror_axis": false,
    "name_array": null,
    "nesting": null,
    "nesting_aggs": {},
    "nodes": null,
    "number_format": function(value,name) {
      if (["year",vars.id_var].indexOf(name) >= 0 || typeof value === "string") {
        return value
      }
      else if (value < 1) {
        return d3.round(value,2)
      }
      else if (value.toString().split(".")[0].length > 4) {
        var symbol = d3.formatPrefix(value).symbol
        symbol = symbol.replace("G", "B") // d3 uses G for giga

        // Format number to precision level using proper scale
        value = d3.formatPrefix(value).scale(value)
        value = parseFloat(d3.format(".3g")(value))
        return value + symbol;
      }
      else if (name == "share") {
        return d3.format(".2f")(value)
      }
      else {
        return d3.format(",f")(value)
      }

    },
    "order": "asc",
    "projection": d3.geo.mercator(),
    "scroll_zoom": false,
    "secondary_color": "#ffdddd",
    "size_scale": null,
    "size_scale_type": "sqrt",
    "solo": [],
    "sort": "total",
    "spotlight": true,
    "stack_type": "linear",
    "sub_title": null,
    "svg_height": window.innerHeight,
    "svg_width": window.innerWidth,
    "text_format": function(text,name) {
      return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()
    },
    "text_var": "name",
    "title": null,
    "title_center": true,
    "title_height": 0,
    "title_width": null,
    "tooltip_info": [],
    "total_bar": false,
    "total_var": "total",
    "type": "tree_map",
    "update_function": null,
    "value_var": "value",
    "xaxis_domain": null,
    "xaxis_val": null,
    "xaxis_var": null,
    "xscale": null,
    "xscale_type": "linear",
    "yaxis_domain": null,
    "yaxis_val": null,
    "yaxis_var": null,
    "yscale": null,
    "yscale_type": "linear",
    "year": null,
    "years": null,
    "year_var": "year",
    "zoom_behavior": d3.behavior.zoom(),
    "zoom_function": null
  }

  var data_obj = {"raw": null},
      error = false,
      filter_change = false,
      solo_change = false,
      value_change = false,
      axis_change = false,
      nodes,
      links,
      static_axes = true,
      xaxis_domain = null,
      yaxis_domain = null;

  var data_type = {
    "bubbles": "array",
    "geo_map": "object",
    "network": "object",
    "pie_scatter": "pie_scatter",
    "rings": "object",
    "stacked": "stacked",
    "tree_map": "tree_map"
  }

  var nested_apps = ["pie_scatter","stacked","tree_map"]

  //===================================================================

  chart = function(selection) {
    selection.each(function(data_passed) {

      if (vars.dev) console.log("[d3plus] *** Start Chart ***")

      // Things to do ONLY when the data has changed
      if (data_passed != data_obj.raw) {

        if (vars.dev) console.log("[d3plus] New Data Detected")
        // Copy data to "raw_data" variable
        data_obj = {}
        vars.keys = {}
        data_obj.raw = data_passed

        data_passed.forEach(function(d){
          for (k in d) {
            if (!vars.keys[k] && d[k]) {
              vars.keys[k] = typeof d[k]
            }
          }
        })

        var changed = []
        if (filter_change) changed.push("filter")
        if (solo_change) changed.push("solo")
        if (value_change && vars.value_var) changed.push(vars.value_var)
        if (axis_change) {
          if (vars.yaxis_var) changed.push(vars.yaxis_var)
          if (vars.xaxis_var) changed.push(vars.xaxis_var)
        }

        data_obj.filtered = filter_check(data_obj.raw,changed)
        vars.parent = d3.select(this)

        filter_change = false
        solo_change = false
        value_change = false
        axis_change = false

        if (vars.dev) console.log("[d3plus] Establishing Year Range and Current Year")
        // Find available years
        vars.years = d3plus_old.utils.uniques(data_obj.raw,vars.year_var)
        vars.years.sort()
        // Set initial year if it doesn't exist
        if (!vars.year) {
          if (vars.years.length) vars.year = vars.years[vars.years.length-1]
          else vars.year = "all"
        }

        data_obj.year = {}
        if (vars.years.length) {
          vars.years.forEach(function(y){
            data_obj.year[y] = data_obj.filtered.filter(function(d){
              return d[vars.year_var] == y;
            })
          })
        }

      }

      if (vars.type == "stacked") {
        vars.yaxis_var = vars.value_var
      }

      var changed = []
      if (filter_change) changed.push("filter")
      if (solo_change) changed.push("solo")
      if (value_change && vars.value_var) changed.push(vars.value_var)
      if (axis_change) {
        if (vars.yaxis_var) changed.push(vars.yaxis_var)
        if (vars.xaxis_var) changed.push(vars.xaxis_var)
      }

      if (changed.length) {
        delete data_obj[data_type[vars.type]]
        data_obj.filtered = filter_check(data_obj.raw,changed)
        if (vars.years.length) {
          vars.years.forEach(function(y){
            data_obj.year[y] = data_obj.filtered.filter(function(d){
              return d[vars.year_var] == y;
            })
          })
        }
      }

      filter_change = false
      solo_change = false
      value_change = false
      axis_change = false

      if (!data_obj[data_type[vars.type]]) {

        data_obj[data_type[vars.type]] = {}

        if (nested_apps.indexOf(vars.type) >= 0) {

          if (vars.dev) console.log("[d3plus] Nesting Data")

          if (!vars.nesting) vars.nesting = [vars.id_var]
          if (!vars.depth || vars.nesting.indexOf(vars.depth) < 0) vars.depth = vars.nesting[0]

          vars.nesting.forEach(function(depth){

            var level = vars.nesting.slice(0,vars.nesting.indexOf(depth)+1)

            if (vars.type == "stacked") {
              var temp_data = []
              for (y in data_obj.year) {
                var yd = nest(data_obj.year[y],level)
                temp_data = temp_data.concat(yd)
              }
              data_obj[data_type[vars.type]][depth] = temp_data
            }
            else if (vars.type == "pie_scatter") {

              data_obj[data_type[vars.type]][depth] = {"true": {}, "false": {}}
              for (b in data_obj[data_type[vars.type]][depth]) {
                var all_array = []
                if (b == "true") var spotlight = true
                else var spotlight = false
                for (y in data_obj.year) {
                  if (spotlight) {
                    var filtered_data = data_obj.year[y].filter(function(d){
                      return d[vars.active_var] != spotlight
                    })
                  }
                  else {
                    var filtered_data = data_obj.year[y]
                  }
                  data_obj[data_type[vars.type]][depth][b][y] = nest(filtered_data,level)
                  all_array = all_array.concat(data_obj[data_type[vars.type]][depth][b][y])
                }
                data_obj[data_type[vars.type]][depth][b].all = all_array
              }

            }
            else {
              data_obj[data_type[vars.type]][depth] = {}
              var all_array = []
              for (y in data_obj.year) {
                data_obj[data_type[vars.type]][depth][y] = nest(data_obj.year[y],level)
                all_array = all_array.concat(data_obj[data_type[vars.type]][depth][y])
              }
              data_obj[data_type[vars.type]][depth].all = all_array
            }

          })

        }
        else if (data_type[vars.type] == "object") {
          for (y in data_obj.year) {
            data_obj[data_type[vars.type]][y] = {}
            data_obj.year[y].forEach(function(d){
              data_obj[data_type[vars.type]][y][d[vars.id_var]] = d;
            })
          }
        }
        else {
          for (y in data_obj.year) {
            data_obj[data_type[vars.type]][y] = data_obj.year[y]
          }
        }

      }

      vars.data == null
      if (nested_apps.indexOf(vars.type) >= 0 && vars.nesting) {

        if (!vars.depth) vars.depth = vars.nesting[vars.nesting.length-1]

        if (vars.type == "stacked") {
          vars.data = data_obj[data_type[vars.type]][vars.depth].filter(function(d){
            if (vars.year instanceof Array) {
              return d[vars.year_var] >= vars.year[0] && d[vars.year_var] <= vars.year[1]
            }
            else {
              return true
            }
          })
        }
        else if (vars.type == "pie_scatter" && vars.year) {
          vars.data = data_obj[data_type[vars.type]][vars.depth][vars.spotlight][vars.year]
        }
        else if (vars.year) {
          vars.data = data_obj[data_type[vars.type]][vars.depth][vars.year]
        }

      }
      else if (vars.year) {
        vars.data = data_obj[data_type[vars.type]][vars.year];
      }

      if (vars.data && (vars.type == "tree_map" && !vars.data.children.length) || (vars.data && vars.data.length == 0)) {
        vars.data = null
      }

      d3plus_old.tooltip.remove(vars.type);

      vars.svg = vars.parent.selectAll("svg").data([vars.data]);

      vars.svg_enter = vars.svg.enter().append("svg")
        .attr('width',vars.svg_width)
        .attr('height',vars.svg_height)

      vars.svg_enter.append("rect")
        .attr("id","svgbg")
        .attr("fill",vars.background)
        .attr('width',vars.svg_width)
        .attr('height',vars.svg_height)

      vars.svg.transition().duration(d3plus_old.timing)
        .attr('width',vars.svg_width)
        .attr('height',vars.svg_height)

      vars.svg.select("rect#svgbg").transition().duration(d3plus_old.timing)
        .attr('width',vars.svg_width)
        .attr('height',vars.svg_height)

      if (["network","rings"].indexOf(vars.type) >= 0) {
        if (vars.solo.length || vars.filter.length) {
          if (vars.dev) console.log("[d3plus] Filtering Nodes and Edges")
          vars.nodes = nodes.filter(function(d){
            return true_filter(d)
          })
          vars.links = links.filter(function(d){
            var first_match = true_filter(d.source),
                second_match = true_filter(d.target)
            return first_match && second_match
          })
        }
        else {
          vars.nodes = nodes
          vars.links = links
        }
        vars.connections = get_connections(vars.links)
      }

      vars.parent
        .style("width",vars.svg_width+"px")
        .style("height",vars.svg_height+"px")
        .style("overflow","hidden")

      vars.width = vars.svg_width;

      if (vars.type == "pie_scatter" && vars.data) {
        if (vars.dev) console.log("[d3plus] Setting Axes Domains")
        if (xaxis_domain instanceof Array) vars.xaxis_domain = xaxis_domain
        else if (!static_axes) {
          vars.xaxis_domain = d3.extent(data_obj[data_type[vars.type]][vars.depth][vars.spotlight][vars.year],function(d){
            return d[vars.xaxis_var]
          })
        }
        else {
          vars.xaxis_domain = d3.extent(data_obj[data_type[vars.type]][vars.depth][vars.spotlight].all,function(d){
            return d[vars.xaxis_var]
          })
        }
        if (yaxis_domain instanceof Array) vars.yaxis_domain = yaxis_domain
        else if (!static_axes) {
          vars.yaxis_domain = d3.extent(data_obj[data_type[vars.type]][vars.depth][vars.spotlight][vars.year],function(d){
            return d[vars.yaxis_var]
          }).reverse()
        }
        else {
          vars.yaxis_domain = d3.extent(data_obj[data_type[vars.type]][vars.depth][vars.spotlight].all,function(d){
            return d[vars.yaxis_var]
          }).reverse()
        }
        if (vars.mirror_axis) {
          var domains = vars.yaxis_domain.concat(vars.xaxis_domain)
          vars.xaxis_domain = d3.extent(domains)
          vars.yaxis_domain = d3.extent(domains).reverse()
        }
        if (vars.xaxis_domain[0] == vars.xaxis_domain[1]) {
          vars.xaxis_domain[0] -= 1
          vars.xaxis_domain[1] += 1
        }
        if (vars.yaxis_domain[0] == vars.yaxis_domain[1]) {
          vars.yaxis_domain[0] -= 1
          vars.yaxis_domain[1] += 1
        }
      }

      if (!vars.xaxis_domain) vars.xaxis_domain = [0,0]
      if (!vars.yaxis_domain) vars.yaxis_domain = [0,0]

      // Calculate total_bar value
      if (!vars.data || !vars.total_bar || vars.type == "stacked") {
        var total_val = null
      }
      else {
        if (vars.dev) console.log("[d3plus] Calculating Total Value")

        if (vars.type == "tree_map") {

          function check_child(c) {
            if (c[vars.value_var]) return c[vars.value_var]
            else if (c.children) {
              return d3.sum(c.children,function(c2){
                return check_child(c2)
              })
            }
          }

          var total_val = check_child(vars.data)
        }
        else if (vars.data instanceof Array) {
          var total_val = d3.sum(vars.data,function(d){
            return d[vars.value_var]
          })
        }
        else if (vars.type == "rings") {
          if (vars.data[vars.highlight])
            var total_val = vars.data[vars.highlight][vars.value_var]
          else {
            var total_val = null
          }
        }
        else {
          var total_val = d3.sum(d3.values(vars.data),function(d){
            return d[vars.value_var]
          })
        }
      }

      if (vars.data) {

        if (vars.dev) console.log("[d3plus] Calculating Color Range")

        var data_range = []
        vars.color_domain = null

        if (vars.type == "tree_map") {

          function check_child_colors(c) {
            if (c.children) {
              c.children.forEach(function(c2){
                check_child_colors(c2)
              })
            }
            else {
              data_range.push(find_variable(c,vars.color_var))
            }
          }

          check_child_colors(vars.data)

        }
        else if (vars.data instanceof Array) {
          vars.data.forEach(function(d){
            data_range.push(find_variable(d,vars.color_var))
          })
        }
        else {
          d3.values(vars.data).forEach(function(d){
            data_range.push(find_variable(d,vars.color_var))
          })
        }

        data_range = data_range.filter(function(d){
          return d;
        })

        if (typeof data_range[0] == "number") {
          data_range.sort(function(a,b) {return a-b})
          vars.color_domain = [d3.quantile(data_range,0.1),d3.quantile(data_range,0.9)]
          var new_range = vars.color_range.slice(0)
          if (vars.color_domain[0] < 0 && vars.color_domain[1] > 0) {
            vars.color_domain.push(vars.color_domain[1])
            vars.color_domain[1] = 0
          }
          else if (vars.color_domain[1] > 0) {
            vars.color_domain[0] = 0
            new_range.splice(0,1)
          }
          else if (vars.color_domain[0] < 0) {
            vars.color_domain[1] = 0
            new_range.pop()
          }
          vars.color_scale
            .domain(vars.color_domain)
            .range(new_range)
        }

      }

      vars.svg_enter.append("g")
        .attr("class","titles")

      vars.svg_enter.append("g")
        .attr("class","footer")
        .attr("transform","translate(0,"+vars.svg_height+")")

      // Create titles
      vars.margin.top = 0
      var title_offset = 0
      if (vars.svg_width <= 400 || vars.svg_height <= 300) {
        vars.small = true;
        vars.graph.margin = {"top": 0, "right": 0, "bottom": 0, "left": 0}
        vars.graph.width = vars.width
        make_title(null,"title");
        make_title(null,"sub_title");
        make_title(null,"total_bar");
        update_footer(null)
      }
      else {
        if (vars.dev) console.log("[d3plus] Creating/Updating Titles")
        vars.small = false;
        vars.graph.margin = {"top": 5, "right": 10, "bottom": 40, "left": 40}
        vars.graph.width = vars.width-vars.graph.margin.left-vars.graph.margin.right
        make_title(vars.title,"title");
        make_title(vars.sub_title,"sub_title");
        if (vars.data && !error && (vars.type != "rings" || (vars.type == "rings" && vars.connections[vars.highlight]))) {
          make_title(total_val,"total_bar");
        }
        else {
          make_title(null,"total_bar");
        }
        if (vars.margin.top > 0) {
          vars.margin.top += 3
          if (vars.margin.top < vars.title_height) {
            title_offset = (vars.title_height-vars.margin.top)/2
            vars.margin.top = vars.title_height
          }
        }
        update_footer(vars.footer)
      }

      d3.select("g.titles").transition().duration(d3plus_old.timing)
        .attr("transform","translate(0,"+title_offset+")")


      vars.height = vars.svg_height - vars.margin.top - vars.margin.bottom;

      vars.graph.height = vars.height-vars.graph.margin.top-vars.graph.margin.bottom

      vars.svg_enter.append("clipPath")
        .attr("id","clipping")
        .append("rect")
          .attr("id","parent_clip")
          .attr("width",vars.width)
          .attr("height",vars.height)

      vars.parent_enter = vars.svg_enter.append("g")
        .attr("class","parent")
        .attr("clip-path","url(#clipping)")
        .attr("transform","translate("+vars.margin.left+","+vars.margin.top+")")

      vars.svg.select("g.parent").transition().duration(d3plus_old.timing)
        .attr("transform","translate("+vars.margin.left+","+vars.margin.top+")")

      vars.svg.select("rect#parent_clip").transition().duration(d3plus_old.timing)
        .attr("width",vars.width)
        .attr("height",vars.height)

      vars.parent_enter.append("defs")
      vars.defs = d3.select("g.parent").select("defs")


      vars.loader = vars.parent.selectAll("div#d3plus_loader").data([vars.data]);

      vars.loader.enter().append("div")
        .attr("id","d3plus_loader")
        .style("background-color",vars.background)
        .style("display","none")
        .append("div")
          .attr("id","d3plus_loader_text")
          .style("font-family",vars.font)
          .style("font-weight",vars.font_weight)
          .style(vars.info_style)
          .text(vars.text_format("Loading..."))

      // vars.loader.select("div#d3plus_loader_text").transition().duration(d3plus_old.timing)

      if (!error && !vars.data) {
        vars.error = vars.text_format("No Data Available","error")
      }
      else if (vars.type == "rings" && !vars.connections[vars.highlight]) {
        vars.data = null
        vars.error = vars.text_format("No Connections Available","error")
      }
      else if (error) {
        vars.data = null
        if (error === true) {
          vars.error = vars.text_format("Error","error")
        }
        else {
          vars.error = vars.text_format(error,"error")
        }
      }
      else {
        vars.error = ""
      }

      if (vars.dev) console.log("[d3plus] Building \"" + vars.type + "\"")
      d3plus[vars.type](vars)
      if (vars.dev) console.log("[d3plus] *** End Chart ***")

      d3plus_old.error(vars)

    });

    return chart;
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Helper Functions
  //-------------------------------------------------------------------

  filter_check = function(check_data,keys) {

    if (vars.dev) console.log("[d3plus] Filtering Data")

    return check_data.filter(function(d){

      var ret = true
      keys.forEach(function(key){
        if (ret) {
          if (key == "filter" || key == "solo") {
            ret = true_filter(d)
          }
          else if (key != vars.value_var || vars.type != "rings") {
            var value = find_variable(d,key)
            if (value === null) ret = false
          }
        }
      })
      return ret

    })

  }

  true_filter = function(d) {

    var id = d[vars.id_var],
        check = [id]

    if (vars.nesting.length) {
      vars.nesting.forEach(function(key){
        if (vars.attrs[id][key] && vars.attrs[id][key][vars.id_var]) {
          check.push(vars.attrs[id][key][vars.id_var])
        }
      })
    }

    var match = true
    if (id != vars.highlight || vars.type != "rings") {
      if (vars.solo.length) {
        match = false
        check.forEach(function(c){
          if (vars.solo.indexOf(c) >= 0) match = true
        })
      }
      else if (vars.filter.length) {
        match = true
        check.forEach(function(c){
          if (vars.filter.indexOf(c) >= 0) match = false
        })
      }
    }
    return match
  }

  nest = function(flat_data,levels) {

    var flattened = [];
    var nested_data = d3.nest();

    levels.forEach(function(nest_key, i){

      nested_data
        .key(function(d){
          var n = find_variable(d,nest_key)
          if (typeof n === "object") return n[vars.id_var]
          else return n
        })

      if (i == levels.length-1) {
        nested_data.rollup(function(leaves){

          to_return = {
            "num_children": leaves.length,
            "num_children_active": d3.sum(leaves, function(d){ return d[vars.active_var]; })
          }

          var nest_obj = find_variable(leaves[0],nest_key)
          if (typeof nest_obj === "object") to_return[vars.id_var] = nest_obj[vars.id_var]
          else to_return[vars.id_var] = nest_obj

          if (nest_obj.display_id) to_return.display_id = nest_obj.display_id;

          for (key in vars.keys) {
            var prefix = ""
            if (key.indexOf("cp_bra_") == 0) {
              var arr = key.split("_")
              prefix = []
              prefix.push(arr.shift())
              prefix.push(arr.shift())
              prefix.push(arr.shift())
              prefix = prefix.join("_") + "_"
              key = arr.join("_")
            }
            if (key == "wage_avg") {
              var wage = 0, num_emp = 0
              leaves.forEach(function(d){
                wage += d[prefix+"wage"] ? d[prefix+"wage"] : 0
                num_emp += d[prefix+"num_emp"] ? d[prefix+"num_emp"] : 0
              })
              to_return[prefix+key] = wage/num_emp
            }
            else if (key == "num_jobs_est") {
              var num_est = 0, num_emp = 0
              leaves.forEach(function(d){
                num_est += d[prefix+"num_est"] ? d[prefix+"num_est"] : 0
                num_emp += d[prefix+"num_emp"] ? d[prefix+"num_emp"] : 0
              })
              to_return[prefix+key] = num_emp/num_est
            }
            else if (vars.nesting_aggs[prefix+key]) {
              to_return[prefix+key] = d3[vars.nesting_aggs[prefix+key]](leaves, function(d){ return d[prefix+key]; })
            }
            else {
              if ([vars.year_var].indexOf(prefix+key) >= 0 || (prefix+key == vars.id_var && !to_return[vars.id_var])) {
                to_return[prefix+key] = leaves[0][prefix+key];
              }
              else if (vars.keys[prefix+key] === "number" && prefix+key != vars.id_var) {
                to_return[prefix+key] = d3.sum(leaves, function(d){ return d[prefix+key]; })
              }
              else if (prefix+key == vars.color_var) {
                to_return[prefix+key] = leaves[0][prefix+key]
              }
            }
          }

          if(vars.type != "tree_map"){
            levels.forEach(function(nk){
              to_return[nk] = leaves[0][nk]
            })
            flattened.push(to_return);
          }

          return to_return

        })
      }

    })

    rename_key_value = function(obj) {
      if (obj.values && obj.values.length) {
        var return_obj = {}
        return_obj.children = obj.values.map(function(obj) {
          return rename_key_value(obj);
        })
        return_obj[vars.id_var] = obj.key
        return return_obj
      }
      else if(obj.values) {
        return obj.values
      }
      else {
        return obj;
      }
    }

    nested_data = nested_data
      .entries(flat_data)
      .map(rename_key_value)

    if(vars.type != "tree_map"){
      return flattened;
    }

    return {"name":"root", "children": nested_data};

  }

  make_title = function(t,type){

    // Set the total value as data for element.
    var font_size = type == "title" ? 18 : 13,
        title_position = {
          "x": vars.svg_width/2,
          "y": vars.margin.top
        }

    if (type == "total_bar" && t) {
      title = vars.number_format(t,vars.value_var)
      vars.total_bar.prefix ? title = vars.total_bar.prefix + title : null;
      vars.total_bar.suffix ? title = title + vars.total_bar.suffix : null;

      if (vars.filter.length || vars.solo.length && vars.type != "rings") {
        var overall_total = d3.sum(data_obj.raw, function(d){
          if (vars.type == "stacked") return d[vars.value_var]
          else if (vars.year == d[vars.year_var]) return d[vars.value_var]
        })
        var pct = (t/overall_total)*100
        ot = vars.number_format(overall_total,vars.value_var)
        title += " ("+vars.number_format(pct,"share")+"% of "+ot+")"
      }

    }
    else {
      title = t
    }

    if (title) {
      var title_data = title_position
      title_data.title = title
      title_data = [title_data]
    }
    else {
      var title_data = []
    }

    var total = d3.select("g.titles").selectAll("g."+type).data(title_data)

    var offset = 0
    if (["pie_scatter","stacked"].indexOf(vars.type) >= 0 && !vars.title_center) {
      offset = vars.graph.margin.left
    }

    // Enter
    total.enter().append("g")
      .attr("class",type)
      .style("opacity",0)
      .append("text")
        .attr("x",function(d) { return d.x; })
        .attr("y",function(d) { return d.y+offset; })
        .attr("font-size",font_size)
        .attr("fill","#333")
        .attr("text-anchor", "middle")
        .attr("font-family", vars.font)
        .style("font-weight", vars.font_weight)
        .each(function(d){
          var width = vars.title_width ? vars.title_width : vars.svg_width
          width -= offset*2
          d3plus_old.utils.wordwrap({
            "text": d.title,
            "parent": this,
            "width": width,
            "height": vars.svg_height/8,
            "resize": false
          })
        })

    // Update
    total.transition().duration(d3plus_old.timing)
      .style("opacity",1)

    update_titles()

    // Exit
    total.exit().transition().duration(d3plus_old.timing)
      .style("opacity",0)
      .remove();

    if (total.node()) vars.margin.top += total.select("text").node().getBBox().height

  }

  update_footer = function(footer_text) {

    if (footer_text) {
      if (footer_text.indexOf("<a href=") == 0) {
        var div = document.createElement("div")
        div.innerHTML = footer_text
        var t = footer_text.split("href=")[1]
        var link = t.split(t.charAt(0))[1]
        if (link.charAt(0) != "h" && link.charAt(0) != "/") {
          link = "http://"+link
        }
        var d = [div.getElementsByTagName("a")[0].innerHTML]
      }
      else {
        var d = [footer_text]
      }
    }
    else var d = []

    var source = d3.select("g.footer").selectAll("text.source").data(d)
    var padding = 3

    source.enter().append("text")
      .attr("class","source")
      .attr("opacity",0)
      .attr("x",vars.svg_width/2+"px")
      .attr("y",padding-1+"px")
      .attr("font-size","10px")
      .attr("fill","#333")
      .attr("text-anchor", "middle")
      .attr("font-family", vars.font)
      .style("font-weight", vars.font_weight)
      .each(function(d){
        d3plus_old.utils.wordwrap({
          "text": d,
          "parent": this,
          "width": vars.svg_width-20,
          "height": vars.svg_height/8,
          "resize": false
        })
      })
      .on(d3plus_old.evt.over,function(){
        if (link) {
          d3.select(this)
            .style("text-decoration","underline")
            .style("cursor","pointer")
            .style("fill","#000")
        }
      })
      .on(d3plus_old.evt.out,function(){
        if (link) {
          d3.select(this)
            .style("text-decoration","none")
            .style("cursor","auto")
            .style("fill","#333")
        }
      })
      .on(d3plus_old.evt.click,function(){
        if (link) {
          if (link.charAt(0) != "/") var target = "_blank"
          else var target = "_self"
          window.open(link,target)
        }
      })

    source
      .attr("opacity",1)
      .attr("x",(vars.svg_width/2)+"px")
      .attr("font-family", vars.font)
      .style("font-weight", vars.font_weight)
      .each(function(d){
        d3plus_old.utils.wordwrap({
          "text": d,
          "parent": this,
          "width": vars.svg_width-20,
          "height": vars.svg_height/8,
          "resize": false
        })
      })

    source.exit().transition().duration(d3plus_old.timing)
      .attr("opacity",0)
      .remove()

    if (d.length) {
      var height = source.node().getBBox().height
      vars.margin.bottom = height+padding*2
    }
    else {
      vars.margin.bottom = 0
    }

    d3.select("g.footer").transition().duration(d3plus_old.timing)
      .attr("transform","translate(0,"+(vars.svg_height-vars.margin.bottom)+")")

  }

  update_titles = function() {

    var offset = 0
    if (["pie_scatter","stacked"].indexOf(vars.type) >= 0 && !vars.title_center) {
      offset = vars.graph.margin.left
    }

    d3.select("g.titles").selectAll("g").select("text")
      .transition().duration(d3plus_old.timing)
        .attr("x",function(d) { return d.x+offset; })
        .attr("y",function(d) { return d.y; })
        .each(function(d){
          var width = vars.title_width ? vars.title_width : vars.svg_width
          width -= offset*2
          d3plus_old.utils.wordwrap({
            "text": d.title,
            "parent": this,
            "width": width,
            "height": vars.svg_height/8,
            "resize": false
          })
        })
        .selectAll("tspan")
          .attr("x",function(d) { return d.x+offset; })

  }

  get_connections = function(links) {
    var connections = {};
    links.forEach(function(d) {
      if (!connections[d.source[vars.id_var]]) {
        connections[d.source[vars.id_var]] = []
      }
      connections[d.source[vars.id_var]].push(d.target)
      if (!connections[d.target[vars.id_var]]) {
        connections[d.target[vars.id_var]] = []
      }
      connections[d.target[vars.id_var]].push(d.source)
    })
    return connections;
  }

  get_tooltip_data = function(id,length,extras) {

    if (!length) var length = "long"

    var extra_data = {}
    if (extras && typeof extras == "string") extras = [extras]
    else if (extras && typeof extras == "object") {
      extra_data = d3plus_old.utils.merge(extra_data,extras)
      var extras = []
      for (k in extra_data) {
        extras.push(k)
      }
    }
    else if (!extras) var extras = []

    var tooltip_highlights = []
    extras.push(vars.value_var)
    if (["bubbles"].indexOf(vars.type) >= 0) {
      tooltip_highlights.push(vars.active_var)
      extras.push(vars.active_var)
      tooltip_highlights.push(vars.else_var)
      extras.push(vars.else_var)
      tooltip_highlights.push(vars.total_var)
      extras.push(vars.total_var)
    }
    else if (["stacked","pie_scatter"].indexOf(vars.type) >= 0) {
      tooltip_highlights.push(vars.xaxis_var)
      tooltip_highlights.push(vars.yaxis_var)
      extras.push(vars.xaxis_var)
      extras.push(vars.yaxis_var)
    }

    if (["stacked","pie_scatter","bubbles"].indexOf(vars.type) < 0) {
      tooltip_highlights.push(vars.value_var)
    }

    if (vars.tooltip_info instanceof Array) var a = vars.tooltip_info
    else if (vars.tooltip_info[length] && vars.tooltip_info[length] instanceof Array) var a = vars.tooltip_info[length]
    else if (vars.tooltip_info[length]) var a = d3plus_old.utils.merge({"":[]},vars.tooltip_info[length])
    else var a = vars.tooltip_info

    function format_key(key,group) {
      if (!group) var group = null
      else var group = vars.text_format(group)

      var value = extra_data[key] || find_variable(id,key)
      if (value !== false) {
        var name = vars.text_format(key),
            h = tooltip_highlights.indexOf(key) >= 0

        if (typeof value == "string") {
          value = value.toString()
          var val = vars.text_format(value,key)
        }
        else if (typeof value == "number") {
          var val = vars.number_format(value,key)
        }

        var obj = {"name": name, "value": val, "highlight": h, "group": group}

        if (vars.descs[key] && length == "long") obj.desc = vars.descs[key]

        if (val) tooltip_data.push(obj)
      }

    }

    var tooltip_data = []

    if (a instanceof Array) {

      extras.forEach(function(e){
        if (a.indexOf(e) < 0) a.push(e)
      })

      a.forEach(function(t){
        format_key(t)
      })

    }
    else {

      if (vars.tooltip_info.long && typeof vars.tooltip_info.long == "object") {
        var placed = []
        for (group in vars.tooltip_info.long) {
          extras.forEach(function(e){
            if (vars.tooltip_info.long[group].indexOf(e) >= 0 && ((a[group] && a[group].indexOf(e) < 0) || !a[group])) {
              if (!a[group]) a[group] = []
              a[group].push(e)
              placed.push(e)
            }
            else if (a[group] && a[group].indexOf(e) >= 0) {
              placed.push(e)
            }
          })
        }
        extras.forEach(function(e){
          if (placed.indexOf(e) < 0) {
            if (!a[""]) a[""] = []
            a[""].push(e)
          }
        })
      }
      else {
        var present = []
        for (group in a) {
          extras.forEach(function(e){
            if (a[group].indexOf(e) >= 0) {
              present.push(e)
            }
          })
        }
        if (present.length != extras.length) {
          if (!a[""]) a[""] = []
          extras.forEach(function(e){
            if (present.indexOf(e) < 0) {
              a[""].push(e)
            }
          })
        }
      }

      if (a[""]) {
        a[""].forEach(function(t){
          format_key(t,"")
        })
        delete a[""]
      }

      for (group in a) {
        if (a[group] instanceof Array) {
          a[group].forEach(function(t){
            format_key(t,group)
          })
        }
        else if (typeof a[group] == "string") {
          format_key(a[group],group)
        }
      }

    }

    return tooltip_data

  }

  find_variable = function(id,variable) {

    if (typeof id == "object") {
      var dat = id
      id = dat[vars.id_var]
    }
    else {
      if (vars.data instanceof Array) {
        var dat = vars.data.filter(function(d){
          return d[vars.id_var] == id
        })[0]
      }
      else if (vars.data) {
        var dat = vars.data[id]
      }
    }

    var attr = vars.attrs[id]

    var value = false

    if (dat && dat.values) {
      dat.values.forEach(function(d){
        if (d[variable] && !value) value = d[variable]
      })
    }

    if (!value) {
      if (dat && typeof dat[variable] != "undefined") value = dat[variable]
      else if (attr && typeof attr[variable] != "undefined") value = attr[variable]
    }

    if (value === null) value = 0
    if (variable == vars.text_var && value) {
      return vars.text_format(value)
    }
    else return value

  }

  find_color = function(id) {
    var color = find_variable(id,vars.color_var)
    if (!color && vars.color_domain instanceof Array) color = 0
    else if (!color) color = d3plus_old.utils.rand_color()
    if (typeof color == "string") return color
    else return vars.color_scale(color)
  }

  footer_text = function() {

    var text = vars.click_function || vars.tooltip_info.long ? vars.text_format("Click for More Info") : null

    if (!text && vars.type == "geo_map") return vars.text_format("Click to Zoom")
    else return text

  }

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Expose Public Variables
  //-------------------------------------------------------------------

  chart.active_var = function(x) {
    if (!arguments.length) return vars.active_var
    vars.active_var = x
    return chart
  };

  chart.attrs = function(x) {
    if (!arguments.length) return vars.attrs;
    vars.attrs = x;
    return chart;
  };

  chart.background = function(x) {
    if (!arguments.length) return vars.background;
    vars.background = x;
    return chart;
  };

  chart.click_function = function(x) {
    if (!arguments.length) return vars.click_function;
    vars.click_function = x;
    return chart;
  };

  chart.color_var = function(x) {
    if (!arguments.length) return vars.color_var;
    vars.color_var = x;
    return chart;
  };

  chart.csv_data = function(x) {
    if (!arguments.length) {
      var csv_to_return = [],
          column_init = vars.csv_columns,
          columns = [], titles = []

      if (column_init.indexOf(vars.text_var) < 0) column_init.unshift(vars.text_var)
      if (column_init.indexOf(vars.id_var) < 0) column_init.unshift(vars.id_var)
      if (column_init.indexOf(vars.year_var) < 0) column_init.unshift(vars.year_var)

      // filter out the columns (if specified)
      column_init.forEach(function(c){
        if (vars.keys[c] || c == vars.text_var) {
          columns.push(c)
          titles.push(vars.text_format(c))
        }
      })

      csv_to_return.push(titles);

      if (vars.type == "tree_map") {

        var arr = []

        function flatted_children(c) {
          if (c.children && !vars.depth || (c.children && vars.depth && vars.nesting.indexOf(vars.depth)+1 != vars.depth)) {
            c.children.forEach(function(c2){
              flatted_children(c2)
            })
          }
          else {
            arr.push(c)
          }
        }

        flatted_children(vars.data)

      }
      else if (vars.data instanceof Array) {
        var arr = vars.data
      }
      else {
        var arr = d3.values(vars.data)
      }

      arr.forEach(function(d){

        var ret = []
        columns.forEach(function(c){
          ret.push(find_variable(d,c))
        })
        csv_to_return.push(ret)
      })
      return csv_to_return;
    }
    return chart;
  };

  chart.csv_columns = function(x) {
    if (!arguments.length) return vars.csv_columns;
    vars.csv_columns = x;
    return chart;
  };

  chart.coords = function(x) {
    if (!arguments.length) return vars.coords;
    vars.coord_change = true
    x.objects[Object.keys(x.objects)[0]].geometries.forEach(function(f){
      f.id = f[vars.id_var]
    });
    vars.coords = topojson.feature(x, x.objects[Object.keys(x.objects)[0]]).features

    function polygon(ring) {
      var polygon = [ring];
      ring.push(ring[0]); // add closing coordinate
      if (d3.geo.area({type: "Polygon", coordinates: polygon}) > 2 * Math.PI) ring.reverse(); // fix winding order
      return polygon;
    }

    var selectedStates = {type: "GeometryCollection", geometries: x.objects[Object.keys(x.objects)[0]].geometries},
        selectionBoundary = topojson.mesh(x, selectedStates, function(a, b) { return a === b; })

    vars.boundaries = {type: "MultiPolygon", coordinates: selectionBoundary.coordinates.map(polygon)};

    return chart;
  };

  chart.depth = function(x) {
    if (!arguments.length) return vars.depth;
    vars.depth = x;
    return chart;
  };

  chart.descs = function(x) {
    if (!arguments.length) return vars.descs;
    vars.descs = x;
    return chart;
  };

  chart.dev = function(x) {
    if (!arguments.length) return vars.dev;
    vars.dev = x;
    return chart;
  };

  chart.donut = function(x) {
    if (!arguments.length) return vars.donut;
    if (typeof x == "boolean")  vars.donut = x;
    else if (x === "false") vars.donut = false;
    else vars.donut = true;
    return chart;
  };

  chart.else_var = function(x) {
    if (!arguments.length) return vars.else_var;
    vars.else_var = x;
    return chart;
  };

  chart.error = function(x) {
    if (!arguments.length) return error
    error = x
    return chart
  };

  chart.filter = function(x) {
    if (!arguments.length) return vars.filter;
    // if we're given an array then overwrite the current filter var
    if(x instanceof Array){
      vars.filter = x;
    }
    // otherwise add/remove it from array
    else {
      // if element is in the array remove it
      if(vars.filter.indexOf(x) > -1){
        vars.filter.splice(vars.filter.indexOf(x), 1)
      }
      // if element is in the solo array remove it and add to this one
      else if(vars.solo.indexOf(x) > -1){
        vars.solo.splice(vars.solo.indexOf(x), 1)
        vars.filter.push(x)
      }
      // element not in current filter so add it
      else {
        vars.filter.push(x)
      }
    }
    filter_change = true;
    return chart;
  };

  chart.footer = function(x) {
    if (!arguments.length) return vars.footer;
    vars.footer = x;
    return chart;
  };

  chart.font = function(x) {
    if (!arguments.length) return vars.font;
    vars.font = x;
    return chart;
  };

  chart.font_weight = function(x) {
    if (!arguments.length) return vars.font_weight;
    vars.font_weight = x;
    return chart;
  };

  chart.group_bgs = function(x) {
    if (!arguments.length) return vars.group_bgs;
    if (typeof x == "boolean")  vars.group_bgs = x;
    else if (x === "false") vars.group_bgs = false;
    else vars.group_bgs = true;
    return chart;
  };

  chart.grouping = function(x) {
    if (!arguments.length) return vars.grouping;
    vars.grouping = x;
    return chart;
  };

  chart.height = function(x) {
    if (!arguments.length) return vars.svg_height;
    vars.svg_height = x;
    return chart;
  };

  chart.highlight = function(value) {
    if (!arguments.length) return vars.highlight;
    vars.highlight = value;
    return chart;
  };

  chart.icon_style = function(x) {
    if (!arguments.length) return vars.icon_style;
    vars.icon_style = x;
    return chart;
  };

  chart.id_var = function(x) {
    if (!arguments.length) return vars.id_var;
    vars.id_var = x;
    return chart;
  };

  chart.labels = function(x) {
    if (!arguments.length) return vars.labels;
    vars.labels = x;
    return chart;
  };

  chart.layout = function(x) {
    if (!arguments.length) return vars.layout;
    vars.layout = x;
    return chart;
  };

  chart.links = function(x) {
    if (!arguments.length) return vars.links;
    links = x;
    return chart;
  };

  chart.info_style = function(x) {
    if (!arguments.length) return vars.info_style;
    vars.info_style = x;
    return chart;
  };

  chart.mirror_axis = function(x) {
    if (!arguments.length) return vars.mirror_axis;
    vars.mirror_axis = x;
    return chart;
  };

  chart.name_array = function(x) {
    if (!arguments.length) return vars.name_array;
    vars.name_array = x;
    return chart;
  };

  chart.nesting = function(x) {
    if (!arguments.length) return vars.nesting;
    vars.nesting = x;
    return chart;
  };

  chart.nesting_aggs = function(x) {
    if (!arguments.length) return vars.nesting_aggs;
    vars.nesting_aggs = x;
    return chart;
  };

  chart.nodes = function(x) {
    if (!arguments.length) return vars.nodes;
    nodes = x;
    return chart;
  };

  chart.number_format = function(x) {
    if (!arguments.length) return vars.number_format;
    vars.number_format = x;
    return chart;
  };

  chart.order = function(x) {
    if (!arguments.length) return vars.order;
    vars.order = x;
    return chart;
  };

  chart.scroll_zoom = function(x) {
    if (!arguments.length) return vars.scroll_zoom;
    vars.scroll_zoom = x;
    return chart;
  };

  chart.size_scale = function(x) {
    if (!arguments.length) return vars.size_scale_type;
    vars.size_scale_type = x;
    return chart;
  };

  chart.solo = function(x) {
    if (!arguments.length) return vars.solo;
    // if we're given an array then overwrite the current filter var
    if(x instanceof Array){
      vars.solo = x;
    }
    // otherwise add/remove it from array
    else {
      // if element is in the array remove it
      if(vars.solo.indexOf(x) > -1){
        vars.solo.splice(vars.solo.indexOf(x), 1)
      }
      // else, add it
      else {
        vars.solo.push(x)
      }
    }
    solo_change = true
    return chart;
  };

  chart.sort = function(x) {
    if (!arguments.length) return vars.sort;
    vars.sort = x;
    return chart;
  };

  chart.spotlight = function(x) {
    if (!arguments.length) return vars.spotlight;
    if (typeof x == "boolean")  vars.spotlight = x;
    else if (x === "false") vars.spotlight = false;
    else vars.spotlight = true;
    return chart;
  };

  chart.stack_type = function(x) {
    if (!arguments.length) return vars.stack_type;
    vars.stack_type = x;
    return chart;
  };

  chart.static_axes = function(x) {
    if (!arguments.length) return static_axes;
    static_axes = x;
    return chart;
  };

  chart.sub_title = function(x) {
    if (!arguments.length) return vars.sub_title;
    vars.sub_title = x;
    return chart;
  };

  chart.text_format = function(x) {
    if (!arguments.length) return vars.text_format;
    vars.text_format = x;
    return chart;
  };

  chart.text_var = function(x) {
    if (!arguments.length) return vars.text_var;
    vars.text_var = x;
    return chart;
  };

  chart.title = function(x) {
    if (!arguments.length) return vars.title;
    vars.title = x;
    return chart;
  };

  chart.title_center = function(x) {
    if (!arguments.length) return vars.title_center;
    vars.title_center = x;
    return chart;
  };

  chart.title_height = function(x) {
    if (!arguments.length) return vars.title_height;
    vars.title_height = x;
    return chart;
  };

  chart.title_width = function(x) {
    if (!arguments.length) return vars.title_width;
    vars.title_width = x;
    return chart;
  };

  chart.tooltip_info = function(x) {
    if (!arguments.length) return vars.tooltip_info;
    vars.tooltip_info = x;
    return chart;
  };

  chart.total_bar = function(x) {
    if (!arguments.length) return vars.total_bar;
    vars.total_bar = x;
    return chart;
  };

  chart.total_var = function(x) {
    if (!arguments.length) return vars.total_var;
    vars.total_var = x;
    return chart;
  };

  chart.type = function(x) {
    if (!arguments.length) return vars.type;
    vars.type = x;
    return chart;
  };

  chart.value_var = function(x) {
    if (!arguments.length) return vars.value_var;
    vars.value_var = x;
    value_change = true;
    return chart;
  };

  chart.width = function(x) {
    if (!arguments.length) return vars.svg_width;
    vars.svg_width = x;
    return chart;
  };

  chart.xaxis_domain = function(x) {
    if (!arguments.length) return vars.xaxis_domain;
    xaxis_domain = x;
    return chart;
  };

  chart.xaxis_val = function(x) {
    if (!arguments.length) return vars.xaxis_val;
    vars.xaxis_val = x;
    return chart;
  };

  chart.xaxis_var = function(x) {
    if (!arguments.length) return vars.xaxis_var;
    vars.xaxis_var = x;
    axis_change = true;
    return chart;
  };

  chart.xaxis_scale = function(x) {
    if (!arguments.length) return vars.xscale_type;
    vars.xscale_type = x;
    return chart;
  };

  chart.yaxis_domain = function(x) {
    if (!arguments.length) return vars.yaxis_domain;
    yaxis_domain = x.reverse();
    return chart;
  };

  chart.yaxis_val = function(x) {
    if (!arguments.length) return vars.yaxis_val;
    vars.yaxis_val = x;
    return chart;
  };

  chart.yaxis_var = function(x) {
    if (!arguments.length) return vars.yaxis_var;
    vars.yaxis_var = x;
    axis_change = true;
    return chart;
  };

  chart.yaxis_scale = function(x) {
    if (!arguments.length) return vars.yscale_type;
    vars.yscale_type = x;
    return chart;
  };

  chart.year = function(x) {
    if (!arguments.length) return vars.year;
    vars.year = x;
    return chart;
  };

  chart.year_var = function(x) {
    if (!arguments.length) return vars.year_var;
    vars.year_var = x;
    return chart;
  };

  //===================================================================

  zoom_controls = function() {
    d3.select("#zoom_controls").remove()
    if (!vars.small) {
      // Create Zoom Controls
      var zoom_enter = vars.parent.append("div")
        .attr("id","zoom_controls")
        .style("top",(vars.margin.top+5)+"px")

      zoom_enter.append("div")
        .attr("id","zoom_in")
        .attr("unselectable","on")
        .on(d3plus_old.evt.click,function(){ vars.zoom("in") })
        .text("+")

      zoom_enter.append("div")
        .attr("id","zoom_out")
        .attr("unselectable","on")
        .on(d3plus_old.evt.click,function(){ vars.zoom("out") })
        .text("-")

      zoom_enter.append("div")
        .attr("id","zoom_reset")
        .attr("unselectable","on")
        .on(d3plus_old.evt.click,function(){
          vars.zoom("reset")
          vars.update()
        })
        .html("\&#8634;")
    }
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // X/Y Graph System
  //-------------------------------------------------------------------

  var tick_style = {
    "stroke": "#ccc",
    "stroke-width": 1,
    "shape-rendering": "crispEdges"
  }

  var axis_style = {
    "font-size": "12px",
    "fill": "#888"
  }

  var label_style = {
    "font-size": "14px",
    "fill": "#333",
    "text-anchor": "middle"
  }

  vars.x_axis = d3.svg.axis()
    .tickSize(0)
    .tickPadding(20)
    .orient('bottom')
    .tickFormat(function(d, i) {

      if ((vars.xscale_type == "log" && d.toString().charAt(0) == "1")
          || vars.xscale_type != "log") {

        if (vars.xaxis_var == vars.year_var) var text = d;
        else {
          var text = vars.number_format(d,vars.xaxis_var);
        }

        d3.select(this)
          .style(axis_style)
          .attr("transform","translate(-22,3)rotate(-65)")
          .attr("font-family",vars.font)
          .attr("font-weight",vars.font_weight)
          .text(text)

        var height = (Math.cos(25)*this.getBBox().width)
        if (height > vars.graph.yoffset && !vars.small) vars.graph.yoffset = height

        var tick_offset = 10
        var tick_opacity = 1
      }
      else {
        var text = null
        var tick_offset = 5
        var tick_opacity = 0.25
      }

      if (!(tick_offset == 5 && vars.xaxis_var == vars.year_var)) {

        var bgtick = d3.select(this.parentNode).selectAll("line.tick")
          .data([d])

        bgtick.enter().append("line")
          .attr("class","tick")
          .attr("x1", 0)
          .attr("x2", 0)
          .attr("y1", tick_offset)
          .attr("y2", -vars.graph.height)
          .attr(tick_style)
          .attr("opacity",tick_opacity)

        bgtick.transition().duration(d3plus_old.timing)
          .attr("y1", tick_offset)
          .attr("y2", -vars.graph.height)
          .attr("opacity",tick_opacity)

      }

      return text;

    });

  vars.y_axis = d3.svg.axis()
    .tickSize(0)
    .tickPadding(15)
    .orient('left')
    .tickFormat(function(d, i) {

      if ((vars.yscale_type == "log" && d.toString().charAt(0) == "1")
          || vars.yscale_type != "log") {

        if (vars.yaxis_var == vars.year_var) var text = d;
        else if (vars.layout == "share" && vars.type == "stacked") {
          var text = d*100+"%"
        }
        else {
          var text = vars.number_format(d,vars.yaxis_var);
        }

        d3.select(this)
          .style(axis_style)
          .attr("font-family",vars.font)
          .attr("font-weight",vars.font_weight)
          .text(text)

        var width = this.getBBox().width
        if (width > vars.graph.offset && !vars.small) vars.graph.offset = width

        var tick_offset = -10
        var tick_opacity = 1
      }
      else {
        var text = null
        var tick_offset = -5
        var tick_opacity = 0.25
      }

      if (!(tick_offset == -5 && vars.yaxis_var == vars.year_var)) {

        var bgtick = d3.select(this.parentNode).selectAll("line.tick")
          .data([d])

        bgtick.enter().append("line")
          .attr("class","tick")
          .attr("x1", tick_offset)
          .attr("x2", vars.graph.width)
          .attr(tick_style)
          .attr("opacity",tick_opacity)

        bgtick.transition().duration(d3plus_old.timing)
          .attr("x1", tick_offset)
          .attr("x2", vars.graph.width)
          .attr("opacity",tick_opacity)

      }

      return text;

    });

  graph_update = function() {

    // create label group
    var axes = vars.parent_enter.append("g")
      .attr("class","axes_labels")

    // Enter Graph
    vars.chart_enter = vars.parent_enter.append("g")
      .attr("class", "chart")
      .attr("transform", "translate(" + vars.graph.margin.left + "," + vars.graph.margin.top + ")")

    vars.chart_enter.append("rect")
      .style('fill','#fafafa')
      .attr("id","background")
      .attr('x',0)
      .attr('y',0)
      .attr('width', vars.graph.width)
      .attr('height', vars.graph.height)
      .attr("stroke-width",1)
      .attr("stroke","#ccc")
      .attr("shape-rendering","crispEdges")

    vars.chart_enter.append("path")
      .attr("id","mirror")
      .attr("fill","#000")
      .attr("fill-opacity",0.03)
      .attr("stroke-width",1)
      .attr("stroke","#ccc")
      .attr("stroke-dasharray","10,10")
      .attr("opacity",0)

    // Create X axis
    vars.chart_enter.append("g")
      .attr("transform", "translate(0," + vars.graph.height + ")")
      .attr("class", "xaxis")
      .call(vars.x_axis.scale(vars.x_scale))

    // Create Y axis
    vars.chart_enter.append("g")
      .attr("class", "yaxis")
      .call(vars.y_axis.scale(vars.y_scale))

    var labelx = vars.width/2
    if (!vars.title_center) labelx += vars.graph.margin.left

    // Create X axis label
    axes.append('text')
      .attr('class', 'x_axis_label')
      .attr('x', labelx)
      .attr('y', vars.height-10)
      .text(vars.text_format(vars.xaxis_var))
      .attr("font-family",vars.font)
      .attr("font-weight",vars.font_weight)
      .attr(label_style)

    // Create Y axis label
    axes.append('text')
      .attr('class', 'y_axis_label')
      .attr('y', 15)
      .attr('x', -(vars.graph.height/2+vars.graph.margin.top))
      .text(vars.text_format(vars.yaxis_var))
      .attr("transform","rotate(-90)")
      .attr("font-family",vars.font)
      .attr("font-weight",vars.font_weight)
      .attr(label_style)

    // Set Y axis
    vars.graph.offset = 0
    d3.select("g.yaxis")
      .call(vars.y_axis.scale(vars.y_scale))

    vars.graph.margin.left += vars.graph.offset
    vars.graph.width -= vars.graph.offset
    vars.x_scale.range([0,vars.graph.width])

    // Set X axis
    vars.graph.yoffset = 0
    d3.select("g.xaxis")
      .call(vars.x_axis.scale(vars.x_scale))

    vars.graph.height -= vars.graph.yoffset

    // Update Graph
    d3.select(".chart").transition().duration(vars.graph.timing)
      .attr("transform", "translate(" + vars.graph.margin.left + "," + vars.graph.margin.top + ")")
      .attr("opacity",function(){
        if (vars.data.length == 0) return 0
        else return 1
      })
      .select("rect#background")
        .attr('width', vars.graph.width)
        .attr('height', vars.graph.height)

    d3.select("#mirror").transition().duration(vars.graph.timing)
      .attr("opacity",function(){
        return vars.mirror_axis ? 1 : 0
      })
      .attr("d",function(){
        return "M "+vars.graph.width+" "+vars.graph.height+" L 0 "+vars.graph.height+" L "+vars.graph.width+" 0 Z"
      })

    // Update X axis
    if (vars.type == "stacked") {
      vars.y_scale.range([vars.graph.height,0]);
    }
    else {
      vars.y_scale.range([0, vars.graph.height]);
    }

    d3.select("g.yaxis")
      .call(vars.y_axis.scale(vars.y_scale))

    d3.select("g.xaxis")
      .attr("transform", "translate(0," + vars.graph.height + ")")
      .call(vars.x_axis.scale(vars.x_scale))

    d3.select("g.xaxis").selectAll("g.tick").select("text")
      .style("text-anchor","end")

    // Update X axis label
    d3.select(".x_axis_label")
      .attr('x', labelx)
      .attr('y', vars.height-10)
      .attr("opacity",function(){
        if (vars.data.length == 0) return 0
        else return 1
      })
      .text(vars.text_format(vars.xaxis_var))

    // Update Y axis label
    d3.select(".y_axis_label")
      .attr('y', 15)
      .attr('x', -(vars.graph.height/2+vars.graph.margin.top))
      .attr("opacity",function(){
        if (vars.data.length == 0) return 0
        else return 1
      })
      .text(vars.text_format(vars.yaxis_var))

    // Axis Dotted Lines
    vars.chart_enter.append("line")
      .attr("id","y_axis_val")
      .attr("x1",0)
      .attr("x2",vars.graph.width)
      .attr("stroke","#ccc")
      .attr("stroke-width",3)
      .attr("stroke-dasharray","10,10")

    vars.chart_enter.append("text")
      .attr("id","y_axis_val_text")
      .style(axis_style)
      .attr("text-align","start")
      .attr("x","10px")

    if (vars.yaxis_val && typeof vars.yaxis_val == "object") {
      var y_name = Object.keys(vars.yaxis_val)[0]
      var y_val = vars.yaxis_val[y_name]
    }
    else if (vars.yaxis_val) {
      var y_val = vars.yaxis_val, y_name = null
    }
    else {
      var y_val = null, y_name = null
    }

    if (typeof y_val == "string") y_val = parseFloat(y_val)

    d3.select("#y_axis_val").transition().duration(vars.graph.timing)
      .attr("y1",vars.y_scale(y_val))
      .attr("y2",vars.y_scale(y_val))
      .attr("opacity",function(d){
        var yes = y_val > vars.y_scale.domain()[1] && y_val < vars.y_scale.domain()[0]
        return y_val != null && yes ? 1 : 0
      })

    d3.select("#y_axis_val_text").transition().duration(vars.graph.timing)
      .text(function(){
        if (y_val != null) {
          var v = vars.number_format(y_val,y_name)
          return y_name ? vars.text_format(y_name) + ": " + v : v
        }
        else return null
      })
      .attr("y",(vars.y_scale(y_val)+20)+"px")


    vars.chart_enter.append("line")
      .attr("id","x_axis_val")
      .attr("y1",0)
      .attr("y2",vars.graph.height)
      .attr("stroke","#ccc")
      .attr("stroke-width",3)
      .attr("stroke-dasharray","10,10")

    vars.chart_enter.append("text")
      .attr("id","x_axis_val_text")
      .style(axis_style)
      .attr("text-align","start")
      .attr("y",(vars.graph.height-8)+"px")

    if (vars.xaxis_val && typeof vars.xaxis_val == "object") {
      var x_name = Object.keys(vars.xaxis_val)[0]
      var x_val = vars.xaxis_val[x_name]
    }
    else if (vars.xaxis_val) {
      var x_val = vars.xaxis_val, x_name = null
    }
    else {
      var x_val = null, x_name = null
    }

    if (typeof x_val == "string") x_val = parseFloat(x_val)

    d3.select("#x_axis_val").transition().duration(vars.graph.timing)
      .attr("x1",vars.x_scale(x_val))
      .attr("x2",vars.x_scale(x_val))
      .attr("opacity",function(d){
        var yes = x_val > vars.x_scale.domain()[0] && x_val < vars.x_scale.domain()[1]
        return x_val != null && yes ? 1 : 0
      })

    d3.select("#x_axis_val_text").transition().duration(vars.graph.timing)
      .text(function(){
        if (x_val != null) {
          var v = vars.number_format(x_val,x_name)
          return x_name ? vars.text_format(x_name) + ": " + v : v
        }
        else return null
      })
      .attr("x",(vars.x_scale(x_val)+10)+"px")

    // Move titles
    update_titles()

    vars.graph.timing = d3plus_old.timing

  }

  //===================================================================

  return chart;
};
d3plus_old.network = function(vars) {

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Function that handles the zooming and panning of the visualization
  //-------------------------------------------------------------------

  vars.zoom = function(direction) {

    var zoom_extent = zoom_behavior.scaleExtent()
    // If d3 zoom event is detected, use it!
    if(!direction) {
      evt_scale = d3.event.scale
      translate = d3.event.translate
    }
    else {
      if (direction == "in") {
        if (zoom_behavior.scale() > zoom_extent[1]/2) multiplier = zoom_extent[1]/zoom_behavior.scale()
        else multiplier = 2
      }
      else if (direction == "out") {
        if (zoom_behavior.scale() < zoom_extent[0]*2) multiplier = zoom_extent[0]/zoom_behavior.scale()
        else multiplier = 0.5
      }
      else if (direction == vars.highlight) {
        var x_bounds = [scale.x(highlight_extent.x[0]),scale.x(highlight_extent.x[1])],
            y_bounds = [scale.y(highlight_extent.y[0]),scale.y(highlight_extent.y[1])]

        if (x_bounds[1] > (vars.width-info_width-5)) var offset_left = info_width+32
        else var offset_left = 0

        var w_zoom = (vars.width-info_width-10)/(x_bounds[1]-x_bounds[0]),
            h_zoom = vars.height/(y_bounds[1]-y_bounds[0])

        if (w_zoom < h_zoom) {
          x_bounds = [x_bounds[0]-(max_size*4),x_bounds[1]+(max_size*4)]
          evt_scale = (vars.width-info_width-10)/(x_bounds[1]-x_bounds[0])
          if (evt_scale > zoom_extent[1]) evt_scale = zoom_extent[1]
          offset_x = -(x_bounds[0]*evt_scale)
          offset_y = -(y_bounds[0]*evt_scale)+((vars.height-((y_bounds[1]-y_bounds[0])*evt_scale))/2)
        } else {
          y_bounds = [y_bounds[0]-(max_size*2),y_bounds[1]+(max_size*2)]
          evt_scale = vars.height/(y_bounds[1]-y_bounds[0])
          if (evt_scale > zoom_extent[1]) evt_scale = zoom_extent[1]
          offset_x = -(x_bounds[0]*evt_scale)+(((vars.width-info_width-10)-((x_bounds[1]-x_bounds[0])*evt_scale))/2)
          offset_y = -(y_bounds[0]*evt_scale)
        }

        translate = [offset_x+offset_left,offset_y]
      }
      else if (direction == "reset") {
        vars.highlight = null
        translate = [0,0]
        evt_scale = 1
      }

      if (direction == "in" || direction == "out") {
        var trans = d3.select("g.viz")[0][0].getAttribute('transform')
        if (trans) {
          trans = trans.split('(')
          var coords = trans[1].split(')')
          coords = coords[0].replace(' ',',')
          coords = coords.substring(0,trans[1].length-6).split(',')
          offset_x = parseFloat(coords[0])
          offset_y = coords.length == 2 ? parseFloat(coords[1]) : parseFloat(coords[0])
          zoom_var = parseFloat(trans[2].substring(0,trans[2].length-1))
        } else {
          offset_x = 0
          offset_y = 0
          zoom_var = 1
        }
        if ((multiplier > 0.5 && multiplier <= 1) && direction == "out") {
          offset_x = 0
          offset_y = 0
        } else {
          offset_x = (vars.width/2)-(((vars.width/2)-offset_x)*multiplier)
          offset_y = (vars.height/2)-(((vars.height/2)-offset_y)*multiplier)
        }

        translate = [offset_x,offset_y]
        evt_scale = zoom_var*multiplier
      }

    }

    zoom_behavior.translate(translate).scale(evt_scale)

    // Auto center visualization
    if (translate[0] > 0) translate[0] = 0
    else if (translate[0] < -((vars.width*evt_scale)-vars.width)) {
      translate[0] = -((vars.width*evt_scale)-vars.width)
    }
    if (translate[1] > 0) translate[1] = 0
    else if (translate[1] < -((vars.height*evt_scale)-vars.height)) translate[1] = -((vars.height*evt_scale)-vars.height)
    if (!direction) {
      if (d3.event.sourceEvent.type == "mousewheel" || d3.event.sourceEvent.type == "mousemove") {
        var viz_timing = d3.select(".viz")
      } else {
        var viz_timing = d3.select(".viz").transition().duration(d3plus_old.timing)
      }
    } else {
      var viz_timing = d3.select(".viz").transition().duration(d3plus_old.timing)
    }
    viz_timing.attr("transform","translate(" + translate + ")" + "scale(" + evt_scale + ")")

  }

  //===================================================================

  vars.update = function() {
    // If highlight variable has ACTUALLY changed, do this stuff
    if (last_highlight != vars.highlight) {

      // Remove all tooltips on page
      d3plus_old.tooltip.remove(vars.type)
      d3.select("g.highlight").selectAll("*").remove()
      d3.select("g.hover").selectAll("*").remove()

      if (vars.highlight) {

        create_nodes("highlight")

      }
      else {
        vars.zoom("reset");
      }

      node.call(node_color)

      last_highlight = vars.highlight
    }

    // If hover variable has ACTUALLY changed, do this stuff
    if (last_hover != hover) {

      d3.select("g.hover").selectAll("*").remove()

      // If a new hover element exists, create it
      if (hover && hover != vars.highlight) {
        create_nodes("hover")
      }

      // Set last_hover to the new hover ID
      last_hover = hover
    }

    function create_nodes(group) {

      if (group == "highlight") {
        var c = vars.highlight
      }
      else {
        var c = hover
      }

      var node_data = vars.nodes.filter(function(x){return x[vars.id_var] == c})

      if (group == "highlight" || !vars.highlight) {

        var prim_nodes = [],
            prim_links = [];

        if (vars.connections[c]) {
          vars.connections[c].forEach(function(n){
            prim_nodes.push(vars.nodes.filter(function(x){return x[vars.id_var] == n[vars.id_var]})[0])
          })
          prim_nodes.forEach(function(n){
            prim_links.push({"source": node_data[0], "target": n})
          })
        }

        var node_data = prim_nodes.concat(node_data)
        highlight_extent.x = d3.extent(d3.values(node_data),function(v){return v.x;}),
        highlight_extent.y = d3.extent(d3.values(node_data),function(v){return v.y;})

        if (group == "highlight") {
          vars.zoom(c);

          make_tooltip = function(html) {

            if (typeof html == "string") html = "<br>"+html

            if (scale.x(highlight_extent.x[1]) > (vars.width-info_width-10)) {
              var x_pos = 30
            }
            else {
              var x_pos = vars.width-info_width-5
            }

            var prod = vars.nodes.filter(function(n){return n[vars.id_var] == vars.highlight})[0]

            var tooltip_data = get_tooltip_data(vars.highlight)

            var tooltip_appends = "<div class='d3plus_tooltip_data_title'>"
            tooltip_appends += vars.text_format("Primary Connections")
            tooltip_appends += "</div>"

            prim_nodes.forEach(function(n){

              var parent = "d3.select(&quot;#"+vars.parent.node().id+"&quot;)"

              tooltip_appends += "<div class='d3plus_network_connection' onclick='"+parent+".call(chart.highlight(&quot;"+n[vars.id_var]+"&quot;))'>"
              tooltip_appends += "<div class='d3plus_network_connection_node'"
              tooltip_appends += " style='"
              tooltip_appends += "background-color:"+fill_color(n)+";"
              tooltip_appends += "border-color:"+stroke_color(n)+";"
              tooltip_appends += "'"
              tooltip_appends += "></div>"
              tooltip_appends += "<div class='d3plus_network_connection_name'>"
              tooltip_appends += find_variable(n[vars.id_var],vars.text_var)
              tooltip_appends += "</div>"
              tooltip_appends += "</div>"
            })

            d3plus_old.tooltip.remove(vars.type)

            d3plus_old.tooltip.create({
              "data": tooltip_data,
              "title": find_variable(vars.highlight,vars.text_var),
              "color": find_color(vars.highlight),
              "icon": find_variable(vars.highlight,"icon"),
              "style": vars.icon_style,
              "x": x_pos,
              "y": vars.margin.top+5,
              "width": info_width,
              "max_height": vars.height-10,
              "html": tooltip_appends+html,
              "fixed": true,
              "mouseevents": true,
              "parent": vars.parent,
              "background": vars.background,
              "id": vars.type
            })

          }

          var html = vars.click_function ? vars.click_function(vars.highlight) : ""

          if (typeof html == "string") make_tooltip(html)
          else {
            d3.json(html.url,function(data){
              html = html.callback(data)
              make_tooltip(html)
            })
          }

        }

        d3.select("g."+group).selectAll("line")
          .data(prim_links).enter().append("line")
            .attr("pointer-events","none")
            .attr("stroke",vars.highlight_color)
            .attr("stroke-width",2)
            .call(link_position)
      }

      var node_groups = d3.select("g."+group).selectAll("g")
        .data(node_data).enter().append("g")
          .attr("class","hover_node")
          .call(node_events)

      node_groups
        .append("circle")
          .attr("class","bg")
          .call(node_size)
          .call(node_position)
          .call(node_stroke)
          .attr("stroke",vars.highlight_color);

      node_groups
        .append("circle")
          .call(node_size)
          .call(node_position)
          .call(node_stroke)
          .call(node_color)
          .call(create_label);
    }

  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Private Variables
  //-------------------------------------------------------------------

  var dragging = false,
      offset_top = 0,
      offset_left = 0,
      info_width = 300,
      zoom_behavior = d3.behavior.zoom().scaleExtent([1, 16]),
      scale = {},
      hover = null,
      last_hover = null,
      last_highlight = null,
      highlight_extent = {};

  //===================================================================

  d3plus_old.tooltip.remove(vars.type)
  var x_range = d3.extent(d3.values(vars.nodes), function(d){return d.x})
  var y_range = d3.extent(d3.values(vars.nodes), function(d){return d.y})
  var aspect = (x_range[1]-x_range[0])/(y_range[1]-y_range[0])

  // Define Scale
  if (aspect > vars.width/vars.height) {
    var viz_height = vars.width/aspect, viz_width = vars.width
    offset_top = ((vars.height-viz_height)/2)
  } else {
    var viz_width = vars.height*aspect, viz_height = vars.height
    offset_left = ((vars.width-viz_width)/2)
  }

  // x scale
  scale.x = d3.scale.linear()
    .domain(x_range)
    .range([offset_left, vars.width-offset_left])
  // y scale
  scale.y = d3.scale.linear()
    .domain(y_range)
    .range([offset_top, vars.height-offset_top])

  var val_range = d3.extent(d3.values(vars.data), function(d){
    return d[vars.value_var] ? d[vars.value_var] : null
  });

  if (typeof val_range[0] == "undefined") val_range = [1,1]

  var distances = []
  vars.nodes.forEach(function(n1){
    vars.nodes.forEach(function(n2){
      if (n1 != n2) {
        var xx = Math.abs(scale.x(n1.x)-scale.x(n2.x));
        var yy = Math.abs(scale.y(n1.y)-scale.y(n2.y));
        distances.push(Math.sqrt((xx*xx)+(yy*yy)))
      }
    })
  })

  var max_size = d3.min(distances,function(d){return d*0.75})
  var min_size = 4;
  // return
  // x scale
  scale.x.range([offset_left+(max_size*1.5), vars.width-(max_size*1.5)-offset_left])
  // y scale
  scale.y.range([offset_top+(max_size*1.5), vars.height-(max_size*1.5)-offset_top])

  // size scale
  scale.size = d3.scale.log()
    .domain(val_range)
    .range([min_size, max_size])

  // Create viz group on vars.parent_enter
  var viz_enter = vars.parent_enter.append("g")
    .call(zoom_behavior.on("zoom",function(){ vars.zoom(); }))
    .on(d3plus_old.evt.down,function(d){
      dragging = true
    })
    .on(d3plus_old.evt.up,function(d){
      dragging = false
    })
    .append('g')
      .attr('class','viz')

  viz_enter.append('rect')
    .attr('class','overlay')
    .attr("fill","transparent");

  d3.select("rect.overlay")
    .attr("width", vars.width)
    .attr("height", vars.height)
    .on(d3plus_old.evt.over,function(d){
      if (!vars.highlight && hover) {
        hover = null;
        vars.update();
      }
    })
    .on(d3plus_old.evt.click,function(d){
      // vars.highlight = null;
      // vars.zoom("reset");
      // vars.update();
    })
    .on(d3plus_old.evt.move,function(d){
      if (zoom_behavior.scale() > 1) {
        d3.select(this).style("cursor","move")
        if (dragging && !d3plus_old.ie) {
          d3.select(this).style("cursor","-moz-grabbing")
          d3.select(this).style("cursor","-webkit-grabbing")
        }
        else if (!d3plus_old.ie) {
          d3.select(this).style("cursor","-moz-grab")
          d3.select(this).style("cursor","-webkit-grab")
        }
      }
      else {
        d3.select(this).style("cursor","default")
      }
    });

  if (!vars.scroll_zoom) {
    d3.select(d3.select("g.viz").node().parentNode)
      .on("mousewheel.zoom", null)
      .on("DOMMouseScroll.zoom", null)
      .on("wheel.zoom", null)
  }

  viz_enter.append('g')
    .attr('class','links')

  viz_enter.append('g')
    .attr('class','nodes')

  viz_enter.append('g')
    .attr('class','highlight')

  viz_enter.append('g')
    .attr('class','hover')

  zoom_controls();

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // New nodes and links enter, initialize them here
  //-------------------------------------------------------------------
  if (!vars.data) var nodes = []
  else var nodes = vars.nodes
  var node = d3.select("g.nodes").selectAll("circle.node")
    .data(nodes, function(d) { return d[vars.id_var]; })

  node.enter().append("circle")
    .attr("class","node")
    .attr("r",0)
    .call(node_position)
    .call(node_color)
    .call(node_stroke);

  if (!vars.data) var links = []
  else var links = vars.links
  var link = d3.select("g.links").selectAll("line.link")
    .data(links, function(d) { return d.source[vars.id_var] + "-" + d.target[vars.id_var]; })

  link.enter().append("line")
    .attr("class","link")
    .attr("pointer-events","none")
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .call(link_position);

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Update, for nodes and links that are already in existance
  //-------------------------------------------------------------------

  node
    .on(d3plus_old.evt.over, function(d){
      if (!dragging) {
        hover = d[vars.id_var];
        vars.update();
      }
    });

  node.transition().duration(d3plus_old.timing)
    .call(node_size)
    .call(node_stroke)
    .call(node_position)
    .call(node_color);

  link
    .call(link_events);

  link.transition().duration(d3plus_old.timing)
    .attr("stroke", "#dedede")
    .call(link_position);

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Exit, for nodes and links that are being removed
  //-------------------------------------------------------------------

  node.exit().transition().duration(d3plus_old.timing)
    .attr("r",0)
    .remove()

  link.exit().transition().duration(d3plus_old.timing)
    .attr("stroke", "white")
    .remove()

  //===================================================================

  if (vars.highlight) {
    var present = false;
    vars.nodes.forEach(function(d){
      if (d[vars.id_var] == vars.highlight) present = true;
    })
    if (!present) {
      vars.highlight = null;
    }
  }
  vars.update();

  function link_position(l) {
    l
      .attr("x1", function(d) { return scale.x(d.source.x); })
      .attr("y1", function(d) { return scale.y(d.source.y); })
      .attr("x2", function(d) { return scale.x(d.target.x); })
      .attr("y2", function(d) { return scale.y(d.target.y); })
      .attr("vector-effect","non-scaling-stroke")
  }

  function link_events(l) {
    l
      .on(d3plus_old.evt.click,function(d){
        vars.highlight = null;
        vars.zoom("reset");
        vars.update();
      })
  }

  function node_position(n) {
    n
      .attr("cx", function(d) { return scale.x(d.x); })
      .attr("cy", function(d) { return scale.y(d.y); })
  }

  function node_size(n) {
    n
      .attr("r", function(d) {
        var value = find_variable(d[vars.id_var],vars.value_var)
        return value > 0 ? scale.size(value) : scale.size(val_range[0])
      })
  }

  function node_stroke(b) {
    b
      .attr("stroke-width", function(d){

        // Determine which type of node we're dealing with, based on "g" class
        var parent_group = this.parentNode.className.baseVal
        var class_name = this.className.baseVal
        // "True" if node is in the highlight or hover groups
        var highlighted = parent_group == "hover_node"
        var bg = class_name == "bg"

        if (bg) {
          if (vars.highlight == d[vars.id_var]) return 6;
          else return 4;
        }
        else if (highlighted) return 0;
        else return 1;
      })
      .attr("vector-effect","non-scaling-stroke")
  }

  function node_color(n) {
    n
      .attr("fill", function(d){

        // Determine which type of node we're dealing with, based on "g" class
        var parent_group = this.parentNode.className.baseVal

        // "True" if node is a background node and a node has been highlighted
        var background_node = vars.highlight && parent_group == "nodes"
        // "True" if node is in the highlight or hover groups
        var highlighted = parent_group == "hover_node"
        // "True" if vars.spotlight is true and node vars.active_var is false
        var active = find_variable(d[vars.id_var],vars.active_var)
        var hidden = vars.spotlight && !active
        // Grey out nodes that are in the background or hidden by spotlight,
        // otherwise, use the active_color function
        if ((background_node || hidden) && !highlighted) {
          return "#efefef"
        }
        else {
          var active = find_variable(d[vars.id_var],vars.active_var)
          if (active) this.parentNode.appendChild(this)
          return fill_color(d)
        }

      })
      .attr("stroke", function(d){

        // Determine which type of node we're dealing with, based on "g" class
        var parent_group = this.parentNode.className.baseVal;

        // "True" if node is a background node and a node has been highlighted
        var background_node = vars.highlight && parent_group == "nodes";
        // "True" if node is in the highlight or hover groups
        var highlighted = parent_group == "hover_node"
        // "True" if vars.spotlight is true and node vars.active_var is false
        var active = find_variable(d[vars.id_var],vars.active_var)
        var hidden = vars.spotlight && !active

        if (highlighted) return fill_color(d);
        else if (background_node || hidden) return "#dedede";
        else return stroke_color(d);

      })
  }

  function fill_color(d) {

    // Get elements' color
    var color = find_color(d[vars.id_var])

    // If node is not active, lighten the color
    var active = find_variable(d[vars.id_var],vars.active_var)
    if (!active) {
      var color = d3.hsl(color);
      color.l = 0.95;
    }

    // Return the color
    return color;

  }

  function stroke_color(d) {

    // Get elements' color
    var color = find_color(d[vars.id_var])

    // If node is active, return a darker color, else, return the normal color
    var active = find_variable(d[vars.id_var],vars.active_var)
    return active ? "#333" : color;

  }

  function node_events(n) {
    n
      .on(d3plus_old.evt.over, function(d){

        d3.select(this).style("cursor","pointer")
        if (!d3plus_old.ie) {
          d3.select(this).style("cursor","-moz-zoom-in")
          d3.select(this).style("cursor","-webkit-zoom-in")
        }

        if (d[vars.id_var] == vars.highlight && !d3plus_old.ie) {
          d3.select(this).style("cursor","-moz-zoom-out")
          d3.select(this).style("cursor","-webkit-zoom-out")
        }

        if (d[vars.id_var] != hover) {
          hover = d[vars.id_var];
          vars.update();
        }

      })
      .on(d3plus_old.evt.out, function(d){

        // Returns false if the mouse has moved into a child element.
        // This is used to catch when the mouse moves onto label text.
        var target = d3.event.toElement || d3.event.relatedTarget
        if (target) {
          var id_check = target.__data__[vars.id_var] == d[vars.id_var]
          if (target.parentNode != this && !id_check) {
            hover = null;
            vars.update();
          }
        }
        else {
          hover = null;
          vars.update();
        }

      })
      .on(d3plus_old.evt.click, function(d){

        d3.select(this).style("cursor","auto")

        // If there is no highlighted node,
        // or the hover node is not the highlighted node
        if (!vars.highlight || vars.highlight != d[vars.id_var]) {
          vars.highlight = d[vars.id_var];
        }

        // Else, the user is clicking on the highlighted node.
        else {
          vars.highlight = null;
        }

        vars.update();

      })
  }

  function create_label(n) {
    if (vars.labels) {
      n.each(function(d){

        var font_size = Math.ceil(10/zoom_behavior.scale()),
            padding = font_size/4,
            corner = Math.ceil(3/zoom_behavior.scale())
            value = find_variable(d[vars.id_var],vars.value_var),
            size = value > 0 ? scale.size(value) : scale.size(val_range[0])
        if (font_size < size || d[vars.id_var] == hover || d[vars.id_var] == vars.highlight) {
          d3.select(this.parentNode).append("text")
            .attr("pointer-events","none")
            .attr("x",scale.x(d.x))
            .attr("fill",d3plus_old.utils.text_color(fill_color(d)))
            .attr("font-size",font_size+"px")
            .attr("text-anchor","middle")
            .attr("font-family",vars.font)
            .attr("font-weight",vars.font_weight)
            .each(function(e){
              var th = size < font_size+padding*2 ? font_size+padding*2 : size,
                  tw = ((font_size*5)/th)*(font_size*5)
              var text = find_variable(d[vars.id_var],vars.text_var)
              d3plus_old.utils.wordwrap({
                "text": text,
                "parent": this,
                "width": tw,
                "height": th,
                "padding": 0
              });
              if (!d3.select(this).select("tspan")[0][0]) {
                d3.select(this).remove();
              }
              else {
                finish_label(d3.select(this));
              }
            })
        }

        function finish_label(text) {

          var w = text.node().getBBox().width,
              h = text.node().getBBox().height

          text.attr("y",scale.y(d.y)-(h/2)-(padding/3))

          w = w+(padding*6)
          h = h+(padding*2)

          if (w > size*2) {
            d3.select(text.node().parentNode)
              .insert("rect","circle")
                .attr("class","bg")
                .attr("rx",corner)
                .attr("ry",corner)
                .attr("width",w)
                .attr("height",h)
                .attr("y",scale.y(d.y)-(h/2))
                .attr("x",scale.x(d.x)-(w/2))
                .call(node_stroke)
                .attr("stroke",vars.highlight_color);
            d3.select(text.node().parentNode)
              .insert("rect","text")
                .attr("rx",corner)
                .attr("ry",corner)
                .attr("stroke-width", 0)
                .attr("fill",fill_color(d))
                .attr("width",w)
                .attr("height",h)
                .attr("y",scale.y(d.y)-(h/2))
                .attr("x",scale.x(d.x)-(w/2));
          }
        }

      })

    }
  }

};

d3plus_old.stacked = function(vars) {

  var covered = false

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Helper function used to create stack polygon
  //-------------------------------------------------------------------

  var stack = d3.layout.stack()
    .values(function(d) { return d.values; })
    .x(function(d) { return d[vars.year_var]; })
    .y(function(d) { return d[vars.yaxis_var]; });

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // INIT vars & data munging
  //-------------------------------------------------------------------

  // get max total for sums of each xaxis
  if (!vars.data) vars.data = []

  vars.xaxis_range = d3.extent(vars.years)
  var xaxis_vals = [vars.xaxis_range[0]]
  while (xaxis_vals[xaxis_vals.length-1] < vars.xaxis_range[1]) {
    xaxis_vals.push(xaxis_vals[xaxis_vals.length-1]+1)
  }

  var xaxis_sums = d3.nest()
    .key(function(d){return d[vars.xaxis_var] })
    .rollup(function(leaves){
      return d3.sum(leaves, function(d){return d[vars.yaxis_var];})
    })
    .entries(vars.data)

  // nest data properly according to nesting array
  var nested_data = nest_data();

  var data_max = vars.layout == "share" ? 1 : d3.max(xaxis_sums, function(d){ return d.values; });

  // scales for both X and Y values
  var year_extent = vars.year instanceof Array ? vars.year : d3.extent(xaxis_vals)

  vars.x_scale = d3.scale[vars.xscale_type]()
    .domain(year_extent)
    .range([0, vars.graph.width]);
  // **WARNING reverse scale from 0 - max converts from height to 0 (inverse)
  vars.y_scale = d3.scale[vars.yscale_type]()
    .domain([0, data_max])
    .range([vars.graph.height, 0]);

  graph_update()

  // Helper function unsed to convert stack values to X, Y coords
  var area = d3.svg.area()
    .interpolate(vars.stack_type)
    .x(function(d) { return vars.x_scale(d[vars.year_var]); })
    .y0(function(d) { return vars.y_scale(d.y0); })
    .y1(function(d) { return vars.y_scale(d.y0 + d.y)+1; });

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // LAYERS
  //-------------------------------------------------------------------

  vars.chart_enter.append("clipPath")
    .attr("id","path_clipping")
    .append("rect")
      .attr("width",vars.graph.width)
      .attr("height",vars.graph.height)

  d3.select("#path_clipping rect").transition().duration(d3plus_old.timing)
    .attr("width",vars.graph.width)
    .attr("height",vars.graph.height)
    .attr("x",1)
    .attr("y",1)

  // Get layers from d3.stack function (gives x, y, y0 values)
  var offset = vars.layout == "value" ? "zero" : "expand";

  if (nested_data.length) {
    var layers = stack.offset(offset)(nested_data)
  }
  else {
    var layers = []
  }

  // container for layers
  vars.chart_enter.append("g").attr("class", "layers")
    .attr("clip-path","url(#path_clipping)")

  // give data with key function to variables to draw
  var paths = d3.select("g.layers").selectAll(".layer")
    .data(layers, function(d){ return d.key; })

  // ENTER
  // enter new paths, could be next level deep or up a level
  paths.enter().append("path")
    .attr("opacity", 0)
    .attr("id", function(d){
      return "path_"+d[vars.id_var]
    })
    .attr("class", "layer")
    .attr("fill", function(d){
      return find_color(d.key)
    })
    .attr("d", function(d) {
      return area(d.values);
    })

  small_tooltip = function(d) {

    covered = false

    var mouse_x = d3.event.layerX-vars.graph.margin.left;
    var rev_x_scale = d3.scale.linear()
      .domain(vars.x_scale.range()).range(vars.x_scale.domain());
    var this_x = Math.round(rev_x_scale(mouse_x));
    var this_x_index = xaxis_vals.indexOf(this_x)
    var this_value = d.values[this_x_index]

    d3.selectAll("line.rule").remove()
    d3plus_old.tooltip.remove(vars.type)

    if (this_value && this_value[vars.value_var] > 0) {

      var id = find_variable(d,vars.id_var),
          self = d3.select("#path_"+id).node()

      d3.select(self).attr("opacity",1)

      // add dashed line at closest X position to mouse location
      d3.select("g.chart").append("line")
        .datum(d)
        .attr("class", "rule")
        .attr({"x1": vars.x_scale(this_x), "x2": vars.x_scale(this_x)})
        .attr({"y1": vars.y_scale(this_value.y0), "y2": vars.y_scale(this_value.y + this_value.y0)})
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "5,3")
        .attr("pointer-events","none")

      // tooltip
      var tooltip_data = get_tooltip_data(this_value,"short")
      if (vars.layout == "share") {
        var share = vars.number_format(this_value.y*100,"share")+"%"
        tooltip_data.push({"name": vars.text_format("share"), "value": share})
      }

      var path_height = vars.y_scale(this_value.y + this_value.y0)-vars.y_scale(this_value.y0),
          tooltip_x = vars.x_scale(this_x)+vars.graph.margin.left+vars.margin.left+vars.parent.node().offsetLeft,
          tooltip_y = vars.y_scale(this_value.y0 + this_value.y)-(path_height/2)+vars.graph.margin.top+vars.margin.top+vars.parent.node().offsetTop

      d3plus_old.tooltip.create({
        "data": tooltip_data,
        "title": find_variable(d[vars.id_var],vars.text_var),
        "id": vars.type,
        "icon": find_variable(d[vars.id_var],"icon"),
        "style": vars.icon_style,
        "color": find_color(d[vars.id_var]),
        "x": tooltip_x,
        "y": tooltip_y,
        "offset": -(path_height/2),
        "align": "top center",
        "arrow": true,
        "footer": footer_text(),
        "mouseevents": false
      })

    }

  }

  // UPDATE
  paths
    .on(d3plus_old.evt.over, function(d) {
      small_tooltip(d)
    })
    .on(d3plus_old.evt.move, function(d) {
      small_tooltip(d)
    })
    .on(d3plus_old.evt.out, function(d){

      var id = find_variable(d,vars.id_var),
          self = d3.select("#path_"+id).node()

      d3.selectAll("line.rule").remove()
      d3.select(self).attr("opacity",0.85)

      if (!covered) {
        d3plus_old.tooltip.remove(vars.type)
      }

    })
    .on(d3plus_old.evt.click, function(d){

      covered = true

      var id = find_variable(d,vars.id_var)
      var self = this

      var mouse_x = d3.event.layerX-vars.graph.margin.left;
      var rev_x_scale = d3.scale.linear()
        .domain(vars.x_scale.range()).range(vars.x_scale.domain());
      var this_x = Math.round(rev_x_scale(mouse_x));
      var this_x_index = xaxis_vals.indexOf(this_x)
      var this_value = d.values[this_x_index]

      make_tooltip = function(html) {

        d3.selectAll("line.rule").remove()
        d3plus_old.tooltip.remove(vars.type)
        d3.select(self).attr("opacity",0.85)

        var tooltip_data = get_tooltip_data(this_value,"long")
        if (vars.layout == "share") {
          var share = vars.number_format(this_value.y*100,"share")+"%"
          tooltip_data.push({"name": vars.text_format("share"), "value": share})
        }

        d3plus_old.tooltip.create({
          "title": find_variable(d[vars.id_var],vars.text_var),
          "color": find_color(d[vars.id_var]),
          "icon": find_variable(d[vars.id_var],"icon"),
          "style": vars.icon_style,
          "id": vars.type,
          "fullscreen": true,
          "html": html,
          "footer": vars.footer,
          "data": tooltip_data,
          "mouseevents": true,
          "parent": vars.parent,
          "background": vars.background
        })

      }

      var html = vars.click_function ? vars.click_function(id) : null

      if (typeof html == "string") make_tooltip(html)
      else if (html && html.url && html.callback) {
        d3.json(html.url,function(data){
          html = html.callback(data)
          make_tooltip(html)
        })
      }
      else if (vars.tooltip_info.long) {
        make_tooltip(html)
      }

    })

  paths.transition().duration(d3plus_old.timing)
    .attr("opacity", 0.85)
    .attr("fill", function(d){
      return find_color(d.key)
    })
    .attr("d", function(d) {
      return area(d.values);
    })

  // EXIT
  paths.exit()
    .transition().duration(d3plus_old.timing)
    .attr("opacity", 0)
    .remove()

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // TEXT LAYERS
  //-------------------------------------------------------------------

  // filter layers to only the ones with a height larger than 6% of viz
  var text_layers = [];
  var text_height_scale = d3.scale.linear().range([0, 1]).domain([0, data_max]);

  layers.forEach(function(layer){
    // find out which is the largest
    var available_areas = layer.values.filter(function(d,i,a){

      var min_height = 30;
      if (i == 0) {
        return (vars.graph.height-vars.y_scale(d.y)) >= min_height
            && (vars.graph.height-vars.y_scale(a[i+1].y)) >= min_height
            && (vars.graph.height-vars.y_scale(a[i+2].y)) >= min_height
            && vars.y_scale(d.y)-(vars.graph.height-vars.y_scale(d.y0)) < vars.y_scale(a[i+1].y0)
            && vars.y_scale(a[i+1].y)-(vars.graph.height-vars.y_scale(a[i+1].y0)) < vars.y_scale(a[i+2].y0)
            && vars.y_scale(d.y0) > vars.y_scale(a[i+1].y)-(vars.graph.height-vars.y_scale(a[i+1].y0))
            && vars.y_scale(a[i+1].y0) > vars.y_scale(a[i+2].y)-(vars.graph.height-vars.y_scale(a[i+2].y0));
      }
      else if (i == a.length-1) {
        return (vars.graph.height-vars.y_scale(d.y)) >= min_height
            && (vars.graph.height-vars.y_scale(a[i-1].y)) >= min_height
            && (vars.graph.height-vars.y_scale(a[i-2].y)) >= min_height
            && vars.y_scale(d.y)-(vars.graph.height-vars.y_scale(d.y0)) < vars.y_scale(a[i-1].y0)
            && vars.y_scale(a[i-1].y)-(vars.graph.height-vars.y_scale(a[i-1].y0)) < vars.y_scale(a[i-2].y0)
            && vars.y_scale(d.y0) > vars.y_scale(a[i-1].y)-(vars.graph.height-vars.y_scale(a[i-1].y0))
            && vars.y_scale(a[i-1].y0) > vars.y_scale(a[i-2].y)-(vars.graph.height-vars.y_scale(a[i-2].y0));
      }
      else {
        return (vars.graph.height-vars.y_scale(d.y)) >= min_height
            && (vars.graph.height-vars.y_scale(a[i-1].y)) >= min_height
            && (vars.graph.height-vars.y_scale(a[i+1].y)) >= min_height
            && vars.y_scale(d.y)-(vars.graph.height-vars.y_scale(d.y0)) < vars.y_scale(a[i+1].y0)
            && vars.y_scale(d.y)-(vars.graph.height-vars.y_scale(d.y0)) < vars.y_scale(a[i-1].y0)
            && vars.y_scale(d.y0) > vars.y_scale(a[i+1].y)-(vars.graph.height-vars.y_scale(a[i+1].y0))
            && vars.y_scale(d.y0) > vars.y_scale(a[i-1].y)-(vars.graph.height-vars.y_scale(a[i-1].y0));
      }
    });
    var best_area = d3.max(layer.values,function(d,i){
      if (available_areas.indexOf(d) >= 0) {
        if (i == 0) {
          return (vars.graph.height-vars.y_scale(d.y))
               + (vars.graph.height-vars.y_scale(layer.values[i+1].y))
               + (vars.graph.height-vars.y_scale(layer.values[i+2].y));
        }
        else if (i == layer.values.length-1) {
          return (vars.graph.height-vars.y_scale(d.y))
               + (vars.graph.height-vars.y_scale(layer.values[i-1].y))
               + (vars.graph.height-vars.y_scale(layer.values[i-2].y));
        }
        else {
          return (vars.graph.height-vars.y_scale(d.y))
               + (vars.graph.height-vars.y_scale(layer.values[i-1].y))
               + (vars.graph.height-vars.y_scale(layer.values[i+1].y));
        }
      } else return null;
    });
    var best_area = layer.values.filter(function(d,i,a){
      if (i == 0) {
        return (vars.graph.height-vars.y_scale(d.y))
             + (vars.graph.height-vars.y_scale(layer.values[i+1].y))
             + (vars.graph.height-vars.y_scale(layer.values[i+2].y)) == best_area;
      }
      else if (i == layer.values.length-1) {
        return (vars.graph.height-vars.y_scale(d.y))
             + (vars.graph.height-vars.y_scale(layer.values[i-1].y))
             + (vars.graph.height-vars.y_scale(layer.values[i-2].y)) == best_area;
      }
      else {
        return (vars.graph.height-vars.y_scale(d.y))
             + (vars.graph.height-vars.y_scale(layer.values[i-1].y))
             + (vars.graph.height-vars.y_scale(layer.values[i+1].y)) == best_area;
      }
    })[0]
    if (best_area) {
      layer.tallest = best_area
      text_layers.push(layer)
    }

  })
  // container for text layers
  vars.chart_enter.append("g").attr("class", "text_layers")

  // RESET
  var texts = d3.select("g.text_layers").selectAll(".label")
    .data([])

  // EXIT
  texts.exit().remove()

  // give data with key function to variables to draw
  var texts = d3.select("g.text_layers").selectAll(".label")
    .data(text_layers)

  // ENTER
  texts.enter().append("text")
    // .attr('filter', 'url(#dropShadow)')
    .attr("class", "label")
    .style("font-weight",vars.font_weight)
    .attr("font-size","18px")
    .attr("font-family",vars.font)
    .attr("dy", 6)
    .attr("opacity",0)
    .attr("pointer-events","none")
    .attr("text-anchor", function(d){
      // if first, left-align text
      if(d.tallest[vars.year_var] == vars.x_scale.domain()[0]) return "start";
      // if last, right-align text
      if(d.tallest[vars.year_var] == vars.x_scale.domain()[1]) return "end";
      // otherwise go with middle
      return "middle"
    })
    .attr("fill", function(d){
      return d3plus_old.utils.text_color(find_color(d[vars.id_var]))
    })
    .attr("x", function(d){
      var pad = 0;
      // if first, push it off 10 pixels from left side
      if(d.tallest[vars.year_var] == vars.x_scale.domain()[0]) pad += 10;
      // if last, push it off 10 pixels from right side
      if(d.tallest[vars.year_var] == vars.x_scale.domain()[1]) pad -= 10;
      return vars.x_scale(d.tallest[vars.year_var]) + pad;
    })
    .attr("y", function(d){
      var height = vars.graph.height - vars.y_scale(d.tallest.y);
      return vars.y_scale(d.tallest.y0 + d.tallest.y) + (height/2);
    })
    .text(function(d) {
      return find_variable(d[vars.id_var],vars.text_var)
    })
    .each(function(d){
      // set usable width to 2x the width of each x-axis tick
      var tick_width = (vars.graph.width / xaxis_vals.length) * 2;
      // if the text box's width is larger than the tick width wrap text
      if(this.getBBox().width > tick_width){
        // first remove the current text
        d3.select(this).text("")
        // figure out the usable height for this location along x-axis
        var height = vars.graph.height-vars.y_scale(d.tallest.y)
        // wrap text WITHOUT resizing
        // d3plus_old.utils.wordwrap(d[nesting[nesting.length-1]], this, tick_width, height, false)

        d3plus_old.utils.wordwrap({
          "text": find_variable(d[vars.id_var],vars.text_var),
          "parent": this,
          "width": tick_width,
          "height": height,
          "resize": false
        })

        // reset Y to compensate for new multi-line height
        var offset = (height - this.getBBox().height) / 2;
        // top of the element's y attr
        var y_top = vars.y_scale(d.tallest.y0 + d.tallest.y);
        d3.select(this).attr("y", y_top + offset)
      }
    })

  // UPDATE
  texts.transition().duration(d3plus_old.timing)
    .attr("opacity",function(){
      if (vars.small || !vars.labels) return 0
      else return 1
    })

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Nest data function (needed for getting flat data ready for stacks)
  //-------------------------------------------------------------------

  function nest_data(){

    var nested = d3.nest()
      .key(function(d){ return d[vars.id_var]; })
      .rollup(function(leaves){

        // Make sure all xaxis_vars at least have 0 values
        var years_available = leaves
          .reduce(function(a, b){ return a.concat(b[vars.xaxis_var])}, [])
          .filter(function(y, i, arr) { return arr.indexOf(y) == i })

        xaxis_vals.forEach(function(y){
          if(years_available.indexOf(y) < 0){
            var obj = {}
            obj[vars.xaxis_var] = y
            obj[vars.yaxis_var] = 0
            if (leaves[0][vars.id_var]) obj[vars.id_var] = leaves[0][vars.id_var]
            leaves.push(obj)
          }
        })

        return leaves.sort(function(a,b){
          return a[vars.xaxis_var]-b[vars.xaxis_var];
        });

      })
      .entries(vars.data)

    nested.forEach(function(d, i){
      d.total = d3.sum(d.values, function(dd){ return dd[vars.yaxis_var]; })
      d[vars.id_var] = d.values[0][vars.id_var]
    })
    // return nested

    return nested.sort(function(a,b){

      var s = vars.sort == "value" ? "total" : vars.sort

      a_value = find_variable(a,s)
      b_value = find_variable(b,s)

      if (s == vars.color_var) {

        a_value = d3.rgb(a_value).hsl()
        b_value = d3.rgb(b_value).hsl()

        if (a_value.s == 0) a_value = 361
        else a_value = a_value.h
        if (b_value.s == 0) b_value = 361
        else b_value = b_value.h

      }

      if(a_value<b_value) return vars.order == "desc" ? -1 : 1;
      if(a_value>b_value) return vars.order == "desc" ? 1 : -1;
      return 0;

    });

  }

  //===================================================================

};
d3plus_old.tree_map = function(vars) {

  var covered = false

  // Ok, to get started, lets run our heirarchically nested
  // data object through the d3 treemap function to get a
  // flat array of data with X, Y, width and height vars
  if (vars.data) {
    var tmap_data = d3.layout.treemap()
      .round(false)
      .size([vars.width, vars.height])
      .children(function(d) { return d.children; })
      .sort(function(a, b) { return a.value - b.value; })
      .value(function(d) { return d[vars.value_var]; })
      .nodes(vars.data)
      .filter(function(d) {
        return !d.children;
      })
  }
  else {
    var tmap_data = []
  }

  var cell = d3.select("g.parent").selectAll("g")
    .data(tmap_data, function(d){ return d[vars.id_var]; })

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // New cells enter, initialize them here
  //-------------------------------------------------------------------

  // cell aka container
  var cell_enter = cell.enter().append("g")
    .attr("id",function(d){
      return "cell_"+d[vars.id_var]
    })
    .attr("opacity", 0)
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    })

  // rectangle
  cell_enter.append("rect")
    .attr("stroke",vars.background)
    .attr("stroke-width",1)
    .attr("opacity",0.85)
    .attr('width', function(d) {
      return d.dx+'px'
    })
    .attr('height', function(d) {
      return d.dy+'px'
    })
    .attr("fill", function(d){
      return find_color(d);
    })
    .attr("shape-rendering","crispEdges")

  // text (name)
  cell_enter.append("text")
    .attr("opacity", 1)
    .attr("text-anchor","start")
    .style("font-weight",vars.font_weight)
    .attr("font-family",vars.font)
    .attr('class','name')
    .attr('x','0.2em')
    .attr('y','0em')
    .attr('dy','0em')
    .attr("fill", function(d){
      var color = find_color(d)
      return d3plus_old.utils.text_color(color);
    })
    .style("pointer-events","none")

  // text (share)
  cell_enter.append("text")
    .attr('class','share')
    .attr("text-anchor","middle")
    .style("font-weight",vars.font_weight)
    .attr("font-family",vars.font)
    .attr("fill", function(d){
      var color = find_color(d)
      return d3plus_old.utils.text_color(color);
    })
    .attr("fill-opacity",0.5)
    .style("pointer-events","none")
    .text(function(d) {
      var root = d;
      while(root.parent){ root = root.parent; } // find top most parent node
      d.share = vars.number_format((d.value/root.value)*100,"share")+"%";
      return d.share;
    })
    .attr('font-size',function(d){
      var size = (d.dx)/7
      if(d.dx < d.dy) var size = d.dx/7
      else var size = d.dy/7
      if (size < 10) size = 10;
      return size
    })
    .attr('x', function(d){
      return d.dx/2
    })
    .attr('y',function(d){
      return d.dy-(parseInt(d3.select(this).attr('font-size'),10)*0.25)
    })
    .each(function(d){
      var el = d3.select(this).node().getBBox()
      if (d.dx < el.width) d3.select(this).remove()
      else if (d.dy < el.height) d3.select(this).remove()
    })



  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Update, for cells that are already in existance
  //-------------------------------------------------------------------

  small_tooltip = function(d) {

    d3plus_old.tooltip.remove(vars.type)
    var ex = {}
    ex[vars.text_format("share")] = d.share
    var tooltip_data = get_tooltip_data(d,"short",ex)
    var id = find_variable(d,vars.id_var)

    d3plus_old.tooltip.create({
      "title": find_variable(d,vars.text_var),
      "color": find_color(d),
      "icon": find_variable(d,"icon"),
      "style": vars.icon_style,
      "id": vars.type,
      "x": d3.event.clientX,
      "y": d3.event.clientY,
      "offset": 3,
      "arrow": true,
      "mouseevents": d3.select("#cell_"+id).node(),
      "footer": footer_text(),
      "data": tooltip_data
    })

  }

  cell
    .on(d3plus_old.evt.over,function(d){

      var id = find_variable(d,vars.id_var),
          self = d3.select("#cell_"+id).node()

      self.parentNode.appendChild(self)

      d3.select("#cell_"+id).select("rect")
        .style("cursor","pointer")
        .attr("opacity",1)

      small_tooltip(d);

    })
    .on(d3plus_old.evt.out,function(d){

      var id = find_variable(d,vars.id_var)

      d3.select("#cell_"+id).select("rect")
        .attr("opacity",0.85)

      if (!covered) {
        d3plus_old.tooltip.remove(vars.type)
      }

    })
    .on(d3plus_old.evt.down,function(d){

      covered = true

      var id = find_variable(d,vars.id_var),
          self = d3.select("#cell_"+id).node()

      make_tooltip = function(html) {

        d3.select("#cell_"+id).select("rect")
          .attr("opacity",0.85)

        d3plus_old.tooltip.remove(vars.type)

        var ex = {}
        ex[vars.text_format("share")] = d.share
        var tooltip_data = get_tooltip_data(d,"long",ex)

        d3plus_old.tooltip.create({
          "title": find_variable(d,vars.text_var),
          "color": find_color(d),
          "icon": find_variable(d,"icon"),
          "style": vars.icon_style,
          "id": vars.type,
          "fullscreen": true,
          "html": html,
          "footer": vars.footer,
          "data": tooltip_data,
          "mouseevents": true,
          "parent": vars.parent,
          "background": vars.background
        })

      }

      var html = vars.click_function ? vars.click_function(id) : null

      if (typeof html == "string") make_tooltip(html)
      else if (html && html.url && html.callback) {
        d3.json(html.url,function(data){
          html = html.callback(data)
          make_tooltip(html)
        })
      }
      else if (vars.tooltip_info.long) {
        make_tooltip(html)
      }

    })
    .on(d3plus_old.evt.move,function(d){
      covered = false
      d3plus_old.tooltip.move(d3.event.clientX,d3.event.clientY,vars.type)
    })

  cell.transition().duration(d3plus_old.timing)
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    })
    .attr("opacity", 1)

  // update rectangles
  cell.select("rect").transition().duration(d3plus_old.timing)
    .attr('width', function(d) {
      return d.dx+'px'
    })
    .attr('height', function(d) {
      return d.dy+'px'
    })
    .attr("fill", function(d){
      return find_color(d);
    })

  // text (name)
  cell.select("text.name").transition()
    .duration(d3plus_old.timing/2)
    .attr("opacity", 0)
    .attr("fill", function(d){
      var color = find_color(d)
      return d3plus_old.utils.text_color(color);
    })
    .transition().duration(d3plus_old.timing/2)
    .each("end", function(d){
      d3.select(this).selectAll("tspan").remove();
      if(d.dx > 30 && d.dy > 30){
        var text = []
        var arr = vars.name_array ? vars.name_array : [vars.text_var,vars.id_var]
        arr.forEach(function(n){
          var name = find_variable(d,n)
          if (typeof name === "number") text.push(vars.number_format(name))
          else if (typeof name === "string") text.push(vars.text_format(name))
        })

        var size = (d.dx)/7
        if(d.dx < d.dy) var size = d.dx/7
        else var size = d.dy/7
        if (size < 10) size = 10;

        d3plus_old.utils.wordwrap({
          "text": text,
          "parent": this,
          "width": d.dx,
          "height": d.dy-size,
          "resize": true
        })
      }

      d3.select(this).transition().duration(d3plus_old.timing/2)
        .attr("opacity", 1)
    })


  // text (share)
  cell.select("text.share").transition().duration(d3plus_old.timing/2)
    .attr("opacity", 0)
    .attr("fill", function(d){
      var color = find_color(d)
      return d3plus_old.utils.text_color(color);
    })
    .each("end",function(d){
      d3.select(this)
        .text(function(d){
          var root = d.parent;
          while(root.parent){ root = root.parent; } // find top most parent node
          d.share = vars.number_format((d.value/root.value)*100,"share")+"%";
          return d.share;
        })
        .attr('font-size',function(d){
          var size = (d.dx)/7
          if(d.dx < d.dy) var size = d.dx/7
          else var size = d.dy/7
          if (size < 10) size = 10;
          return size
        })
        .attr('x', function(d){
          return d.dx/2
        })
        .attr('y',function(d){
          return d.dy-(parseInt(d3.select(this).attr('font-size'),10)*0.25)
        })
        .each(function(d){
          var el = d3.select(this).node().getBBox()
          if (d.dx < el.width) d3.select(this).remove()
          else if (d.dy < el.height) d3.select(this).remove()
        })
      d3.select(this).transition().duration(d3plus_old.timing/2)
        .attr("opacity", 1)
    })


  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Exis, get rid of old cells
  //-------------------------------------------------------------------

  cell.exit().transition().duration(d3plus_old.timing)
    .attr("opacity", 0)
    .remove()

  //===================================================================

}
d3plus_old.geo_map = function(vars) {

  var default_opacity = 0.50,
      select_opacity = 0.75,
      stroke_width = 1,
      color_gradient = ["#00008f", "#003fff", "#00efff", "#ffdf00", "#ff3000", "#7f0000"],
      projection = null
      gmap_projection = null,
      path = null,
      hover = null,
      dragging = false,
      scale_height = 10,
      scale_padding = 20,
      scale_width = 250,
      info_width = vars.small ? 0 : 300,
      redraw = false

  vars.loading_text = vars.text_format("Loading Geography")

  /**********************/
  /* Define Color Scale */
  /**********************/
  vars.data_range = []
  vars.data_extent = [0,0]
  if (vars.data) {
    vars.data_extent = d3.extent(d3.values(vars.data),function(d){
      return d[vars.value_var] && d[vars.value_var] != 0 ? d[vars.value_var] : null
    })
    var step = 0.0
    while(step <= 1) {
      vars.data_range.push((vars.data_extent[0]*Math.pow((vars.data_extent[1]/vars.data_extent[0]),step)))
      step += 0.25
    }
    vars.value_color = d3.scale.log()
      .domain(vars.data_range)
      .interpolate(d3.interpolateRgb)
      .range(color_gradient)
  }
  else {
    vars.data = []
  }

  /*******************/
  /* Create Init Map */
  /*******************/
  var map_div = vars.parent.selectAll("div#map").data([vars.data])

  map_div.enter().append("div")
    .attr("id","map")
    .style("width",vars.width+"px")
    .style("height",vars.height+"px")
    .style("margin-left",vars.margin.left+"px")
    .style("margin-top",vars.margin.top+"px")
    .each(function(){

      /************************/
      /* Initial Map Creation */
      /************************/
      google.maps.visualRefresh = true;
      vars.map = new google.maps.Map(this, {
        zoom: 5,
        center: new google.maps.LatLng(-13.544541, -52.734375),
        mapTypeControl: false,
        panControl: false,
        streetViewControl: false,
        zoomControl: false,
        scrollwheel: vars.scroll_zoom,
        mapTypeId: google.maps.MapTypeId.TERRAIN
      })

      google.maps.event.addListener(vars.map,"drag", function(e){
        dragging = true
      })

      // google.maps.event.addListener(vars.map,"dragend", function(){
      //   dragging = false
      // })

      var zoomControl = document.createElement('div')
      zoomControl.style.marginLeft = "5px"
      zoomControl.style.marginTop = "5px"

      var zoomIn = document.createElement('div')
      zoomIn.id = "zoom_in"
      zoomIn.innerHTML = "+"
      zoomControl.appendChild(zoomIn)

      var zoomOut = document.createElement('div')
      zoomOut.id = "zoom_out"
      zoomOut.innerHTML = "-"
      zoomControl.appendChild(zoomOut)

      vars.map.controls[google.maps.ControlPosition.LEFT_TOP].push(zoomControl)

      //zoom in control click event
      google.maps.event.addDomListener(zoomIn, 'click', function() {
        vars.loading_text = vars.text_format("Zooming In")
         var currentZoomLevel = vars.map.getZoom();
         if(currentZoomLevel != 21){
           vars.map.setZoom(currentZoomLevel + 1);
          }
       });

      //zoom out control click event
      google.maps.event.addDomListener(zoomOut, 'click', function() {
        vars.loading_text = vars.text_format("Zooming Out")
         var currentZoomLevel = vars.map.getZoom();
         if(currentZoomLevel != 0){
           vars.map.setZoom(currentZoomLevel - 1);
         }
       });

      var tileControl = document.createElement('div')
      tileControl.style.marginRight = "5px"

      var roadMap = document.createElement('div')
      roadMap.className = "tile_toggle"
      roadMap.innerHTML = vars.text_format("roads")
      tileControl.appendChild(roadMap)

      var terrain = document.createElement('div')
      terrain.className = "tile_toggle active"
      terrain.innerHTML = vars.text_format("terrain")
      tileControl.appendChild(terrain)

      var satellite = document.createElement('div')
      satellite.className = "tile_toggle"
      satellite.innerHTML = vars.text_format("satellite")
      tileControl.appendChild(satellite)

      var hybrid = document.createElement('div')
      hybrid.className = "tile_toggle"
      hybrid.innerHTML = vars.text_format("hybrid")
      tileControl.appendChild(hybrid)

      vars.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(tileControl)

      google.maps.event.addDomListener(roadMap, 'click', function() {
        d3.selectAll(".tile_toggle").attr("class","tile_toggle")
        this.className = "tile_toggle active"
        vars.map.setMapTypeId(google.maps.MapTypeId.ROADMAP)
      });

      google.maps.event.addDomListener(terrain, 'click', function() {
        d3.selectAll(".tile_toggle").attr("class","tile_toggle")
        this.className = "tile_toggle active"
        vars.map.setMapTypeId(google.maps.MapTypeId.TERRAIN)
      });

      google.maps.event.addDomListener(satellite, 'click', function() {
        d3.selectAll(".tile_toggle").attr("class","tile_toggle")
        this.className = "tile_toggle active"
        vars.map.setMapTypeId(google.maps.MapTypeId.SATELLITE)
      });

      google.maps.event.addDomListener(hybrid, 'click', function() {
        d3.selectAll(".tile_toggle").attr("class","tile_toggle")
        this.className = "tile_toggle active"
        vars.map.setMapTypeId(google.maps.MapTypeId.HYBRID)
      });

      scale()

      vars.overlay = new google.maps.OverlayView();

      // Add the container when the overlay is added to the map.
      vars.overlay.onAdd = function() {

        vars.zoom = vars.map.zoom

        var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")

        path_group = layer.append("svg")
            .attr("id","gmap_overlay")
            .append("g")

        path_defs = path_group.append("defs")

        path_group.append("rect")
          .attr("class","overlay")
          .attr("width",20000)
          .attr("height",20000)
          .attr("fill","transparent")
          .on(d3plus_old.evt.move, function(d) {
            if (vars.highlight && !dragging && !d3plus_old.ie) {
              d3.select(this).style("cursor","-moz-zoom-out")
              d3.select(this).style("cursor","-webkit-zoom-out")
            }
          })
          .on(d3plus_old.evt.click, function(d) {
            if (vars.highlight && !dragging) zoom("reset")
          })

        vars.overlay.draw = function() {

          redraw = true

          vars.loader.select("div").text(vars.loading_text)
          vars.loader.style("display","block")

          var self = this

          setTimeout(function(){

            projection = self.getProjection()
            gmap_projection = function (coordinates) {
              var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
              var pixelCoordinates = projection.fromLatLngToDivPixel(googleCoordinates);
              return [pixelCoordinates.x + 10000, pixelCoordinates.y + 10000];
            }

            path = d3.geo.path().projection(gmap_projection);

            var paths = path_group.selectAll("path")
              .data(vars.coords)

            paths.enter().append("path")
                .attr("id",function(d) {
                  return "path"+d.id
                } )
                .attr("d", path)
                .attr("opacity",default_opacity)
                .call(color_paths)
                .attr("vector-effect","non-scaling-stroke")

            if (vars.map.zoom != vars.zoom) {
              paths.attr("d",path)
            }

            paths
              .attr("opacity",default_opacity)
              .call(color_paths)
              .on(d3plus_old.evt.over, function(d){
                hover = d.id
                if (vars.highlight != d.id) {
                  d3.select(this)
                    .style("cursor","pointer")
                    .attr("opacity",select_opacity)
                  if (!d3plus_old.ie) {
                    d3.select(this)
                      .style("cursor","-moz-zoom-in")
                      .style("cursor","-webkit-zoom-in")
                  }
                }
                if (!vars.highlight) {
                  update()
                }
              })
              .on(d3plus_old.evt.out, function(d){
                hover = null
                if (vars.highlight != d.id) {
                  d3.select(this).attr("opacity",default_opacity)
                }
                if (!vars.highlight) {
                  update()
                }
              })
              .on(d3plus_old.evt.click, function(d) {
                if (!dragging) {
                  vars.loading_text = vars.text_format("Calculating Coordinates")
                  if (vars.highlight == d.id) {
                    zoom("reset")
                  }
                  else {
                    if (vars.highlight) {
                      var temp = vars.highlight
                      vars.highlight = null
                      d3.select("path#path"+temp).call(color_paths);
                    }
                    vars.highlight = d.id;
                    d3.select(this).call(color_paths);
                    zoom(d3.select(this).datum());
                  }
                  update();
                }
                dragging = false
              })

            vars.zoom = vars.map.zoom
            scale_update()
            update()

            if (vars.coord_change) {
              if (vars.highlight) var z = d3.select("path#path"+vars.highlight).datum()
              else var z = "reset"
              vars.loading_text = vars.text_format("Calculating Coordinates")
              zoom(z)
              vars.coord_change = false
            }

            vars.loader.style("display","none")

          },5)

        }
      }

      // Bind our overlay to the map…
      vars.overlay.setMap(vars.map)

    })

  map_div
    .style("width",vars.width+"px")
    .style("height",vars.height+"px")
    .style("margin-left",vars.margin.left+"px")
    .style("margin-top",vars.margin.top+"px")

  setTimeout(function(){
    var c = vars.map.getCenter()
    google.maps.event.trigger(vars.map, "resize")
    vars.map.panTo(c)
  },d3plus_old.timing)

  if (!redraw && vars.overlay.draw) vars.overlay.draw()

  function zoom(d) {

    if (d == "reset") {
      d = vars.boundaries
      if (vars.highlight) {
        var temp = vars.highlight;
        vars.highlight = null;
        d3.select("#path"+temp).call(color_paths);
        update()
      }
    }

    var bounds = d3.geo.bounds(d),
        gbounds = new google.maps.LatLngBounds()

    if (info_width > 0 && vars.highlight) {
      bounds[1][0] =  bounds[1][0]+(bounds[1][0]-bounds[0][0])
    }

    gbounds.extend(new google.maps.LatLng(bounds[0][1],bounds[0][0]))
    gbounds.extend(new google.maps.LatLng(bounds[1][1],bounds[1][0]))

    vars.map.fitBounds(gbounds)
  }

  function color_paths(p) {

    path_defs.selectAll("#stroke_clip").remove();

    p
      .attr("fill",function(d){
        if (d.id == vars.highlight) return "none";
        else if (!vars.data[d.id]) return "#888888";
        else return vars.data[d.id][vars.value_var] ? vars.value_color(vars.data[d.id][vars.value_var]) : "#888888"
      })
      .attr("stroke-width",function(d) {
        if (d.id == vars.highlight) return 10;
        else return stroke_width;
      })
      .attr("stroke",function(d) {
        if (d.id == vars.highlight) {
          if (!vars.data[d.id]) return "#888"
          return vars.data[d.id][vars.value_var] ? vars.value_color(vars.data[d.id][vars.value_var]) : "#888888";
        }
        else return "white";
      })
      .attr("opacity",function(d){
        if (d.id == vars.highlight) return select_opacity;
        else return default_opacity;
      })
      .each(function(d){
        if (d.id == vars.highlight) {
          path_defs.append("clipPath")
            .attr("id","stroke_clip")
            .append("use")
              .attr("xlink:href","#path"+vars.highlight)
          d3.select(this).attr("clip-path","url(#stroke_clip)")
        }
        else {
          d3.select(this).attr("clip-path","none")
        }
      })
  }

  function update() {

    d3plus_old.tooltip.remove(vars.type);

    if (!vars.small && (hover || vars.highlight)) {

      var id = vars.highlight ? vars.highlight : hover

      var data = vars.data[id]

      if (data && data[vars.value_var]) {
        var color = vars.value_color(data[vars.value_var])
      }
      else {
        var color = "#888"
      }

      make_tooltip = function(html) {

        d3plus_old.tooltip.remove(vars.type);

        if (typeof html == "string") html = "<br>"+html

        d3plus_old.tooltip.create({
          "data": tooltip_data,
          "title": find_variable(id,vars.text_var),
          "id": vars.type,
          "icon": find_variable(id,"icon"),
          "style": vars.icon_style,
          "color": color,
          "footer": footer,
          "x": vars.width-info_width-5+vars.margin.left,
          "y": vars.margin.top+5,
          "fixed": true,
          "width": info_width,
          "html": html,
          "parent": vars.parent,
          "mouseevents": true,
          "background": vars.background,
          "max_height": vars.height-47
        })

      }

      if (!data || !data[vars.value_var]) {
        var footer = vars.text_format("No Data Available")
        make_tooltip(null)
      }
      else if (!vars.highlight) {
        var tooltip_data = get_tooltip_data(id,"short"),
            footer = footer_text()
        make_tooltip(null)
      }
      else {
        var tooltip_data = get_tooltip_data(id,"long"),
            footer = vars.footer

        var html = vars.click_function ? vars.click_function(id) : null

        if (typeof html == "string") make_tooltip(html)
        else if (html.url && html.callback) {
          d3.json(html.url,function(data){
            html = html.callback(data)
            make_tooltip(html)
          })
        }

      }

    }

  }

  function scale() {

    var scale_svg = vars.parent.selectAll("svg#scale").data(["scale"])

    var scale_enter = scale_svg.enter().append("svg")
      .attr("id","scale")
      .style("left",(30+vars.margin.left)+"px")
      .style("top",(5+vars.margin.top)+"px")
      .attr("width", scale_width+"px")
      .attr("height", "45px")

    var scale_defs = scale_enter.append("defs")

    var gradient = scale_defs
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%")
      .attr("spreadMethod", "pad");

    vars.data_range.forEach(function(v,i){
      gradient.append("stop")
        .attr("offset",Math.round((i/(vars.data_range.length-1))*100)+"%")
        .attr("stop-color", vars.value_color(v))
        .attr("stop-opacity", 1)
    })

    var scale = scale_enter.append('g')
      .attr('class','scale')
      .style("opacity",0)

    var shadow = scale_defs.append("filter")
      .attr("id", "shadow")
      .attr("x", "-50%")
      .attr("y", "0")
      .attr("width", "200%")
      .attr("height", "200%");

    shadow.append("feGaussianBlur")
      .attr("in","SourceAlpha")
      .attr("result","blurOut")
      .attr("stdDeviation","3")

    shadow.append("feOffset")
      .attr("in","blurOut")
      .attr("result","the-shadow")
      .attr("dx","0")
      .attr("dy","1")

    shadow.append("feColorMatrix")
      .attr("in","the-shadow")
      .attr("result","colorOut")
      .attr("type","matrix")
      .attr("values","0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0")

    shadow.append("feBlend")
      .attr("in","SourceGraphic")
      .attr("in2","colorOut")
      .attr("mode","normal")

    scale.append("rect")
      .attr("id","scalebg")
      .attr("width", scale_width+"px")
      .attr("height", "45px")
      .attr("fill","#ffffff")
      .attr("opacity",0.75)
      .attr("filter","url(#shadow)")
      .attr("shape-rendering","crispEdges")

    scale.append("text")
      .attr("id","scale_title")
      .attr("x",(scale_width/2)+"px")
      .attr("y","0px")
      .attr("dy","1.25em")
      .attr("text-anchor","middle")
      .attr("fill","#333")
      .attr("font-size","10px")
      .attr("font-family",vars.font)
      .style("font-weight",vars.font_weight)

    scale.append("rect")
      .attr("id","scalecolor")
      .attr("x",scale_padding+"px")
      .attr("y",(scale_height*1.75)+"px")
      .attr("width", (scale_width-(scale_padding*2))+"px")
      .attr("height", scale_height*0.75+"px")
      .style("fill", "url(#gradient)")

    vars.data_range.forEach(function(v,i){
      if (i == vars.data_range.length-1) {
        var x = scale_padding+Math.round((i/(vars.data_range.length-1))*(scale_width-(scale_padding*2)))-1
      } else if (i != 0) {
        var x = scale_padding+Math.round((i/(vars.data_range.length-1))*(scale_width-(scale_padding*2)))-1
      } else {
        var x = scale_padding+Math.round((i/(vars.data_range.length-1))*(scale_width-(scale_padding*2)))
      }
      scale.append("rect")
        .attr("id","scaletick_"+i)
        .attr("x", x+"px")
        .attr("y", (scale_height*1.75)+"px")
        .attr("width", 1)
        .attr("height", ((scale_height*0.75)+3)+"px")
        .style("fill", "#333")
        .attr("opacity",0.25)

      scale.append("text")
        .attr("id","scale_"+i)
        .attr("x",x+"px")
        .attr("y", (scale_height*2.75)+"px")
        .attr("dy","1em")
        .attr("text-anchor","middle")
        .attr("fill","#333")
        .attr("font-family",vars.font)
        .style("font-weight",vars.font_weight)
        .attr("font-size","10px")
    })

  }

  function scale_update() {
    if (!vars.data_extent[0] || Object.keys(vars.data).length < 2 || vars.small) {
      d3.select("g.scale").transition().duration(d3plus_old.timing)
        .style("opacity",0)
    }
    else {
      var max = 0
      vars.data_range.forEach(function(v,i){
        var elem = d3.select("g.scale").select("text#scale_"+i)
        elem.text(vars.number_format(v,vars.value_var))
        var w = elem.node().getBBox().width
        if (w > max) max = w
      })

      max += 10

      d3.select("g.scale").transition().duration(d3plus_old.timing)
        .style("opacity",1)

      d3.select("svg#scale").transition().duration(d3plus_old.timing)
        .attr("width",max*vars.data_range.length+"px")
        .style("left",(30+vars.margin.left)+"px")
        .style("top",(5+vars.margin.top)+"px")

      d3.select("g.scale").select("rect#scalebg").transition().duration(d3plus_old.timing)
        .attr("width",max*vars.data_range.length+"px")

      d3.select("g.scale").select("rect#scalecolor").transition().duration(d3plus_old.timing)
        .attr("x",max/2+"px")
        .attr("width",max*(vars.data_range.length-1)+"px")

      d3.select("g.scale").select("text#scale_title").transition().duration(d3plus_old.timing)
        .attr("x",(max*vars.data_range.length)/2+"px")
        .text(vars.text_format(vars.value_var))

      vars.data_range.forEach(function(v,i){

        if (i == vars.data_range.length-1) {
          var x = (max/2)+Math.round((i/(vars.data_range.length-1))*(max*vars.data_range.length-(max)))-1
        }
        else if (i != 0) {
          var x = (max/2)+Math.round((i/(vars.data_range.length-1))*(max*vars.data_range.length-(max)))-1
        }
        else {
          var x = (max/2)+Math.round((i/(vars.data_range.length-1))*(max*vars.data_range.length-(max)))
        }

        d3.select("g.scale").select("rect#scaletick_"+i).transition().duration(d3plus_old.timing)
          .attr("x",x+"px")

        d3.select("g.scale").select("text#scale_"+i).transition().duration(d3plus_old.timing)
          .attr("x",x+"px")
      })

    }

  }

};

d3plus_old.pie_scatter = function(vars) {

  var covered = false

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Define size scaling
  //-------------------------------------------------------------------
  if (!vars.data) vars.data = []
  var size_domain = d3.extent(vars.data, function(d){
    return d[vars.value_var] == 0 ? null : d[vars.value_var]
  })

  if (!size_domain[1]) size_domain = [0,0]

  var max_size = d3.max([d3.min([vars.graph.width,vars.graph.height])/15,10]),
      min_size = 10

  if (size_domain[0] == size_domain[1]) var min_size = max_size

  var size_range = [min_size,max_size]

  vars.size_scale = d3.scale[vars.size_scale_type]()
    .domain(size_domain)
    .range(size_range)

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Graph setup
  //-------------------------------------------------------------------

  // Create Axes
  vars.x_scale = d3.scale[vars.xscale_type]()
    .domain(vars.xaxis_domain)
    .range([0, vars.graph.width])
    .nice()

  vars.y_scale = d3.scale[vars.yscale_type]()
    .domain(vars.yaxis_domain)
    .range([0, vars.graph.height])
    .nice()

  if (vars.xscale_type != "log") set_buffer("x")
  if (vars.yscale_type != "log") set_buffer("y")

  // set buffer room (take into account largest size var)
  function set_buffer(axis) {

    var scale = vars[axis+"_scale"]
    var inverse_scale = d3.scale[vars[axis+"scale_type"]]()
      .domain(scale.range())
      .range(scale.domain())

    var largest_size = vars.size_scale.range()[1]

    // convert largest size to x scale domain
    largest_size = inverse_scale(largest_size)

    // get radius of largest in pixels by subtracting this value from the x scale minimum
    var buffer = largest_size - scale.domain()[0];

    // update x scale with new buffer offsets
    vars[axis+"_scale"]
      .domain([scale.domain()[0]-buffer,scale.domain()[1]+buffer])
  }

  graph_update();

  //===================================================================


  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // NODES
  //-------------------------------------------------------------------

  var arc = d3.svg.arc()
    .innerRadius(0)
    .startAngle(0)
    .outerRadius(function(d) { return d.arc_radius })
    .endAngle(function(d) { return d.arc_angle })

  // sort nodes so that smallest are always on top
  vars.data.sort(function(node_a, node_b){
    return node_b[vars.value_var] - node_a[vars.value_var];
  })

  vars.chart_enter.append("g").attr("class","circles")

  var nodes = d3.select("g.circles").selectAll("g.circle")
    .data(vars.data,function(d){ return d[vars.id_var] })

  nodes.enter().append("g")
    .attr("opacity", 0)
    .attr("class", "circle")
    .attr("transform", function(d) { return "translate("+vars.x_scale(d[vars.xaxis_var])+","+vars.y_scale(d[vars.yaxis_var])+")" } )
    .each(function(d){

      d3.select(this)
        .append("circle")
        .style("stroke", function(dd){
          if (d[vars.active_var] || (d.num_children_active == d.num_children && d[vars.active_var] != false)) {
            return "#333";
          }
          else {
            return find_color(d[vars.id_var]);
          }
        })
        .style('stroke-width', 1)
        .style('fill', function(dd){
          if (d[vars.active_var] || (d.num_children_active == d.num_children && d[vars.active_var] != false)) {
            return find_color(d[vars.id_var]);
          }
          else {
            var c = d3.hsl(find_color(d[vars.id_var]));
            c.l = 0.95;
            return c.toString();
          }
        })
        .attr("r", 0 )

      vars.arc_angles[d.id] = 0
      vars.arc_sizes[d.id] = 0

      d3.select(this)
        .append("path")
        .style('fill', find_color(d[vars.id_var]) )
        .style("fill-opacity", 1)

      d3.select(this).select("path").transition().duration(d3plus_old.timing)
        .attrTween("d",arcTween)

    })

  // update

  nodes
    .on(d3plus_old.evt.over, function(d){
      covered = false

      var val = d[vars.value_var] ? d[vars.value_var] : vars.size_scale.domain()[0]
      var radius = vars.size_scale(val),
          x = vars.x_scale(d[vars.xaxis_var]),
          y = vars.y_scale(d[vars.yaxis_var]),
          color = d[vars.active_var] || d.num_children_active/d.num_children == 1 ? "#333" : find_color(d[vars.id_var]),
          viz = d3.select("g.chart");

      // vertical line to x-axis
      viz.append("line")
        .attr("class", "axis_hover")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", y+radius+1) // offset so hover doens't flicker
        .attr("y2", vars.graph.height)
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("shape-rendering","crispEdges")

      // horizontal line to y-axis
      viz.append("line")
        .attr("class", "axis_hover")
        .attr("x1", 0)
        .attr("x2", x-radius) // offset so hover doens't flicker
        .attr("y1", y)
        .attr("y2", y)
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("shape-rendering","crispEdges")

      // x-axis value box
      var xrect = viz.append("rect")
        .attr("class", "axis_hover")
        .attr("y", vars.graph.height)
        .attr("height", 20)
        .attr("fill", "white")
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("shape-rendering","crispEdges")

      var xtext = vars.number_format(d[vars.xaxis_var],vars.xaxis_var)

      // xvalue text element
      var xtext = viz.append("text")
        .attr("class", "axis_hover")
        .attr("x", x)
        .attr("y", vars.graph.height)
        .attr("dy", 14)
        .attr("text-anchor","middle")
        .style("font-weight",vars.font_weight)
        .attr("font-size","12px")
        .attr("font-family",vars.font)
        .attr("fill","#4c4c4c")
        .text(xtext)

      var xwidth = xtext.node().getBBox().width+10
      xrect.attr("width",xwidth)
        .attr("x",x-(xwidth/2))

      // y-axis value box
      var yrect = viz.append("rect")
        .attr("class", "axis_hover")
        .attr("y", y-10)
        .attr("height", 20)
        .attr("fill", "white")
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("shape-rendering","crispEdges")

      var ytext = vars.number_format(d[vars.yaxis_var],vars.yaxis_var)

      // xvalue text element
      var ytext = viz.append("text")
        .attr("class", "axis_hover")
        .attr("x", -25)
        .attr("y", y-10)
        .attr("dy", 14)
        .attr("text-anchor","middle")
        .style("font-weight",vars.font_weight)
        .attr("font-size","12px")
        .attr("font-family",vars.font)
        .attr("fill","#4c4c4c")
        .text(ytext)

      var ywidth = ytext.node().getBBox().width+10
      ytext.attr("x",-ywidth/2)
      yrect.attr("width",ywidth)
        .attr("x",-ywidth)

      var ex = null
      if (d.num_children > 1 && !vars.spotlight && d.num_children_active != d.num_children) {
        var num = d.num_children_active,
            den = d.num_children
        ex = {"fill":num+"/"+den+" ("+vars.number_format((num/den)*100,"share")+"%)"}
      }
      var tooltip_data = get_tooltip_data(d,"short",ex)

      d3plus_old.tooltip.remove(vars.type)
      d3plus_old.tooltip.create({
        "id": vars.type,
        "color": find_color(d[vars.id_var]),
        "icon": find_variable(d[vars.id_var],"icon"),
        "style": vars.icon_style,
        "data": tooltip_data,
        "title": find_variable(d[vars.id_var],vars.text_var),
        "x": x+vars.graph.margin.left+vars.margin.left+vars.parent.node().offsetLeft,
        "y": y+vars.graph.margin.top+vars.margin.top+vars.parent.node().offsetTop,
        "offset": radius,
        "arrow": true,
        "footer": footer_text(),
        "mouseevents": false
      })

    })
    .on(d3plus_old.evt.out, function(d){
      if (!covered) d3plus_old.tooltip.remove(vars.type)
      d3.selectAll(".axis_hover").remove()
    })
    .on(d3plus_old.evt.click, function(d){
      covered = true
      var id = find_variable(d,vars.id_var)
      var self = this

      make_tooltip = function(html) {

        d3plus_old.tooltip.remove(vars.type)
        d3.selectAll(".axis_hover").remove()

        var ex = null
        if (d.num_children > 1 && !vars.spotlight && d.num_children_active != d.num_children) {
          var num = d.num_children_active,
              den = d.num_children
          ex = {"fill":num+"/"+den+" ("+vars.number_format((num/den)*100,"share")+"%)"}
        }
        var tooltip_data = get_tooltip_data(d,"long",ex)

        d3plus_old.tooltip.create({
          "title": find_variable(d,vars.text_var),
          "color": find_color(d),
          "icon": find_variable(d,"icon"),
          "style": vars.icon_style,
          "id": vars.type,
          "fullscreen": true,
          "html": html,
          "footer": vars.footer,
          "data": tooltip_data,
          "mouseevents": self,
          "parent": vars.parent,
          "background": vars.background
        })

      }

      var html = vars.click_function ? vars.click_function(id) : null

      if (typeof html == "string") make_tooltip(html)
      else if (html && html.url && html.callback) {
        d3.json(html.url,function(data){
          html = html.callback(data)
          make_tooltip(html)
        })
      }
      else if (vars.tooltip_info.long) {
        make_tooltip(html)
      }

    })

  nodes.transition().duration(d3plus_old.timing)
    .attr("transform", function(d) { return "translate("+vars.x_scale(d[vars.xaxis_var])+","+vars.y_scale(d[vars.yaxis_var])+")" } )
    .attr("opacity", 1)
    .each(function(d){

      var val = d[vars.value_var]
      val = val && val > 0 ? val : vars.size_scale.domain()[0]
      d.arc_radius = vars.size_scale(val);

      d3.select(this).select("circle").transition().duration(d3plus_old.timing)
        .style("stroke", function(dd){
          if (d[vars.active_var] || (d.num_children_active == d.num_children && d[vars.active_var] != false)) return "#333";
          else return find_color(d[vars.id_var]);
        })
        .style('fill', function(dd){
          if (d[vars.active_var] || (d.num_children_active == d.num_children && d[vars.active_var] != false)) return find_color(d[vars.id_var]);
          else {
            var c = d3.hsl(find_color(d[vars.id_var]));
            c.l = 0.95;
            return c.toString();
          }
        })
        .attr("r", d.arc_radius )


      if (d.num_children) {
        d.arc_angle = (((d.num_children_active / d.num_children)*360) * (Math.PI/180));
        d3.select(this).select("path").transition().duration(d3plus_old.timing)
          .style('fill', find_color(d[vars.id_var]) )
          .attrTween("d",arcTween)
          .each("end", function(dd) {
            vars.arc_angles[d.id] = d.arc_angle
            vars.arc_sizes[d.id] = d.arc_radius
          })
      }

    })

  // exit
  nodes.exit()
    .transition().duration(d3plus_old.timing)
    .attr("opacity", 0)
    .remove()

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Data Ticks
  //-------------------------------------------------------------------

  var tick_group = vars.chart_enter.append("g")
    .attr("id","data_ticks")

  var ticks = d3.select("g#data_ticks")
    .selectAll("g.data_tick")
    .data(vars.data, function(d){ return d[vars.id_var]; })

  var ticks_enter = ticks.enter().append("g")
    .attr("class", "data_tick")

  // y ticks
  // ENTER
  ticks_enter.append("line")
    .attr("class", "ytick")
    .attr("x1", -10)
    .attr("x2", 0)
    .attr("y1", function(d){ return vars.y_scale(d[vars.yaxis_var]) })
    .attr("y2", function(d){ return vars.y_scale(d[vars.yaxis_var]) })
    .attr("stroke", function(d){ return find_color(d[vars.id_var]); })
    .attr("stroke-width", 1)
    .attr("shape-rendering","crispEdges")

  // UPDATE
  ticks.select(".ytick").transition().duration(d3plus_old.timing)
    .attr("x1", -10)
    .attr("x2", 0)
    .attr("y1", function(d){ return vars.y_scale(d[vars.yaxis_var]) })
    .attr("y2", function(d){ return vars.y_scale(d[vars.yaxis_var]) })

  // x ticks
  // ENTER
  ticks_enter.append("line")
    .attr("class", "xtick")
    .attr("y1", vars.graph.height)
    .attr("y2", vars.graph.height + 10)
    .attr("x1", function(d){ return vars.x_scale(d[vars.xaxis_var]) })
    .attr("x2", function(d){ return vars.x_scale(d[vars.xaxis_var]) })
    .attr("stroke", function(d){ return find_color(d[vars.id_var]); })
    .attr("stroke-width", 1)
    .attr("shape-rendering","crispEdges")

  // UPDATE
  ticks.select(".xtick").transition().duration(d3plus_old.timing)
    .attr("y1", vars.graph.height)
    .attr("y2", vars.graph.height + 10)
    .attr("x1", function(d){ return vars.x_scale(d[vars.xaxis_var]) })
    .attr("x2", function(d){ return vars.x_scale(d[vars.xaxis_var]) })

  // EXIT (needed for when things are filtered/soloed)
  ticks.exit().remove()

  //===================================================================

  function arcTween(b) {
    var i = d3.interpolate({arc_angle: vars.arc_angles[b.id], arc_radius: vars.arc_sizes[b.id]}, b);
    return function(t) {
      return arc(i(t));
    };
  }

};
d3plus_old.bubbles = function(vars) {

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Private Variables
  //-------------------------------------------------------------------

  var covered = false

  var groups = {},
      donut_size = 0.35,
      title_height = vars.small ? 0 : 30,
      arc_offset = vars.donut ? donut_size : 0,
      sort_order = vars.sort == "value" ? vars.value_var : vars.sort;

  var arc = d3.svg.arc()
    .startAngle(0)
    .innerRadius(function(d) { return d.arc_inner })
    .outerRadius(function(d) { return d.arc_radius })
    .endAngle(function(d) { return d.arc_angle });

  var arc_else = d3.svg.arc()
    .startAngle(0)
    .innerRadius(function(d) { return d.arc_inner_else })
    .outerRadius(function(d) { return d.arc_radius_else })
    .endAngle(function(d) { return d.arc_angle_else });

  var arc_bg = d3.svg.arc()
    .startAngle(0)
    .innerRadius(function(d) { return d.arc_inner_bg })
    .outerRadius(function(d) { return d.arc_radius_bg })
    .endAngle(360);

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Define size scaling
  //-------------------------------------------------------------------
  if (!vars.data) vars.data = []
  var size_domain = d3.extent(vars.data, function(d){
    return d[vars.value_var] == 0 ? null : d[vars.value_var]
  })

  if (!size_domain[1]) size_domain = [0,0]
  if (size_domain[1] == size_domain[0]) size_domain[0] = 0

  vars.size_scale = d3.scale[vars.size_scale_type]()
    .domain(size_domain)
    .range([1,4])

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Calculate positioning for each bubble
  //-------------------------------------------------------------------

  var data_nested = {}
  data_nested.key = "root";
  data_nested.values = d3.nest()
    .key(function(d){ return find_variable(d[vars.id_var],vars.grouping) })
    .entries(vars.data)

  var pack = d3.layout.pack()
    .size([vars.width,vars.height])
    .children(function(d) { return d.values; })
    .value(function(d) { return d[vars.value_var] })
    .padding(0)
    .radius(function(d){ return vars.size_scale(d) })
    .sort(function(a,b) {
      if (a.values && b.values) return a.values.length - b.values.length;
      else return a[vars.value_var] - b[vars.value_var];
    })

  var data_packed = pack.nodes(data_nested)
    .filter(function(d){
      if (d.depth == 1) {
        if (d.children.length == 1 ) {
          d[vars.text_var] = find_variable(d.children[0][vars.id_var],vars.text_var);
          d.category = d.children[0].category;
        }
        else {
          d[vars.text_var] = d.key;
          d.category = d.key;
        }
        d[vars.value_var] = d.value;
      }
      return d.depth == 1;
    })
    .sort(function(a,b){
      var s = sort_order == vars.color_var ? "category" : sort_order
      var a_val = find_variable(a,s)
      var b_val = find_variable(b,s)
      if (typeof a_val == "number") {
        if(a[sort_order] < b[sort_order]) return 1;
        if(a[sort_order] > b[sort_order]) return -1;
      }
      else {
        if(a_val < b_val) return -1;
        if(a_val > b_val) return 1;
      }
      return 0;
    })

  if(data_packed.length == 1) {
    var columns = 1,
        rows = 1;
  }
  else if (data_packed.length < 4) {
    var columns = data_packed.length,
        rows = 1;
  }
  else {
    var rows = Math.ceil(Math.sqrt(data_packed.length/(vars.width/vars.height))),
        columns = Math.ceil(Math.sqrt(data_packed.length*(vars.width/vars.height)));
  }

  if (vars.data.length > 0) {
    while ((rows-1)*columns >= data_packed.length) rows--
  }



  var max_size = d3.max(data_packed,function(d){return d.r;})*2,
      downscale = (d3.min([vars.width/columns,(vars.height/rows)-title_height])*0.90)/max_size;

  var r = 0, c = 0;
  data_packed.forEach(function(d){

    if (d.depth == 1) {

      if (vars.grouping != "active") {
        var color = find_color(d.children[0][vars.id_var]);
      }
      else {
        var color = "#cccccc";
      }

      color = d3.rgb(color).hsl()
      if (color.s > 0.9) color.s = 0.75
      while (color.l > 0.75) color = color.darker()
      color = color.rgb()

      groups[d.key] = {};
      groups[d.key][vars.color_var] = color;
      groups[d.key].children = d.children.length;
      groups[d.key].key = d.key;
      groups[d.key][vars.text_var] = d[vars.text_var];
      groups[d.key].x = ((vars.width/columns)*c)+((vars.width/columns)/2);
      groups[d.key].y = ((vars.height/rows)*r)+((vars.height/rows)/2)+(title_height/2);
      groups[d.key].width = (vars.width/columns);
      groups[d.key].height = (vars.height/rows);
      groups[d.key].r = d.r*downscale;

      if (c < columns-1) c++
      else {
        c = 0
        r++
      }

    }

  })

  vars.data.forEach(function(d){
    var parent = data_packed.filter(function(p){
      if (find_variable(d[vars.id_var],vars.grouping) === false) var key = "false";
      else if (find_variable(d[vars.id_var],vars.grouping) === true) var key = "true";
      else var key = find_variable(d[vars.id_var],vars.grouping)
      return key == p.key
    })[0]
    d.x = (downscale*(d.x-parent.x))+groups[parent.key].x;
    d.y = (downscale*(d.y-parent.y))+groups[parent.key].y;
    d.r = d.r*downscale;
  })

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Set up initial SVG groups
  //-------------------------------------------------------------------

  vars.parent_enter.append('g')
    .attr('class','groups');

  vars.parent_enter.append('g')
    .attr('class','bubbles');

  vars.parent_enter.append('g')
    .attr('class','labels');

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // New labels enter, initialize them here
  //-------------------------------------------------------------------

  if (vars.small) groups = {};

  var group = d3.select("g.groups").selectAll("g.group")
    .data(d3.values(groups),function(d){ return d.key })

  group.enter().append("g")
    .attr("class", "group")
    .attr("transform", function(d){ return "translate("+d.x+","+d.y+")"; })
    .each(function(d){

      if (vars.grouping == "active") {
        var t = d[vars.text_var] == "true" ? "Fully "+vars.active_var : "Not Fully "+vars.active_var
      } else {
        var t = d[vars.text_var]
      }

      d3.select(this).append("text")
        .attr("opacity",0)
        .attr("text-anchor","middle")
        .attr("font-weight",vars.font_weight)
        .attr("font-size","12px")
        .attr("font-family",vars.font)
        .attr("fill",d3plus_old.utils.darker_color(d[vars.color_var]))
        .attr('x',0)
        .attr('y',function(dd) {
          return -(d.height/2)-title_height/4;
        })
        .each(function(){
          d3plus_old.utils.wordwrap({
            "text": t,
            "parent": this,
            "width": d.width,
            "height": 30
          })
        })

    });

  group.transition().duration(d3plus_old.timing)
    .attr("transform", function(d){ return "translate("+d.x+","+d.y+")"; })
    .each(function(d){

      if (vars.group_bgs && d.children > 1) {

        var bg = d3.select(this).selectAll("circle")
          .data([d]);

        bg.enter().append("circle")
          .attr("fill", d[vars.color_var])
          .attr("stroke", d[vars.color_var])
          .attr("stroke-width",1)
          .style('fill-opacity', 0.1 )
          .attr("opacity",0)
          .attr("r",d.r)

        bg.transition().duration(d3plus_old.timing)
          .attr("opacity",1)
          .attr("r",d.r);

      } else {
        d3.select(this).select("circle").transition().duration(d3plus_old.timing)
          .attr("opacity",0)
          .remove();
      }

      d3.select(this).select("text").transition().duration(d3plus_old.timing)
        .attr("opacity",1)
        .attr('y',function(dd) {
          return -(d.height/2)-title_height/4;
        })

    });

  group.exit().transition().duration(d3plus_old.timing)
    .each(function(d){

      if (vars.group_bgs) {
        d3.select(this).select("circle").transition().duration(d3plus_old.timing)
          .attr("r",0)
          .attr("opacity",0);
      }

      d3.select(this).selectAll("text").transition().duration(d3plus_old.timing)
        .attr("opacity",0);

    }).remove();

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // New bubbles enter, initialize them here
  //-------------------------------------------------------------------

  var bubble = d3.select("g.bubbles").selectAll("g.bubble")
    .data(vars.data,function(d){ return d[vars.id_var] })

  update_function = function(obj,d) {



  }

  bubble.transition().duration(d3plus_old.timing)
    .attr("transform", function(d){ return "translate("+d.x+","+d.y+")"; })
    .each(function(d){

      if (vars.donut) d.arc_inner_bg = d.r*arc_offset;
      else d.arc_inner_bg = 0;
      d.arc_radius_bg = d.r;

      var color = find_color(d[vars.id_var])

      var bg_color = d3.hsl(color)
      bg_color.l = 0.95
      bg_color = bg_color.toString()

      d3.select(this).select("path.bg").transition().duration(d3plus_old.timing)
        .attr("fill", bg_color )
        .attr("stroke", color)
        .attrTween("d",arcTween_bg)
        .each("end", function() {
          vars.arc_sizes[d[vars.id_var]+"_bg"] = d.arc_radius_bg
          vars.arc_inners[d[vars.id_var]+"_bg"] = d.arc_inner_bg
        })


      var arc_start = d.r*arc_offset;

      d.arc_inner = arc_start;
      d.arc_radius = arc_start+(d.r-arc_start);

      if (d[vars.total_var]) d.arc_angle = (((d[vars.active_var]/d[vars.total_var])*360) * (Math.PI/180));
      else if (d.active) d.arc_angle = Math.PI;

      d.arc_angle = d.arc_angle < Math.PI*2 ? d.arc_angle : Math.PI*2

      d3.select(this).select("path.available").transition().duration(d3plus_old.timing)
        .style('fill', color)
        .attrTween("d",arcTween)
        .each("end", function() {
          vars.arc_sizes[d[vars.id_var]] = d.arc_radius
          vars.arc_inners[d[vars.id_var]] = d.arc_inner
          vars.arc_angles[d[vars.id_var]] = d.arc_angle
        })

      if (d[vars.else_var]) {

        d.arc_inner_else = arc_start;
        d.arc_radius_else = d.r;

        d.arc_angle_else = d.arc_angle + (((d[vars.else_var] / d[vars.total_var])*360) * (Math.PI/180));
        d.arc_angle_else = d.arc_angle_else < Math.PI*2 ? d.arc_angle_else : Math.PI*2

        d3.select("pattern#hatch"+d[vars.id_var]).select("rect").transition().duration(d3plus_old.timing)
          .style("fill",color)

        d3.select("pattern#hatch"+d[vars.id_var]).select("path").transition().duration(d3plus_old.timing)
          .style("stroke",color)

        d3.select(this).select("path.elsewhere").transition().duration(d3plus_old.timing)
          .style("stroke",color)
          .attrTween("d",arcTween_else)
          .each("end", function() {
            vars.arc_sizes[d[vars.id_var]+"_else"] = d.arc_radius_else
            vars.arc_inners[d[vars.id_var]+"_else"] = d.arc_inner_else
            vars.arc_angles[d[vars.id_var]+"_else"] = d.arc_angle_else
          })
      }

    })

  bubble.enter().append("g")
    .attr("class", "bubble")
    .attr("transform", function(d){ return "translate("+d.x+","+d.y+")"; })
    .each(function(d){

      d3.select(this).append("rect")
        .attr("fill","transparent")
        .attr("opacity",0)
        .attr("x",-d.r)
        .attr("y",-d.r)
        .attr("width",d.r*2)
        .attr("height",d.r*2)

      vars.arc_sizes[d[vars.id_var]+"_bg"] = 0
      vars.arc_inners[d[vars.id_var]+"_bg"] = 0

      var color = find_color(d[vars.id_var])

      var bg_color = d3.hsl(color)
      bg_color.l = 0.95
      bg_color = bg_color.toString()

      d3.select(this).append("path")
        .attr("class","bg")
        .attr("fill", bg_color )
        .attr("stroke", color)
        .attr("stroke-width",1)

      d3.select(this).select("path.bg").transition().duration(d3plus_old.timing)
        .attrTween("d",arcTween_bg)

      if (d[vars.else_var]) {

        vars.arc_angles[d[vars.id_var]+"_else"] = 0
        vars.arc_sizes[d[vars.id_var]+"_else"] = 0
        vars.arc_inners[d[vars.id_var]+"_else"] = 0

        vars.defs.select("pattern#hatch"+d[vars.id_var]).remove()

        var pattern = vars.defs.append("pattern")
          .attr("id","hatch"+d[vars.id_var])
          .attr("patternUnits","userSpaceOnUse")
          .attr("x","0")
          .attr("y","0")
          .attr("width","10")
          .attr("height","10")
          .append("g")

        pattern.append("rect")
          .attr("x","0")
          .attr("y","0")
          .attr("width","10")
          .attr("height","10")
          .attr("fill",color)
          .attr("fill-opacity",0.25)

        pattern.append("line")
          .attr("x1","0")
          .attr("x2","10")
          .attr("y1","0")
          .attr("y2","10")
          .attr("stroke",color)
          .attr("stroke-width",1)

        pattern.append("line")
          .attr("x1","-1")
          .attr("x2","1")
          .attr("y1","9")
          .attr("y2","11")
          .attr("stroke",color)
          .attr("stroke-width",1)

        pattern.append("line")
          .attr("x1","9")
          .attr("x2","11")
          .attr("y1","-1")
          .attr("y2","1")
          .attr("stroke",color)
          .attr("stroke-width",1)

        d3.select(this).append("path")
          .attr("class","elsewhere")
          .attr("fill", "url(#hatch"+d[vars.id_var]+")")
          .attr("stroke",color)
          .attr("stroke-width",1)

        d3.select(this).select("path.elsewhere").transition().duration(d3plus_old.timing)
          .attrTween("d",arcTween_else)
      }

      vars.arc_angles[d[vars.id_var]] = 0
      vars.arc_sizes[d[vars.id_var]] = 0
      vars.arc_inners[d[vars.id_var]] = 0

      d3.select(this).append("path")
        .each(function(dd) { dd.arc_id = dd[vars.id_var]; })
        .attr("class","available")
        .attr('fill', color)

      d3.select(this).select("path.available").transition().duration(d3plus_old.timing)
        .attrTween("d",arcTween)

    })
    .each(function(d){

      if (vars.donut) d.arc_inner_bg = d.r*arc_offset;
      else d.arc_inner_bg = 0;
      d.arc_radius_bg = d.r;

      d3.select(this).select("path.bg").transition().duration(d3plus_old.timing)
        .attrTween("d",arcTween_bg)
        .each("end", function() {
          vars.arc_sizes[d[vars.id_var]+"_bg"] = d.arc_radius_bg
          vars.arc_inners[d[vars.id_var]+"_bg"] = d.arc_inner_bg
        })


      var arc_start = d.r*arc_offset;

      d.arc_inner = arc_start;
      d.arc_radius = arc_start+(d.r-arc_start);

      d3.select(this).select("path.available").transition().duration(d3plus_old.timing)
        .attrTween("d",arcTween)
        .each("end", function() {
          vars.arc_sizes[d[vars.id_var]] = d.arc_radius
          vars.arc_inners[d[vars.id_var]] = d.arc_inner

          if (d[vars.total_var]) d.arc_angle = (((d[vars.active_var] / d[vars.total_var])*360) * (Math.PI/180));
          else if (d.active) d.arc_angle = Math.PI;

          d.arc_angle = d.arc_angle < Math.PI*2 ? d.arc_angle : Math.PI*2

          d3.select(this).transition().duration(d3plus_old.timing*(d.arc_angle/2))
            .attrTween("d",arcTween)
            .each("end", function() {
              vars.arc_angles[d[vars.id_var]] = d.arc_angle
            })
        })

      if (d[vars.else_var]) {

        d.arc_inner_else = arc_start;
        d.arc_radius_else = d.r;

        d3.select(this).select("path.elsewhere").transition().duration(d3plus_old.timing)
          .attrTween("d",arcTween_else)
          .each("end", function() {
            vars.arc_sizes[d[vars.id_var]+"_else"] = d.arc_radius_else
            vars.arc_inners[d[vars.id_var]+"_else"] = d.arc_inner_else

            d.arc_angle_else = d.arc_angle + (((d[vars.else_var] / d[vars.total_var])*360) * (Math.PI/180));

            d.arc_angle_else = d.arc_angle_else < Math.PI*2 ? d.arc_angle_else : Math.PI*2

            d3.select(this).transition().duration(d3plus_old.timing*(d.arc_angle_else/2))
              .attrTween("d",arcTween_else)
              .each("end", function() {
                vars.arc_angles[d[vars.id_var]+"_else"] = d.arc_angle_else
              })
          })
      }

    })


  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Update, for things that are already in existance
  //-------------------------------------------------------------------

  bubble
    .on(d3plus_old.evt.over, function(d){

      covered = false
      d3.select(this).style("cursor","pointer")

      var tooltip_data = get_tooltip_data(d,"short")

      d3plus_old.tooltip.remove(vars.type)
      d3plus_old.tooltip.create({
        "id": vars.type,
        "color": find_color(d[vars.id_var]),
        "icon": find_variable(d[vars.id_var],"icon"),
        "style": vars.icon_style,
        "data": tooltip_data,
        "title": find_variable(d[vars.id_var],vars.text_var),
        "x": d.x+vars.margin.left+vars.parent.node().offsetLeft,
        "y": d.y+vars.margin.top+vars.parent.node().offsetTop,
        "offset": d.r-5,
        "arrow": true,
        "mouseevents": false,
        "footer": footer_text()
      })

    })
    .on(d3plus_old.evt.out, function(d){
      if (!covered) d3plus_old.tooltip.remove(vars.type)
    })
    .on(d3plus_old.evt.click, function(d){

      covered = true
      var id = find_variable(d,vars.id_var)
      var self = this

      make_tooltip = function(html) {
        d3plus_old.tooltip.remove(vars.type)
        d3.selectAll(".axis_hover").remove()

        var tooltip_data = get_tooltip_data(d,"long")

        d3plus_old.tooltip.create({
          "title": find_variable(d,vars.text_var),
          "color": find_color(d),
          "icon": find_variable(d,"icon"),
          "style": vars.icon_style,
          "id": vars.type,
          "fullscreen": true,
          "html": html,
          "footer": vars.footer,
          "data": tooltip_data,
          "mouseevents": self,
          "parent": vars.parent,
          "background": vars.background
        })

      }

      var html = vars.click_function ? vars.click_function(id) : null

      if (typeof html == "string") make_tooltip(html)
      else if (html && html.url && html.callback) {
        d3.json(html.url,function(data){
          html = html.callback(data)
          make_tooltip(html)
        })
      }
      else if (vars.tooltip_info.long) {
        make_tooltip(html)
      }

    })

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Exit, for nodes and links that are being removed
  //-------------------------------------------------------------------

  bubble.exit().transition().duration(d3plus_old.timing)
    .each(function(d){

      d.arc_radius_bg = 0;
      d.arc_inner_bg = 0;

      d3.select(this).select("path.bg").transition().duration(d3plus_old.timing)
        .attrTween("d",arcTween_bg)
        .each("end", function() {
          vars.arc_sizes[d[vars.id_var]+"_bg"] = d.arc_radius_bg
          vars.arc_inners[d[vars.id_var]+"_bg"] = d.arc_inner_bg
        })

      d.arc_radius = 0;
      d.arc_angle = 0;
      d.arc_inner = 0;

      d3.select(this).select("path.available").transition().duration(d3plus_old.timing)
        .attrTween("d",arcTween)
        .each("end", function() {
          vars.arc_angles[d[vars.id_var]] = d.arc_angle
          vars.arc_sizes[d[vars.id_var]] = d.arc_radius
          vars.arc_inners[d[vars.id_var]] = d.arc_inner
        })

      if (d[vars.else_var]) {

        d.arc_angle_else = 0;
        d.arc_radius_else = 0;
        d.arc_inner_else = 0;

        d3.select(this).select("path.elsewhere").transition().duration(d3plus_old.timing)
          .attrTween("d",arcTween_else)
          .each("end", function(dd) {
            vars.arc_angles[d[vars.id_var]+"_else"] = d.arc_angle_else
            vars.arc_sizes[d[vars.id_var]+"_else"] = d.arc_radius_else
            vars.arc_inners[d[vars.id_var]+"_else"] = d.arc_inner_else
          })
      }

      d3.select(this).select("circle.hole").transition().duration(d3plus_old.timing)
        .attr("r", 0)

    })
    .remove();

  //===================================================================

  function arcTween(b) {
    var i = d3.interpolate({arc_angle: vars.arc_angles[b[vars.id_var]], arc_radius: vars.arc_sizes[b[vars.id_var]], arc_inner: vars.arc_inners[b[vars.id_var]]}, b);
    return function(t) {
      return arc(i(t));
    };
  }

  function arcTween_else(b) {
    var i = d3.interpolate({arc_angle_else: vars.arc_angles[b[vars.id_var]+"_else"], arc_radius_else: vars.arc_sizes[b[vars.id_var]+"_else"], arc_inner_else: vars.arc_inners[b[vars.id_var]+"_else"]}, b);
    return function(t) {
      return arc_else(i(t));
    };
  }

  function arcTween_bg(b) {
    var i = d3.interpolate({arc_radius_bg: vars.arc_sizes[b[vars.id_var]+"_bg"], arc_inner_bg: vars.arc_inners[b[vars.id_var]+"_bg"]}, b);
    return function(t) {
      return arc_bg(i(t));
    };
  }

  //===================================================================
};

d3plus_old.rings = function(vars) {

  var tooltip_width = 300

  var width = vars.small ? vars.width : vars.width-tooltip_width

  var tree_radius = vars.height > width ? width/2 : vars.height/2,
      node_size = d3.scale.linear().domain([1,2]).range([8,4]),
      ring_width = vars.small ? tree_radius/2.25 : tree_radius/3,
      total_children,
      hover = null;

  // container for the visualization
  var viz_enter = vars.parent_enter.append("g").attr("class", "viz")
    .attr("transform", "translate(" + width / 2 + "," + vars.height / 2 + ")");

  viz_enter.append("g").attr("class","links")
  viz_enter.append("g").attr("class","nodes")

  d3.select("g.viz").transition().duration(d3plus_old.timing)
    .attr("transform", "translate(" + width / 2 + "," + vars.height / 2 + ")");

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // INIT vars & data munging
  //-------------------------------------------------------------------

  var tree = d3.layout.tree()
      .size([360, tree_radius - ring_width])
      .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

  var diagonal = d3.svg.diagonal.radial()
      .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

  var line = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .interpolate("basis");

  if (vars.data) {
    var root = get_root()
  }
  else {
    var root = {"links": [], "nodes": []}
  }

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // LINKS
  //-------------------------------------------------------------------

  var link = d3.select(".links").selectAll(".link")
    .data(root.links)

  link.enter().append("path")
    .attr("fill", "none")
    .attr("class", "link")
    .attr("opacity",0);

  if (!vars.last_highlight || vars.last_highlight != vars.highlight) {
    link.transition().duration(d3plus_old.timing/2)
      .attr("opacity",0)
      .transition().call(line_styles)
      .transition().duration(d3plus_old.timing/2)
      .attr("opacity",function(d) {
        if (hover && d3.select(this).attr("stroke") == "#ddd") {
           return 0.25
        } return 0.75;
      })
  }
  else {
    link.call(line_styles)
      .attr("opacity",function(d) {
        if (hover && d3.select(this).attr("stroke") == "#ddd") {
           return 0.25
        } return 0.75;
      })
  }

  link.exit().transition().duration(d3plus_old.timing)
    .attr("opacity",0)
    .remove();

  //===================================================================

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // NODES
  //-------------------------------------------------------------------

  var node = d3.select(".nodes").selectAll("g.node")
    .data(root.nodes,function(d){return d[vars.id_var]})

  var node_enter = node.enter().append("g")
      .attr("class", "node")
      .attr("opacity",0)
      .attr("transform", function(d) {
        if (d.depth == 0) return "none"
        else return "rotate(" + (d.ring_x - 90) + ")translate(" + d.ring_y + ")";
      })

  node_enter.append("circle")
    .attr("id",function(d) { return "node_"+d[vars.id_var]; })
    .call(circle_styles)
    .attr("r",0)

  node_enter.append("text")
    .attr("font-weight",vars.font_weight)
    .attr("x",0)
    .attr("font-family",vars.font)
    .attr("opacity",0)
    .call(text_styles);

  node
    .on(d3plus_old.evt.over,function(d){
      if (d.depth != 0) {
        d3.select(this).style("cursor","pointer")
        if (!d3plus_old.ie) {
          d3.select(this).style("cursor","-moz-zoom-in")
          d3.select(this).style("cursor","-webkit-zoom-in")
        }
        hover = d;
        if (!vars.small) {
          link.call(line_styles);
          d3.selectAll(".node circle").call(circle_styles);
          d3.selectAll(".node text").call(text_styles);
        }
      }
    })
    .on(d3plus_old.evt.out,function(d){
      if (d.depth != 0) {
        hover = null;
        if (!vars.small) {
          link.call(line_styles);
          d3.selectAll(".node circle").call(circle_styles);
          d3.selectAll(".node text").call(text_styles);
        }
      }
    })
    .on(d3plus_old.evt.click,function(d){
      if (d.depth != 0) vars.parent.call(chart.highlight(d[vars.id_var]));
    })

  node.transition().duration(d3plus_old.timing)
      .attr("opacity",1)
      .attr("transform", function(d) {
        if (d.depth == 0) return "none"
        else return "rotate(" + (d.ring_x - 90) + ")translate(" + d.ring_y + ")";
      })

  node.select("circle").transition().duration(d3plus_old.timing)
    .call(circle_styles)

  node.select("text").transition().duration(d3plus_old.timing)
    .attr("opacity",function(d){
      if (vars.small) return 0
      else return 1
    })
    .call(text_styles)
    .each(function(d) {
      if (d.depth == 0) {
        var s = Math.sqrt((ring_width*ring_width)/2),
            w = s*1.4,
            h = s/1.4,
            resize = true
      }
      else {
        d3.select(this).attr("font-size","10px")
        var w = ring_width-d.radius*2, resize = false
        if (d.depth == 1) var h = (Math.PI*((tree_radius-(ring_width*2))*2))*(d.size/360);
        if (d.depth == 2) var h = (Math.PI*((tree_radius-ring_width)*2))/total_children;
      }

      if (h < 15) h = 15;

      d3plus_old.utils.wordwrap({
        "text": d.name,
        "parent": this,
        "width": w,
        "height": h,
        "resize": resize,
        "font_min": 10
      })

      d3.select(this).attr("y",(-d3.select(this).node().getBBox().height/2)+"px")

    })

  node.exit().transition().duration(d3plus_old.timing)
      .attr("opacity",0)
      .remove()

  //===================================================================

  hover = null;

  vars.last_highlight = vars.highlight

  if (!vars.small && vars.data) {

    d3plus_old.tooltip.remove(vars.type)

    make_tooltip = function(html) {

      if (typeof html == "string") html = "<br>"+html

      var tooltip_appends = "<div class='d3plus_tooltip_data_title'>"
      tooltip_appends += vars.text_format("Primary Connections")
      tooltip_appends += "</div>"

      vars.connections[vars.highlight].forEach(function(n){

        var parent = "d3.select(&quot;#"+vars.parent.node().id+"&quot;)"

        tooltip_appends += "<div class='d3plus_network_connection' onclick='"+parent+".call(chart.highlight(&quot;"+n[vars.id_var]+"&quot;))'>"
        tooltip_appends += "<div class='d3plus_network_connection_node'"
        tooltip_appends += " style='"
        tooltip_appends += "background-color:"+fill_color(n)+";"
        tooltip_appends += "border-color:"+stroke_color(n)+";"
        tooltip_appends += "'"
        tooltip_appends += "></div>"
        tooltip_appends += "<div class='d3plus_network_connection_name'>"
        tooltip_appends += find_variable(n[vars.id_var],vars.text_var)
        tooltip_appends += "</div>"
        tooltip_appends += "</div>"
      })

      var tooltip_data = get_tooltip_data(vars.highlight)

      d3plus_old.tooltip.remove(vars.type)
      d3plus_old.tooltip.create({
        "title": find_variable(vars.highlight,vars.text_var),
        "color": find_color(vars.highlight),
        "icon": find_variable(vars.highlight,"icon"),
        "style": vars.icon_style,
        "id": vars.type,
        "html": tooltip_appends+html,
        "footer": vars.footer,
        "data": tooltip_data,
        "x": vars.width-tooltip_width-5,
        "y": vars.margin.top+5,
        "max_height": vars.height-10,
        "fixed": true,
        "width": tooltip_width,
        "mouseevents": true,
        "parent": vars.parent,
        "background": vars.background
      })

    }

    var html = vars.click_function ? vars.click_function(vars.highlight,root.nodes) : ""

    if (typeof html == "string") make_tooltip(html)
    else {
      d3.json(html.url,function(data){
        html = html.callback(data)
        make_tooltip(html)
      })
    }

  }

  function fill_color(d) {
    if(find_variable(d[vars.id_var],vars.active_var)){
      return d[vars.color_var];
    }
    else {
      var lighter_col = d3.hsl(d[vars.color_var]);
      lighter_col.l = 0.95;
      return lighter_col.toString()
    }
  }

  function stroke_color(d) {
    if(find_variable(d[vars.id_var],vars.active_var)){
      return "#333";
    } else {
      return d3plus_old.utils.darker_color(d[vars.color_var])
    }
  }

  function line_styles(l) {
    l
      .attr("stroke", function(d) {
        if (hover) {
          if (d.source == hover || d.target == hover ||
          (hover.depth == 2 && (hover.parents.indexOf(d.target) >= 0))) {
            this.parentNode.appendChild(this);
            return vars.highlight_color;
          } else if (hover.depth == 1 && hover.children_total.indexOf(d.target) >= 0) {
            return vars.secondary_color;
          }
          else {
            return "transparent"
          }
        }
        if (d.source[vars.id_var] == vars.highlight) {
          this.parentNode.appendChild(this)
          return "#888"
        }
        else return "#ccc"
      })
      .attr("stroke-width", function(d){
        if (d.source[vars.id_var] == vars.highlight) return 2
        else return 1
      })
      .attr("d", function(d) {
        if (d.source[vars.id_var] == vars.highlight) {
          var x = d.target.ring_y * Math.cos((d.target.ring_x-90)*(Math.PI/180)),
              y = d.target.ring_y * Math.sin((d.target.ring_x-90)*(Math.PI/180))
          return line([{"x":0,"y":0},{"x":x,"y":y}]);
        } else {
          var x1 = d.source.ring_x,
              y1 = d.source.ring_y,
              x2 = d.target.ring_x,
              y2 = d.target.ring_y
          return diagonal({"source":{"x":x1,"y":y1},"target":{"x":x2,"y":y2}});
        }
      })
  }

  function circle_styles(c) {
    c
      .attr("fill", function(d){
        var color = fill_color(d)

        if (d.depth == 0) return color;
        else if (d.depth == 1 && (!hover || d == hover || d.children_total.indexOf(hover) >= 0)) return color;
        else if (d.depth == 2 && (!hover || d == hover || d.parents.indexOf(hover) >= 0)) return color;
        else return "lightgrey"

      })
      .attr("stroke", function(d){
        var color = stroke_color(d)

        if (d.depth == 0) return color;
        else if (d.depth == 1 && (!hover || d == hover || d.children_total.indexOf(hover) >= 0)) return color;
        else if (d.depth == 2 && (!hover || d == hover || d.parents.indexOf(hover) >= 0)) return color;
        else return "darkgrey"

      })
      .attr("stroke-width", "1")
      .attr("r", function(d){
        if (d.depth == 0) return ring_width/2;
        var s = node_size(d.depth);
        if (d.depth == 1) var limit = (Math.PI*((tree_radius-(ring_width*2))*2))/total_children;
        if (d.depth == 2) var limit = (Math.PI*((tree_radius-ring_width)*2))/total_children;
        if (s > limit/2) s = limit/2;
        if (s < 2) s = 2;
        d.radius = s;
        return d.radius;
      })
  }

  function text_styles(t) {
    t
      .attr("fill",function(d){
        if (d.depth == 0) {
          var color = d3plus_old.utils.text_color(fill_color(d));
        }
        else {
          var color = d3plus_old.utils.darker_color(d[vars.color_var]);
        }

        if (d.depth == 0) return color;
        else if (d.depth == 1 && (!hover || d == hover || d.children_total.indexOf(hover) >= 0)) return color;
        else if (d.depth == 2 && (!hover || d == hover || d.parents.indexOf(hover) >= 0)) return color;
        else return "lightgrey"
      })
      .attr("text-anchor", function(d) {
        if (d.depth == 0) return "middle"
        else return d.ring_x%360 < 180 ? "start" : "end";
      })
      .attr("transform", function(d) {
        if (d.depth == 0) return "none"
        else {
          var offset = d.radius*2
          return d.ring_x%360 < 180 ? "translate("+offset+")" : "rotate(180)translate(-"+offset+")";
        }
      })
  }

  function get_root(){

    var links = [], nodes = [], root = {}

    root.ring_x = 0;
    root.ring_y = 0;
    root.depth = 0;
    root[vars.text_var] = find_variable(vars.highlight,vars.text_var)
    root[vars.id_var] = vars.highlight
    root.children = []
    root[vars.color_var] = find_color(vars.highlight)
    root[vars.active_var] = find_variable(vars.highlight,vars.active_var)

    nodes.push(root);

    // populate first level
    var prim_links = vars.connections[vars.highlight]
    if (prim_links) {
      prim_links.forEach(function(child){

        // give first level child the properties
        child.ring_x = 0;
        child.ring_y = ring_width;
        child.depth = 1;
        child[vars.text_var] = find_variable(child[vars.id_var],vars.text_var)
        child.children = []
        child.children_total = []
        child[vars.color_var] = find_color(child[vars.id_var])
        child[vars.active_var] = find_variable(child[vars.id_var],vars.active_var)

        // push first level child into nodes
        nodes.push(child);
        root.children.push(child);

        // create link from center to first level child
        links.push({"source": nodes[nodes.indexOf(root)], "target": nodes[nodes.indexOf(child)]})

        vars.connections[child[vars.id_var]].forEach(function(grandchild){
          child.children_total.push(grandchild);
        })

      })

      // populate second level
      var len = nodes.length,
          len2 = nodes.length

      while(len--) {

        var sec_links = vars.connections[nodes[len][vars.id_var]]
        if (sec_links) {
          sec_links.forEach(function(grandchild){

            // if grandchild isn't already a first level child or the center node
            if (prim_links.indexOf(grandchild) < 0 && grandchild[vars.id_var] != vars.highlight) {

              grandchild.ring_x = 0;
              grandchild.ring_y = ring_width*2;
              grandchild.depth = 2;
              grandchild[vars.text_var] = find_variable(grandchild[vars.id_var],vars.text_var)
              grandchild[vars.color_var] = find_color(grandchild[vars.id_var])
              grandchild[vars.active_var] = find_variable(grandchild[vars.id_var],vars.active_var)
              grandchild.parents = []

              var s = 10000, node_id = 0;
              prim_links.forEach(function(node){
                var temp_links = vars.connections[node[vars.id_var]]
                temp_links.forEach(function(node2){
                  if (node2[vars.id_var] == grandchild[vars.id_var]) {
                    grandchild.parents.push(node);
                    if (temp_links.length < s) {
                      s = temp_links.length
                      node_id = node[vars.id_var]
                    }
                  }
                })
              })
              var len3 = len2;
              while(len3--) {
                if (nodes[len3][vars.id_var] == node_id && nodes[len3].children.indexOf(grandchild) < 0) {
                  nodes[len3].children.push(grandchild);
                }
              }

              // if grandchild hasn't been added to the nodes list, add it
              if (nodes.indexOf(grandchild) < 0) {
                nodes.push(grandchild);
              }

              // create link from child to grandchild
              links.push({"source": nodes[len], "target": nodes[nodes.indexOf(grandchild)]})

            }

          })
        }

      }
    }

    var first_offset = 0

    total_children = d3.sum(nodes,function(dd){
        if (dd.depth == 1) {
          if (dd.children.length > 0) return dd.children.length;
          else return 1;
        } else return 0;
      })


    // sort first level vars.connections by color
    nodes[0].children.sort(function(a, b){
      var a_color = d3.rgb(a[vars.color_var]).hsl().h
      var b_color = d3.rgb(b[vars.color_var]).hsl().h
      if (d3.rgb(a[vars.color_var]).hsl().s == 0) a_color = 361
      if (d3.rgb(b[vars.color_var]).hsl().s == 0) b_color = 361
      if (a_color < b_color) return -1;
      if (a_color > b_color) return 1;
      return 0;
    })

    nodes[0].children.forEach(function(d){
      if (d.children.length > 1) var num = d.children.length;
      else var num = 1;
      d.ring_x = ((first_offset+(num/2))/total_children)*360
      d.size = (num/total_children)*360
      if (d.size > 180) d.size = 180

      var positions = (num)/2

      // sort children by color
      d.children.sort(function(a, b){
        var a_color = d3.rgb(a[vars.color_var]).hsl().h
        var b_color = d3.rgb(b[vars.color_var]).hsl().h
        if (d3.rgb(a[vars.color_var]).hsl().s == 0) a_color = 361
        if (d3.rgb(b[vars.color_var]).hsl().s == 0) b_color = 361
        if (a_color < b_color) return -1;
        if (a_color > b_color) return 1;
        return 0;
      })

      d.children.forEach(function(c,i){
        if (d.children.length <= 1) c.ring_x = d.ring_x
        else c.ring_x = d.ring_x+(((i+0.5)-positions)/positions)*(d.size/2)
      })
      first_offset += num
    })


    return {"nodes": nodes, "links": links};
  }
};

})();
