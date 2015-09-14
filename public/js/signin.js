// Requires

require('../CONFIG.js');
var _ = require('lodash');
var moment = require('moment');
var $ = require('jquery');
require('jquery.countdown');

// Renders the progress bar at the top of page, using the start time of the student's next (or current) event.
renderProgressBar = function(eventStart){

  $('.countDown').show();
  var currentTime = moment( new Date() );

  if (eventStart && currentTime.isAfter( eventStart ) ) {
    return null;
  } else {
    $('.timer').countDown({  
      start_time: currentTime, //Time when the progress bar is at 0%
      end_time: eventStart || currentTime.add(1, 'ms'), //Time Progress bar is at 100% and timer runs out, when no eventStart is passed for end_time, use current time with 1 added ms to trigger onComplete and update_progress
      progress: $('.progress-bar'), //There dom element which should display the progressbar.
      onComplete: function() {
        $('.timer').show();
        $('.timer').replaceWith("<div class=\"timer ended\">Time's Up!</div>");
      },
      update_progress : function(progress, element){
        if (Math.floor(progress) === 50) {
          $(element).removeClass('progress-bar-success').addClass('progress-bar-warning');
        } else if (Math.floor(progress) === 75) {
          $(element).removeClass('progress-bar-warning').addClass('progress-bar-danger');
        } 

        element.attr('aria-valuenow', Math.floor(progress));//We set a custom attribute, 'area-valuenow' containing the progress
        element.css('width', Math.floor(progress)+'%');//Fill the bar with percentage of progress
        element.text(Math.floor(progress)+'%');//Put text notation of progress inside the progressbar
      }
    });
  }
}

// Render a location image
renderLocationImage = function(eventLocation, eventActivity, eventCreator, focusArea) {

  if (eventLocation) {
    $('#locationImage').append( LOCATION_IMAGES[eventLocation.toLowerCase()] );
    $('#locationText').append(eventLocation);
  }

  // Check if the event activity has an icon, otherwise it is a description and use GET_ACTIVITY
  if (eventActivity && ACTIVITY_IMAGES[eventActivity.toLowerCase()]) {
    $('#activityImage').append( ACTIVITY_IMAGES[eventActivity.toLowerCase()] );
  } else {
    $('#activityImage').append( GET_ACTIVITY(eventActivity) );
  }

  $('#activityText').append(eventActivity || '');

  if (eventCreator) {
    $('#creatorImage').append( CREATOR_IMAGES[eventCreator] );
 //   $('#creatorText').append(eventCreator);
  } else if (focusArea) {
    $('#creatorImage').append( FOCUS_AREAS[focusArea] );
    $('#creatorText').append(focusArea);
  }
}

// Render the grove calendar.
renderGroveCalendar = function(numEvents, userData) {
   $.get('/api/grove/' + userData.id, function(calendar) {
      window.eventData.groveCalendar = calendar;
      var nextEventIndex = _.findIndex(calendar, function(event) {
        return !event.checkedIn;
      });

      // If there's not a next event, then the student has finished their calendar, in which case uncheck all events and start at the top
      if (nextEventIndex === -1) {
        nextEventIndex = 0;
        calendar = _.map(calendar, function(e) {
          e.checkedIn = false;
          return e;
        });

        // Save the new calendar
        $.ajax('/api/grove/' + userData.id, {
          method: 'PUT',
          data: JSON.stringify({calendar: calendar}),
          contentType: 'application/json',
          success: function() {
            // Do we need to do anything here?
          },
          error: function(xhr, text, error) {
            // Do we need to do anything here?
          }
        });
      }
      
      var nextEvent = calendar[nextEventIndex];

      if (nextEvent) renderLocationImage(nextEvent.location, nextEvent.activity, null, nextEvent.focus_area);
  });
}

