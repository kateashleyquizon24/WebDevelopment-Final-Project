var ORDER_PHP_URL = 'http://localhost/travelitrix/order.php';

document.addEventListener('DOMContentLoaded', function () {

  /* ── Destination Data ─────────────────────── */
  var destinations = [
    { name: 'PARIS',       emoji: '🗼', lat: '48.8566°N', lng: '2.3522°E',   coord: '48.8566° N, 2.3522° E',   select: 'Paris, France'           },
    { name: 'TOKYO',       emoji: '⛩️', lat: '35.6762°N', lng: '139.6503°E', coord: '35.6762° N, 139.6503° E', select: 'Tokyo, Japan'            },
    { name: 'SWITZERLAND', emoji: '🏔️', lat: '46.8182°N', lng: '8.2275°E',   coord: '46.8182° N, 8.2275° E',   select: 'Swiss Alps, Switzerland' },
    { name: 'RIO',         emoji: '🏖️', lat: '22.9068°S', lng: '43.1729°W',  coord: '22.9068° S, 43.1729° W',  select: 'Rio de Janeiro, Brazil'  },
    { name: 'CAIRO',       emoji: '🏛️', lat: '30.0444°N', lng: '31.2357°E',  coord: '30.0444° N, 31.2357° E',  select: 'Cairo, Egypt'            },
    { name: 'NEW YORK',    emoji: '🗽', lat: '40.7128°N', lng: '74.0060°W',  coord: '40.7128° N, 74.0060° W',  select: 'New York, USA'           },
    { name: 'SYDNEY',      emoji: '🦘', lat: '33.8688°S', lng: '151.2093°E', coord: '33.8688° S, 151.2093° E', select: 'Sydney, Australia'       },
    { name: 'DUBAI',       emoji: '🕌', lat: '25.2048°N', lng: '55.2708°E',  coord: '25.2048° N, 55.2708° E',  select: 'Dubai, UAE'              },
  ];

  var UNIT_PRICE   = 9999;
  var currentIndex = 0;
  var isSlamming   = false;

  var holoText      = document.getElementById('holoText');
  var watchLat      = document.getElementById('watchLat');
  var watchLng      = document.getElementById('watchLng');
  var coordDisplay  = document.getElementById('coordDisplay');
  var slamBtn       = document.getElementById('slamBtn');
  var omnitrixImg   = document.getElementById('omnitrixImg');
  var watchFace     = document.getElementById('watchFace');

  /* ── Watch Update ─────────────────────────── */
  function updateWatch(dest) {
    if (holoText)     holoText.textContent     = dest.emoji + ' ' + dest.name;
    if (watchLat)     watchLat.textContent     = dest.lat;
    if (watchLng)     watchLng.textContent     = dest.lng;
    if (coordDisplay) coordDisplay.textContent = dest.coord + ' · ' + dest.name;
  }

  updateWatch(destinations[0]);

  function cycleDestination() {
    if (isSlamming) return;
    currentIndex = (currentIndex + 1) % destinations.length;
    updateWatch(destinations[currentIndex]);
  }

  if (omnitrixImg) omnitrixImg.addEventListener('click', cycleDestination);
  if (watchFace)   watchFace.addEventListener('click', cycleDestination);

  /* ── SLAM Button ──────────────────────────── */
  if (slamBtn) {
    slamBtn.addEventListener('click', function () {
      if (isSlamming) return;
      isSlamming = true;
      if (omnitrixImg) omnitrixImg.classList.add('slammed');
      var flash = document.createElement('div');
      flash.className = 'teleport-flash';
      document.body.appendChild(flash);
      setTimeout(function () {
        if (omnitrixImg) omnitrixImg.classList.remove('slammed');
        flash.remove();
        currentIndex = (currentIndex + 1) % destinations.length;
        updateWatch(destinations[currentIndex]);
        isSlamming = false;
      }, 600);
    });
  }

  /* ── setDestination (called by card buttons) */
  window.setDestination = function (el) {
    var destName = el.getAttribute('data-dest');
    var idx = destinations.findIndex(function (d) { return d.name === destName; });
    if (idx >= 0) {
      currentIndex = idx;
      updateWatch(destinations[idx]);
      var sel = document.getElementById('destSelect');
      if (sel) sel.value = destinations[idx].select;
    }
  };

  /* ── Live Order Total ─────────────────────── */
  var qtyInput        = document.querySelector('input[name="quantity"]');
  var summarySubtotal = document.getElementById('summarySubtotal');
  var summaryTotal    = document.getElementById('summaryTotal');

  function updateTotal() {
    if (!qtyInput || !summarySubtotal || !summaryTotal) return;
    var qty   = Math.max(1, Math.min(10, parseInt(qtyInput.value) || 1));
    var total = qty * UNIT_PRICE;
    var fmt   = '$' + total.toLocaleString('en-US', { minimumFractionDigits: 2 });
    summarySubtotal.textContent = fmt;
    summaryTotal.textContent    = fmt;
  }

  if (qtyInput) {
    qtyInput.addEventListener('input', updateTotal);
    updateTotal();
  }

  /* ── Order Form — fetch() to XAMPP ───────── */
  var orderForm    = document.getElementById('orderForm');
  var orderSuccess = document.getElementById('orderSuccess');
  var submitBtn    = orderForm ? orderForm.querySelector('[type="submit"]') : null;

  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      e.preventDefault(); // always prevent default; we use fetch()

      /* Client-side validation first */
      if (!orderForm.checkValidity()) {
        orderForm.classList.add('was-validated');
        return;
      }
      orderForm.classList.add('was-validated');

      /* Disable button & show loading state */
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Transmitting…';
      }

      /* Collect form data */
      var formData = new FormData(orderForm);

      /* POST to XAMPP via fetch */
      fetch(ORDER_PHP_URL, {
        method: 'POST',
        body: formData
      })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.success) {
          /* ── SUCCESS ── */
          if (orderSuccess) {
            orderSuccess.innerHTML =
              '<i class="bi bi-check-circle-fill me-2"></i>' +
              '<strong>Order #' + String(data.order_id).padStart(6, '0') + ' confirmed!</strong> ' +
              'Hi ' + data.name + ', confirmation will be sent to ' + data.email + '. Total: $' + data.total;
            orderSuccess.classList.remove('d-none');
          }
          orderForm.classList.add('d-none');

          setTimeout(function () {
            var modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
            if (modal) modal.hide();
            setTimeout(function () {
              orderForm.reset();
              orderForm.classList.remove('was-validated', 'd-none');
              if (orderSuccess) orderSuccess.classList.add('d-none');
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-bag-check-fill me-2"></i>Place Order';
              }
              updateTotal();
            }, 400);
          }, 3500);

        } else {
          /* ── SERVER VALIDATION / DB ERROR ── */
          showFormErrors(data.errors || ['An unknown error occurred.']);
          resetSubmitBtn();
        }
      })
      .catch(function (err) {
        /* ── NETWORK / CONNECTION ERROR ── */
        showFormErrors([
          'Could not reach the server. Make sure XAMPP is running and ' +
          'the URL is: ' + ORDER_PHP_URL
        ]);
        resetSubmitBtn();
      });
    });
  }

  function showFormErrors(errorsArray) {
    /* Show errors inside the modal above the form */
    var existing = document.getElementById('fetchErrorBox');
    if (existing) existing.remove();

    var box = document.createElement('div');
    box.id = 'fetchErrorBox';
    box.className = 'alert alert-danger mb-3';
    box.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i><strong>Order failed:</strong><ul class="mb-0 mt-1">' +
      errorsArray.map(function (e) { return '<li>' + e + '</li>'; }).join('') +
      '</ul>';

    if (orderForm) orderForm.parentNode.insertBefore(box, orderForm);
  }

  function resetSubmitBtn() {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-bag-check-fill me-2"></i>Place Order';
    }
  }

  /* ── Navbar Scroll Effect ─────────────────── */
  var navbar = document.getElementById('mainNav');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.style.backgroundColor = window.scrollY > 50
        ? 'rgba(7, 15, 9, 0.98)'
        : 'rgba(7, 15, 9, 0.9)';
    });
  }

  /* ── Close Mobile Nav on Link Click ──────── */
  document.querySelectorAll('.navbar-nav .nav-link[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function () {
      var collapse = document.querySelector('.navbar-collapse');
      if (collapse && collapse.classList.contains('show')) {
        bootstrap.Collapse.getInstance(collapse)?.hide();
      }
    });
  });

});
