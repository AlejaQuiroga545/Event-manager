// Agregar las importaciones al inicio del archivo
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  enrollInEvent,
  initializeEventIds,
  validateEventData,
  getRegisteredUsers,
  registerUser,
} from "./services.js"

// SISTEMA DE AUTENTICACIÓN
// ========================

// Usuarios predefinidos (en un proyecto real, esto vendría de una base de datos)
const USERS = [
  { username: "admin", password: "admin123", role: "admin", name: "Administrator" },
  { username: "user", password: "user123", role: "user", name: "Regular User" },
]

let currentUser = null // Usuario actual
// Variable para almacenar el ID del usuario actual
// Se inicializa en null y se actualizará al iniciar sesión
// Se utilizará para identificar al usuario en las operaciones CRUD
let nextEventId = 0 // Variable para controlar el próximo ID del evento

// Importación de Swal
const Swal = window.Swal

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", async () => {
  await initializeEventIds() // Inicializar el sistema de IDs
  checkAuthStatus() // Verificar el estado de autenticación al cargar la página
  setupAuthForms() // Configurar el formulario de login y registro
  setupLogout() // Configurar el botón de logout
})

// Verificar estado de autenticación
function checkAuthStatus() {
  // Verificar si hay un usuario guardado en localStorage
  // Si hay un usuario guardado, mostrar la aplicación principal
  // Si no hay usuario guardado, mostrar la pantalla de login
  // Esto permite que el usuario permanezca autenticado incluso al recargar la página
  // Utiliza localStorage para guardar el usuario actual y así mantener la sesión activa entre recargas de página
  // Esto es útil para aplicaciones SPA donde el usuario no quiere volver a iniciar sesión cada vez que recarga la página
  const savedUser = localStorage.getItem("currentUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    showMainApp() // Mostrar la aplicación principal si hay un usuario autenticado
  } else {
    showLoginScreen() // Mostrar la pantalla de login si no hay usuario autenticado
  }
}

// Mostrar pantalla de login
function showLoginScreen() {
  document.getElementById("login-screen").style.display = "flex"
  document.getElementById("main-app").style.display = "none"
}

// Mostrar aplicación principal
function showMainApp() {
  document.getElementById("login-screen").style.display = "none"
  document.getElementById("main-app").style.display = "flex"
  updateUserInterface()
  navigate("/events") // Navegar a la página de eventos por defecto
}

// Configurar formularios de autenticación (login y registro)
function setupAuthForms() {
  const loginForm = document.getElementById("login-form")
  const registerForm = document.getElementById("register-form")
  const showRegisterLink = document.getElementById("show-register")
  const showLoginLink = document.getElementById("show-login")

  // Alternar entre formularios de login y registro
  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault()
    loginForm.style.display = "none"
    registerForm.style.display = "block"
  })

  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault()
    registerForm.style.display = "none"
    loginForm.style.display = "block"
  })

  // Manejar el envío del formulario de login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value

    // Validar credenciales contra usuarios predefinidos y usuarios registrados
    let user = USERS.find((u) => u.username === username && u.password === password)

    if (!user) {
      // Verificar usuarios registrados
      const registeredUsers = await getRegisteredUsers()
      user = registeredUsers.find((u) => u.username === username && u.password === password)
    }

    if (user) {
      currentUser = user
      localStorage.setItem("currentUser", JSON.stringify(user))

      await Swal.fire({
        icon: "success",
        title: "¡Inicio de sesión exitoso!",
        text: `Bienvenido ${user.name}`,
        timer: 1500,
        showConfirmButton: false,
      })

      showMainApp()
    } else {
      await Swal.fire({
        icon: "error",
        title: "Error de inicio de sesión",
        text: "Usuario o contraseña inválidos",
        confirmButtonColor: "#667eea",
      })
    }

    // Limpiar formulario
    loginForm.reset()
  })

  // Manejar el envío del formulario de registro
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = document.getElementById("reg-name").value
    const username = document.getElementById("reg-username").value
    const password = document.getElementById("reg-password").value

    // Verificar si el nombre de usuario ya existe
    const existingUser = USERS.find((u) => u.username === username)
    const registeredUsers = await getRegisteredUsers()
    const existingRegisteredUser = registeredUsers.find((u) => u.username === username)

    if (existingUser || existingRegisteredUser) {
      await Swal.fire({
        icon: "error",
        title: "Error de registro",
        text: "El nombre de usuario ya existe",
        confirmButtonColor: "#667eea",
      })
      return
    }

    // Registrar nuevo usuario
    const newUser = {
      name,
      username,
      password,
      role: "user", // Todos los usuarios registrados son usuarios regulares
      enrolledEvents: [], // Array para rastrear eventos inscritos
    }

    try {
      await registerUser(newUser)

      await Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "Ahora puedes iniciar sesión",
        timer: 1500,
        showConfirmButton: false,
      })

      // Volver al formulario de login
      registerForm.style.display = "none"
      loginForm.style.display = "block"
      registerForm.reset()
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error de registro",
        text: "No se pudo registrar el usuario",
        confirmButtonColor: "#667eea",
      })
    }
  })
}

