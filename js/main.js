$(function() {
  $('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top - 70
        }, 1000);
        return false;
      }
    }
  });
});


// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};
 
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
     
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
       
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
   
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();

/**
 * Transforms form results into an object
 * from http://stackoverflow.com/questions/1184624/convert-form-data-to-js-object-with-jquery
 */
(function() {
  $.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
  };
})();

$(function() {

  var mandrillKey = '026t-Soj1CcaN0FPMNd0HA';
  var mandrillEndpoint = 'https://mandrillapp.com/api/1.0/messages/send.json';
  var emailFromEmail = 'kontakt@uratujmykrajobraz.pl';
  
  var odometer;

  var firebaseUrl = 'https://ratujmykrajobraz.firebaseio.com';
  var firebaseRef = new Firebase(firebaseUrl);
  var counterRef = firebaseRef.child('counter');
  var messagesRef = firebaseRef.child('messages');

  var counterEl = $('[data-counter]');
  var districtSelector = $(".district-selector");
  var formEl = $('form');
  var messageEl = formEl.find('textarea');

  function districtSelectorInit() {
  
    districtSelector.select2({
      placeholder: 'Wpisz nazwę miasta lub powiatu',
      data: AppDistrictData
    });

    districtSelector.on('change', function() {
      var districtNumber = parseInt(this.value.split('-')[0]);
      var match = AppSenatorsData[districtNumber - 1]
      $('#toName').val(match.name);
      $('#toEmail').val(match.email);
      updateMessage(match)
    });

    updateMessage({});
    
  };

  function counterInit() {
    var odometer = new Odometer({
      el: counterEl[0],
      value: 0,
    });

    odometer.update(100)

    counterRef.on("value", function(snapshot) {
      odometer.update(snapshot.val())
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
  };

  function onFormChange() {
    var districtNumber = parseInt(districtSelector.val().split('-')[0]);
    var match = AppSenatorsData[districtNumber - 1]
    updateMessage(match);
  }

  function updateMessage(senator) {
    var msg = tmpl('mesageTemplate', {
      senator: senator,
      message: formEl.serializeObject()
    });
    messageEl.val(msg);
  };


  function onFormSubmit(event) {
    event.preventDefault();
    event.target.checkValidity();
    
    var data = $(this).serializeObject();
    data.toEmail = this.toEmail.value;
    data.toName = this.toName.value;
    data.district = this.district.value.split('-')[0];

    var payload = {
      key: mandrillKey,
      async: false,
      message: {
        text: data.messageBody,
        subject: data.messageTitle,
        from_email: emailFromEmail,
        from_name: data.fromName,
        headers: {
          "Reply-To": data.fromEmail
        },
        to: [{
          email: data.toEmail,
          name: data.toName
        }]
      }
    }
    
    $.ajax({type: "POST",
      contentType: 'application/json',
      url: mandrillEndpoint,
      dataType: 'json',
      data: JSON.stringify(payload)
    });

    
    counterRef.transaction(function (current_value) {
      return (current_value || 0) + 1;
    });

    messagesRef.push(data)
    
    this.reset();

    $('#thankYouModal').modal({})

  };


  counterInit();
  districtSelectorInit();
  formEl.on('submit', onFormSubmit);
  formEl.find('#fromName').on('change', onFormChange);
  formEl.find('#fromEmail').on('change', onFormChange);

});

$(function() {



});


