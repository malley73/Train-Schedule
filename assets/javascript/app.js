$(document).ready(function() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAv_ar4YMftCRdvBYMB0QfZRFSVxQFtt5o",
    authDomain: "train-schedule-80ec2.firebaseapp.com",
    databaseURL: "https://train-schedule-80ec2.firebaseio.com",
    projectId: "train-schedule-80ec2",
    storageBucket: "",
    messagingSenderId: "347865332434"
  };
  firebase.initializeApp(config)

  //define firbase reference
  var database = firebase.database();
  var i = 0;

  // Initial load
  if (i === 0) {
    database.ref().on("child_added", function(childSnapshot, prevChildKey) {
      parseData(childSnapshot);
      i = 1;
    });
  }

  function collectFormData() {
    var name = $('#shuttle').val().trim();
    var planet = $('#planet').val().trim();
    var frequency = Number($('#frequency').val());
    var status = $('#status').val().trim();
    var firstTime = moment($('#firsttime').val(), "HH:mm").format("X");
    recordFormValues(name, planet, frequency, status, firstTime);
  }

  //write values to firebase
  function recordFormValues(name, destination, frequency, status, time) {
    var shuttles = {
      name: name,
      destination: destination,
      frequency: frequency,
      status: status,
      initTime: time
    };

    database.ref().push(shuttles);
    clearForm();
  }

  function clearForm() {
    $('#shuttle').val("");
    $('#planet').val("");
    $('#frequency').val("");
    $('#status').val("");
    $('#firsttime').val("");
  }

  function parseData(childSnapshot) {
    var name = childSnapshot.val().name;
    var destination = childSnapshot.val().destination;
    var frequency = childSnapshot.val().frequency;
    var status = childSnapshot.val().status;
    var time = childSnapshot.val().initTime;

    var timeDiff = moment().diff(moment.unix(time, "X"), "minutes");
    var minutes = frequency === 0 ? "-" : parseInt(frequency - (timeDiff % frequency));
    var nextArrival = frequency === 0 ? "-" : moment().add(minutes, 'minutes').format("hh:mm A");
    updateDisplay(name, destination, frequency, nextArrival, minutes, status);
  }

  function updateDisplay(name, destination, frequency, nextArrival, minutes, status) {
    if (minutes === "-") {
      $("#display > tbody").append("<tr class='danger'><td>" + name + "</td><td>" + destination + "</td><td>" +
        frequency + "</td><td>" + nextArrival + "</td><td>" + minutes + "</td><td>" + status + "</td></tr>");
    } else {
      $("#display > tbody").append("<tr><td>" + name + "</td><td>" + destination + "</td><td>" +
        frequency + "</td><td>" + nextArrival + "</td><td>" + minutes + "</td><td>" + status + "</td></tr>");
    }
  }

  // refresh every minute
  setInterval(function() {
    $("#tbody").empty();
    database.ref().on("child_added", function(childSnapshot, prevChildKey) {
      parseData(childSnapshot);
    });
  }, 60000);

  // form submit
  $("#submit").on('click', function(event) {
    event.preventDefault();
    collectFormData();
  });
});