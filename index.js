
var $modal = $("#choose-topic-modal");

var getTopicCurrentLevel = function(topicId) {
	return parseInt(localStorage.getItem(topicId));
}

// Render area's topics
var updateAreaTopics = function(areaId, topicData) {
	// Join topics components with its data
	var topics = d3.select(".vote-container")
    					 .select(".area#" + areaId)
							 .select(".body-wrapper")
							 .selectAll(".topic")
							 .data(topicData)
							 .attr("class", function(d) {
								 var classString = "topic col-sm-4";
								 classString += " " + "level_" + getTopicCurrentLevel(d.id);

								 return classString;
							 })
							 .attr("topic-id", function(d, i) {   // use this index to pour data to statistic modal
								 return d.id
							 })
							 .attr("area-id", function(d, i) {
								 return d.area;
							 })
							 .attr("data-toggle", "popover")
							 .attr("data-trigger","focus")
							 .attr("title", function(d,i) {
								 var t = "";
								 return t;
							 })
							 .text(function(d) { return d.name; });

  topics.enter().append("div")
                .attr("class", function(d) {
                	var classString = "topic col-sm-4";
                	classString += " " + "level_" + getTopicCurrentLevel(d.id);

                	return classString;
                })
                .attr("topic-id", function(d, i) {   // use this index to pour data to statistic modal
                  return d.id
                })
                .attr("area-id", function(d, i) {
                	return d.area;
                })
                .attr("data-toggle", "popover")
                .attr("data-trigger","focus")
                .attr("title", function(d,i) {
                	var t = "";
                  return t;
                })
                .text(function(d) { return d.name; });
};

// render area
var renderArea = function(areaId, data) {
	topicData = data["topics"];

	// Add area title
	d3.select(".vote-container")
    .select(".area#" + areaId)
    .append("div").attr("class", "title").text(data["name"])
    .append("div").attr("class", "body-wrapper row")

	updateAreaTopics(areaId, topicData);
}

// render popover
var $popover = $("#popover")

var renderPopover = function(topic) {
	$popover.find("input[name='vote'][value='" + getTopicCurrentLevel(topic.id) + "']").prop("checked", true);

	var link = (!!topic["link"] ? topic.link : "https://engineering.grokking.org/");
	$popover.find("a.topic-link").attr("href", link);
}

var rebindVoteEvent = function(afterVote) {
	$("input[name='vote']").unbind("click");
	$("input[name='vote']").click(afterVote);
}

var addTopicsClickEvent = function() {
	$(".topic").popover({
		html: true,
    content: $popover
  });

	$(".topic").on('click', function() {
	  $(this).popover('show');

	  var areaId = $(this).attr("area-id");
	  var topicId = $(this).attr("topic-id");

		topics = window.areas[areaId].topics
		topic = topics[topics.map(function(topic) {return topic.id;}).indexOf(topicId)];
	  renderPopover(topic);

	  var _this = this;
	  rebindVoteEvent(function() {
			localStorage.setItem(topicId, $(this).val());
			$(_this).popover('hide');

			// Re-render area topics
			updateAreaTopics(areaId, topics);
		})
	});

	$(".topic").on('mouseenter', function() {

	});
}


window.areas = {};
window.topics = [];


var downloadData = function() {
	// Get areas
	$.ajax({
		url: "mock_areas.json",
	    type: "GET",
	    crossDomain: true,
	    dataType: "json",
	    success: function (response) {
	    	console.log("get areas: ", response);
	      var d = response;

	      $.each(d, function(index, areaData) {
					var areaId = areaData.id;
					window.areas[areaId] = areaData;
				});

				// Get topic
				$.ajax({
					url: "mock_topics.json",
			    type: "GET",
			    crossDomain: true,
			    dataType: "json",
			    success: function (response) {
						console.log("get topic: ", response);
		        var d = response;

		        window.topics = d;

						$.each(window.topics, function(index, topicData) {
							var area = window.areas[topicData.area];

						  if(area)
						  {
						  	if(!area.topics)
						  		area.topics = [];

								area.topics.push(topicData);
						  }
						});

						$.each(window.areas, function(key, areaData) {
							console.log(areaData);
					  	renderArea(areaData["id"], areaData);
						});

						addTopicsClickEvent();
					},
			    error: function (xhr, status) {
			        console.log(xhr, status);
			    }
			})
		},
	    error: function (xhr, status) {
	        console.log(xhr, status);
	    }
	});
}

// Display modal
var renderModal = function(topicData) {
	// render title
	$modal.find(".question").text("Bạn đã nắm vững về " + topicData["name"] + " đến đâu?");
	$modal.find("a").attr("href", topicData["link"] + "?utm_source=map&utm_term=" + topicData["name"]);

	$modal.find("input[name='vote']").unbind("click");
	$modal.find("input[name='vote']").click(function() {
		console.log(topicData, " updated");
		localStorage.setItem(topicData["id"], $(this).val());
	});
};

// var initModal = function() {
// 	$modal.on('show.bs.modal', function(e) {
// 		var topicId = $(e.relatedTarget).attr("topic-id");
// 		var topicData = null;

// 		for(var i=0; i<window.topics.length; i++)
// 		{
// 			if(window.topics[i].id == topicId)
// 			{
// 				renderModal(window.topics[i]);
// 			}
// 		}
// 	});
// }

/**
MAIN PROGRAM
**/

downloadData();
// initModal();
