// Requires

var _ = require('lodash');
var moment = require('moment');
var $ = require('jquery');

// Globals

var studentsArray = [];
var FILTER = 'All'
function sortByNameAndStatus(a, b) {
	var an = $(a).attr('data-name'), bn = $(b).attr('data-name');

	return $(b).hasClass('Found') - $(a).hasClass('Found') || (an > bn) - 1 || 1; 
};

// Class of student display
var StudentLocationDisplay = function(student) {
	this.data = _.pick(student, ['_id', 'email','name','image','googleId', 'absent']);
	
	// Create the DOM element representing the student
	var display = $('<div>').addClass('studentLocationDisplay').addClass('col-md-2').attr('id', student.googleId).attr('data-name', student.name);
	var container = $('<div>').addClass('nameImageContainer');
	var absentToggle = $('<button>').addClass('btn btn-xs btn-primary absent-toggle').text( student.absent ? 'Present' : 'Absent');

	var toggle = $('<div>').append(absentToggle);

	var info = $('<div>').addClass('studentInfoContainer')

	container
		.append('<div class="name">' + student.name + '</div>')
		.append('<div><img class="studentImage" src="' +student.image+'"></div>');

	display.append( container ).append( info ).append( toggle );
	
	absentToggle.on('click', this.toggleAbsent.bind(this));

	this.el = display;

	// If student is absent, no need to mess with any of the below data
	if (student.absent) {
		this.status = 'Absent';
		this.updateDisplay();
	}
	// Look at the student's recent scan to determine if they are in the correct place or not
	else if (student.recentScan) {
		scan = student.recentScan;
		this.recentScan = scan;
		// First, check if the scan is recent (i.e. if that event is still ongoing)
		var recent = false;
		var event = scan.event ? scan.event[0] : undefined;

		// If google event, check against event end
		if (event && event.end && moment(event.end).add(TRANSITION_LENGTH, 'ms').isAfter(moment())) {
			recent = true;
		}
		// If grove calendar, check against length of events
		else if (event && !event.end && moment(scan.time).add(EVENT_LENGTH - TRANSITION_LENGTH, 'ms').isAfter(moment())) {
			recent = true;
		}

		// If the scan is recent
		if (recent) {
			this.moveMe(scan);
		} 
		// If the scan is not recent, student is lost
		else {
			this.status = 'Lost';
			this.updateDisplay();
		}
	} 
	// If there is no recent scan at all, student is lost
	else {
		this.status = 'Lost';
		this.updateDisplay();
	}

};

// Toggles absent / present status
StudentLocationDisplay.prototype.toggleAbsent = function(e) {
	e.preventDefault();

	this.status = this.status === 'Absent' ? 'Lost' : 'Absent';

	var self = this;

	$.post( '/api/user/', { id: this.data.googleId, absent: !this.data.absent }, self.updateDisplay.bind(self) );
}

// Updates student display based on most recent scan / event 
StudentLocationDisplay.prototype.updateDisplay = function() {

	if (this.status != 'Absent') {
		this.el.find('.absent-toggle').text('Absent');
	}

	if (this.status === 'Found') {
		var scannedEvent = this.recentScan.event[0];
		var text = _.chain(['summary', 'activity', 'focus_area'])
			.map(function(key) {
				return scannedEvent[key];
			})
			.filter()
			.join(' | ')
			.value()

		var info = $('<p>').addClass('last-scan-info').addClass('text-primary').text(text);

		this.el.find('.studentInfoContainer').empty().append(info);
		this.el.removeClass('Lost').addClass('Found');
		this.render();
	}
	// If the student is lost, do not display the last scan information
	else if (this.status === 'Lost') {
		var self = this;

		// Call the API endpoint to get current event without a scan
		$.get('/current-event/' + this.data.googleId, function(result) {
			self.el.removeClass('Found').addClass('Lost');
			
			var correction = $('<p>').addClass('correct-location-info').addClass('text-primary').text(result.location);
			self.el.find('.studentInfoContainer').empty().append(correction);
			self.currentLocation = result && result.location || 'No Event';

			self.render()
			
		});
	} else if (this.status === 'Absent') {
		this.el.removeClass('Found').addClass('Lost');
		this.currentLocation = 'Absent';
		this.el.find('.absent-toggle').text('Present');
		this.render()
	}
};

StudentLocationDisplay.prototype.render = function() {
	// render into the dom based on where their location is
	var locationId = this.currentLocation.split(' ').join('');
	var location = $('#'+locationId)
	location.append(this.el);

	var locationArray = location.find('.studentLocationDisplay').sort( sortByNameAndStatus );

	locationArray.detach().appendTo( location );

	// Re-attach the absent click handler, was getting a strange bug where it did not always fire otherwise
	this.el.find('.absent-toggle').off('click').on('click', this.toggleAbsent.bind(this) )
};

