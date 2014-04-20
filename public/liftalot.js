$(document).ready(function(){
  $("#save-workout").asEventStream('click').onValue(saveWorkout);
});

function saveWorkout() {
  var liftList = $('#lift-list li');
  liftData =_.map(liftList, function(el) {
    return {
      name : $(el).find('.name').text(),
      sets : $(el).find('.sets').val(),
      reps : $(el).find('.reps').val(),
      weight : $(el).find('.weight').val()
    };
  });
  var postData = { lifts : liftData };

  $.ajax('/workout', {
    data : JSON.stringify(postData),
    contentType : 'application/json',
    type : 'POST'
  });
}