// Configurar logout
function setupLogout() {
  document.getElementById("logout-btn").addEventListener("click", async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres cerrar sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#667eea",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      currentUser = null
      localStorage.removeItem("currentUser")

      await Swal.fire({
        icon: "success",
        title: "Sesión cerrada exitosamente",
        timer: 1000,
        showConfirmButton: false,
      })

      showLoginScreen()
    }
  })
}

// Actualizar interfaz según el usuario
function updateUserInterface() {
  if (!currentUser) return

  // Actualizar información del usuario
  document.getElementById("user-name").textContent = currentUser.name
  document.getElementById("user-role").textContent = currentUser.role.toUpperCase()
  document.getElementById("user-role").className = `role-badge ${currentUser.role}`

  // Controlar acceso según el rol
  const newEventLink = document.getElementById("new-event-link")
  const myEventsLink = document.getElementById("my-events-link")

  if (currentUser.role === "admin") {
    newEventLink.style.display = "flex"
    myEventsLink.style.display = "none" // Admins no necesitan "Mis Eventos"
  } else {
    newEventLink.style.display = "none"
    myEventsLink.style.display = "flex"
  }
}

// SECCIÓN DE RUTAS Y NAVEGACIÓN (SPA)
// ===================================

// Actualizar las rutas para que coincidan con los archivos HTML existentes
const routes = {
  "/": "./users.html", // Usar el archivo existente temporalmente
  "/events": "./users.html", // Reutilizar users.html como events.html
  "/new-event": "./newuser.html", // Reutilizar newuser.html como new-event.html
  "/my-events": "./my-events.html", // Crear este archivo
}

// Navegación
document.body.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault()

    // Verificar permisos para nueva creación de evento
    if (e.target.getAttribute("href") === "/new-event" && currentUser.role !== "admin") {
      Swal.fire({
        icon: "error",
        title: "Acceso Denegado",
        text: "No tienes permisos para acceder a esta función",
        confirmButtonColor: "#667eea",
      })
      return
    }

    navigate(e.target.getAttribute("href"))
  }
})

// En la función navigate, actualizar la lógica de inicialización
async function navigate(pathname) {
  // Actualizar navegación activa
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.classList.remove("active")
  })
  document.querySelector(`[href="${pathname}"]`)?.classList.add("active")

  const route = routes[pathname]
  const html = await fetch(route).then((res) => res.text())
  document.getElementById("content").innerHTML = html

  // Inicializar funcionalidad específica de la página
  if (pathname === "/events" || pathname === "/") {
    renderEvents()
  }

  if (pathname === "/new-event") {
    setupEventForm()
  }

  if (pathname === "/my-events") {
    renderMyEvents()
  }
}

// Manejar botones de retroceso/avance del navegador
window.addEventListener("popstate", () => navigate(location.pathname))