// Move the student to a new location based on the most recent scan
StudentLocationDisplay.prototype.moveMe = function(scan) {

	var self = this;

	// move from one array to another
	if (this.el) {
		this.el.remove();
	};

	// If this method was triggered by a scan, update the location to the location of the scan. If it was triggered by a timeout, leave the location as is.
	if (scan) {
		this.currentLocation = scan.scannedLocation;
	}

	if (scan && scan.correct) {
		this.status = 'Found';
		// Set a timeout based on the end of the event, and move the student to Lost after the event is over as a placeholder until they scan into another event

		var now = moment( new Date() );
		
		if (scan.event.end) {
			var difference = moment(scan.event.end).subtract( TRANSITION_LENGTH, 'ms').diff( now );
		}
		else {
			/* Split the hour based on EVENT_LENGTH and TRANSITION_LENGTH
		    e.g. if events go for 15 with 5 min transition, 8:55 - 9:10 would
		    be the period during which the timeout would be set for 9:10 */
		    var intervals = 60 / (EVENT_LENGTH / (60 * 1000)) + 1;
		    var start_times = [];
		    for (var i =0; i < intervals; i++) {
		      start_times.push( moment( new Date() ).startOf('hour').add(i * EVENT_LENGTH - TRANSITION_LENGTH, 'ms'));
		    }

		    var event_end = _.find(start_times, function(t) {
		        return now.isBetween( t, moment(t).add( EVENT_LENGTH, 'ms' ) );
		    }).add(EVENT_LENGTH, 'ms');

			// Push student into lost after event ends and transition time has lapsed
			var difference = event_end.diff(now);
		}

		this.transitionTimeout = window.setTimeout( self.moveMe.bind(self, null), difference);
	}
	// If the scan does not match the location, the student is in the wrong location
	else if (scan) {
		this.status = 'Lost';
	}
	// If there is no scan, this method is being triggered by the timeout, meaning the student has not scanned in to anywhere on time and is lost
	// We need to get the student's next event and move them accordingly
	else {
		this.status = 'Lost';
		this.recentScan = null;
	}

	// Now updateDisplay
	self.updateDisplay();
};

// When receiving a scan, find the student that matches the scan, move them to a new location based on the scan and clear any possible transitions
function scanReceived(scan) {

	var scanStudent = _.find(studentsArray, function(student) {
		return student.data.googleId === scan.googleId;
	});

	// If a student is found, move the student and override their recent scan
	if (scanStudent) {
		if (scanStudent.transitionTimeout) { window.clearTimeout(scanStudent.transitionTimeout); }
		scanStudent.recentScan = scan;
		// Call the moveMe function, making sure it is bound to the current student
		scanStudent.moveMe.call(scanStudent, scan);
	}
}

$(function(){
	// Load the different button filters and divs
	_.keys(LOCATION_IMAGES).concat('Absent').forEach( function(location) {
		// Manual override for iPad Center to avoid sentence casing
		if (location.toLowerCase() === 'ipad center') {
			var prettyDisplay = 'iPad Center';
		} else {
			var prettyDisplay = location.split(' ').map( function(word) {
				return word[0].toUpperCase() + word.slice(1);
			}).join(' ');
		}

		// Create the button and add it to button group
		var button = $('<button>').addClass('btn btn-info btn-block').text(prettyDisplay);
		var listItem = $('<li>').append(button);
		$('#location-filters').append(listItem);

		// Create the container for the students
		// Title is just the location, the container id needs to have spaces removed
		var title = $('<h3>').text(prettyDisplay);
		var container = $('<div>').addClass('row').attr('id', prettyDisplay.split(' ').join('')).append(title);
		$('#locations-container').append(container);
	});

	// Attach event handler to the filter buttons
	$('#location-filters button').click(function(e) {
		
		// Set filter
		FILTER = $(this).text();

		// Update display
		if (FILTER === 'All') {
			$('#locations-container > div').show();
		}
		else {
			// First, hide all containers
			$('#locations-container > div').hide();

			// Then show just the one with id matching the filter (spaces removed from filter)
			$('#' + FILTER.split(' ').join('')).show();
		}

		// Update the display of the filter buttons by removing primary from all and adding it to this one
		$('#location-filters button.btn-warning').removeClass('btn-warning').addClass('btn-info');
		$(this).removeClass('btn-info').addClass('btn-warning');
	});

	// Get AJAX call to User database and get all the students, create StudentLocationDisplay objects for each, and put them in the students array
	var tracker = io.connect();
	tracker.on('SCAN!', scanReceived );
	
	$.get('api/user', function(students) {
		studentsArray = _.map(students, function(student) {
			return new StudentLocationDisplay(student);
		});
		
		// Put in a slight delay for student panels to display, then set them all to same height (don't need this with css changes, but keeping it in case we want to go back to this method)

		// window.setTimeout(function(){
		// 	var displays = $('.studentLocationDisplay');

		// 	var heights = displays.map(function() {
		// 		return $(this).height()
		// 	});

		// 	var maxHeight = Math.max.apply(null, heights);

		// 	displays.height(maxHeight);
		// }, 500);
		
	});

	// All absent event handler
	$('.all-absent').on('click', function() {
		$.ajax('/api/user/bulk', { 
			type: 'PUT',
			contentType: 'application/json',
			data: JSON.stringify({ absent: true })
		});
	});
	
});
