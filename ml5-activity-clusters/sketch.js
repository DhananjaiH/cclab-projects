// Your code will go here
// open up your console - if everything loaded properly you should see 0.3.0
console.log('ml5 version:', ml5.version);

const dataset = [];

const options = {
    'k': 2,
    'maxIter': 8,
    'threshold': 0.5,
};

var kmeans;

d3.csv("/data/data.csv").then(function(data) {
  console.log(data[0]); // [{"Hello": "world"}, …]
  
  for(var i=0; i<data.length; i++) {
  	//dataset.push({ x: i%7, y: data[i].Steps}); // clustering day of the week vs step count
  	dataset.push({ x: parseFloat( data[i].Steps ), y: approxSleepHours(data[i])}); //clustering step count vs sleep hours
  }
  console.log(dataset.length);
  // Initialize the magicFeature
  kmeans = ml5.kmeans(dataset, options, clustersCalculated);
});

// method for calculating the approx sleep hours based on activity data
function approxSleepHours(obj) {
	return (24*60 - ( parseFloat( obj.Minutes_sitting ) + parseFloat( obj.Minutes_of_slow_activity)
					+ parseFloat(obj.Minutes_of_moderate_activity) + parseFloat(obj.Minutes_of_intense_activity) ))/60;
}

// When the model is loaded
function clustersCalculated() {
  console.log('Points Clustered!');
  console.log(kmeans.dataset);
  //console.log(kmeans.centroids);

  //console.log(kmeans.readCsv("../Test_datasets/One_Year_Of_FitBitChargeHR_Data.csv"));
  //drawBeatifulD3Chart();
  drawCanvasJSChart();
}

// plotting the data using D3??
function drawBeatifulD3Chart() {
	// Set the dimensions of the canvas / graph
	var margin = {top: 30, right: 20, bottom: 30, left: 50},
		width = 600 - margin.left - margin.right,
		height = 270 - margin.top - margin.bottom;

	// Parse the date / time
	//var parseDate = d3.time.format("%d-%b-%y").parse;

	// Set the ranges
	var x = d3.scale.linear().range([0,width]);
	var y = d3.scale.linear().range([height, 0]);

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
				.orient("bottom").ticks(5);

	var yAxis = d3.svg.axis().scale(y)
				.orient("left").ticks(5);

	// Define the line
	var valueline = d3.svg.line()
				.x(function(d) { return x(d.date); })
				.y(function(d) { return y(d.close); });

	// Adds the svg canvas
	var svg = d3.select("body")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", 
		"translate(" + margin.left + "," + margin.top + ")");

	// Get the data
	d3.csv("data.csv", function(error, data) {
		data.forEach(function(d) {
			d.date = parseDate(d.date);
			d.close = +d.close;
		});

		// Scale the range of the data
		x.domain(d3.extent(data, function(d) { return d.date; }));
		y.domain([0, d3.max(data, function(d) { return d.close; })]);

		// Add the valueline path.
		svg.append("path")
		.attr("class", "line")
		.attr("d", valueline(data));

		// Add the scatterplot
		svg.selectAll("dot")
		.data(data)
		.enter().append("circle")
		.attr("r", 3.5)
		.attr("cx", function(d) { return x(d.date); })
		.attr("cy", function(d) { return y(d.close); });

		// Add the X Axis
		svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

		// Add the Y Axis
		svg.append("g")
		.attr("class", "y axis")
		.call(yAxis);
	});
}

// plotting the data chart using canvas js
function drawCanvasJSChart() {

	// sorting the clusters into separate arrays...
	var clusters = [];
	// creating sub-arrays depending on the number of clusters
	for (var i=0; i<kmeans.config.k; i++) {
		clusters.push( {
			type: "scatter",
			toolTipContent: "<span style=\"color:#4F81BC \"><b>{name}</b></span><br/><b> Load:</b> {x} TPS<br/><b> Response Time:</b></span> {y} ms",
			name: "0",
			showInLegend: true,
			dataPoints: []
		});
	}


	// loading data into the appropriate cluster set for the chart
	for(var i=0; i<kmeans.dataset.length; i++) {
		clusters[ kmeans.dataset[i].centroid ].dataPoints.push( { x:kmeans.dataset[i][0], y:kmeans.dataset[i][1] });
	}

	var chart = new CanvasJS.Chart("chartContainer", {
	animationEnabled: true,
	title:{
		text: "Clustering Steps vs Sleep data"
	},
	axisX: {
		title:"Step count (in thousands)"
	},
	axisY:{
		title: "Approx sleep (in hours)"
	},
	data: clusters
	});
	chart.render();
}