// OPERACIONES CRUD
// ================

// READ: Mostrar eventos
async function renderEvents() {
  try {
    const events = await getAllEvents()

    // Mostrar botón de agregar solo para admin
    const addBtn = document.getElementById("add-event-btn")
    if (currentUser.role === "admin") {
      addBtn.classList.remove("hidden")
      addBtn.addEventListener("click", () => navigate("/new-event"))
    }

    // Generar HTML de la tabla basado en el rol del usuario
    const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Capacidad</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${events
          .map(
            (event) => `
          <tr>
            <td>${event.name}</td>
            <td>${event.description}</td>
            <td>${event.capacity}</td>
            <td>${event.date}</td>
            <td>
              ${
                currentUser.role === "admin"
                  ? `
                <button data-id="${event.id}" class="btn-edit">Editar</button>
                <button data-id="${event.id}" class="btn-delete">Eliminar</button>
                `
                  : `
                <button data-id="${event.id}" class="btn-enroll" ${event.capacity <= 0 ? "disabled" : ""}>
                  ${event.capacity <= 0 ? "Sold Out" : "Enroll"}
                </button>
                `
              }
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    `

    document.getElementById("events-table-container").innerHTML = tableHTML

    // Configurar event listeners basados en el rol del usuario
    if (currentUser.role === "admin") {
      setupDeleteButtons()
      setupEditButtons()
    } else {
      setupEnrollButtons()
    }
  } catch (err) {
    console.error("Error getting events:", err)
  }
}

// Configurar botones de eliminar para admin
function setupDeleteButtons() {
  const deleteButtons = document.querySelectorAll(".btn-delete")
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const eventId = button.dataset.id

      try {
        const deleted = await deleteEvent(eventId)
        if (deleted) {
          renderEvents()
        }
      } catch (err) {
        console.error(`Error deleting event: ${err}`)
      }
    })
  })
}

// Configurar botones de editar para admin
function setupEditButtons() {
  const editButtons = document.querySelectorAll(".btn-edit")
  editButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const eventId = button.dataset.id

      try {
        const event = await getEventById(eventId)
        navigate("/new-event")
        setTimeout(() => setupEventForm(event), 100)
      } catch (err) {
        console.error(`Error fetching event to edit: ${err}`)
      }
    })
  })
}

// Configurar botones de inscripción para usuarios regulares
function setupEnrollButtons() {
  const enrollButtons = document.querySelectorAll(".btn-enroll")
  enrollButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const eventId = button.dataset.id

      try {
        const event = await getEventById(eventId)

        if (event.capacity <= 0) {
          await Swal.fire({
            icon: "warning",
            title: "Evento lleno",
            text: "No hay capacidad disponible para este evento",
            confirmButtonColor: "#667eea",
          })
          return
        }

        // Verificar si el usuario ya está inscrito
        const userEnrollments = getUserEnrollmentsFromStorage(currentUser.username)
        if (userEnrollments.includes(eventId)) {
          await Swal.fire({
            icon: "info",
            title: "Ya inscrito",
            text: "Ya estás inscrito en este evento",
            confirmButtonColor: "#667eea",
          })
          return
        }

        // Disminuir capacidad en 1
        const updatedEvent = {
          ...event,
          capacity: event.capacity - 1,
        }

        await enrollInEvent(eventId, updatedEvent)

        // Guardar inscripción del usuario en localStorage
        saveUserEnrollment(currentUser.username, eventId)

        await Swal.fire({
          icon: "success",
          title: "¡Inscrito!",
          text: `Te has inscrito exitosamente en ${event.name}`,
          timer: 1500,
          showConfirmButton: false,
        })

        renderEvents() // Actualizar la lista de eventos
      } catch (err) {
        console.error(`Error enrolling in event: ${err}`)
      }
    })
  })
}

