var w = 800;
var h = 700;
var padding = 70;
var margin = 15;

var rowDev = function(d){
    return {feasible: +d.feasible, fdev: +d.fdev}
}
var rowDes = function(d){
    return {designs: +d.designs};
}

var rowEI = function(d){
    return {feasible: +d.feasible, ei: +d.ei}
}
// initial figure

var svg = d3.select("body").append("svg").attr("height",h).attr("width",w);

var xScale = d3.scale.linear()
    .domain([0,1])
    .range([padding, w-padding]);

var triangle = d3.svg.symbol().type("triangle-up").size(60);
var citer = 1;
var yScale;
var nclick = 0;
var yloc = function(i,citer,beforeval,afterval){
	if(i<citer) return beforeval;
	return afterval;
}
var tripos, labpos;

d3.csv("devdata.csv",rowDev, function(data){
    
    yScale = d3.scale.linear()
	.domain([0,
		 d3.max(data, function(d){return d.fdev;})])
	.range([h-padding, padding]);
    var line = d3.svg.line()
	.x(function(d){return xScale(d.feasible);})
	.y(function(d){return yScale(d.fdev);})
    svg.append("path")
	.datum(data)
	.attr("class","line")
	.attr("d",line);
    
    var xAxis = d3.svg.axis().scale(xScale).ticks(5).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).ticks(5).orient("left");
    svg.append("g")
	.attr("class", "axis bottom")
	.attr("transform", "translate(0," + (h - 0.8*padding) + ")")
	.call(xAxis);
    svg.append("g")
	.attr("class", "axis left")
	.attr("transform", "translate(" + padding + ",0)")
	.call(yAxis);
    svg.append("text")
	.attr("class","axislabel")
	.attr("transform", "translate("+margin+","+0.5*h+") rotate(-90)")
	.attr("x",0)
	.attr("y",0)
	.attr("text-anchor","middle")
	.text("Discrepancy");
    svg.append("text")
	.attr("class","axislabel")
	.attr("x",0.5*w)
	.attr("y",h-margin)
	.attr("text-anchor","middle")
	.text("x");
    tripos = function(d,i){
	var ypos = yloc(i,citer,yScale(.5),yScale(-20));
	return "translate("+xScale(d.designs)+","+ypos+")";
    }
    labpos = function(d,i){
	var ypos = yloc(i,citer,yScale(1.5),yScale(-20));
	return ypos;
    }
    d3.csv("designs.csv",rowDes, function(data){
	svg.selectAll("circle").data(data.slice(0,6))
	    .enter().append("circle")
	    .attr("cy",yScale(.5))
	    .attr("cx",function(d){return xScale(d.designs);});
	var tris = svg.selectAll(".triangle").data(data.slice(6,9)).enter()
	    .append("path").attr("class","triangle")
	    .attr("d",triangle)
	    .attr("transform",tripos);
	var text = svg.selectAll(".label").data(data.slice(6,9))
	    .enter().append("text").attr("class","label")
	    .attr("x",function(d){return xScale(d.designs);})
	    .attr("y",labpos).text(function(d,i){return i+1;})
	    .attr("text-anchor","middle");
    });
    d3.csv("eidata1.csv",rowEI, function(data){
	var yScaleEI = d3.scale.linear()
	    .domain([0,
		     d3.max(data, function(d){return d.ei;})])
	    .range([h-padding, padding]);
	var yAxisei = d3.svg.axis().scale(yScaleEI).ticks(5).orient("right")
	var lineEI = d3.svg.line()
	    .x(function(d){return xScale(d.feasible);})
	    .y(function(d){return yScaleEI(d.ei);})
	svg.append("path")
	    .datum(data)
	    .attr("class","lineEI")
	    .attr("d",lineEI)
	    .style("stroke-dasharray",("3, 3"))
	svg.append("g")
	    .attr("class", "axis right")
	    .attr("transform", "translate("+(w-padding)+",0)")
	    .call(yAxisei);
	svg.append("text")
	    .attr("class","axislabel")
	    .attr("transform", "translate("+(w-margin)+","+0.5*h+") rotate(90)")
	    .attr("x",0)
	    .attr("y",0)
	    .attr("text-anchor","middle")
	    .text("EI");     
    });
});

svg.on("click",function(){
    nclick++;
    citer = nclick%3+1;
    d3.select("h1")
	.transition().duration(1000)
	.text(function(){return "Iteration #"+citer;});
    var fname = "eidata"+citer+".csv";
    d3.csv(fname,rowEI,function(data){
	var yScaleEIc = d3.scale.linear()
	    .domain([0,
		     d3.max(data, function(d){return d.ei;})])
	    .range([h-padding, padding]);
	var yAxiseic = d3.svg.axis().scale(yScaleEIc).ticks(5).orient("right");
	var lineEIc = d3.svg.line()
	    .x(function(d){return xScale(d.feasible);})
	    .y(function(d){return yScaleEIc(d.ei);})
	
	svg.select(".lineEI")
	    .datum(data).transition().duration(1000).attr("d",lineEIc);
	svg.select(".right").transition().duration(1000).call(yAxiseic);
    });
    svg.selectAll(".triangle").transition().
	duration(1000).attr("transform",tripos);
    svg.selectAll(".label")
	.transition().duration(1000).attr("y",labpos)
});
