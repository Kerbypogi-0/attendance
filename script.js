document.addEventListener("DOMContentLoaded", () => {
    const addClassButton = document.getElementById("addClassButton");
    const removeClassButton = document.getElementById("removeClassButton");
    const classList = document.getElementById("classList");
    const classNameInput = document.getElementById("className");
   
    const studentNameInput = document.getElementById("studentName");
    const addStudentButton = document.getElementById("addStudentButton");
    const selectedClassName = document.getElementById("selectedClassName");
    const attendanceTableBody = document.querySelector("#attendanceTable tbody");
    const summaryTableBody = document.querySelector("#summaryTable tbody");

    
    // Get elements
const searchIcon = document.getElementById('searchIcon');
const loadingIcon = document.getElementById('loadingIcon');
const searchInput = document.getElementById('searchInput');
const searchContainer = document.querySelector('.search-container');

// Event listener for the search icon
searchIcon.addEventListener('click', function(event) {
    // Hide the search icon and show the loading icon
    searchIcon.style.display = 'none';
    loadingIcon.style.display = 'inline-block';

    // Show the input field and focus on it
    searchInput.style.display = 'inline-block';
    searchInput.focus();

    // Stop propagation to prevent triggering the outside click event
    event.stopPropagation();
});

// Hide the input field and change back to the search icon when clicking outside
document.addEventListener('click', function(event) {
    if (!searchContainer.contains(event.target)) {
        // Hide the input field
        searchInput.style.display = 'none';
        
        // Hide the loading icon and show the search icon
        loadingIcon.style.display = 'none';
        searchIcon.style.display = 'inline-block';
    }
});

// Prevent input field clicks from triggering the outside click event
searchInput.addEventListener('click', function(event) {
    event.stopPropagation();
});

    let classes = JSON.parse(localStorage.getItem("classes")) || {};
    let currentClass = null;

    function saveData() {
        localStorage.setItem("classes", JSON.stringify(classes));
    }

    function loadData() {
        const savedData = localStorage.getItem("classes");
        if (savedData) {
            classes = JSON.parse(savedData);
        }
    }

    function loadClassList() {
        classList.innerHTML = '';
        Object.keys(classes).forEach(className => {
            const classItem = document.createElement("div");
            classItem.classList.add("class-item");
            classItem.textContent = className;
            classItem.addEventListener("click", () => {
                currentClass = className;
                displayClass(className);
            });
            classList.appendChild(classItem);
        });
    }

    function displayClass(className) {
        selectedClassName.textContent = className;
        attendanceTableBody.innerHTML = "";

        if (classes[className] && classes[className].students) {
            classes[className].students.forEach((student, index) => {
                const row = document.createElement("tr");
                const nameCell = document.createElement("td");

                const studentName = document.createElement("span");
                studentName.textContent = student.name;
                const acronym = document.createElement("span");
                acronym.classList.add("acronym");

                switch (student.status) {
                    case "Present":
                        acronym.textContent = "P";
                        acronym.classList.add("present");
                        break;
                    case "Absent":
                        acronym.textContent = "A";
                        acronym.classList.add("absent");
                        break;
                    case "Late":
                        acronym.textContent = "L";
                        acronym.classList.add("late");
                        break;
                    case "Excused":
                        acronym.textContent = "E";
                        acronym.classList.add("excused");
                        break;
                    default:
                        acronym.textContent = "-";
                        break;
                }

                studentName.appendChild(acronym);
                nameCell.appendChild(studentName);

                const attendanceCell = document.createElement("td");
                ["Present", "Absent", "Late", "Excused"].forEach(status => {
                    const statusButton = document.createElement("button");
                    statusButton.textContent = status;
                    statusButton.classList.add("attendance-btn");

                    if (student.status === status) {
                        statusButton.classList.add("active");
                    }

                    statusButton.addEventListener("click", () => {
                        student.status = status;
                        displayClass(currentClass);
                        updateSummaryTable();
                        saveData();
                    });

                    attendanceCell.appendChild(statusButton);
                });

                // Add Remove button to delete the student
                const removeButtonCell = document.createElement("td");
                const removeButton = document.createElement("button");
                removeButton.textContent = "Remove";
                removeButton.classList.add("remove-btn");
                removeButton.addEventListener("click", () => {
                    classes[currentClass].students.splice(index, 1);
                    saveData();
                    displayClass(currentClass); // Refresh class display after removal
                });

                removeButtonCell.appendChild(removeButton);
                row.appendChild(nameCell);
                row.appendChild(attendanceCell);
                row.appendChild(removeButtonCell); // Add the remove button to the row
                attendanceTableBody.appendChild(row);
            });
        }
        updateSummaryTable();
    }

    function updateSummaryTable() {
        summaryTableBody.innerHTML = "";
        if (currentClass && classes[currentClass]) {
            classes[currentClass].students.forEach(student => {
                const row = document.createElement("tr");
                const nameCell = document.createElement("td");
                nameCell.textContent = student.name;

                const totalAbsences = student.status === "Absent" ? 1 : 0;
                const totalLate = student.status === "Late" ? 1 : 0;
                const totalExcused = student.status === "Excused" ? 1 : 0;

                const absencesCell = document.createElement("td");
                absencesCell.textContent = totalAbsences;

                const lateCell = document.createElement("td");
                lateCell.textContent = totalLate;

                const excusedCell = document.createElement("td");
                excusedCell.textContent = totalExcused;

                row.appendChild(nameCell);
                row.appendChild(absencesCell);
                row.appendChild(lateCell);
                row.appendChild(excusedCell);

                summaryTableBody.appendChild(row);
            });
        }
    }

    addClassButton.addEventListener("click", () => {
        const className = classNameInput.value.trim();
        if (className && !classes[className]) {
            classes[className] = { students: [] };
            saveData();
            loadClassList();
            classNameInput.value = "";
            displayClass(className);
        }
    });

    removeClassButton.addEventListener("click", () => {
        if (currentClass && classes[currentClass]) {
            delete classes[currentClass];
            saveData();
            loadClassList();
            currentClass = null;
            selectedClassName.textContent = "";
        }
    });

    addStudentButton.addEventListener("click", () => {
        const studentName = studentNameInput.value.trim();
        if (studentName && currentClass) {
            classes[currentClass].students.push({ name: studentName, status: "" });

            // Sort students by last name (split name and compare the last part)
            classes[currentClass].students.sort((a, b) => {
                const lastNameA = a.name.split(" ").pop().toLowerCase();
                const lastNameB = b.name.split(" ").pop().toLowerCase();
                return lastNameA.localeCompare(lastNameB);
            });

            saveData();
            displayClass(currentClass);
            studentNameInput.value = "";
        }
    });

    searchInput.addEventListener("input", (event) => {
        const query = event.target.value.toLowerCase();
        const classItems = document.querySelectorAll(".class-item");

        classItems.forEach(item => {
            const className = item.textContent.toLowerCase();
            item.style.display = className.includes(query) ? "block" : "none";
        });
    });

    loadData();
    loadClassList();
});

