/*
 * Form Validation
 */
$(() => {
  $('select[required]').css({
    position: 'absolute',
    display: 'inline',
    height: 0,
    padding: 0,
    border: '1px solid rgba(255,255,255,0)',
    width: 0,
  });

  $('#formValidate').validate({
    rules: {
      uname: {
        required: true,
        minlength: 5,
      },
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minlength: 5,
      },
      cpassword: {
        required: true,
        minlength: 5,
        equalTo: '#password',
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
      email: 'Enter your email',
      password: {
        required: 'Enter your password',
        minlength: 'Enter at least 5 characters',
      },
      cpassword: {
        required: 'Enter your confirm password',
        minlength: 'Enter at least 5 characters',
        equalTo: 'Please enter correct password',
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

  $('#formValidateEnquiries').validate({
    rules: {
      first_name: {
        required: true,
      },
      last_name: {
        required: true,
      },
      organisation: {
        required: true,
      },
      designation: {
        required: true,
      },
      email: {
        required: true,
      },
      subject: {
        required: true,
      },
      phone: {
        required: true,
      },
      message: {
        required: true,
      },
    },
    messages: {
      first_name: {
        required: 'please enter first name',
      },
      last_name: {
        required: 'please enter last name',
      },
      organisation: {
        required: 'please enter organisation',
      },
      designation: {
        required: 'please enter designation',
      },
      email: {
        required: 'please enter email',
      },
      phone: {
        required: 'please enter 10 digit number only',
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

  $('#formValidateCampaign').validate({
    rules: {
      name: {
        required: true,
      },
      startDate: {
        required: true,
      },
      endDate: {
        required: true,
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

  $('#formValidateLeads').validate({
    rules: {
      FIId: {
        required: true,
      },
      startDate: {
        required: true,
      },
      end_date: {
        required: true,
      },
      leads_csv: {
        required: true,
      },
      productTypeId: {
        required: true,
      },
    },
    messages: {
      FIId: {
        required: 'Please select FIs name',
      },
      startDate: {
        required: 'Please select start date',
      },
      end_date: {
        required: 'Please select expiry date',
      },
      leads_csv: {
        required: 'Please upload csv file',
      },
      productTypeId: {
        required: 'Please select productType',
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

  $('#validateAddFis').validate({
    rules: {
      name: {
        required: true,
      },
      location: {
        required: true,
      },
      fiImage: {
        required: true,
      },
      category: {
        required: true,
      },
      description: {
        required: true,
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
  $('#validateEditFis').validate({
    rules: {
      name: {
        required: true,
      },
      location: {
        required: true,
      },
      category: {
        required: true,
      },
      description: {
        required: true,
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

  $('#validateAddLocation').validate({
    rules: {
      name: {
        required: true,
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

  $('#validateAddPincode').validate({
    rules: {
      code: {
        required: true,
        digits: true,
        minlength: 6,
        maxlength:6
      },
      location: {
        required: true,
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

$('#validateAddDisposition').validate({
  rules: {
    name: {
      required: true,
    },
    type: {
      required: true,
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