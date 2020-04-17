var idToTitle // declare here so it has global scope
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
                              selectedMovies=[1,2,145,318,6238,920],
                              numUsersToProcess=10,
                              likeThreshold=0,
                              idToTitle,
                              nearestOnly=true) {
  let nodes = []
  let links = []
  for (let i=0; i<=numUsersToProcess && i<=TOTAL_NUM_OF_USERS; i++){
    let userId = i === 0 ? username : i
    nodes.push({"id": userId})
    for (let d of ratingData){
      if (d["id"] === userId || d["id"] < i) {
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
    if (nearestOnly) {  // if want to se nearest neighbors only
      for (let i=1; i<=numUsersToProcess && i<=TOTAL_NUM_OF_USERS; i++){
        let found = findUndirectedEdge(links, target=userId, source=i)
        if (found) {
          nodes.push({"id": i})
        }
      }
      break; // stop constructing the network
    }
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
      let nearestOnly = document.getElementById('nearestOnly').checked
      idToTitle = dataDict.idToTitleDict // need to be global scope
      let nodesAndLinks = extractNodesAndLinks(dataDict.ratingData,
                                               username=username,
                                               selectedMovies=[1,2,145,318,6238,920],
                                               numUsersToProcess=numUsersToProcess,
                                               likeThreshold=likeThreshold,
                                               idToTitle=idToTitle,
                                               nearestOnly=nearestOnly)                                              
      renderNetworkViz(nodesAndLinks.nodes, nodesAndLinks.links, username)
    })
    .catch(e => console.log(e))
  })
}

