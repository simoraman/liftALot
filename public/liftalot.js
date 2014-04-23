$(document).ready(function(){
  $("#save-workout").asEventStream('click').onValue(saveWorkout);
  $(".add").asEventStream('click').doAction(".preventDefault").onValue(increase);
  $(".remove").asEventStream('click').doAction(".preventDefault").onValue(decrease);
});

function increase(event){
  valueElement = $(event.target.parentElement).find('input');
  value = parseInt(valueElement.val());
  valueElement.val(value + 1);
}
function decrease(event){
  valueElement = $(event.target.parentElement).find('input');
  value = parseInt(valueElement.val());
  if(value > 0){
    valueElement.val(value - 1);
  }
}

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
