/*
 * DataTables - Tables
 */

$(() => {
  // Simple Data Table

  $('#data-table-simple').DataTable({
    responsive: true,
  });

  // Row Grouping Table

  const table = $('#data-table-row-grouping').DataTable({
    responsive: true,
    columnDefs: [{
      visible: false,
      targets: 2,
    }],
    order: [
      [2, 'asc'],
    ],
    displayLength: 25,
    drawCallback(settings) {
      const api = this.api();
      const rows = api.rows({
        page: 'current',
      }).nodes();
      // eslint-disable-next-line no-var
      var last = null;

      api.column(2, {
        page: 'current',
      }).data().each((group, i) => {
        if (last !== group) {
          $(rows).eq(i).before(
            `<tr class="group"><td colspan="5">${group}</td></tr>`,
          );

          last = group;
        }
      });
    },
  });

 

  // Dynmaic Scroll table

  $('#scroll-dynamic').DataTable({
    responsive: true,
    scrollY: '50vh',
    scrollCollapse: true,
    paging: false,
  });

  // Horizontal And Vertical Scroll Table

  $('#scroll-vert-hor').DataTable({
    scrollY: 200,
    scrollX: true,
  });

  // Multi Select Table

  $('#multi-select').DataTable({
    responsive: true,
    paging: true,
    ordering: false,
    info: false,
    columnDefs: [{
      visible: false,
      targets: 2,
    }],

  });
});


// Datatable click on select issue fix
$(window).on('load', () => {
   // Page Length Option Table
   $('#userTable').DataTable({
    responsive: true,
    bLengthChange: false, // thought this line could hide the LengthMenu
    bInfo: false,
    paging: true,
    ordering: false,
    pageLength: 50,
    searching: true,
  });

  $('.dt-action').on('click',(e)=>{
    let elem = $(e.target);
    let objId = elem.data('id');
    let ActionUrl = elem.data('url');
    window.location = ActionUrl+objId;
  });

  $('.dropdown-content.select-dropdown li').on('click', function () {
    const that = this;
    setTimeout(() => {
      if ($(that).parent().parent().find('.select-dropdown')
        .hasClass('active')) {
        // $(that).parent().removeClass('active');
        $(that).parent().parent().find('.select-dropdown')
          .removeClass('active');
        $(that).parent().hide();
      }
    }, 100);
  });
});

const checkbox = $('#multi-select tbody tr th input');
const selectAll = $('#multi-select .select-all');

// Select A Row Function

$(document).ready(() => {
  checkbox.on('click', function () {
    $(this).parent().parent().parent()
      .toggleClass('selected');
  });

  checkbox.on('click', function () {
    if ($(this).attr('checked')) {
      $(this).attr('checked', false);
    } else {
      $(this).attr('checked', true);
    }
  });

  // Select Every Row

  selectAll.on('click', function () {
    $(this).toggleClass('clicked');
    if (selectAll.hasClass('clicked')) {
      $('#multi-select tbody tr').addClass('selected');
    } else {
      $('#multi-select tbody tr').removeClass('selected');
    }

    if ($('#multi-select tbody tr').hasClass('selected')) {
      checkbox.prop('checked', true);
    } else {
      checkbox.prop('checked', false);
    }
  });
});