function starSliderChange(value){
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

function displayNumUsers(value) {
  document.getElementById('numUsersDisplay').innerHTML = value
}

// =================== code for auto-complete movie search ====================

var countries = [{"name":"Afghanistan"},{"name":"Åland Islands"},{"name":"Albania"},{"name":"Algeria"},{"name":"American Samoa"},{"name":"Andorra"},{"name":"Angola"},{"name":"Anguilla"},{"name":"Antarctica"},{"name":"Antigua and Barbuda"},{"name":"Argentina"},{"name":"Armenia"},{"name":"Aruba"},{"name":"Australia"},{"name":"Austria"},{"name":"Azerbaijan"},{"name":"Bahamas"},{"name":"Bahrain"},{"name":"Bangladesh"},{"name":"Barbados"},{"name":"Belarus"},{"name":"Belgium"},{"name":"Belize"},{"name":"Benin"},{"name":"Bermuda"},{"name":"Bhutan"},{"name":"Bolivia (Plurinational State of)"},{"name":"Bonaire, Sint Eustatius and Saba"},{"name":"Bosnia and Herzegovina"},{"name":"Botswana"},{"name":"Bouvet Island"},{"name":"Brazil"},{"name":"British Indian Ocean Territory"},{"name":"United States Minor Outlying Islands"},{"name":"Virgin Islands (British)"},{"name":"Virgin Islands (U.S.)"},{"name":"Brunei Darussalam"},{"name":"Bulgaria"},{"name":"Burkina Faso"},{"name":"Burundi"},{"name":"Cambodia"},{"name":"Cameroon"},{"name":"Canada"},{"name":"Cabo Verde"},{"name":"Cayman Islands"},{"name":"Central African Republic"},{"name":"Chad"},{"name":"Chile"},{"name":"China"},{"name":"Christmas Island"},{"name":"Cocos (Keeling) Islands"},{"name":"Colombia"},{"name":"Comoros"},{"name":"Congo"},{"name":"Congo (Democratic Republic of the)"},{"name":"Cook Islands"},{"name":"Costa Rica"},{"name":"Croatia"},{"name":"Cuba"},{"name":"Curaçao"},{"name":"Cyprus"},{"name":"Czech Republic"},{"name":"Denmark"},{"name":"Djibouti"},{"name":"Dominica"},{"name":"Dominican Republic"},{"name":"Ecuador"},{"name":"Egypt"},{"name":"El Salvador"},{"name":"Equatorial Guinea"},{"name":"Eritrea"},{"name":"Estonia"},{"name":"Ethiopia"},{"name":"Falkland Islands (Malvinas)"},{"name":"Faroe Islands"},{"name":"Fiji"},{"name":"Finland"},{"name":"France"},{"name":"French Guiana"},{"name":"French Polynesia"},{"name":"French Southern Territories"},{"name":"Gabon"},{"name":"Gambia"},{"name":"Georgia"},{"name":"Germany"},{"name":"Ghana"},{"name":"Gibraltar"},{"name":"Greece"},{"name":"Greenland"},{"name":"Grenada"},{"name":"Guadeloupe"},{"name":"Guam"},{"name":"Guatemala"},{"name":"Guernsey"},{"name":"Guinea"},{"name":"Guinea-Bissau"},{"name":"Guyana"},{"name":"Haiti"},{"name":"Heard Island and McDonald Islands"},{"name":"Holy See"},{"name":"Honduras"},{"name":"Hong Kong"},{"name":"Hungary"},{"name":"Iceland"},{"name":"India"},{"name":"Indonesia"},{"name":"Côte d'Ivoire"},{"name":"Iran (Islamic Republic of)"},{"name":"Iraq"},{"name":"Ireland"},{"name":"Isle of Man"},{"name":"Israel"},{"name":"Italy"},{"name":"Jamaica"},{"name":"Japan"},{"name":"Jersey"},{"name":"Jordan"},{"name":"Kazakhstan"},{"name":"Kenya"},{"name":"Kiribati"},{"name":"Kuwait"},{"name":"Kyrgyzstan"},{"name":"Lao People's Democratic Republic"},{"name":"Latvia"},{"name":"Lebanon"},{"name":"Lesotho"},{"name":"Liberia"},{"name":"Libya"},{"name":"Liechtenstein"},{"name":"Lithuania"},{"name":"Luxembourg"},{"name":"Macao"},{"name":"Macedonia (the former Yugoslav Republic of)"},{"name":"Madagascar"},{"name":"Malawi"},{"name":"Malaysia"},{"name":"Maldives"},{"name":"Mali"},{"name":"Malta"},{"name":"Marshall Islands"},{"name":"Martinique"},{"name":"Mauritania"},{"name":"Mauritius"},{"name":"Mayotte"},{"name":"Mexico"},{"name":"Micronesia (Federated States of)"},{"name":"Moldova (Republic of)"},{"name":"Monaco"},{"name":"Mongolia"},{"name":"Montenegro"},{"name":"Montserrat"},{"name":"Morocco"},{"name":"Mozambique"},{"name":"Myanmar"},{"name":"Namibia"},{"name":"Nauru"},{"name":"Nepal"},{"name":"Netherlands"},{"name":"New Caledonia"},{"name":"New Zealand"},{"name":"Nicaragua"},{"name":"Niger"},{"name":"Nigeria"},{"name":"Niue"},{"name":"Norfolk Island"},{"name":"Korea (Democratic People's Republic of)"},{"name":"Northern Mariana Islands"},{"name":"Norway"},{"name":"Oman"},{"name":"Pakistan"},{"name":"Palau"},{"name":"Palestine, State of"},{"name":"Panama"},{"name":"Papua New Guinea"},{"name":"Paraguay"},{"name":"Peru"},{"name":"Philippines"},{"name":"Pitcairn"},{"name":"Poland"},{"name":"Portugal"},{"name":"Puerto Rico"},{"name":"Qatar"},{"name":"Republic of Kosovo"},{"name":"Réunion"},{"name":"Romania"},{"name":"Russian Federation"},{"name":"Rwanda"},{"name":"Saint Barthélemy"},{"name":"Saint Helena, Ascension and Tristan da Cunha"},{"name":"Saint Kitts and Nevis"},{"name":"Saint Lucia"},{"name":"Saint Martin (French part)"},{"name":"Saint Pierre and Miquelon"},{"name":"Saint Vincent and the Grenadines"},{"name":"Samoa"},{"name":"San Marino"},{"name":"Sao Tome and Principe"},{"name":"Saudi Arabia"},{"name":"Senegal"},{"name":"Serbia"},{"name":"Seychelles"},{"name":"Sierra Leone"},{"name":"Singapore"},{"name":"Sint Maarten (Dutch part)"},{"name":"Slovakia"},{"name":"Slovenia"},{"name":"Solomon Islands"},{"name":"Somalia"},{"name":"South Africa"},{"name":"South Georgia and the South Sandwich Islands"},{"name":"Korea (Republic of)"},{"name":"South Sudan"},{"name":"Spain"},{"name":"Sri Lanka"},{"name":"Sudan"},{"name":"Suriname"},{"name":"Svalbard and Jan Mayen"},{"name":"Swaziland"},{"name":"Sweden"},{"name":"Switzerland"},{"name":"Syrian Arab Republic"},{"name":"Taiwan"},{"name":"Tajikistan"},{"name":"Tanzania, United Republic of"},{"name":"Thailand"},{"name":"Timor-Leste"},{"name":"Togo"},{"name":"Tokelau"},{"name":"Tonga"},{"name":"Trinidad and Tobago"},{"name":"Tunisia"},{"name":"Turkey"},{"name":"Turkmenistan"},{"name":"Turks and Caicos Islands"},{"name":"Tuvalu"},{"name":"Uganda"},{"name":"Ukraine"},{"name":"United Arab Emirates"},{"name":"United Kingdom of Great Britain and Northern Ireland"},{"name":"United States of America"},{"name":"Uruguay"},{"name":"Uzbekistan"},{"name":"Vanuatu"},{"name":"Venezuela (Bolivarian Republic of)"},{"name":"Viet Nam"},{"name":"Wallis and Futuna"},{"name":"Western Sahara"},{"name":"Yemen"},{"name":"Zambia"},{"name":"Zimbabwe"}];
console.log(countries);

countries.map(function(element, index) {
  countries[index] = element.name;
});

// variables
var input = document.getElementById("autocomplete-input");
var results, countries_to_show = [];
var autocomplete_results = document.getElementById("autocomplete-results");

// functions
function autocomplete(val) {
  var countries_returned = [];

  for (i = 0; i < countries.length; i++) {
    if (val === countries[i].toLowerCase().slice(0, val.length)) {
      countries_returned.push(countries[i]);
    }
  }

  return countries_returned;
}

// events
input.onkeyup = function(e) {
  input_val = this.value.toLowerCase();

  if (input_val.length > 0) {
    autocomplete_results.innerHTML = "";
    countries_to_show = autocomplete(input_val);

    for (i = 0; i < countries_to_show.length; i++) {
      autocomplete_results.innerHTML +=
        "<li id=" +
        countries_to_show[i] +
        ' class="list-item">' +
        countries_to_show[i] +
        "</li>";
    }
    autocomplete_results.style.display = "block";
  } else {
    countries_to_show = [];
    autocomplete_results.innerHTML = "";
  }
};

// Get the element, add a click listener...
document
  .getElementById("autocomplete-results")
  .addEventListener("click", function(e) {
    // e.target is the clicked element!
    // If it was a list item
    if (e.target && e.target.nodeName == "LI") {
      // List item found!  Output the value!
      console.log(e.target.innerHTML);
      input.value = e.target.innerHTML;
      autocomplete_results.innerHTML = null; //empty the value
    }
  });

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
  var width = window.innerWidth/1.1 * 0.75
  var height = window.innerHeight/1.25
  
  // Select svg from DOM
  var svg = d3.select('svg')
  
  // Set width and height of SVG
  svg.attr('width', width).attr('height', height)
  
  // Set up link force for simulation
  var linkForce = d3
    .forceLink()
    .id(function (link) { return link.id })
    .strength(function (link) { return (0.001 * nodes.length) })
  
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