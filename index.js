var dataviz = {
	datas: datas,
	arrayDep: [],
	arrayYear:[],
	depCount: null,
	yearCount:null,
	chartDataDep: [],
	dataYear: [],
	dataHelpYear: [],
	d3: [],
	arrayByYear: [],
	allMontant: [],
	pieMontant: {},

	/*onchange year each d3 if year=year push d3.departemnt in arraybyyear puis sort puis chart ...*/
	init:function() {
		this.page();
		this.push();
		this.depCount= this.sort(this.arrayDep);
		this.yearCount= this.sort(this.arrayYear);

		this.chart();
		this.graphDep();
		this.graphYear();

		this.yearSelected = 2014,
		this.select();
		this.yearDepCount= this.sort(this.arrayByYear);
		this.graph3d();
		this.piechart();

	},

	sort:function(array) {
		var sorted = array.reduce(function (index, pos) {
			index[pos] ? index[pos]++ : index[pos] = 1;
			return index;
		}, {});
		return sorted;
	},
	select: function() {
		self = this;
		var key = Object.keys(this.yearCount);
		var yearVal= key.reverse();

		$.each(yearVal, function(key, value) {
			$('#selectYear')
			.append($("<option></option>")
			        .attr("value",value)
			        .text(value));
		});

		this.sortByYear(this.yearSelected);

		$( "#selectYear" ).change(function() {
			self.arrayByYear= [];
			var year = $(this).val();
			self.sortByYear(year);
			self.yearDepCount= self.sort(self.arrayByYear);
			console.log(self.yearDepCount);
			$('#graph_d3js').empty();
			self.graph3d();

		});
	},
	sortByYear:function(year) {
		self = this;
		console.log(year);
		$.each(this.d3, function( index, value ) {
			if(self.d3[index].year == year) {
				self.arrayByYear.push(self.d3[index].departement);
			}
		});
	},
	page:function(){
		$('button').click(function(e){
			$('.page').hide();
			$('#'+e.target.className).fadeIn(1000);

		});
	},
	push:function() {
		self = this;
		this.pieMontant.less = [];
		this.pieMontant.middle = [];
		this.pieMontant.more = [];
		$.each(this.datas, function( index, value ) {
			var departement = value.fields.adresse_administrative_code_departement_du_tiers_beneficiaire;
			var year = value.fields.exercice_de_la_premiere_decision;
			var montant = value.fields.montant_vote
			console.log(value.fields);
			if(departement !== undefined) {
				self.arrayDep.push(departement);
			}
			if(year !== undefined) {
				self.arrayYear.push(year);
			}
			if(year !== undefined && departement !==undefined) {
				var data = {}
				data.departement = departement;
				data.year = parseInt(year);
				self.d3.push(data);
			}
			if(montant !== undefined) {
				if(montant < 10000) {
					self.pieMontant.less.push(montant);
				} else if (montant >= 10000 && montant < 50000){
					self.pieMontant.middle.push(montant);
				} else {
					self.pieMontant.more.push(montant);
				}
			}
		});
		console.log(this.pieMontant);
	},
	chart:function() {
		self = this;
		$.each( this.depCount, function( key, value ) {
			var data = {};
			data.departement = key;
			data.count_help = value;
			self.chartDataDep.push(data);
		});
		$.each( this.yearCount, function( key, value ) {
			self.dataYear.push(key);
			self.dataHelpYear.push(value);
		});

	},
	graphDep:function() {
		self = this;
		var chart;

		AmCharts.ready(function() {
			chart = AmCharts.makeChart("chartDep", {
				"type": "serial",
				"theme": "light",
				"titles": [{
					"text": "Nombre d'aides par departement"
				}],
				"dataProvider": self.chartDataDep,
				"startDuration": 1,
				"graphs": [{
					"balloonText": "<b>[[value]]</b>",
					"fillColorsField": "color",
					"fillAlphas": 0.9,
					"lineAlpha": 0.2,
					"type": "column",
					"valueField": "count_help",

				}, {
					"fillColorsField": "color",
					"fillAlphas": 0,
					"lineAlpha": 0.2,
					"type": "column",
					"valueField": "count_help",
					"clustered": false,
					"showBalloon": false,
					"visibleInLegend": false
				}],
				"chartCursor": {
					"categoryBalloonEnabled": false,
					"cursorAlpha": 0,
					"zoomable": false
				},
				"categoryField": "departement",
				"categoryAxis": {
					"gridPosition": "start",
					"title":"Departements"
				},
				"valueAxes": [{
					"axisAlpha": 0,
					"position": "left",
					"title": "Nombre d'aides"
				}],
				"depth3D": "10",
				"angle": "30",
				"export": {
					"enabled": true,
					"libs": {
						"path": "http://www.amcharts.com/lib/3/plugins/export/libs/"
					}
				}
			});

			chart.write("chartDep");
		});
	},
	graphYear:function() {
		self = this;
		$('#chartYear').highcharts({
			chart: {
				type: 'areaspline'
			},
			title: {
				text: "Nombre d'aides par année"
			},
			legend: {
				layout: 'vertical',
				align: 'left',
				verticalAlign: 'top',
				x: 150,
				y: 100,
				floating: true,
				borderWidth: 1,
				backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
			},
			xAxis: {
				categories: this.dataYear
			},
			yAxis: {
				title: {
					text: "Nombre d'aides"
				}
			},
			tooltip: {
				shared: true,
				valueSuffix: ' aides'
			},
			credits: {
				enabled: false
			},
			plotOptions: {
				areaspline: {
					fillOpacity: 0.8
				}
			},
			series: [{
				name: "Nombre d'aides par année",
				data: this.dataHelpYear
			}]
		});
	},
	graph3d:function() {

		var arrayDepCount=  [];
		$.each(this.yearDepCount, function( key, value ) {
			var data = {};
			data.departement = parseInt(key);
			data.count = value;
			arrayDepCount.push(data);
		});

		var w = 1100;
		var h = 500;
		var padding = 5;

		var svg = d3.select("#graph_d3js")
		.append("svg")
		.attr("width", w)
		.attr("height", h);

		svg.selectAll("rect")
		.data(arrayDepCount)
		.enter()
		.append("rect")
		.attr("width", w / arrayDepCount.length - padding)
		.attr("x", function(d, i) {
			return i * (w / arrayDepCount.length);
		})

		.attr("y", function(d) {
			return h - d.count * 25;
		})
		.attr("height", function(d) {
			return d.count * 25;
    		});
		svg.selectAll("nb")
		.data(arrayDepCount)
		.enter()
		.append("text")
		.text(function(d) {
			return d.count;
		})
		.attr("x", function(d, i) {
			return i * (w / arrayDepCount.length) +10;
		})
		.attr("y", function(d) {
			return h - (d.count * 25) + 15;
		})
		.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "white");

		svg.selectAll("dep")
		.data(arrayDepCount)
		.enter()
		.append("text")
		.text(function(d) {
			return d.departement;
		})
		.attr("x", function(d, i) {
			return i * (w / arrayDepCount.length) +(w / arrayDepCount.length)/2;
		})
		.attr("y", function(d) {
			return h + 15;
		})
		.attr("font-family", "sans-serif")
		.attr("font-size", "12px")
		.attr("fill", "black");
	},
	piechart:function() {

		var pichart = Raphael("pichart");
		console.log(pichart);
		pichart.piechart(
		                 500,
		                 300,
		                 200,
		                 [this.pieMontant.less.length, this.pieMontant.middle.length,this.pieMontant.more.length],
		                 {

		                 	colors: ["#000038", "#000066", "#0000ff"]
		                 }
		                 );
		pichart.text(500, 20, "Proportions des aides selon le montant").attr({ font: "20px sans-serif" });
		pichart.text(270, 190, "10000k").attr({ font: "12px sans-serif" });

		pichart.text(700, 70, "10000k-50000k").attr({ font: "12px sans-serif" });
		pichart.text(700, 220, "+ de 50000k").attr({ font: "12px sans-serif" });

	},
	initMap:function(){
		var mapOption = {
			center: {lat: 48.85703523304221, lng: 2.2977218544110656},
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			styles: [{
				featureType: 'poi.attraction',
				"elementType": "labels",
				"stylers": [{
					lightness: 100,
					visibility: "on",
					weight: '500px'
				}]
			}],
			disableDoubleClickZoom: false,
			fullscreenControl: true
		};

		var map = new google.maps.Map(document.getElementById('map'), mapOption);
	}


}
$( document ).ready(function() {
	dataviz.init();

});