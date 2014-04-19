$(document).ready(function(){
  $('#add-lift').asEventStream('click').onValue(addLift);
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

function addLift() {
  var data = {
    name : $("#lift-selection").val()
  };
  var template = Hogan.compile(
    ['<li> <span class="name">{{name}}</span>',
    '<input type="number" class="sets" value="3" min="0"></input> x <input type="number" class="reps" value="5" min="0"></input>',
     '@ <input type="number" class="weight" min="0" value=""></input>',
     '</li>'].join('\n'));
  $('#lift-list').append(template.render(data));
}
