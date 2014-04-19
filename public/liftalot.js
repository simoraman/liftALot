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
    type : 'POST'
  });
}

function addLift() {
  var data = {
    name : $("#lift-selection").val()
  };
  var template = Hogan.compile(
    ['<li>{{name}}',
    '<input type=text value="3"></input> x <input type=text value="5"></input>',
     '@ <input type=text value=""></input>',
     '</li>'].join('\n'));
  $('#lift-list').append(template.render(data));
}
