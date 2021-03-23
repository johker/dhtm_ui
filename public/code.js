var socket = io();


function sendUpdate(key, value ) {
		console.log('Sending Update: k=' + key + ', v=' + value)
		socket.emit('param_update', {key,value});
}

socket.on('sdr ', (msg) => {
	console.log('sdr: ' + msg);
	sdr = msg; 
});

function btest(bit){
	return ((sdr>>bit) % 2 != 0)
}

function is_active(idx) {
	let byteIdx = (idx >> 3) + ploff;
	let bitIdx = idx % 8;
	sdr[byteIdx] = sdr[byteIdx] | 1 << bitIdx;
}

var ploff = 8;
var n = 4096;
var sdr = new Uint8Array(n + ploff); 
var cmax = 64;
var rmax = 64;

function gridData() {
	var data = new Array();
	var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
	var ypos = 1;
	var width = 5;
	var height = 5;
	var offset = 5;

    // iterate for rows 
	for (var row = 0; row < rmax; row++) {
        	data.push( new Array() );

	        // iterate for cells/columns inside rows
		for (var column = 0; column < cmax; column++) {
        		data[row].push({
			x: xpos,
			y: ypos,
	        	width: width,
        		height: height,
			active: is_active(row*column+column)	
		})
		xpos += width + offset;
        }
        // reset the x position after a row is complete
        xpos = 1;
        ypos += height + offset;
    }
    return data;
}

var gridData = gridData();	
// I like to log the data to the console for quick debugging
console.log(gridData);

var grid = d3.select("#grid")
	.append("svg")
	.attr("width","510px")
	.attr("height","510px");
	
var row = grid.selectAll(".row")
	.data(gridData)
	.enter().append("g")
	.attr("class", "row");
	
var column = row.selectAll(".square")
	.data(function(d) { return d; })
	.enter().append("rect")
	.attr("class","square")
	.attr("x", function(d) { return d.x; })
	.attr("y", function(d) { return d.y; })
	.attr("width", function(d) { return d.width; })
	.attr("height", function(d) { return d.height; })
	.style("fill", "#fff")
	.on('click', function(d) {
       d.click ++;
       if ((d.click)%4 == 0 ) { d3.select(this).style("fill","#fff"); }
	   if ((d.click)%4 == 1 ) { d3.select(this).style("fill","#2C93E8"); }
	   if ((d.click)%4 == 2 ) { d3.select(this).style("fill","#F56C4E"); }
	   if ((d.click)%4 == 3 ) { d3.select(this).style("fill","#838690"); }
    });


// convenience function to update everything (run after UI input)
function updateAll() {
		console.log('UpdateAll');
    // updateForces();
    // updateDisplay();
}
