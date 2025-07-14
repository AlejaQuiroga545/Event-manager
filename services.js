// SERVICIOS CRUD PARA GESTIÓN DE USUARIOS
// =======================================

const API_BASE_URL = "http://localhost:3000"

// Importación de SweetAlert2
const Swal = window.Swal

/**
 * Servicio para obtener todos los usuarios
 * @returns {Promise<Array>} Lista de usuarios
 */
export async function getAllUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/events`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching users:", error)
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load users",
      confirmButtonColor: "#667eea",
    })
    throw error
  }
}

/**
 * Servicio para obtener un usuario por ID
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export async function getUserById(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${userId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error)
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load event data",
      confirmButtonColor: "#667eea",
    })
    throw error
  }
}

/**
 * Servicio para crear un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Usuario creado
 */
export async function createUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const createdUser = await response.json()

    await Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Event created successfully",
      timer: 1500,
      showConfirmButton: false,
    })

    return createdUser
  } catch (error) {
    console.error("Error creating user:", error)
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to create event",
      confirmButtonColor: "#667eea",
    })
    throw error
  }
}


/**
 * Servicio para actualizar un usuario existente
 * @param {number} userId - ID del usuario
 * @param {Object} userData - Datos actualizados del usuario
 * @returns {Promise<Object>} Usuario actualizado
 */
export async function updateUser(userId, userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const updatedUser = await response.json()

    await Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Event updated successfully",
      timer: 1500,
      showConfirmButton: false,
    })

    return updatedUser
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error)
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to update event",
      confirmButtonColor: "#667eea",
    })
    throw error
  }
}

/**
 * Servicio para eliminar un usuario
 * @param {number} userId - ID del usuario a eliminar
 * @returns {Promise<boolean>} True si se eliminó correctamente
 */
export async function deleteUser(userId) {
  try {
    // Mostrar confirmación antes de eliminar
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#667eea",
      confirmButtonText: "Yes, delete it!",
    })

    if (!result.isConfirmed) {
      return false
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    await Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Event has been deleted successfully",
      timer: 1500,
      showConfirmButton: false,
    })

    return true
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error)
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to delete event",
      confirmButtonColor: "#667eea",
    })
    throw error
  }
}

/**
 * Servicio para inscribirse a evento
 * @param {number} userId - ID del usuario
 * @param {Object} userData - Datos actualizados del usuario
 * @returns {Promise<Object>} Usuario actualizado
 */
export async function inscribeEvent(userId, userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const updatedUser = await response.json()

    await Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Event updated successfully",
      timer: 1500,
      showConfirmButton: false,
    })

    return updatedUser
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error)
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to update event",
      confirmButtonColor: "#667eea",
    })
    throw error
  }
}

/**
 * Servicio para inicializar el sistema de IDs secuenciales
 * @returns {Promise<number>} Próximo ID disponible
 */
export async function initializeUserIds() {
  try {
    const users = await getAllUsers()

    if (users.length === 0) {
      return 0
    }

    // Encontrar el ID más alto y establecer el siguiente
    const maxId = Math.max(...users.map((user) => Number.parseInt(user.id) || 0))
    return maxId + 1
  } catch (error) {
    console.error("Error initializing user IDs:", error)
    return 0
  }
}

/**
 * Servicio para validar datos de usuario
 * @param {Object} userData - Datos del usuario a validar
 * @returns {Object} Resultado de la validación
 */
export function validateUserData(userData) {
  const errors = []

  // Validar nombre
  if (!userData.name || userData.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
