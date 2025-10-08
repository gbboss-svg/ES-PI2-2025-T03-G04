document.addEventListener("DOMContentLoaded", () => {
  const mockDisciplines = [
    {
      id: "1",
      course: "Engenharia de Software",
      name: "Programação Web",
      classNumber: "A1",
    },
    {
      id: "2",
      course: "Ciência da Computação",
      name: "Banco de Dados",
      classNumber: "B2",
    },
    {
      id: "3",
      course: "Sistemas de Informação",
      name: "Redes de Computadores",
      classNumber: "C3",
    },
  ];

  const disciplinesList = document.getElementById("disciplines-list");

  function renderDisciplines() {
    disciplinesList.innerHTML = "";
    mockDisciplines.forEach((discipline) => {
      const item = `
        <div class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">${discipline.name}</h5>
            <p class="mb-1">${discipline.course} - Turma ${discipline.classNumber}</p>
          </div>
          <button class="btn btn-outline-primary btn-sm">
            <i class="bi bi-download me-2"></i>Exportar
          </button>
        </div>
      `;
      disciplinesList.innerHTML += item;
    });
  }

  renderDisciplines();
});
