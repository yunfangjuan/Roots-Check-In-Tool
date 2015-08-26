// Set the event length. 10 minutes * 60 seconds * 1000 ms. 
window.EVENT_LENGTH = 10 * 60 * 1000;

// Transition time between events. 2 minutes * 60s * 1000 ms.
window.TRANSITION_LENGTH = 2 * 60 * 1000;

// Images for the various locations
// TODO:  add images for all locations, with keys that are the name of the location
window.LOCATION_IMAGES = {
  'library': '<img class="location-image" src="http://rootselementary.org/wp-content/uploads/2015/08/green-paint-splatter-md.png">',
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
  'Buddy Reading': '<i class="activity-image" src="https://maxcdn.icons8.com/iOS7/PNG/75/Science/literature-75.png">',
  'writing': '<img class="activity-image" src="https://maxcdn.icons8.com/windows8/PNG/64/Editing/ball_point_pen-64.png">',
  'science': '<img class="activity-image" src="https://maxcdn.icons8.com/windows8/PNG/64/Science/test_tube-64.png">',
  'dance': '<img class="activity-image" src="https://maxcdn.icons8.com/Android/PNG/64/Sports/dancing-64.png">',
  

};

// Images for event creator
window.CREATOR_IMAGES = {
	'Jill Carty': '<img src="/img/jill-image.jpg" class="creator-image">'
/*	'Roots Elementary':
	'Anna Stringfield':
	'Leksy Wolk':
	'Mackenzie Wagner':
	'Julia Quintanilla':
	'Eve Bunevich': 
	'Jonathan Hanover':
	'Martin Cech':
	'Megan Miles':
	'Samantha Gambino':
	'Mahdyeh Nowkhandan':
	'Debbie Van Roy':
	'Dominic Hernandez':
	'Idali Franco':*/
}

// The list of all possible grove calendar activities
window.GROVE_ACTIVITIES = {
	'Library Center': ['Level Reading', 'Buddy Reading'],
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
	
	// For all of our predefined activities, if the name of the activity is in the summary somewhere, use that image
	Object.keys(ACTIVITY_IMAGES).forEach( function(activity) {
		if(description.match(activity)) {
			return ACTIVITY_IMAGES[activity];
		}
	});
}