document.addEventListener("DOMContentLoaded", () => {
    const attendanceSummary = JSON.parse(localStorage.getItem("attendanceSummary")) || {};

    function resetDailyAttendance() {
        const today = new Date().toLocaleDateString();

        if (attendanceSummary[today]) return;

        attendanceSummary[today] = {};

        Object.keys(classes).forEach(className => {
            classes[className].students.forEach(student => {
                student.status = "";
                if (!attendanceSummary[today][className]) attendanceSummary[today][className] = [];
                attendanceSummary[today][className].push({
                    name: student.name,
                    status: student.status
                });
            });
        });

        saveData();
        localStorage.setItem("attendanceSummary", JSON.stringify(attendanceSummary));
    }

    function autoResetStatusAfterMarking(student) {
        setTimeout(() => {
            student.status = "";
            saveData();
            displayClass(currentClass);
        }, 1 * 60 * 1000);
    }

    resetDailyAttendance();
    setInterval(resetDailyAttendance, 15 * 10 * 10 * 1000);

    function saveData() {
        localStorage.setItem("classes", JSON.stringify(classes));
        localStorage.setItem("attendanceSummary", JSON.stringify(attendanceSummary));
    }
});

// Throttle function to limit the number of times a function can be called
function throttle(func, wait) {
    let isThrottled = false;
    return function(...args) {
      if (!isThrottled) {
        func(...args);
        isThrottled = true;
        setTimeout(() => isThrottled = false, wait);
      }
    };
  }
  
  // Function to check if user is at the bottom of the page
  function checkScrollPosition() {
    const documentHeight = document.documentElement.scrollHeight; // Full page height
    const viewportHeight = window.innerHeight;                     // Viewport height
    const scrollPosition = window.scrollY;                         // Current scroll position
  
    // If the user has scrolled to the bottom of the page
    if (scrollPosition + viewportHeight >= documentHeight) {
      footer.style.display = 'block';  // Show the footer when at the bottom
    } else {
      footer.style.display = 'none';   // Hide the footer when not at the bottom
    }
  }
  
  // Listen for the scroll event with throttling
  window.addEventListener('scroll', throttle(checkScrollPosition, 200));  // Runs at most once every 200ms
  
