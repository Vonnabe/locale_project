document.addEventListener('DOMContentLoaded', () => {

  const checkinDatetime = document.getElementById('checkin_datetime');
  const checkoutDatetime = document.getElementById('checkout_datetime');
  const bookingForm = document.getElementById('bookingForm');

  // Replace with your actual Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyynfeTIyi7pCbixscjquD717aw6ewRWiNnRTNRYimcf6vE3wF3uTl3HQW-GKN7yIU-/exec';

  const formatDatetimeLocal = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const now = new Date();
  if (checkinDatetime) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    checkinDatetime.min = formatDatetimeLocal(today);
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = bookingForm.querySelector('.btn-hero-submit');
      const fullname = document.getElementById('fullname').value.trim();
      const email = document.getElementById('email').value.trim();
      const checkinVal = checkinDatetime.value;
      const checkoutVal = checkoutDatetime.value;
      const category = document.getElementById('category').value;

      if (!fullname || !email || !checkinVal || !checkoutVal || !category) {
        alert('Please fill in all fields before submitting.');
        return;
      }

      const selectedCheckin = new Date(checkinVal);
      const selectedCheckout = new Date(checkoutVal);
      const currentTime = new Date();

      if (selectedCheckin < currentTime) {
        alert('Check-in date and time cannot be in the past.');
        return;
      }

      const minAllowedCheckin = new Date(currentTime.getTime() + 12 * 60 * 60 * 1000);
      if (selectedCheckin < minAllowedCheckin) {
        alert('Check-in must be scheduled at least 12 hours in advance from now.');
        return;
      }

      if (selectedCheckout <= selectedCheckin) {
        alert('Check-out date and time must be after the check-in date and time.');
        return;
      }

      // Prepare payload
      const formData = {
        fullname: fullname,
        email: email,
        checkin_datetime: checkinVal,
        checkout_datetime: checkoutVal,
        category: category
      };

      // Disable button during network request
      submitBtn.disabled = true;
      submitBtn.textContent = 'Booking...';

      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.result === 'success') {
          alert('Car booking request submitted successfully!');
          bookingForm.reset();
        } else {
          alert('There was an issue submitting your booking. Please try again.');
        }
      } catch (err) {
        console.error('Error submitting form:', err);
        alert('Failed to submit booking request. Please check your internet connection.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    });
  }

  // Info dropdown toggle logic
  const dropdowns = document.querySelectorAll('.info-dropdown');
  dropdowns.forEach((dropdown) => {
    const toggleBtn = dropdown.querySelector('.info-dropdown-toggle');
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdowns.forEach((other) => {
        if (other !== dropdown) other.classList.remove('active');
      });
      dropdown.classList.toggle('active');
    });
  });

  document.addEventListener('click', () => {
    dropdowns.forEach((d) => d.classList.remove('active'));
  });

});