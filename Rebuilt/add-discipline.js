document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-discipline-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const course = document.getElementById("course").value;
    const discipline = document.getElementById("discipline").value;
    const classNumber = document.getElementById("classNumber").value;

    if (course && discipline && classNumber) {
      // In a real application, you would send this data to a server.
      // Here, we'll just simulate success and redirect.
      alert("Disciplina criada com sucesso!");
      window.location.href = "index.html";
    }
  });
});