getCalendar = function(userData){

  // Start and end times for calendar
  var start = moment().startOf('day').toISOString();
  var end = moment().endOf('day').toISOString();

  //get users google calendar events starting with today
  gapi.client.request('https://www.googleapis.com/calendar/v3/calendars/' + userData.email + '/events/?singleEvents=true&timeMin=' + start + '&timeMax=' + end + '&orderBy=startTime').execute(function(response) {

        var currentTime = moment( new Date() );

        //loop through all events in user's google calendar
        var events = _.map(response.items, function(event){

          //return events in this format
          return {
              eventId: event.id,
              location: event.location,
              creator: event.creator.displayName || event.creator.email,
              start: event.start.dateTime,
              end: event.end.dateTime,
              description: event.description,
              summary: event.summary
            };
        });


        //push all events objects in users calendar
        userData.calendar = events;

        window.userData = userData;

        //send user data with calendar events to backend, and save to database
        $.ajax ({
          type: "POST",
          url: 'api/user',
          data: JSON.stringify(userData),
          contentType: 'application/json'
        });
        
        /* loop through all events to find one that is no more than TRANSITION_LENGTH away,
        e.g. if it is 9:52 right now, an event that starts at 9:55 would be next, but an event that starts at 10:00 would not, if 5 min transition time */
        var nextEvent = _.find(events, function(event){
          var a = currentTime;
          var b = moment(event.start);
          var difference = b.diff(a, 'ms');
          return (difference <= TRANSITION_LENGTH && difference > 0);
        });

        // Check to see if there's an event currently happening that the student is late for or is checking into the app before the event is done
        var currentEvent = _.find(events, function(event) {
          var end = moment( event.end ).subtract(TRANSITION_LENGTH, 'ms' );
          return currentTime.isBetween(event.start, end );
        });

        window.eventData = {
          currentEvent: currentEvent,
          nextEvent: nextEvent
        };

        //if a current event is found, show location, teacher, and activity. 
        if (currentEvent) {
          // Render location for current event
          renderLocationImage(currentEvent.location, currentEvent.summary, currentEvent.creator);

          // Render progress bar as full by not passing start time
          renderProgressBar();
        } 
        // If there's not a current event, show the next event
        else if (nextEvent) {

          //pass event start time to renderProgressBar
          renderProgressBar(nextEvent.start);

          renderLocationImage(nextEvent.location, nextEvent.summary, nextEvent.creator);
        }
        // If nothing came back from the google calendar, render the next grove calendar event
        else {
          /* Split the hour based on EVENT_LENGTH and TRANSITION_LENGTH
          e.g. if events go for 15 with 5 min transition, 8:55 - 9:10 would
          be the period during which we would show a student that an event
          is starting at 9:00 */
          var intervals = 60 / (EVENT_LENGTH / (60 * 1000)) + 1;
          var start_times = [];
          for (var i =0; i < intervals; i++) {
            // Remember to use new moment object here for each iteration so as not to override currentTime
            start_times.push( moment( new Date() ).startOf('hour').add(i * EVENT_LENGTH - TRANSITION_LENGTH, 'ms'));
          }

          // Event starts at the first start time after this check-in period
          var event_start = _.find(start_times, function(t) {
            return currentTime.isBetween( t, moment(t).add( EVENT_LENGTH, 'ms' ) );
          }).add(TRANSITION_LENGTH, 'ms');

          // Now render the progress bar and grove calendar with 1 event
          renderProgressBar( event_start );
          renderGroveCalendar(1, userData);
        }
  });
}

signinCallback = function(authResult) {
  if (authResult['status']['signed_in']) {

    // Update the app to reflect a signed in user
    // Hide the sign-in button now that the user is authorized, and show the container
    $('#signinButton').hide();
    $('#main-container').show()

    //make call to google profile for users account information
    gapi.client.request('https://www.googleapis.com/plus/v1/people/me?fields=name(familyName%2Cformatted%2CgivenName)%2CdisplayName%2Cemails%2Fvalue%2Cimage%2Furl%2Cid').execute(function(response) {

      var signInData = {
        id: response.id,
        name: response.displayName,
        email: response.emails[0].value,
        image: response.image.url
      }

      // Now that we have the ID of the student that signed in, listen for any scans from that student and close this window on scan
      var handleScan = function(scan) {
        if (scan.googleId === response.id) {
          window.close();
        }
      };

      var tracker = io.connect();
      tracker.on('SCAN!', handleScan);

      $('#name').append('<h2>' + response.displayName + '\'s Next Step</h2>');
      
      //add google id to scan href/link. that way when scan returns scanned_data we have the users id
      $('#scan-button').attr('href', 'scan://scan?callback=https%3A%2F%2Froots-elementary.herokuapp.com/scanredirect/'+response.id);

      //get calendar events on signIn and send events/user to database in function above
      $('.scan-button').show();
      getCalendar(signInData);

  });
  } else {
    // Update the app to reflect a signed out user
    // Possible error values:
    //   "user_signed_out" - User is signed-out
    //   "access_denied" - User denied access to your app
    //   "immediate_failed" - Could not automatically log in the user
    console.log('Sign-in state: ' + authResult['error']);
  }
}
