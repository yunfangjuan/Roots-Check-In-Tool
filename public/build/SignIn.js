webpackJsonp([1],[function(e,exports,a){function t(e){var a=i(e);if(!a)return null;window.eventData=a,window.userData=e,renderLocationImage(a.location,a.activity||a.summary,a.creator,a.focus_area);var t=r(a.start);renderProgressBar(t)}var n=a(1),r=a(3),o=a(102);a(118);var i=(n.partial(a(119),EVENT_LENGTH,TRANSITION_LENGTH),n.partialRight(a(120),EVENT_LENGTH,TRANSITION_LENGTH,EVENT_INCREMENT)),s="https%3A%2F%2F"+window.location.host;renderProgressBar=function(e){o(".countDown").show();var a=r(Date.now());return e&&a.isAfter(e)?null:void o(".timer").countDown({start_time:a,end_time:e||a.add(1,"ms"),progress:o(".progress-bar"),onComplete:function(){o(".timer").show(),o(".timer").replaceWith('<div class="timer ended">Time\'s Up!</div>')},update_progress:function(e,a){50===Math.floor(e)?o(a).removeClass("progress-bar-success").addClass("progress-bar-warning"):75===Math.floor(e)&&o(a).removeClass("progress-bar-warning").addClass("progress-bar-danger"),a.attr("aria-valuenow",Math.floor(e)),a.css("width",Math.floor(e)+"%"),a.text(Math.floor(e)+"%")}})},renderLocationImage=function(e,a,t,n){e&&(o("#locationImage").empty().append(LOCATION_IMAGES[e.toLowerCase()]),o("#locationText").empty().append(e)),a&&ACTIVITY_IMAGES[a.toLowerCase()]?o("#activityImage").empty().append(ACTIVITY_IMAGES[a.toLowerCase()]):o("#activityImage").empty().append(GET_ACTIVITY(a)),o("#activityText").empty().append(a||""),t?o("#creatorImage").empty().append(CREATOR_IMAGES[t]):n&&(o("#creatorImage").empty().append(FOCUS_AREAS[n]),o("#creatorText").empty().append(n))},getCalendar=function(e){var a=r(Date.now()).startOf("day").toISOString(),i=r(Date.now()).endOf("day").toISOString();gapi.client.request("https://www.googleapis.com/calendar/v3/calendars/"+e.email+"/events/?singleEvents=true&timeMin="+a+"&timeMax="+i+"&orderBy=startTime").execute(function(a){e.calendar=n.map(a.items,function(e){return{eventId:e.id,location:e.location,creator:e.creator.displayName||e.creator.email,start:e.start.dateTime,end:e.end.dateTime,description:e.description,summary:e.summary}}),o.ajax({type:"POST",url:"api/user",data:JSON.stringify(e),contentType:"application/json",success:t}),t(e)})},signinCallback=function(e){e.status.signed_in?(o("#signinButton").hide(),o("#main-container").show(),gapi.client.request("https://www.googleapis.com/plus/v1/people/me?fields=name(familyName%2Cformatted%2CgivenName)%2CdisplayName%2Cemails%2Fvalue%2Cimage%2Furl%2Cid").execute(function(e){var a={id:e.id,name:e.displayName,email:e.emails[0].value,image:e.image.url},t=function(a){a.googleId===e.id&&window.close()},n=io.connect();n.on("SCAN!",t),o("#name").append("<h2>"+e.displayName+"'s Next Step</h2>"),console.log("Scan back URL:"+s),o("#scan-button").attr("href","scan://scan?callback="+s+"/scanredirect/"+e.id),o(".scan-button").show(),getCalendar(a)})):console.log("Sign-in state: "+e.error)}}]);