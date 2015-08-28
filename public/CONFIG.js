// Set the event length. 10 minutes * 60 seconds * 1000 ms. 
window.EVENT_LENGTH = 10 * 60 * 1000;

// Transition time between events. 2 minutes * 60s * 1000 ms.
window.TRANSITION_LENGTH = 2 * 60 * 1000;

// Images for the various locations
// TODO:  add images for all locations, with keys that are the name of the location
window.LOCATION_IMAGES = {
  'library center': '<img class="location-image" src="http://rootselementary.org/wp-content/uploads/2015/08/green-paint-splatter-md.png">',
  'maker center': '<img class="location-image" src="http://rootselementary.org/wp-content/uploads/2015/08/purple-paint.png">',
  'ipad center': '<img class="location-image" src="http://rootselementary.org/wp-content/uploads/2015/08/yellow-splash-ink-md.png">',
  'writing center':'<img class="location-image" src="http://rootselementary.org/wp-content/uploads/2015/08/ink-splash-orange-hi.png">',
  'flex center': '<img class="location-image" src="http://rootselementary.org/wp-content/uploads/2015/08/red.png">',
  'ash': '<img class="location-image" src="http://rootselementary.org/wp-content/uploads/2015/08/blue-alphabet-letter-a.png">',
  'birch': '<img class="location-image" src="http://rootselementary.org/wp-content/uploads/2015/08/blue-alphabet-letter-b.png">',
  'cherry': '<img class="location-image" src="http://rootselementary.org/wp-content/uploads/2015/08/blue-alphabet-letter-c.png">',
  'dahlia': '<img class="location-image" src="http://rootselementary.org/wp-content/uploads/2015/08/blue-alphabet-letter-d.png">',
  'elm': '<img class="location-image" src="http://rootselementary.org/wp-content/uploads/2015/08/blue-alphabet-letter-e.png">',
  'forest': '<img class="location-image" src="http://rootselementary.org/wp-content/uploads/2015/08/blue-alphabet-letter-f.png">',
  'playground': '<img class="location-image" src="http://rootselementary.org/wp-content/uploads/2015/08/playground.gif">'
};

// Images for the various activity / descriptions
// TODO: add images for all activities, with keys that are the name of the activity
window.ACTIVITY_IMAGES = {
  'math': '<img class="activity-image" src="https://maxcdn.icons8.com/windows8/PNG/64/Science/math-64.png">',
  //'reading': '<i class="activity-image" src="https://maxcdn.icons8.com/iOS7/PNG/75/Science/literature-75.png">',
  'writing': '<img class="activity-image" src="https://maxcdn.icons8.com/windows8/PNG/64/Editing/ball_point_pen-64.png">',
  'science': '<img class="activity-image" src="https://maxcdn.icons8.com/windows8/PNG/64/Science/test_tube-64.png">',
  'dance': '<img class="activity-image" src="https://maxcdn.icons8.com/Android/PNG/64/Sports/dancing-64.png">',
  

};

// Images for event creator
window.CREATOR_IMAGES = {
	'Jill Carty': '<img src="http://rootselementary.org/wp-content/uploads/2015/08/jill.jpg" class="creator-image">',
/*	'Roots Elementary':
	'Anna Stringfield': '<img src="http://rootselementary.org/wp-content/uploads/2015/08/anna.jpg" class="creator-image">',
	'Leksy Wolk': '<img src="http://rootselementary.org/wp-content/uploads/2015/08/leksy.jpg" class="creator-image">',
	'Mackenzie Wagner': '<img src="http://rootselementary.org/wp-content/uploads/2015/08/mackenzie.jpg" class="creator-image">',
	'Julia Quintanilla': '<img src="http://rootselementary.org/wp-content/uploads/2015/08/julia.jpg" class="creator-image">',
	'Eve Bunevich': '<img src="http://rootselementary.org/wp-content/uploads/2015/08/eve.jpg" class="creator-image">',
	'Jonathan Hanover': '<img src="http://rootselementary.org/wp-content/uploads/2015/08/jon.jpg" class="creator-image">',
	'Martin Cech': '<img src="http://rootselementary.org/wp-content/uploads/2015/08/marty.jpg" class="creator-image">',
	'Megan Miles': '<img src="http://rootselementary.org/wp-content/uploads/2015/08/megan.jpg" class="creator-image">',
	'Samantha Gambino': '<img src="http://rootselementary.org/wp-content/uploads/2014/12/image1-2-300x300.jpg" class="creator-image">',
	'Mahdyeh Nowkhandan': '<img src="http://rootselementary.org/wp-content/uploads/2015/08/mahdyeh.jpg" class="creator-image">',
	'Debbie Van Roy': '<img src="http://rootselementary.org/wp-content/uploads/2015/08/debbie.jpg" class="creator-image">',
	'Dominic Hernandez': '<img src="http://rootselementary.org/wp-content/uploads/2015/08/dominic.jpg" class="creator-image">',
	'Idali Franco': '<img src="http://rootselementary.org/wp-content/uploads/2015/08/idali.jpg" class="creator-image">'*/
}

// The list of all possible grove calendar activities
window.GROVE_ACTIVITIES = {
	'Library Center': ['Level Reading', 'Buddy Reading','Blocks'],
	'Maker Center': ['Blocks', 'Legos'],
	'iPad Center': ['ST Math', 'RazKids']
};

// The list of all possible Focus Areas, and their associated pictures
window.FOCUS_AREAS = {
	'Fluency': '<i class="focus-area-image fa fa-comment fa-4x">',
	'Mental Math': '<i class="focus-area-image fa fa-calculator fa-4x">',
	'Noise Level': '<i class="focus-area-image fa fa-volume-up fa-4x">'
}

// Getting activity from google descriptions
window.GET_ACTIVITY = function(description) {
	
	// Lower case description to ignore case on keywords 
	description = description.toLowerCase();

	// If 'read' shows up in description
	if (description.match('read')) {
		return '<i class="activity-image fa fa-book fa-4x">';
	}
/*	else if (description.match('math')) {
		return '<img class="activity-image" src="https://maxcdn.icons8.com/windows8/PNG/64/Science/math-64.png">';
	}
	else if (description.match('dance')) {
		return '<img class="activity-image" src="https://maxcdn.icons8.com/Android/PNG/64/Sports/dancing-64.png">';
	}
	else if (description.match('science')) {
		return '<img class="activity-image" src="https://maxcdn.icons8.com/windows8/PNG/64/Science/test_tube-64.png">';
	}
	else if (description.match('writing')) {
		return '<img class="activity-image" src="https://maxcdn.icons8.com/windows8/PNG/64/Editing/ball_point_pen-64.png">';
	}
	else if (description.match('morning circle')) {
		return '<img class="activity-image" src="https://maxcdn.icons8.com/Android/PNG/64/Healthcare/groups-64.png"">'
	}*/
	// For all of our predefined activities, if the name of the activity is in the summary somewhere, use that image
	Object.keys(ACTIVITY_IMAGES).forEach( function(activity) {
 		if(description.match(activity)) {
 			return ACTIVITY_IMAGES[activity];
 		}
 	});
 }
