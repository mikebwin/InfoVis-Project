window.onload = start;

function start() {

var graph = document.getElementById("graph")
var fatality = document.getElementById("fatality")
var severity = document.getElementById("severity")

//width and height to define svgs
var width_fatality = 615
var height_fatality = 600
var width_severity = 600
var height_severity = 600

var fatality_graph = d3.select(fatality)
    .append("svg")
    .attr("width", width_fatality)
    .attr("height", height_fatality)

var severity_graph = d3.select(severity)
    .append("svg")
    .attr("width", width_fatality)
    .attr("height", height_fatality)

//FATALITIES STUFF

var bars = fatality_graph.append('g').attr("id", "fatalities_by_year");
var xScaleFatality = d3.scaleLinear().range([45, width_fatality-20])
var yScaleFatality = d3.scaleLinear().range([height_fatality - 50, 0])
var yAxisFatality = d3.axisLeft(yScaleFatality)
var xAxisFatality = d3.axisBottom(xScaleFatality)

//SEVERITY STUFF
var pie_chart = severity_graph.append('g').attr("id", "severity_breakdown")

var radius_severity = (Math.min(height_severity, width_severity) - 30)/ 2
var color = d3.scaleOrdinal().range(["#363847","#aeb2bf","#e1575c", "#818a8b"])


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
    {
    var fatalities_by_year = d3.nest().key(function(d){
        return d.event_date.getFullYear()
    }).rollup(function(v){
        return d3.sum(v, function(d){
            return d.fatalities
        })
    }).entries(csv)

    xScaleFatality.domain([d3.min(fatalities_by_year, function(d){
        return d.key;
    }), d3.max(fatalities_by_year, function(d){
        return d.key;
    })])

    yScaleFatality.domain([0, d3.max(fatalities_by_year, function(d){
        return d.value;
    })])

    bars.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(35, 0)')
        .call(yAxisFatality)
    bars.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0, 560)')
        .call(xAxisFatality)
    
    
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
            return yScaleFatality(d.value)
        })
        .attr('height', function(d, i){
            return yScaleFatality(0) - yScaleFatality(d.value)
        })
        .attr('width', function(d) {
            return (width_fatality-20)/35
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
    }

    // START LOCATION OF PERCENTAGE OF INJURY SEVERITY
    
    {

    var breakdown = d3.nest().key(function(d) {
        return d.severity
    }).rollup(function(v){
        return v.length
    }).entries(csv)

    var pie = d3.pie().value(function(d){
        return d.value;
    })(breakdown);   

    var arc = d3.arc()
        .outerRadius(radius_severity - 10)
        .innerRadius(width_severity/5);
    var labelArc = d3.arc()
        .outerRadius(radius_severity - 40)
        .innerRadius(radius_severity - 40)

    pie_chart.attr("transform", "translate(" + width_severity/2 + "," + height_severity/2 + ")")
    var arcs = pie_chart.selectAll("arc")
        .data(pie)
        .enter()
        .append("g")
        .attr("class", "arc")
    arcs.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.key)})
        .on("mouseover", function(d){
            arcs.select("text").text(d.data.key + "\n" + d.data.value)
            //for some reason color doesn't work. I'm frustrated
            .style("fill", function(v) { return color(v.data.key)})
            .attr("stroke", "0")
        })
        
    arcs.append("text")
        .attr("id", "pie-inner-text")
        .attr("text-anchor", "middle")
        .attr("font-size", "30px")
        .attr("y", 20)
        
    }
    

})

}