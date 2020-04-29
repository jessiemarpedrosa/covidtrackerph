var ctx = document.getElementById("myChart");
	var dohCases = 'https://coronavirus-ph-api.herokuapp.com/doh-data-drop';
	
	var dates = [], uniqueDates = [], countsPerDate = [];
	var casesCtr=0;
	
	$.getJSON(dohCases, function (data) {
		
		// will generate array with ['Monday', 'Tuesday', 'Wednesday']
		var labels = data.data.map(function(item) {
			var dateReported = item.date_reported;
			var date_string = moment(dateReported, "YYYY-MM-DD").format("MMMM DD YYYY");
			dates.push(dateReported);
			
			return date_string;
		});
		
		var dataset = data.data.map(function(item) {
			if (item.region_res == '7')
				return item.age;
		});
		
		// Gather unique dates and save to uniqueDates[]
		$.each(dates, function(i, el){
			if($.inArray(el, uniqueDates) === -1) uniqueDates.push(el);
		});
		
		  
		function getNumberOfCases(region){
			var countsPerDate = [];
			// Loop through uniqueDates Array, compare the date values to JSON data, once found make a counter and store it to countsPerDate[]
			for (i=0; i<uniqueDates.length; i++){
				casesCtr = 0;
				for (let key in data.data) {
					//console.log( data.data[key].region_res + ' --- ' + val)
					if (region != '') {
						if ( data.data[key].date_reported == uniqueDates[i] && data.data[key].region_res === region ) casesCtr++;
					} else {
						if ( data.data[key].date_reported == uniqueDates[i] ) casesCtr++;
					}
				}
				countsPerDate.push(casesCtr);		
			}
			
			return countsPerDate;
		}

		var myChart = new Chart(ctx, {
			type: 'line',
			data: {
			  labels: uniqueDates,
			  datasets: [{
				label: "Total PH Cases",
				data: getNumberOfCases(""),
				lineTension: 0.5,
				backgroundColor: 'transparent',
				borderColor: '#007bff',
				borderWidth: 1.5,
				pointBackgroundColor: '#007bff',
				pointRadius:3,
				pointHoverRadius:4
			  },{
				label: "NCR Cases",
				data: getNumberOfCases("NCR"),
				lineTension: 0.5,
				backgroundColor: 'transparent',
				borderColor: 'red',
				borderWidth: 1.5,
				pointBackgroundColor: 'red',
				pointRadius:3,
				pointHoverRadius:4
			  },{
				label: "Region 7 Cases",
				data: getNumberOfCases("7"),
				lineTension: 0.5,
				backgroundColor: 'transparent',
				borderColor: 'green',
				borderWidth: 1.5,
				pointBackgroundColor: 'green',
				pointRadius:3,
				pointHoverRadius:4
			  },{
				label: "Region 4A Cases",
				data: getNumberOfCases("4A"),
				lineTension: 0.5,
				backgroundColor: 'transparent',
				borderColor: 'orange',
				borderWidth: 1.5,
				pointBackgroundColor: 'orange',
				pointRadius:3,
				pointHoverRadius:4
			  }]
			},
			options: {
			  scales: {
				xAxes: [{
					type: 'time',
					time: {
						tooltipFormat:'MMM DD, YYYY',
						unit: 'day',
						//unitStepSize: 5,
						displayFormats: {
							day: 'MMM DD'
						}
					},
					ticks: {
						autoSkip: false,
						maxTicksLimit: 15,
						fontColor: '#000'
					  }
				}],
				yAxes: [{
				  ticks: {
					beginAtZero: false
				  },
				  scaleLabel: {
					display: true,
					labelString: "Number of Cases",
					fontColor: "green"
				  }
				}]
			  },
			  legend: {
				display: true,
			  }
			}
		});
		
	});
