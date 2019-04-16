window.onload = start;

function start() {

var graph = document.getElementById("graph")
var fatality = document.getElementById("fatality")
var severity = document.getElementById("severity")

var width = 615
var height = 600

var fatality_graph = d3.select(fatality)
    .append("svg")
    .attr("width", width)
    .attr("height", height)

var severity_graph = d3.select(severity)
    .append("svg")
    .attr("width", width)
    .attr("height", height)

//FATALITIES STUFF
var bars = fatality_graph.append('g').attr("id", "fatalities_by_year");
var xScale = d3.scaleLinear().range([45, width-20])
var yScale = d3.scaleLinear().range([height - 50, 0])
var yAxis = d3.axisLeft(yScale)
var xAxis = d3.axisBottom(xScale)

//SEVERITY STUFF




//START DATA AND D3
d3.csv("aircraft_incidents.csv", function(csv){

    //DATA AGGREGATION
    for (var i = 0; i < csv.length; i++) {
        csv[i].location = csv[i].Location.toUpperCase()
        csv[i].event_date = new Date(csv[i].Event_Date)
        csv[i].country = csv[i].Country.toUpperCase()
        csv[i].severity = csv[i].Injury_Severity == "Non-Fatal" ? 
            "Non-Fatal" : csv[i].Injury_Severity == "Incident" ? 
            "Incident" : csv[i].Injury_Severity == "Unavailable" ? "Unavailable" : "Fatal"
        csv[i].make = csv[i].Make.toUpperCase()
        csv[i].carrier = csv[i].Air_Carrier.toUpperCase()
        csv[i].phase = csv[i].Broad_Phase_of_Flight.toUpperCase()
        csv[i].fatalities = csv[i].Total_Fatal_Injuries
    }

    //START FATALITIES BY YEAR
    var fatalities_by_year = d3.nest().key(function(d){
        return d.event_date.getFullYear()
    }).rollup(function(v){
        return d3.sum(v, function(d){
            return d.fatalities
        })
    }).entries(csv)

    xScale.domain([d3.min(fatalities_by_year, function(d){
        return d.key;
    }), d3.max(fatalities_by_year, function(d){
        return d.key;
    })])

    yScale.domain([0, d3.max(fatalities_by_year, function(d){
        return d.value;
    })])

    bars.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(35, 0)')
        .call(yAxis)
    bars.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0, 560)')
        .call(xAxis)
    
    
    var first = null
    bars.append('g')
        .selectAll(".bar")
        .data(fatalities_by_year)
        .enter()
        .append('rect')
        .attr('class', 'fatality_bar')
        .attr('x', function(d, i){
            return i * (600 / 25) + 40 + i * 2
        })
        .attr('y', function(d, i){
            return yScale(d.value)
        })
        .attr('height', function(d, i){
            return yScale(0) - yScale(d.value)
        })
        .attr('width', function(d) {
            return (width-20)/35
        })
        .attr("style", "border:5px solid black")
        .on("mouseover", function(d){
            if (first != null) {
                refreshTable(this.__data__);
			} else {
                populateTable(this.__data__)
                first = 0                
			}
        })
        .on("mouseleave", function(d){
            clearTable()
        })
    
    function clearTable(){
        d3.select("#strong-fatality_chart_year").html("")
        d3.select("#strong-fatality_chart_fatalities").html("")
    }

    function refreshTable(data) {
        d3.select("#strong-fatality_chart_year").html(data.key)
        d3.select("#strong-fatality_chart_fatalities").html(data.value)
    }

    function populateTable(data) {
        d3.select("#fatality_chart_year").append("strong").attr("id", "strong-fatality_chart_year").text(data.key)
        d3.select("#fatality_chart_fatalities").append("strong").attr("id", "strong-fatality_chart_fatalities").text(data.value)
    }	


    // START LOCATION OF PERCENTAGE OF INJURY SEVERITY


})

}