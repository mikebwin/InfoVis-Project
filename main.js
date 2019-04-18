window.onload = start;

function start() {

var graph = document.getElementById("graph")
var fatality = document.getElementById("fatality")
var severity = document.getElementById("severity")
var phase = document.getElementById("phase")
var bubble = document.getElementById("map")

//width and height to define svgs
var width_fatality = 635
var height_fatality = 600
var width_severity = 600
var height_severity = 600
var width_phase = 600
var height_phase = 600
var width_map = 800
var height_map = 600

var fatality_graph = d3.select(fatality)
    .append("svg")
    .attr("width", width_fatality)
    .attr("height", height_fatality)

var severity_graph = d3.select(severity)
    .append("svg")
    .attr("width", width_fatality)
    .attr("height", height_fatality)

var phase_doughnut = d3.select(phase)
    .append("svg")
    .attr("width", width_phase)
    .attr("height", height_phase)

var bubble_map = d3.select(bubble)
    .append("svg")
    .attr("width", width_map)
    .attr("height", height_map)

//FATALITIES STUFF
{
var bars = fatality_graph.attr("id", "fatalities_by_year");
var xScaleFatality = d3.scaleLinear().range([45, width_fatality-40])
var yScaleFatality = d3.scaleLinear().range([height_fatality - 50, 0])
var yAxisFatality = d3.axisLeft(yScaleFatality)
var xAxisFatality = d3.axisBottom(xScaleFatality)

var freq_threshold = 100
var color = "yellow"
d3.select(fatality).append("p")
.append("button")
    .style("border", "1px solid black")
.text("Filter Fatalities")
.on("click", function(){
    console.log(bars.selectAll(".fatality_bar")
    .filter(function(d){
        return d.value > freq_threshold;
     }))
    bars.selectAll(".fatality_bar")
        .filter(function(d){
            return d.value > freq_threshold;
         })
        .transition()
        .duration(function(d) {
            return Math.random() * 500;
        })
        .delay(function(d) {
            return Math.random() * 300
        })
        .attr("height", function(d){
            return yScaleFatality(0) - yScaleFatality(d.value)
        })
    bars.selectAll(".fatality_bar")
        .filter(function(d){
            return d.value <= freq_threshold;
        })
        .transition()
        .duration(function(d) {
            return Math.random() * 500;
        })
        .delay(function(d) {
            return Math.random() * 300            
        })
        .attr("height", function(d){
            return 0
        })
    })

d3.select(fatality)
    .append('p')
    .append('input')
    .attr('type', 'text')
    .attr('name', 'textInput')
    .attr('placeholder', 'Default = 100')
    .on('change', changefreq)

function changefreq() {
    selectValue = d3.select('input').property('value')
    if (selectValue == ""){
        selectValue = 100
    }
    freq_threshold = selectValue
}
}

//SEVERITY STUFF
var pie_chart = severity_graph.append('g').attr("id", "severity_breakdown")
var radius_severity = (Math.min(height_severity, width_severity) - 30)/ 2

var color = d3.scaleOrdinal().range(["#ffcaca", "#beb1f1", "#c5e6f8", "#fff89c", "#febca9", "#c69afa", "#c5b9cd","#a4ae9e","#363847","#aeb2bf","#e1575c", "#818a8b", "#b4cae1", "#d0adaf", "#403f69"])

//PHASE DOUGHNUT
var phase_chart = phase_doughnut.append('g').attr("id", "phase_breakdown")
var radius_phase = (Math.min(height_phase, width_phase) - 30)/2

//MAP STUFF
var projection = d3.geoStereographic()
    .scale(width_map / 2 / Math.PI)
    .scale(200)
    .translate([width_map / 2, height_map / 2])

var path = d3.geoPath()
    .projection(projection);

var url = "http://enjalot.github.io/wwsd/data/world/world-110m.geojson";


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
        csv[i].coordinates = [csv[i].Longitude, csv[i].Latitude]
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

    fatalities_by_year.sort(compare)

    function compare(a, b) {
        if (a.key > b.key) return 1
        if (b.key > a.key) return -1

        return 0;
    }

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
        .attr('transform', 'translate(55, -20)')
        .call(yAxisFatality)
    bars.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(20, 545)')
        .call(xAxisFatality)

    bars.append("text")
        .attr("transform", "translate(" + (width_fatality/2) + "," + (height_fatality - 20) + ")")
        .style("test-anchor", "middle")
        .text("Year")
    
    bars.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - (height_fatality/2))
        .attr("dy", "1em")
        .style("text-anchor", "middle   ")
        .text("Fatalities")
    
    
    var first = null
    bars.append('g')
        .selectAll(".bar")
        .data(fatalities_by_year)
        .enter()
        .append('rect')
        .attr('class', 'fatality_bar')
        .attr('x', function(d, i){
            return i * (600 / 25) + 60 + i * 2
        })
        .attr('y', function(d, i){
            return yScaleFatality(d.value) - 20
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

    var new_break = breakdown.filter(function(d) {
            if (d.key != "Unavailable") {
                console.log(d.key)
                return d.key
            }
    })

    var pie = d3.pie().value(function(d){
        return d.value;
    })(new_break);  
    
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
            arcs.select("text").text(d.data.key + ": " + d.data.value)
            //for some reason color doesn't work. I'm frustrated
            .style("fill", function(v) { return "black"})
            .attr("stroke", "0")
        })
        
    arcs.append("text")
        .attr("id", "pie-inner-text")
        .attr("text-anchor", "middle")
        .attr("font-size", "25px")
        .attr("y", 20)
        .attr("color", "black")
        
    }

    //ANOTHER DOUGHNUT
    {

    var phase_breakdown = d3.nest().key(function(d) {
    return d.phase
    }).rollup(function(v){
    return v.length
    }).entries(csv)

    var new_phase_breakdown = phase_breakdown.filter(function(d){
        return d.key.length > 0
    });

    phase_pie_chart = d3.pie().value(function(d){
    return d.value;
    })(new_phase_breakdown);   

    var phase_arc = d3.arc()
    .outerRadius(radius_phase - 10)
    .innerRadius(width_phase/5);
    var phase_label = d3.arc()
    .outerRadius(radius_phase - 40)
    .innerRadius(radius_phase - 40)

    phase_chart.attr("transform", "translate(" + width_phase/2 + "," + height_severity/2 + ")")
    var phase_arcs = phase_chart.selectAll("arc")
    .data(phase_pie_chart)
    .enter()
    .append("g")
    .attr("class", "arc")
    phase_arcs.append("path")
    .attr("d", phase_arc)
    .style("fill", function(d) { return color(d.data.key)})
    .on("mouseover", function(d){
        phase_arcs.select("text").text(d.data.key + ": " + d.data.value)
        //for some reason color doesn't work. I'm frustrated
        .style("fill", function(v) { return "black"})
        .attr("stroke", "0")
    })
    
    phase_arcs.append("text")
    .attr("id", "phase-doughtnut")
    .attr("text-anchor", "middle")
    .attr("font-size", "25px")
    .attr("y", 20)
    .attr("color", "black")
        
    }

    // START MAP
    d3.json(url, function(error, world_geojson) {

        console.log(world_geojson)

        var coordinates_breakdown = d3.nest().key(function(d){
            return [Math.round(d.coordinates[0]*2)/2, Math.round(d.coordinates[1]*2)/2]
        }).rollup(function(v){
            return v.length
        }).entries(csv)

        var coordinates = coordinates_breakdown.filter(function(d){
            return d.key.length > 3
        })

        // console.log(world_geojson.features.type)

        // bubble_map.append("g")
        //     .attr("id", "countries")
        //     .selectAll("path")
        //     .data(topojson.feature(world_geojson, world_geojson.features).features)

        bubble_map.append("path")
            .attr("d", path(world_geojson)).attr("fill", "lightgray")
        
        bubble_map.selectAll("circle")
            .data(coordinates)
            .enter()
            .append("circle")
            .attr("r", function(d) {
                return d.value
            })
            .attr("cx", function(d){
                arr = d.key.split(",")
                return projection(arr)[0]
            })
            .attr("cy", function(d){
                arr = d.key.split(",")
                return projection(arr)[1]
            })
            .attr("opacity", .4)
    })
    
})

}