// Función para guardar inscripción del usuario en localStorage
function saveUserEnrollment(username, eventId) {
  const enrollmentsKey = `enrollments_${username}`
  const enrollments = JSON.parse(localStorage.getItem(enrollmentsKey) || "[]")

  if (!enrollments.includes(eventId)) {
    enrollments.push(eventId)
    localStorage.setItem(enrollmentsKey, JSON.stringify(enrollments))
  }
}

// Función para obtener inscripciones del usuario desde localStorage
function getUserEnrollmentsFromStorage(username) {
  const enrollmentsKey = `enrollments_${username}`
  return JSON.parse(localStorage.getItem(enrollmentsKey) || "[]")
}

// Actualizar la función renderMyEvents() completamente:
async function renderMyEvents() {
  try {
    // Obtener inscripciones del usuario desde localStorage
    const userEnrollments = getUserEnrollmentsFromStorage(currentUser.username)
    const allEvents = await getAllEvents()

    // Filtrar eventos en los que el usuario está inscrito
    const enrolledEvents = allEvents.filter((event) => userEnrollments.includes(event.id))

    const contentHTML = `
    <div class="page-header">
      <h2>Mis Eventos</h2>
    </div>
    <div class="my-events-content">
      ${
        enrolledEvents.length > 0
          ? `
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Capacidad Restante</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${enrolledEvents
                .map(
                  (event) => `
                <tr>
                  <td>${event.name}</td>
                  <td>${event.description}</td>
                  <td>${event.date}</td>
                  <td>${event.capacity}</td>
                  <td><span class="status-enrolled">Inscrito</span></td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          `
          : '<div class="no-events">No estás inscrito en ningún evento</div>'
      }
    </div>
    
    <style>
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
      }

      .page-header h2 {
        color: #333;
        font-size: 28px;
      }

      .my-events-content {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }

      .status-enrolled {
        background: #4CAF50;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }

      .no-events {
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 40px;
        font-size: 18px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
      }

      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }

      th {
        background: #f8f9fa;
        font-weight: 600;
        color: #333;
      }

      tr:hover {
        background: #f8f9fa;
      }
    </style>
    `

    document.getElementById("content").innerHTML = contentHTML
  } catch (err) {
    console.error("Error getting user enrollments:", err)
    document.getElementById("content").innerHTML = `
      <div class="page-header">
        <h2>Mis Eventos</h2>
      </div>
      <div class="error-message">Error al cargar tus eventos inscritos</div>
    `
  }
}

// CREATE & UPDATE: Formulario de evento
async function setupEventForm(eventData = null) {
  const form = document.getElementById("event-form")
  const formTitle = document.getElementById("form-title")

  if (eventData) {
    formTitle.textContent = "Editar Evento"
    document.getElementById("event-id").value = eventData.id
    document.getElementById("name").value = eventData.name
    document.getElementById("description").value = eventData.description
    document.getElementById("capacity").value = eventData.capacity
    document.getElementById("date").value = eventData.date
  } else {
    formTitle.textContent = "Nuevo Evento"
    form.reset()
  }

  // Remover event listeners previos
  const newForm = form.cloneNode(true)
  form.parentNode.replaceChild(newForm, form)

  // Agregar nuevo event listener
  document.getElementById("event-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const eventId = document.getElementById("event-id").value
    const eventData = {
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      capacity: Number.parseInt(document.getElementById("capacity").value),
      date: document.getElementById("date").value,
    }

    // Validar datos
    const validation = validateEventData(eventData)
    if (!validation.isValid) {
      await Swal.fire({
        icon: "error",
        title: "Error de Validación",
        html: validation.errors.map((error) => `• ${error}`).join("<br>"),
        confirmButtonColor: "#667eea",
      })
      return
    }

    // Si es un nuevo evento, asignar ID secuencial
    if (!eventId) {
      eventData.id = nextEventId.toString()
    }

    try {
      if (eventId) {
        await updateEvent(eventId, eventData)
      } else {
        await createEvent(eventData)
        nextEventId++
      }

      navigate("/events")
    } catch (err) {
      console.log(`An error occurred: ${err}`)
    }
  })
}
