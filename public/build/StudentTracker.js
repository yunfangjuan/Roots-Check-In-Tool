webpackJsonp([2],[function(t,exports,e){function a(t,e){var a=c(t).attr("data-name"),n=c(e).attr("data-name");return c(e).hasClass("Found")-c(t).hasClass("Found")||(a>n)-1||1}function n(t){return t.split(" ").map(function(t){return t[0].toUpperCase()+t.slice(1)}).join(" ")}function i(t){var e=c("<div>").addClass("studentLocationDisplay").addClass("col-md-2").attr("id",t.googleId).attr("data-name",t.name),a=c("<div>").addClass("nameImageContainer"),n=c("<button>").addClass("btn btn-xs btn-primary absent-toggle").text(t.absent?"Present":"Absent"),i=c("<div>").append(n),s=c("<div>").addClass("studentInfoContainer"),o=c("<div>").addClass("name").text(t.name),r=c("<div>").append(c("<img>").addClass("studentImage").attr("src",t.image));return a.append(o).append(r),e.append(a).append(s).append(i),n.on("click",this.toggleAbsent.bind(this)),e}function s(t){var e=o.find(l,function(e){return e.data.googleId===t.googleId});e&&(e.transitionTimeout&&window.clearTimeout(e.transitionTimeout),e.recentScan=t,e.onScan.call(e,t))}var o=e(1),r=e(3),c=e(90),d=o.partial(e(107),EVENT_LENGTH,TRANSITION_LENGTH),l=[],p="All",u=function(t){if(this.data=o.pick(t,["_id","email","name","image","googleId","absent"]),this.el=i.call(this,t),t.absent)this.status="Absent",this.updateDisplay();else if(t.recentScan){scan=t.recentScan;var e=!1,a=scan.event[0];a&&a.end&&r(a.end).subtract(TRANSITION_LENGTH,"ms").isAfter(Date.now())?e=!0:a&&!a.end&&r(scan.time).add(EVENT_LENGTH,"ms").isAfter(Date.now())&&(e=!0),e?(this.recentScan=scan,this.onScan(scan)):(this.status="Lost",this.updateDisplay())}else this.status="Lost",this.updateDisplay()};u.prototype.toggleAbsent=function(t){t.preventDefault(),this.status="Absent"===this.status?"Lost":"Absent";var e=this;c.post("/api/user/",{id:this.data.googleId,absent:!this.data.absent},e.updateDisplay.bind(e))},u.prototype.updateDisplay=function(){if("Absent"!=this.status&&this.el.find(".absent-toggle").text("Absent"),"Found"===this.status){var t=this.recentScan.event[0],e=o.chain(["summary","activity","focus_area"]).map(function(e){return t[e]}).filter().join(" | ").value(),a=c("<p>").addClass("last-scan-info").addClass("text-primary").text(e);this.el.find(".studentInfoContainer").empty().append(a),this.el.removeClass("Lost").addClass("Found"),this.render()}else if("Lost"===this.status){var n=this;c.get("/current-event/"+this.data.googleId,function(t){n.el.removeClass("Found").addClass("Lost");var e=n.el.find(".studentInfoContainer");e.empty(),c("<p>").addClass("correct-location-info text-primary").text(t.location).appendTo(e),n.recentScan&&c("<p>").addClass("last-scan-info text-danger").text(n.recentScan.scannedLocation).appendTo(n.el.find(".studentInfoContainer")),n.currentLocation=t.location,n.render()})}else"Absent"===this.status&&(this.el.removeClass("Found").addClass("Lost"),this.currentLocation="Absent",this.el.find(".absent-toggle").text("Present"),this.render())},u.prototype.render=function(){this.el&&this.el.remove();var t=c("#"+this.currentLocation.replace(/ /g,""));t.append(this.el);var e=t.find(".studentLocationDisplay").sort(a);e.detach().appendTo(t),this.el.find(".absent-toggle").off("click").on("click",this.toggleAbsent.bind(this))},u.prototype.onScan=function(t){var e=this;if(t&&t.correct){this.currentLocation=t.scannedLocation,this.status="Found";var a=t.event[0].end?r(t.event[0].end).subtract(TRANSITION_LENGTH,"ms").diff(Date.now()):d()+EVENT_LENGTH-TRANSITION_LENGTH;this.transitionTimeout=window.setTimeout(e.onScan.bind(e,null),a)}else t?this.status="Lost":(this.status="Lost",this.recentScan=null);e.updateDisplay()},c(function(){["Lost"].concat(o.keys(LOCATION_IMAGES),"Absent").forEach(function(t){var e=t.match(/ipad/i)?"iPad Center":n(t),a=c("<button>").addClass("btn btn-info btn-block").text(e),i=c("<li>").append(a);c("#location-filters").append(i),c("<div>").addClass("row").attr("id",e.replace(/ /g,"")).append(c("<h3>").text(e)).appendTo(c("#locations-container"))}),c("#location-filters button").click(function(t){p=c(this).text(),"All"===p?c("#locations-container > div").show():(c("#locations-container > div").hide(),c("#"+p.replace(/ /g,"")).show()),c("#location-filters button.btn-warning").removeClass("btn-warning").addClass("btn-info"),c(this).removeClass("btn-info").addClass("btn-warning")}),c.get("api/user",function(t){l=o.map(t,function(t){return new u(t)})});var t=io.connect();t.on("SCAN!",s),c(".all-absent").on("click",function(){c.ajax("/api/user/bulk",{type:"PUT",contentType:"application/json",data:JSON.stringify({absent:!0})})})})}]);
