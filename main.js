// Registan Travel - booking page logic (live price + validation)
(function () {
  'use strict';

  var TOURS = {
    tashkent:  { name: 'Old Tashkent Walk',      price: 35 },
    samarkand: { name: 'Registan & Gur-e-Amir',  price: 120 },
    khiva:     { name: 'Khiva Itchan Kala',      price: 210 }
  };

  var form = document.getElementById('bookingForm');
  if (!form) { return; } // this script is only needed on the booking page

  var nameInput = document.getElementById('name');
  var emailInput = document.getElementById('email');
  var tourSelect = document.getElementById('tour');
  var travellersInput = document.getElementById('travellers');
  var dateInput = document.getElementById('date');
  var totalBox = document.getElementById('total');
  var messageBox = document.getElementById('message');

  function round2(x) {
    return Math.round(x * 100) / 100;
  }

  // Returns the price details, or null if the number of travellers is not valid
  function calculate() {
    var tour = TOURS[tourSelect.value];
    var n = parseInt(travellersInput.value, 10);
    if (!tour || isNaN(n) || n < 1 || n > 12) { return null; }

    var subtotal = n * tour.price;
    var discount = n >= 5 ? 0.10 : 0; // groups of 5 or more get 10% off
    return {
      tour: tour,
      n: n,
      subtotal: subtotal,
      discount: discount,
      total: round2(subtotal * (1 - discount))
    };
  }

  function updateTotal() {
    var c = calculate();
    if (!c) {
      totalBox.textContent = 'Total: please choose 1 to 12 travellers.';
      return;
    }
    var text = 'Total: ' + c.n + ' \u00D7 ' + c.tour.price + ' USD = ' + c.subtotal + ' USD';
    if (c.discount > 0) {
      text += ', minus 10% group discount = ' + c.total + ' USD';
    }
    totalBox.textContent = text;
  }

  function clearErrors() {
    [nameInput, emailInput, travellersInput].forEach(function (field) {
      field.classList.remove('invalid');
    });
    messageBox.className = 'message';
    messageBox.textContent = '';
  }

  // Pre-select a tour when we come from a card on the Home page (?tour=khiva)
  var wanted = new URLSearchParams(window.location.search).get('tour');
  if (wanted && TOURS[wanted]) { tourSelect.value = wanted; }

  tourSelect.addEventListener('change', updateTotal);
  travellersInput.addEventListener('input', updateTotal);
  travellersInput.addEventListener('change', updateTotal);

  form.addEventListener('submit', function (event) {
    event.preventDefault(); // no page reload
    clearErrors();

    var errors = [];
    var firstBad = null;

    function fail(field, text) {
      field.classList.add('invalid');
      errors.push(text);
      if (!firstBad) { firstBad = field; }
    }

    if (nameInput.value.trim() === '') {
      fail(nameInput, 'Please enter your name.');
    }
    if (emailInput.value.indexOf('@') === -1) {
      fail(emailInput, 'Please enter a valid email (it must contain @).');
    }
    var c = calculate();
    if (!c) {
      fail(travellersInput, 'Number of travellers must be between 1 and 12.');
    }

    if (errors.length > 0) {
      messageBox.className = 'message error';
      messageBox.textContent = errors.join(' ');
      firstBad.focus();
      return;
    }

    var when = dateInput.value ? ' on ' + dateInput.value : '';
    messageBox.className = 'message success';
    messageBox.textContent = 'Thank you, ' + nameInput.value.trim() +
      '! Your request for "' + c.tour.name + '"' + when +
      ' was received. Total: ' + c.total + ' USD.';
  });

  updateTotal();
})();
