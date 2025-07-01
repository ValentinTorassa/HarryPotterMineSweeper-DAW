document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("formContact");
  
    var fields = {
      name: {
        input: document.getElementById("nameContact"),
        error: document.getElementById("errorNameContact"),
        validate: function (v) {
          return /^[a-zA-Z0-9 ]{3,}$/.test(v);
        },
        message: "Enter at least 3 valid characters."
      },
      email: {
        input: document.getElementById("emailContact"),
        error: document.getElementById("errorEmailContact"),
        validate: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Enter a valid email address."
      },
      message: {
        input: document.getElementById("messageContact"),
        error: document.getElementById("errorMessageContact"),
        validate: function (v) {
          return v.length >= 6;
        },
        message: "Message must be at least 6 characters."
      }
    };
  
    // Blur/focus for each field
    Object.values(fields).forEach(function (field) {
      field.input.addEventListener("blur", function () {
        if (!field.validate(field.input.value.trim())) {
          field.error.textContent = field.message;
        }
      });
      field.input.addEventListener("focus", function () {
        field.error.textContent = "";
      });
    });
  
    // Submit
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errors = [];
      Object.values(fields).forEach(function (field) {
        var value = field.input.value.trim();
        if (!field.validate(value)) {
          field.error.textContent = field.message;
          errors.push(field.message);
        }
      });
  
      if (errors.length === 0) {
        showModal("Thank you! Your email app will open to send the message.");
        var name = fields.name.input.value.trim();
        var email = fields.email.input.value.trim();
        var message = fields.message.input.value.trim();
        var mailto = "mailto:agustinadylll@gmail.com"
          + "?subject=" + encodeURIComponent("Minesweeper Contact")
          + "&body=" + encodeURIComponent(
            "Name: " + name + "\n"
            + "Email: " + email + "\n"
            + "Message:\n" + message
          );

          // Después de validar todo y antes del mailto
          localStorage.setItem('playerData', JSON.stringify({ 
            name: fields.name.input.value.trim(), 
            house: document.getElementById('houseContact').value
          }));

          setTimeout(function () {
            window.location.href = mailto;
            setTimeout(function () {
              window.location.href = 'index.html'; // o el nombre de tu archivo del buscaminas
            }, 500); // espera medio segundo para asegurarse que mailto se lance
          }, 1200);
          
      }
    });
  
    // Modal
    function showModal(msg) {
      var modal = document.getElementById("modalContact");
      var modalMessage = document.getElementById("modalMessage");
      modalMessage.textContent = msg;
      modal.classList.add("active");
    }
  
    document.getElementById("closeModalButton").addEventListener("click", function () {
      document.getElementById("modalContact").classList.remove("active");
    });
  });
  