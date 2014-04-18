$(document).ready(function(){
  $('#add-lift').asEventStream('click').onValue(addLift);
  $("#save-workout").asEventStream('click').onValue(saveWorkout);
});

function saveWorkout() {
  var liftList = $('#lift-list li');
  liftData =_.map(liftList, function(el) {
    return { name : $(el).text() };
  });
  var postData = { lifts : liftData };

  $.ajax('/workout', {
    data : JSON.stringify(postData),
    contentType : 'application/json',
    type : 'POST'});
}

function addLift() {
  var value = $("#lift-selection").val();
  $('#lift-list').append('<li>' + value + '</li>');
}
