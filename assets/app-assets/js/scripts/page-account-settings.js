/* Account Settings */
/* ----------------*/
$(document).ready(() => {
  var amontLimit = 4000;
  // music select init
  const musicselect = $('#musicselect2').select2({
    dropdownAutoWidth: true,
    width: '100%',
  });
  // movies select init
  const moviesselect = $('#moviesselect2').select2({
    dropdownAutoWidth: true,
    width: '100%',
  });
  // language select init
  const languageselect = $('#languageselect2').select2({
    dropdownAutoWidth: true,
    width: '100%',
  });
  /*  UI - Alerts */
  $('.card-alert .close').click(function () {
    $(this)
      .closest('.card-alert')
      .fadeOut('slow');
  });
  // form validation for general tab
  $('.formValidate').validate({
    rules: {
      uname: {
        required: true,
        minlength: 5,
      },
      email: {
        required: true,
        email: true,
      },
      name: {
        required: true,
      },
      oldpswd: {
        required: true,
        minlength: 5,
      },
      newpswd: {
        required: true,
        minlength: 5,
      },
      repswd: {
        required: true,
        minlength: 5,
      },
      crole: {
        required: true,
      },
      curl: {
        required: true,
        url: true,
      },
      ccomment: {
        required: true,
        minlength: 15,
      },
      tnc_select: 'required',
    },
    // For custom messages
    messages: {
      uname: {
        required: 'Enter a username',
        minlength: 'Enter at least 5 characters',
      },
      curl: 'Enter your website',
    },
    errorElement: 'div',
    errorPlacement(error, element) {
      const placement = $(element).data('error');
      if (placement) {
        $(placement).append(error);
      } else {
        error.insertAfter(element);
      }
    },
  });
  //  form validation for passowrd tab
  $('.paaswordvalidate').validate({
    rules: {
      oldpswd: {
        required: true,
        minlength: 5,
      },
      newpswd: {
        required: true,
        minlength: 5,
      },
      repswd: {
        required: true,
        minlength: 5,
      },
    },
    errorElement: 'div',
    errorPlacement(error, element) {
      const placement = $(element).data('error');
      if (placement) {
        $(placement).append(error);
      } else {
        error.insertAfter(element);
      }
    },
  });
  // upload button converting into file button
  $('#select-files').on('click', () => {
    $('#upfile').click();
  });


$.validator.addMethod("minAge", function(value, element, min) {
    var today = new Date();
    var birthDate = new Date(value);
    var age = today.getFullYear() - birthDate.getFullYear();
 
    if (age > min+1) { return true; }
 
    var m = today.getMonth() - birthDate.getMonth();
 
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
 
    return age >= min;
}, "Age should be minimum 18");

$.validator.addMethod("maxAge", function(value, element, max) {
    var today = new Date();
    var birthDate = new Date(value);
    var age = today.getFullYear() - birthDate.getFullYear();
 
    if (age < max-1) { return true; }
 
    var m = today.getMonth() - birthDate.getMonth();
 
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
 
    return age <= max;
}, "Age should be a maximum 100");
  
  
// add user
$('.validateAddUser').validate({
  rules: {
      firstName: {
          minlength: 3,
          required: true,
      },
      lastName: {
          required: false,
          minlength: 3,
      },
      email: {
          minlength: 1,
          required: true,
          email: true,
          remote: {
              url: baseUrl + 'user/checkUserExit',
              type: "POST",
              dataType: "json",
              //   data:{
            //     'id' : function() {
            //         return $(document).find('#id').val();
            //     }
            // }
          },
      },
      pincode: {
          required: true,
          digits: true,
          minlength: 6,
          maxlength: 6,
      },
      phone: {
          required: true,
          digits: true,
          minlength: 10,
          maxlength: 10,
          remote: {
              url: baseUrl + 'user/checkUserExit',
              type: "POST",
              dataType: "json",
            //   data:{
            //     'id' : function() {
            //         return $(document).find('#id').val();
            //     }
            // }
          },
      },
      emergencyPhone: {
          required: false,
          digits: true,
          minlength: 10,
          maxlength: 10,
      },
      dob: {
          required: true,
          minAge: 18,
          maxAge: 100
      },
      roleId: {
          required: true,
      },
      employeeId:{
        required: true,
        minlength: 6,
        remote: {
            url: baseUrl + 'user/checkUserExit',
            type: "POST",
            dataType: "json",
        },
      },
      location: {
          required: true,
      },
      address: {
          required: false,
          minlength: 5,
      },
      'language[]': {
          required: true,
      },

      'locationId[]': {
          required: true,
      },
      reportingTo: {
        required: true,
    },
      // 'experience': {
      //     required: true,
      //     digits: true,
      // },
      // 'YearsORMonths': {
      //     required: true,
      //     // digits: true,
      // },

  },
  messages: {
      // firstName: {
      //   required: 'Please enter a firstname',
      // },
      // lastName: {
      //   required: 'Please enter a lastName',
      // },
      phone: {
          required: 'Please enter a valid phone number',
          remote: 'This phone number already exists',
      },
      emergencyPhone: {
          required: 'Please enter a valid phone number',
      },
      employeeId: {
        required: 'Please enter a valid employeeId',
        remote: 'This employeeId already exists',
    },
      // dob: {
      //   required: 'Please enter a dob',
      // },
      // location: {
      //   required: 'Please enter a location',
      // },
      // address: {
      //   required: 'Please enter a address',
      // },
      'language[]': {
        required: 'Please select at least one from the language',
      },
      'locationId[]': {
        required: 'Please select at least one from the location',
      },
      reportingTo:{
        required: 'Please select reporting name from the reportingTo',
      },
      email: {
          email: 'Please enter valid email',
          remote: 'This email id already exists',
      },
  },
  errorElement: 'div',
  errorPlacement(error, element) {
      const placement = $(element).data('error');
      if (placement) {
          $(placement).append(error);
      } else {
          error.insertAfter(element);
      }
  },
  // highlight: function(element, errorClass) {
  //     $(element).fadeOut(function() {
  //         $(element).fadeIn();
  //     });
  // },
});
  
// edit user 
$('.validateEditUser').validate({
  rules: {
      firstName: {
          minlength: 3,
          required: true,
      },
      lastName: {
          required: false,
          minlength: 3,
      },
      email: {
          minlength: 1,
          required: true,
          email: true,
          remote: {
              url: baseUrl + 'user/checkUserExit',
              type: "POST",
              dataType: "json",
                data:{
                'id' : function() {
                    return $(document).find('#id').val();
                }
            }
          },
      },
      employeeId:{
        required: true,
        minlength: 6,
        remote: {
          url: baseUrl + 'user/checkUserExit',
          type: "POST",
          dataType: "json",
            data:{
            'id' : function() {
                return $(document).find('#id').val();
            }
        }
      },
      },
      pincode: {
          required: true,
          digits: true,
          minlength: 6,
          maxlength: 6,
      },
      phone: {
          required: true,
          digits: true,
          minlength: 10,
          maxlength: 10,
          remote: {
              url: baseUrl + 'user/checkUserExit',
              type: "POST",
              dataType: "json",
              data:{
                'id' : function() {
                    return $(document).find('#id').val();
                }
            }
          },
      },
      emergencyPhone: {
          required: false,
          digits: true,
          minlength: 10,
          maxlength: 10,
      },
      dob: {
          required: true,
          minAge: 18,
          maxAge: 100
      },
      roleId: {
          required: true,
      },
      location: {
          required: true,
      },
      address: {
          required: false,
          minlength: 5,
      },
      'language[]': {
          required: true,
      },

      'locationId[]': {
          required: true,
      },
      'experience': {
          required: true,
          digits: true,
      },
      'YearsORMonths': {
          required: true,
          // digits: true,
      },

  },
  messages: {
      // firstName: {
      //   required: 'Please enter a firstname',
      // },
      // lastName: {
      //   required: 'Please enter a lastName',
      // },
      phone: {
          // required: 'Please enter a phone',
          remote: 'This phone number already exists',
      },
      emergencyPhone: {
          // required: 'Please enter a phone',
          remote: 'This phone number already exists',
      },
      employeeId: {
        required: 'Please enter a valid employeeId',
        remote: 'This employeeId already exists',
    },
      // dob: {
      //   required: 'Please enter a dob',
      // },
      // location: {
      //   required: 'Please enter a location',
      // },
      // address: {
      //   required: 'Please enter a address',
      // },
      'language[]': {
        required: 'Please select at least one from the language',
      },
      'locationId[]': {
        required: 'Please select at least one from the location',
      },
      email: {
          email: 'Please enter valid email',
          remote: 'This email id already exists',
      },
  },
  errorElement: 'div',
  errorPlacement(error, element) {
      const placement = $(element).data('error');
      if (placement) {
          $(placement).append(error);
      } else {
          error.insertAfter(element);
      }
  },
  // highlight: function(element, errorClass) {
  //     $(element).fadeOut(function() {
  //         $(element).fadeIn();
  //     });
  // },
});

//  user cloumn
$('.columnAction').validate({
  rules: {
      'column[]': {
          required: true,
      },
  },
  messages: {
      'column[]': {
        required: 'Please select at least one from above',
      },
  },
  errorElement: 'div',
  errorPlacement(error, element) {
      const placement = $(element).data('error');
      if (placement) {
          $(placement).append(error);
      } else {
          error.insertAfter(element);
      }
  },
  submitHandler: function(form, event) { 
    event.preventDefault();
    const checkbox = Array.from($(form).find("input[name*='column[]']"));
    let notCheck = [];
    if(checkbox){
      checkbox.forEach(element => {
          if(element.checked != true){
            notCheck.push(element.value);
          }
      });
    }

    if(notCheck){
      toggleColumn(myTable,notCheck,checkbox.length);
      
    }
    $('#filterColumn').modal('close');
 },
});

  $('.validatePassword').validate({
    rules: {
      password: {
        required: true,
        minlength: 5,
      },
      repswd: {
        required: true,
        minlength: 5,
        equalTo: '#password',
      },
    },
    errorElement: 'div',
    errorPlacement(error, element) {
      const placement = $(element).data('error');
      if (placement) {
        $(placement).append(error);
      } else {
        error.insertAfter(element);
      }
    },
  });

  $('#formValidate3').validate({
    rules: {
      password: {
        required: true,
        minlength: 5,
      },
      confirm_password: {
        required: true,
        minlength: 5,
        equalTo: '#password',
      },
    },
    errorElement: 'div',
    errorPlacement(error, element) {
      const placement = $(element).data('error');
      if (placement) {
        $(placement).append(error);
      } else {
        error.insertAfter(element);
      }
    },
  });

  $('.validateAddTeam').validate({
    rules: {
      name: {
        required: true,
      },
      location: {
        required: true,
      },
      description: {
        required: true,
      },
      teamLeaderId: {
        required: true,
      }      
    },
    messages: {
      name: {
        required: 'Team name is required',
      },
      location: {
        required: 'Location is required',
      },
      description: {
        required: 'Description is required',
      },
      description: {
        required: 'Team description is required',
      },
      teamLeaderId: {
        required: 'Team leader is required',
      },      
      curl: 'Enter your website',
    },
    errorElement: 'div',
    errorPlacement(error, element) {
      const placement = $(element).data('error');
      if (placement) {
        $(placement).append(error);
      } else {
        error.insertAfter(element);
      }
    },
  });

  $('.formValidateCase').validate({
    rules: {
      callStatus: {
        required: true,
      },
      recoveredAmount: {
        required: true,
        max: function() {
          return parseInt(maxLimit);
       }
      },
      ptpAmount: {
        required: true,
        max: function() {
          return parseInt(maxLimit);
       }
      },
      comments: {
        required: true,
      },
    },
    messages: {
      callStatus: {
        required: 'Call status is required',
      },
      collectionStatus: {
        required: 'Collection status is required',
      },
      comments: {
        required: 'Comments status is required',
      },
      curl: 'Enter your website',
    },
    errorElement: 'div',
    errorPlacement(error, element) {
      const placement = $(element).data('error');
      if (placement) {
        $(placement).append(error);
      } else {
        error.insertAfter(element);
      }
    },
  });

  $('.addContactInfo').validate({
    rules: {
      type: {
        required: true,
      },
      content: {
        required: true,
      },
    },
    messages: {
      type: {
        required: 'Please select content type',
      },
      content: {
        required: 'Please enter content',
      }
    },
    errorElement: 'div',
    errorPlacement(error, element) {
      const placement = $(element).data('error');
      if (placement) {
        $(placement).append(error);
      } else {
        error.insertAfter(element);
      }
    },
  });

  $('.validateAddRole').validate({
    rules: {
      name: {
        required: true,
        minlength: 3,
      },
    },
    messages: {
      name: {
        required: 'Role name is required',
      },
    },
    errorElement: 'div',
    errorPlacement(error, element) {
      const placement = $(element).data('error');
      if (placement) {
        $(placement).append(error);
      } else {
        error.insertAfter(element);
      }
    },
  });

});
