var calledRenderFunc = false // a flag to ensure not to render viz twice

// Fetch data from the server and render visualization
fetch('http://localhost:8080/').then(function(response) { 
  response.json().then(data => {  
    if (!calledRenderFunc) {
      renderNetworkViz(data.nodes, data.links);
      calledRenderFunc = true;
    }
  })
  .catch(e => console.log(e));
})

/**
 * ============================================================================
 * ======================= Begin Utility Functions ============================
 * ============================================================================
 */

function getNeighbors(node) {
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
    return node.level === 1 ? 'blue' : 'green'
  }
  return node.level === 1 ? 'red' : 'gray'
}

function getLinkColor(node, link) {
  return isNeighborLink(node, link) ? 'green' : '#E5E5E5'
}

function getTextColor(node, neighbors) {
  return Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1 ? 'green' : 'black'
}

function selectNode(selectedNode) {
  var neighbors = getNeighbors(selectedNode)
  // we modify the styles to highlight selected nodes
  nodeElements.attr('fill', function (node) { return getNodeColor(node, neighbors) })
  textElements.attr('fill', function (node) { return getTextColor(node, neighbors) })
  linkElements.attr('stroke', function (link) { return getLinkColor(selectedNode, link) })
}

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
  // Define width and height for SVG/visualization
  var width = window.innerWidth/1.1
  var height = window.innerHeight/2
  
  // Select svg from DOM
  var svg = d3.select('svg')
  
  // Set width and height of SVG
  svg.attr('width', width).attr('height', height)
  
  // Set up link force for simulation
  var linkForce = d3
    .forceLink()
    .id(function (link) { return link.id })
    .strength(function (link) { return link.strength })
  
  // Set up simulation
  var simulation = d3
    .forceSimulation()
    .force('link', linkForce)
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(width / 2, height / 2))
  
  // Determine what happens when dragging and dropping nodes
  var dragDrop = d3.drag().on('start', function (node) {
    node.fx = node.x
    node.fy = node.y
  }).on('drag', function (node) {
    simulation.alphaTarget(0.7).restart()
    node.fx = d3.event.x
    node.fy = d3.event.y
  }).on('end', function (node) {
    if (!d3.event.active) {
      simulation.alphaTarget(0)
    }
    node.fx = null
    node.fy = null
  })
  
  // Create Link Elements
  var linkElements = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
      .attr("pathLength", "10")
      .attr("stroke-width", 1)
      .attr("stroke", "rgba(50, 50, 50, 0.2)")
  
  // Create Node Elements
  var nodeElements = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
      .attr("r", 10)
      .attr("fill", getNodeColor)
      .call(dragDrop)
      .on('click', selectNode)
  
  // Create Node Labels
  var nodeText = svg.append("g")
    .attr("class", "texts")
    .selectAll("text")
    .data(nodes)
    .enter().append("text")
      .text(function (node) { return  node.label })
      .attr("font-size", 15)
      .attr("dx", 15)
      .attr("dy", 4)
  
  // Create Link Labels
  var linkText = svg.append("g")
    .attr("class", "texts")
    .selectAll("text")
    .data(links)
    .enter().append("text")
      .text(function (link) { return  link.strength })
      .attr("font-size", 15)
      .attr("dx", 0)
      .attr("dy", 0)    
  
  // Start simulation of network of nodes
  simulation.nodes(nodes).on('tick', () => {
    nodeElements
      .attr('cx', function (node) { return node.x })
      .attr('cy', function (node) { return node.y })
    nodeText
      .attr('x', function (node) { return node.x })
      .attr('y', function (node) { return node.y })
    linkElements
    .attr('x1', function (link) { return link.source.x })
    .attr('y1', function (link) { return link.source.y })
    .attr('x2', function (link) { return link.target.x })
    .attr('y2', function (link) { return link.target.y })
    linkText
      .attr('x', function (link) { return (link.source.x+link.target.x)/2 })
      .attr('y', function (link) { return (link.source.y+link.target.y)/2 })
  })
  
  // Start simulation of links connectin the nodes 
  simulation.force("link").links(links)
}