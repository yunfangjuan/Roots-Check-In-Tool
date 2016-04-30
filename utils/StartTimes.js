var _      = require('lodash');
var moment = require('moment');
	
/* 
 * Find the closet time increment for transition length
 * For example, if transition length is 5 minute, now is 9:46. The closet start time is 9:50

  Take in event and transition length as parameters so this method can be used in a uniform way on both client and server. 
  @params: DEPRECATED eventLength: event length in milliseconds
  @params: eventIncr: also in milliseconds
*/ 
module.exports = function(eventLength, eventIncr) {
	var currentTime = moment(Date.now());
  //if eventIncr = 5 minutes. intervals = 13
	var intervals = 60 / (eventIncr / (60 * 1000)) + 1; 
	var start_times = [];
	for (var i = 0; i < intervals; i++) {
		// Remember to use new moment object here for each iteration so as not to override currentTime
		start_times.push(currentTime.startOf('hour').add(i * eventIncr, 'ms'));
	}

	// We return the next event start time based on transition length
  // For example in the case transition time is 5 minutes, 
  // if currentTime is 9:03. the eventStart will be 9:05
  //                   8:57, the eventStart will be 9:00
  //                   8:03,                        8:05
	var eventStart = _.find(start_times, function(t) {
		return currentTime.isBetween(t, moment(t).add(eventIncr, 'ms'));
	});

	return eventStart;
}
