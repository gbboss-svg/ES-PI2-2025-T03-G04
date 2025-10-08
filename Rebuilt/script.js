document.addEventListener("DOMContentLoaded", () => {
  const mockDisciplines = [
    {
      id: "1",
      course: "Engenharia de Software",
      name: "Programação Web",
      classNumber: "A1",
      institution: "Universidade Federal",
      gradient: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
    },
    {
      id: "2",
      course: "Ciência da Computação",
      name: "Banco de Dados",
      classNumber: "B2",
      institution: "Universidade Federal",
      gradient: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
    },
    {
      id: "3",
      course: "Sistemas de Informação",
      name: "Redes de Computadores",
      classNumber: "C3",
      institution: "Universidade Federal",
      gradient: "linear-gradient(135deg, #92400e 0%, #b45309 100%)",
    },
    {
      id: "4",
      course: "Engenharia de Software",
      name: "Inteligência Artificial",
      classNumber: "D4",
      institution: "Universidade Federal",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
    },
    {
      id: "5",
      course: "Ciência da Computação",
      name: "Estrutura de Dados",
      classNumber: "E5",
      institution: "Universidade Federal",
      gradient: "linear-gradient(135deg, #db2777 0%, #ec4899 100%)",
    },
    {
      id: "6",
      course: "Sistemas de Informação",
      name: "Segurança da Informação",
      classNumber: "F6",
      institution: "Universidade Federal",
      gradient: "linear-gradient(135deg, #0891b2 0%, #f59e0b 100%)",
    },
  ];

  const disciplinesGrid = document.getElementById("disciplines-grid");
  const deleteModalElement = document.getElementById("deleteModal");
  const deleteModal = new bootstrap.Modal(deleteModalElement);
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  let disciplineToDeleteId = null;

  function renderDisciplines() {
    disciplinesGrid.innerHTML = "";
    mockDisciplines.forEach((discipline) => {
      const card = `
        <div class="col-lg-4 col-md-6">
          <a href="#" class="card-discipline" style="background: ${discipline.gradient};">
            <div class="card-content">
              <h3 class="card-title">${discipline.name}</h3>
              <p class="card-text">${discipline.course} / ${discipline.classNumber}</p>
            </div>
            <div class="card-actions">
              <button class="btn btn-sm" onclick="event.preventDefault(); window.location.href='#';">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button class="btn btn-sm" data-id="${discipline.id}" onclick="event.preventDefault(); handleDelete('${discipline.id}')">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
          </a>
        </div>
      `;
      disciplinesGrid.innerHTML += card;
    });
  }

  window.handleDelete = (id) => {
    disciplineToDeleteId = id;
    deleteModal.show();
  };

  confirmDeleteBtn.addEventListener("click", () => {
    const index = mockDisciplines.findIndex((d) => d.id === disciplineToDeleteId);
    if (index !== -1) {
      mockDisciplines.splice(index, 1);
      renderDisciplines();
    }
    deleteModal.hide();
  });

  renderDisciplines();

  // Sidebar logic
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("main-content");
  const collapseBtn = document.getElementById("collapse-btn");
  const navLinks = document.querySelectorAll(".sidebar .nav-link");

  collapseBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("collapsed");

    const icon = collapseBtn.querySelector("i");
    const text = collapseBtn.querySelector("span");

    if (sidebar.classList.contains("collapsed")) {
      icon.classList.remove("bi-chevron-left");
      icon.classList.add("bi-chevron-right");
      text.textContent = "";
    } else {
      icon.classList.remove("bi-chevron-right");
      icon.classList.add("bi-chevron-left");
      text.textContent = "Recolher";
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // This is a simplified version. In a real app, you'd handle navigation.
      // For now, we just set the active class.
      e.preventDefault();

      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
});
