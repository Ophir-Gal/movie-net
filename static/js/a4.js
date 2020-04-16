var nodes, links // give those variables a global scope
// Fetch data from the server and render visualization
fetch('http://localhost:8080/').then(function(response) { 
  response.json().then(data => { 
    nodes = data.nodes
    links = data.links
    renderNetworkViz(nodes, links)
  })
  .catch(e => console.log(e))
})

/*
 * ============================================================================
 * ================== Begin Form Event Handling Functions =====================
 * ============================================================================
 */
function sliderChange(value){
  let span = document.getElementById('ratingStars')
  span.innerHTML = ""
  let star_count = 0
  if (value > 0){
    let i = 0.5
    for (i=0; i<Math.floor(value); i++){
      let full_star = document.createElement("span")
      full_star.setAttribute('class', 'fa fa-star my-star-icon')
      span.appendChild(full_star)
      star_count++
    }
    if (value > Math.floor(value)){
      let half_star = document.createElement("span")
      half_star.setAttribute('class', 'fa fa-star-half-full my-star-icon')
      span.appendChild(half_star)
      star_count++
    }
  }
  while (star_count < 5){
      let empty_star = document.createElement("span")
      empty_star.setAttribute('class', 'fa fa-star-o my-star-icon')
      span.appendChild(empty_star)
      star_count++
  }
}

/*
 * ============================================================================
 * ================== End Form Event Handling Functions =======================
 * ============================================================================
 */

/*
 * ============================================================================
 * ======================= Begin Utility Functions ============================
 * ============================================================================
 */

function getNeighbors(node) {
  // notice - links is a global variable here
  return links.reduce(function (neighbors, link) {
      if (link.target.id === node.id) {
        neighbors.push(link.source.id)
      } else if (link.source.id === node.id) {
        neighbors.push(link.target.id)
      }
      return neighbors
    },
    [node.id]
  )
}

function isNeighborLink(node, link) {
  return link.target.id === node.id || link.source.id === node.id
}

function getNodeColor(node, neighbors) {
  if (Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1) {
    return neighbors.indexOf(node.id) === 0 ? 'blue' : 'green'
  }
  return node.id === "User" ? 'black' : 'gray'
}

function getLinkColor(node, link) {
  return isNeighborLink(node, link) ? 'green' : '#E5E5E5'
}

/*function getTextColor(node, neighbors) {
  return Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1 ? 'white' : 'black'
}*/

/**
 * ============================================================================
 * ========================= End Utility Functions ============================
 * ============================================================================
 */

/**============================================================================
 * ============================= Main Function ================================
 * ============================================================================
 */
function renderNetworkViz(nodes, links) {
  // give parameters a global scope
  var nodes = nodes
  var links = links

  // Define width and height for SVG/visualization
  var width = window.innerWidth/1.1
  var height = window.innerHeight/1.25
  
  // Select svg from DOM
  var svg = d3.select('svg')
  
  // Set width and height of SVG
  svg.attr('width', width).attr('height', height)
  
  // Set up link force for simulation
  var linkForce = d3
    .forceLink()
    .id(function (link) { return link.id })
    .strength(function (link) { return 0.01 / nodes.length })
  
  // Set up simulation
  var simulation = d3
    .forceSimulation()
    .force('link', linkForce)
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(width / 2, height / 2))
  
  // Create Link Elements
  var linkElements = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
      .attr("pathLength", "10")
      .attr("stroke-width", 3)
      .attr("stroke", "rgba(50, 50, 50, 0.2)")
  
  // Create Node Elements (Person Shapes)
  var nodeElements = svg.append("g")
    .attr("class", "nodes")
    .selectAll("use")
    .data(nodes)
    .enter()
    .append("use")
    .attr("href", "#user-icon-g")
    .attr("transform", "translate(-38,-25)")
    .attr("fill", getNodeColor)
    .on('mouseover', mouseOverNode)
    .on('mouseout', mouseOutNode)

  // Handle drag events
  var dragHandler = d3.drag()
      .on("drag", function (d) {
          d3.select(this)
              .attr("x", d.x = d3.event.x)
              .attr("y", d.y = d3.event.y)
      })

  dragHandler(svg.selectAll("use"))
  
  // Create Node Labels
  var nodeLabels = svg.append("g")
    .attr("class", "texts")
    .selectAll("text")
    .data(nodes)
    .enter().append("text")
      .text(function (node) { return  node.id })
      .attr("font-size", 14)
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .attr("fill", "white")
      .attr("dx", -6)
      .attr("dy", 29)

  // Define what happens when hovering over node
  function mouseOverNode(selectedNode) {
    var neighbors = getNeighbors(selectedNode)
    // we modify the styles to highlight selected nodes
    nodeElements.attr('fill', function (node) { return getNodeColor(node, neighbors) })
    //nodeLabels.attr('fill', function (node) { return getTextColor(node, neighbors) })
    linkElements.attr('stroke', function (link) { return getLinkColor(selectedNode, link) })
  }

  // Define when not hovering over node anymore
  function mouseOutNode(selectedNode) {
    // we modify the styles to not highlight selected nodes
    nodeElements.attr('fill', node => node.id === "User" ? 'black' : 'gray')
    nodeLabels.attr('fill', 'white')
    linkElements.attr('stroke', '#E5E5E5')
  }

  // add the tooltip area to the webpage
  var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)

  function mouseOverLink(link) {
    let person1 = link.source.id === "User" ? "User" : "person " + link.source.id
    let person2 = link.target.id === "User" ? "User" : "person " + link.target.id
    tooltip
      .style("opacity", 1)
      .html(`<ul class='tooltip'><strong>Movies liked by ${person1} and ${person2}:</strong>
      <li>${link.movies.join("</li><li>")}</li></ul>`)
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + "px")
  }

  function mouseOutLink(link) {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0)
  }

  
  // Create Link Labels
  var linkLabels = svg.append("g")
    .attr("class", "texts")
    .selectAll("use")
    .data(links)
    .enter().append("use")
      .attr("href", "#film-icon-g")
      .attr("transform", "translate(-10,-10)")
      .on('mouseout', mouseOutLink)
      .on('mouseover', mouseOverLink)
  

  // Define what happens at every tick of the simulation's internal timer
  simulation.nodes(nodes).on('tick', () => {
    nodeElements
      .attr('x', function (node) { return node.x })
      .attr('y', function (node) { return node.y })
    nodeLabels
      .attr('x', function (node) { return node.x })
      .attr('y', function (node) { return node.y })
    linkElements
    .attr('x1', function (link) { return link.source.x })
    .attr('y1', function (link) { return link.source.y })
    .attr('x2', function (link) { return link.target.x })
    .attr('y2', function (link) { return link.target.y })
    linkLabels
      .attr('x', function (link) { return (link.source.x+link.target.x)/2 })
      .attr('y', function (link) { return (link.source.y+link.target.y)/2 })
  })

  // Make simulation run non-stop
  simulation.on('end', () => simulation.restart())
  
  // Start simulation of links connecting the nodes 
  simulation.force("link").links(links)
}