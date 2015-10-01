var Scan = require('../models/Scan');
var User = require('../models/user');
var _ = require('lodash');
var moment = require('moment');

// Helper function to get the current event for a student
function getCurrentEvent(user, scanned_data) {
	// To find a current event, we want to look for an event that we are transitioning into or that is currently going on (but not transitioning out of). e.g. with transition time of 5 minutes and event of 15, from 8:55 - 9:10 the current event would be one that that goes from 9 - 9:15
	var currentEvent = _.find(user.calendar, function(event) {
		var transition = Number(process.env.TRANSITION_LENGTH) || 5;
		var start = moment( event.start ).subtract(transition * 60 * 1000, 'ms');
		var end = moment( event.end ).subtract(transition * 60 * 1000, 'ms' );
		return moment( new Date() ).isBetween( start, end );
	});

	var index = -1;

	// if there's not a current google calendar event, get the next grove calendar event
	if (!currentEvent) {
		index = _.findIndex(user.groveCalendar, function(event) {
			return !event.checkedIn; 
		});

		if (index > -1 && user.groveCalendar && user.groveCalendar.length) {
			currentEvent = user.groveCalendar[index];
		} else {
			currentEvent = null;
		}
	}

	return { event: currentEvent, index: index };
}

var apiController = {

	// Return all users
	getUsers: function(req, res) {
		User.find({}, function(err, users) {
			if (err) {
				console.error(err);
				res.status(500).send(err);
			} else {
				res.send(users);
			}
		});
	},
	
	// Return one user
	getUser: function(req, res) {
		User.findOne({googleId: req.params.id}, function(err, user) {
			if (err) {
				console.error(err);
				res.status(500).send(err);
			} else {
				res.send(user);
			}
		});
	},

	// On receiving a scan, save it, and then add it to the student who scanned in
	saveScan: function(req, res, socket) {

		var scanned_data = req.query.scanned_data;
		var googleId = req.params.id;

		if (scanned_data) {
			var currentTime = moment();

			User.findOne({googleId: googleId}, function(err, user) {
				if (err) {
					console.error(err);
					res.status(500).send(err);
				}
				else {
					var data = getCurrentEvent(user, scanned_data);
					var currentEvent = data.event;
					var index = data.index;

					// If there's not a current event, check to see if there are any grove calendar events that are unchecked, otherwise if there is a grove calendar, uncheck all of them in, and start at top
					if (!currentEvent && Array.isArray(user.groveCalendar) && user.groveCalendar.length) {
						_.each(user.groveCalendar, function(event) {
							event.checkedIn = false;
						});
						index = 0;
						currentEvent = user.groveCalendar[0];
					} else if (!currentEvent) {
						res.status(500).send("Student has no Grove Calendar and no current event was found");
					}

					// Here, we are going to do the samemagic as the lost-kids file to find when the event ends
					/* Split the hour based on process.env.EVENT_LENGTH and TRANSITION_LENGTH
				    e.g. if events go for 15 with 5 min transition, 8:55 - 9:10 would
				    be the period during which the timeout would be set for 9:10 */
				    var intervals = 60 / (process.env.EVENT_LENGTH / (60 * 1000)) + 1;
				    var start_times = [];
				    for (var i =0; i < intervals; i++) {
				      start_times.push( moment( new Date() ).startOf('hour').add(i * process.env.EVENT_LENGTH - process.env.TRANSITION_LENGTH, 'ms'));
				    }

				    var event_end = _.find(start_times, function(t) {
				        return currentTime.isBetween( t, moment(t).add( process.env.EVENT_LENGTH, 'ms' ) );
				    }).add(process.env.EVENT_LENGTH, 'ms');

					var difference = event_end.diff(currentTime);

					// If the scanned data was correct, consider the event checked into once the event is done, and clear any times in case the student keeps checking into the same event
					if (scanned_data && currentEvent && currentEvent.location === scanned_data && index > -1) {
						setTimeout(function(modelItem, ind) {
							modelItem.groveCalendar[ind].checkedIn = true;
							modelItem.save();
						}, difference, user, index);
					}

					// Set correctness
					var correct = (currentEvent && currentEvent.location === scanned_data);
				
					var newScan = {
						googleId: user.googleId,
						name: user.name,
						email: user.email,
						image: user.image,
						time: currentTime,
						scannedLocation: scanned_data,
						event: [currentEvent],
						correct: correct
					};

					Scan.create(newScan, function(err, scan) {
						if (err) {
							console.error(err);
							res.status(500).send(err);
						}
						else {
							socket.emit('SCAN!', scan);
							// Update the user
							user.recentScan = newScan;
							user.save(function(err, result){
								if (err) {
									console.error(err);
									res.status(500).send(err);
									// res.redirect('/error_saving');
								} else {
									// Redirect the student
									if (scan.correct) {
										res.redirect('/success');
									} else {
										res.redirect('/whoops')
									}
								}
							});
							
						}
					});
				}
			})
		}
		else {
			res.render('index')
		}
	},

	// Get current event for a user
	getCurrentEvent: function(req, res) {
		User.findOne({googleId: req.params.user_id}, function(err, user) {
			if (err) {
				console.error(err);
				res.status(500).send(err);
			} else {
				// Check the current event and index of the event, if there is no current event that means the student has scanned into all of their grove calendar events, in which case we should send back the first one, without unchecking them in to anything
				var currentEvent = getCurrentEvent(user).event;

				if (currentEvent) { res.send(currentEvent); }
				else if (user.groveCalendar && user.groveCalendar.length) { 
					res.send(user.groveCalendar[0]);
				} else {
					res.status(404).send("Could not find next event");
				}
			}
		})
	},

	// Return grove calendar for one student
	getGroveCalendar: function(req, res) {
		User.findOne({googleId: req.params.user_id}, function(err, user) {
			if (err) {
				console.error(err);
				res.statu(500).send(err);
			} else if (!user) {
				res.status(404).send(new Error('User not found!'));
			} else {
				res.send(user.groveCalendar);
			}
		})
	},

	// List all students with basic info + groveCalendar
	listGroveCalendars: function(req, res) {
		User.find({}, function(err, users) {
			if (err) {
				console.error(err)
				res.status(500).send(err);
			} else {
				res.send(_.map(users, function(user) { 
					return _.pick(user, ['_id', 'email', 'name', 'image', 'googleId', 'groveCalendar']);
				}));
			}
		});
	},

	// Update one student's groveCalendar
	updateGroveCalendar: function(req, res) {
		User.update({googleId: req.params.user_id}, { groveCalendar: req.body.calendar}, {}, function(err, numAffected){
			if (err) {
				console.error(err);
				res.status(500).send(err);
			} else {
				res.status(200).end();
			}
		});
	},

	// Update all students
	bulkUpdateUsers: function(req, res) {
		User.update( {}, req.body, { multi: true }, function(err, numAffected) {
			if (err) {
				res.status(500).send(err);
			} else {
				res.status(204).end();
			}
		})
	}
};

module.exports = apiController; 