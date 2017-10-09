
var $modal = $("#choose-topic-modal");

var getTopicCurrentLevel = function(topicId) {
	return parseInt(localStorage.getItem(topicId));
}

// Render area
var renderArea = function(areaId, data) {
	topicData = data["topics"];

	var area = d3.select(".vote-container")
              .select(".area#" + areaId)
              .append("div").attr("class", "title").text(data["name"])
              .append("div").attr("class", "body-wrapper row")
              .selectAll(".topic")
              .data(topicData);

    area.enter().append("div")
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

      //           	if(d.statistic)
      //           	{
						// // show statistic's text in tooltip
		    //             t = "Kết quả tham khảo từ cộng đồng\n\n";
		    //             t += "Chưa biết về kỹ năng này: " + (d.statistic.level_0 || 0) + " người\n";
		    //             t += "Đã biết về nó, nhưng chưa dùng bao giờ: " + (d.statistic.level_1 || 0) + " người\n";
		    //             t += "Đã làm qua, nhưng chưa thành thạo: " + (d.statistic.level_2 || 0) + " người\n";
		    //             t += "I grokked this: " + (d.statistic.level_3 || 0) + " người\n";
      //           	}

                  return t;
                })   
                .text(function(d) { return d.name; });
}

// render Topic
var addTopicsClickEvent = function() {
	$(".topic").popover({
		html: true,
        content: $('#popover')
    });

	$(".topic").on('click', function() {
	  $(this).popover('show');

	  var areaId = $(this).attr("area-id");
	  var topicId = $(this).attr("topic-id");

	  $("input[name='vote'][value='" + getTopicCurrentLevel(topicId) + "']").prop("checked", true);

	  var _this = this;

	  $("input[name='vote']").unbind("click");
	  $("input[name='vote']").click(function() {
			console.log(topicId, " updated");
			localStorage.setItem(topicId, $(this).val());
			$(_this).popover('hide');
		});

	  // highlight
	  $(this).addClass('chosen');
	});

	$(".topic").on('mouseenter', function() {
	  
	});
}


window.areas = {};
window.topics = [];


var downloadData = function() {
	$.ajax({
		url: "mock_areas.json",
	    type: "GET",
	    crossDomain: true,
	    dataType: "json",
	    success: function (response) {
	    	console.log(response);
	        var d = response;

	        $.each(d, function(index, areaData) {
				var areaId = areaData.id;

				window.areas[areaId] = areaData;
			});

			$.ajax({

				url: "mock_topics.json",
			    type: "GET",
			    crossDomain: true,
			    dataType: "json",
			    success: function (response) {
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
					  renderArea(areaData["id"], areaData, key);
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

