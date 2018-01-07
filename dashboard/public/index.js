$(document).ready(function() {
    $("[data-toggle='tooltip']").tooltip();
    
    const theme = localStorage.getItem("theme");
    if (!theme) localStorage.setItem("theme", "dark");
    
    if (theme === "dark") {
      $("body").addClass("dark");
    } else {
      $("#theme").prop("checked", true);
      $(".navbar-dark").removeClass("navbar-dark").addClass("navbar-light");
    }
  });
  
  $("#theme").change(function() {
    var checked = $("#theme").is(":checked");
    localStorage.setItem("theme", checked ? "light" : "dark");
    
    if (checked) {
      $("body").removeClass("dark");
      $(".navbar-dark").removeClass("navbar-dark").addClass("navbar-light");
    } else {
      $("body").addClass("dark");
      $(".navbar-light").removeClass("navbar-light").addClass("navbar-dark");
    }
  });