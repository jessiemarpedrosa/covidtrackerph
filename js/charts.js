let ctx = document.getElementById("myChart");
let dohCases = 'https://coronavirus-ph-api.herokuapp.com/doh-data-drop';
dohDataGoogle = 'https://spreadsheets.google.com/feeds/list/16g_PUxKYMC0XjeEKF6FPUBq2-pFgmTkHoj5lbVrGLhE/oswqc7n/public/values?alt=json';

let dates=[], uniqueDates=[], countPerDate=[], locations=[], uniqueLocations=[], countPerLocation=[];
let casesCtr, locationCtr, diedCtr, genderMCtr, genderFCtr, recoveredCtr, tableOutput;
let countLocation = [];

$.getJSON(dohCases, function (data) {
	console.log(data.data);
	data.data.map(function(item) {
		locations.push(item.location);
	});

	$.each(locations, function(i, el){
		if($.inArray(el, uniqueLocations) === -1) uniqueLocations.push(el);
	});
	uniqueLocations.sort(); 
	
	for (i=0; i<uniqueLocations.length; i++){
		locationCtr = 0, diedCtr=0, genderCtr=0, genderFCtr=0, recoveredCtr=0;
		data.data.map(function(item) {
			if (item.location === uniqueLocations[i]){
				locationCtr++;
				
				if (item.sex === 'M') genderCtr++;
				if (item.sex === 'F') genderFCtr++;
				if (item.recovered_on != '') recoveredCtr++;
			}
		});
		//countPerLocation.push(locationCtr);
		countLocation.push({location:uniqueLocations[i], cases:locationCtr, recovered:recoveredCtr, maleGender:genderCtr, femaleGender:genderFCtr});
		
	}
	
	countLocation.sort((a, b) => (a.cases < b.cases) ? 1 : -1);
	
	console.log(countLocation);
	
	var index = 1;
	for (i=0; i<countLocation.length; i++){
		if (countLocation[i].location!=''){
			tableOutput += '<tr><td>' + index + '</td><td>' + countLocation[i].location + '</td><td>' + countLocation[i].cases + '</td><td>' + 0 + '</td><td>' + countLocation[i].recovered + 
					   '</td><td>' + countLocation[i].maleGender + '</td><td>' + countLocation[i].femaleGender + '</td></tr>';
			index++;
		}
	}
	$('#covidCasesPerProvinceTable tbody').append(tableOutput);
		
		
	$('#covidCasesPerProvinceTable').DataTable();
	$('.dataTables_length').addClass('bs-select');
	
});


$.getJSON(dohDataGoogle, function (data) {
	
	// will generate array with ['Monday', 'Tuesday', 'Wednesday']
	data.feed.entry.map(function(item) {
		let dateReported = item.gsx$daterepconf.$t;
		let date_string='';
		
		if ( dateReported != '' ) 
		date_string = moment(dateReported, "DD-MM-YY").format("MM-DD-YY");
		
		dates.push(date_string);
		
		return date_string;
	});
	
	let dataset = data.feed.entry.map(function(item) {
		if (item.gsx$regionres.$t == '7')
			return item.gsx$age.$t;
	});
	
	// Gather unique dates and save to uniqueDates[]
	$.each(dates, function(i, el){
		if($.inArray(el, uniqueDates) === -1) uniqueDates.push(el);
	});
	
	uniqueDates.sort( function(a, b){
		var dateA = new Date(a), dateB = new Date(b);
		return dateA - dateB;
	}); 


	function getNumberOfCases(region){
		let countPerDate = [], dateReported, regionRes;
		let start = performance.now();
		let areas = ['All','NCR','Central Visayas'];
		let noOfCases = [];
		
		// Loop through uniqueDates Array, compare the date values to JSON data, once found make a counter and store it to countPerDate[]
		for (i=0; i<uniqueDates.length; i++){
			casesCtr = 0;
			for (let key in data.feed.entry) {
				// console.log( data.data[key].region_res + ' --- ' + val)
				// if ( data.data[key].date_reported === 'Invalid Date') console.log(data.data[key].date_reported)
				
				dateReported = moment(data.feed.entry[key].gsx$daterepconf.$t, "DD-MM-YY").format("MM-DD-YY");
				regionRes = data.feed.entry[key].gsx$regionres.$t;
			
				if (region != '') {
					if ( dateReported == uniqueDates[i] && regionRes.includes(region) ) {
						casesCtr++;
						//console.log(dateReported + ' -- ' + uniqueDates[i] + ' -- ' + regionRes + ' -- ' + region)
					}
				} else {
					if ( dateReported == uniqueDates[i] ) casesCtr++;
				}
				
			}
			countPerDate.push(casesCtr);		
		}	
		
		let end = performance.now();
		console.log('Data Feed took ' + (end - start) + ' milliseconds to execute.');
		
		return countPerDate;
	}
	
	
	let myChart = new Chart(ctx, {
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
			data: getNumberOfCases("Central Visayas"),
			lineTension: 0.5,
			backgroundColor: 'transparent',
			borderColor: 'green',
			borderWidth: 1.5,
			pointBackgroundColor: 'green',
			pointRadius:3,
			pointHoverRadius:4
		  },{
			label: "Region 4A Cases",
			data: getNumberOfCases("IV-A"),
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
					parser: 'MM-DD-YY',
					tooltipFormat:'MMM DD, YYYY',
					unit: 'day',
					min: '03-01-20',
					//unitStepSize: 1,
					displayFormats: {
						day: 'MMM DD \'YY'
					}
				},
				ticks: {
					//autoSkip: true,
					maxTicksLimit: 30,
					fontColor: '#000'
				  }
			}],
			yAxes: [{
			  ticks: {
				beginAtZero: false,
				// forces step size to be 5 units
				stepSize: 50
			  },
			  scaleLabel: {
				display: true,
				labelString: "Number of Cases",
				fontColor: "green"
			  }
			}]
		  },
		  legend: {
			display: true
		  }
		}
	});
	
});
