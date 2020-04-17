const TOTAL_NUM_OF_USERS = 610  // number of users in the rating data
submitForm()  // Submit form to immediately generate viz upon webpage load

/*
 * ============================================================================
 * ================== Begin Data Processing Functions =====================
 * ============================================================================
 */

function findUndirectedEdge(links, target, source){
  for (let link of links){
    if ((link["target"] === target && link["source"] === source) ||
        (link["target"] === source && link["source"] === target)) {
          return link
        }
  }
  return false
}

function extractNodesAndLinks(ratingData,
                              username="User",
                              selectedMovies=[1,318,6238,920],
                              numUsersToProcess=10,
                              likeThreshold=0,
                              idToTitle) {
  let nodes = []
  let links = []
  for (let i=0; i<=numUsersToProcess && i<=TOTAL_NUM_OF_USERS; i++){
    let userId = i === 0 ? username : i
    nodes.push({"id": userId})
    for (let d of ratingData){
      if (d["id"] === userId) {
        continue
      } else if(d["id"] <= numUsersToProcess
                && d["rating"] >= likeThreshold
                && selectedMovies.includes(d["movieId"])){
        let found = findUndirectedEdge(links, target=userId, source=d["id"])
        let movieTitle = idToTitle[String(d["movieId"])].title
        if (found && (!found["movies"].includes(movieTitle))){
          found["movies"].push(movieTitle) 
        } else {
          links.push({"target":userId, "source":d["id"], "movies":[movieTitle]})
        }
      }
    }
    console.log('finished with user:', userId)
  }
  return {"nodes":nodes, "links":links}
}

/*
 * ============================================================================
 * ================== End Data Processing Functions =====================
 * ============================================================================
 */

/*
 * ============================================================================
 * ================== Begin Form Event Handling Functions =====================
 * ============================================================================
 */

function submitForm(){
  // Fetch data from the server and render visualization
  fetch('http://localhost:8080/').then(function(response) { 
    response.json()
    .then(dataDict => {
      let username = document.getElementById('username').value
      username = username === "" ? "Jane" : username
      let likeThreshold = Number(document.getElementById('likeThreshold').value)
      let numUsersToProcess = Number(document.getElementById('numUsers').value)
      let nodesAndLinks = extractNodesAndLinks(dataDict.ratingData,
                                               username=username,
                                               selectedMovies=[1,318,6238,920],
                                               numUsersToProcess=numUsersToProcess,
                                               likeThreshold=likeThreshold,
                                               idToTitle=dataDict.idToTitleDict)                                              
      renderNetworkViz(nodesAndLinks.nodes, nodesAndLinks.links, username)
    })
    .catch(e => console.log(e))
  })
}

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

function isNeighborLink(node, link) {
  return link.target.id === node.id || link.source.id === node.id
}

function getNodeColor(node, neighbors) {
  if (Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1) {
    return neighbors.indexOf(node.id) === 0 ? 'blue' : 'green'
  }
  return node.id === username ? 'black' : 'gray'
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
function renderNetworkViz(nodes, links, username) {
  // Remove potential pre-existing chart
  document.getElementById("viz").innerHTML = "";

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

  // local utility funciton to get neighbors of node (needs to be local)
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
    nodeElements.attr('fill', node => node.id === username ? 'black' : 'gray')
    nodeLabels.attr('fill', 'white')
    linkElements.attr('stroke', '#E5E5E5')
  }

  // add the tooltip area to the webpage
  var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)

  function mouseOverLink(link) {
    let person1 = link.source.id === username ? username : "person " + link.source.id
    let person2 = link.target.id === username ? username : "person " + link.target.id
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