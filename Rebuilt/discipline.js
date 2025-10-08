document.addEventListener("DOMContentLoaded", () => {
  // Mock data - in a real app, you'd fetch this based on the discipline ID
  const disciplineData = {
    course: "Engenharia de Software",
    name: "Programação Web",
    classNumber: "A1",
    students: [
      { id: "1", ra: "2021001", name: "João Silva", grades: { P1: 8.5, P2: 7.0, T1: 9.0 }, average: 8.17 },
      { id: "2", ra: "2021002", name: "Maria Santos", grades: { P1: 9.0, P2: 8.5, T1: 9.5 }, average: 9.0 },
      { id: "3", ra: "2021003", name: "Pedro Oliveira", grades: { P1: 7.0, P2: 6.5, T1: 7.5 }, average: 7.0 },
    ],
    columns: [
      { id: "1", name: "Prova 1", shortName: "P1" },
      { id: "2", name: "Prova 2", shortName: "P2" },
      { id: "3", name: "Trabalho 1", shortName: "T1" },
    ],
    logs: [
      {
        id: "1",
        timestamp: "15/01/2025 14:30:25",
        action: "grade_change",
        studentName: "João Silva",
        columnName: "P1",
        oldValue: 8.0,
        newValue: 8.5,
      },
    ],
  };

  // Update header and breadcrumb
  const header = document.querySelector("#main-content header h1");
  const breadcrumb = document.querySelector("#main-content .container h2");
  header.textContent = `VOCÊ ESTÁ NA TURMA ${disciplineData.classNumber}`;
  breadcrumb.textContent = `${disciplineData.course} > ${disciplineData.name} > ${disciplineData.classNumber}`;

  // Render grade table
  const gradeTableContainer = document.getElementById("grade-table-container");
  let tableHtml = `
    <table class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>RA</th>
          <th>Nome</th>
          ${disciplineData.columns.map((col) => `<th>${col.shortName}</th>`).join("")}
          <th>Média</th>
        </tr>
      </thead>
      <tbody>
        ${disciplineData.students
          .map(
            (student) => `
          <tr>
            <td>${student.ra}</td>
            <td>${student.name}</td>
            ${disciplineData.columns
              .map((col) => `<td>${student.grades[col.shortName] || ""}</td>`)
              .join("")}
            <td>${student.average.toFixed(2)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
  gradeTableContainer.innerHTML = `<h3>Alunos e Notas</h3>` + tableHtml;

  // Render grade log
  const gradeLogContainer = document.getElementById("grade-log-container");
  let logHtml = `
    <ul class="list-group">
      ${disciplineData.logs
        .map(
          (log) => `
        <li class="list-group-item">
          <strong>${log.timestamp}:</strong>
          ${log.studentName} - ${log.columnName} alterado de ${log.oldValue} para ${log.newValue}
        </li>
      `,
        )
        .join("")}
    </ul>
  `;
  gradeLogContainer.innerHTML = `<h3>Histórico de Alterações</h3>` + logHtml;
});
