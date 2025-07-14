# Event Manager 

A modern Single Page Application (SPA) for managing events with authentication and role-based access control.

## Features

- 🔐 **Authentication System** with role-based access (Admin/User)
- 👥 **Complete CRUD Operations** for student management
- 🆔 **Sequential ID System** starting from 0
- 🎨 **Modern UI** with responsive design
- 🚨 **SweetAlert2 Integration** for user feedback
- 📊 **Data Validation** and error handling

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tool**: Vite
- **Backend**: JSON Server (Mock API)
- **UI Library**: SweetAlert2
- **Architecture**: SPA with modular services

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start both the JSON server and Vite dev server:
```bash
npm start
```

Start JSON server (port 3000)
```bash
npm run server
```

Start Vite dev server (port 5173)
```bash
npm run dev
```

## 🚀 Uso

### Credenciales Predefinidas

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`
- Acceso: Gestión completa de eventos

**Usuario Regular:**
- Usuario: `user`
- Contraseña: `user123`
- Acceso: Inscripción a eventos

### Registro de Nuevos Usuarios

1. En la pantalla de login, haz clic en "Regístrate aquí"
2. Completa el formulario con nombre, usuario y contraseña
3. Los nuevos usuarios tendrán rol de "user" automáticamente

### Flujo de Trabajo

#### Para Administradores:
1. Iniciar sesión con credenciales de admin
2. Navegar a "Eventos" para ver la lista
3. Usar "AGREGAR NUEVO EVENTO" para crear eventos
4. Editar o eliminar eventos existentes

#### Para Usuarios:
1. Iniciar sesión o registrarse
2. Ver eventos disponibles en "Eventos"
3. Hacer clic en "Enroll" para inscribirse
4. Ver eventos inscritos en "Mis Eventos"

## 📁 Estructura del Proyecto

```
event-manager/
├── index.html              # Página principal con login y app
├── script.js               # Lógica principal de la aplicación
├── services.js             # Servicios CRUD y API calls
├── style.css               # Estilos principales
├── db.json                 # Base de datos JSON Server
├── users.html              # Template para lista de eventos
├── newuser.html            # Template para formulario de eventos
├── my-events.html          # Template para eventos inscritos
├── package.json            # Dependencias y scripts
├── vite.config.js          # Configuración de Vite
└── README.md               # Documentación
```
---
## 🔌 API Endpoints

### Eventos
- `GET /events` - Obtener todos los eventos
- `GET /events/:id` - Obtener evento por ID
- `POST /events` - Crear nuevo evento
- `PUT /events/:id` - Actualizar evento
- `DELETE /events/:id` - Eliminar evento

### Usuarios
- `GET /users` - Obtener usuarios registrados
- `POST /users` - Registrar nuevo usuario

- ## 🎯 Funcionalidades por Rol

| Funcionalidad | Admin | Usuario |
|---------------|-------|---------|
| Ver eventos | ✅ | ✅ |
| Crear eventos | ✅ | ❌ |
| Editar eventos | ✅ | ❌ |
| Eliminar eventos | ✅ | ❌ |
| Inscribirse a eventos | ❌ | ✅ |
| Ver mis inscripciones | ❌ | ✅ |
| Registrar nuevos usuarios | ✅ | ✅ |
