var _          = require('lodash');
var moment     = require('moment');
var startTimes = require('./StartTimes');

/*
	Helper function to get the current event.
	A 'current event' is defined as one that is either currently ongoing or being transitioned into. E.g. with a 15 minute event length and 5 minute transition time, an event that goes from 9:00 - 9:15 would be current from 8:55 - 9:10.

	@params student: The student info
*/
module.exports = function(student, eventLength, transitionLength, eventIncr) {
  var currentTime = moment(Date.now());
	// First check if there is a "current" google calendar event, and return it if so
	var currentEvent = _.find(student.calendar, function(event) {
		var start = moment( event.start ).subtract(transitionLength, 'ms');
		var end = moment( event.end ).subtract(transitionLength, 'ms' );
		return currentTime.isBetween(start, end);
	});
  //console.log("student:");
  //console.log(student);

	if (currentEvent) {
		return currentEvent;
	}

	/* 
		If looking at the grove calendar:
		(a) We return the most recently checked into event IF it was a correct check-in AND we are still within that event's window (it is "current").
		(b) In all other circumstances (we are transitioning out of the correctly scanned event, student hasn't scanned during this period, last scan was wrong), we always show the first event that has not yet been checked into, or null if all events have been checked into (up to the calling function to determine what to do if that is the case.) 
	*/
	var scan = student.recentCorrectScan;
	if (scan && scan.event[0].start && currentTime.add(transitionLength, 'ms').isBetween(moment(scan.event[0].start), moment(scan.event[0].end))) {
		// Return the correctly scanned into event
		return scan.event[0];
	} else {
		// Return the first unchecked event in the student's grove calendar and loop over
		var currentEvent =  _.find( student.groveCalendar, function(event) {
			return !event.checkedIn;
		});
    //reset the grove calendar if all the activities have been checkedin
    if (!currentEvent && !_.isEmpty(student.groveCalendar)) {
       _.each(student.groveCalendar, function(event) { event.checkedIn = false; });
       currentEvent = student.groveCalendar[0];
    }

    if (currentEvent) {
      //Grove calendar.
      //currentEvent.start = startTimes(eventLength, eventIncr); //Revisit this later. 
      currentEvent.start = currentTime.startOf('minute');
      console.log("Getting grove calendar. setting event time start:" + currentEvent.start);
      //Make sure the event start time doesn't interface with the current event 
      //This happens when we are in transitionlength. add eventIncr padding 
      //in case students walk slowly to the next event.
      var nowEvent = _.find(student.calendar, function(event) {
        return currentEvent.start.isBetween(event.start, event.end.add(eventIncr, 'ms')); 
      });
      if (nowEvent) {
        currentEvent.start = nowEvent.end;
      } else if (scan && scan.event[0].start && currentEvent.start.isBetween(moment(scan.event[0].start), moment(scan.event[0].end).add(eventIncr, 'ms'))) {
        currentEvent.start = moment(scan.event[0].end);
      }
      // Find the next google calendar event happening with the grove event
      var nextCalendarEvent = _.find(student.calendar, function(event) {
        return event.start.isAfter(currentEvent.start);
      });
      if (nextCalendarEvent && 
          currentEvent.start.add(2*eventLength, 'ms').isAfter(nextCalendarEvent.start)) {
        //next calendar event is within 30 minutes
        currentEvent.end = nextCalendarEvent.start;
      } else {
        //next calendar event is after 30 minutes. 
        currentEvent.end = currentEvent.start.add(eventLength, 'ms');
      }
      console.log("Current Event:");
      console.log(currentEvent.start);
    }
    return currentEvent;
	}
}
