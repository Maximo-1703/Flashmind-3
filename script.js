// 1. CONFIGURACIÓN DE FIREBASE (El "Pasaporte")
const firebaseConfig = {
  apiKey: "AIzaSyBtpuf3DRb8mRx_gx79qOYb6AX40aJvkkc",
  authDomain: "flashmind-8c964.firebaseapp.com",
  projectId: "flashmind-8c964",
  storageBucket: "flashmind-8c964.firebasestorage.app",
  messagingSenderId: "354760717460",
  appId: "1:354760717460:web:985452a2df91b989cfb081",
  measurementId: "G-CMX6GJH9R8"
};

// 2. INICIALIZACIÓN
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore(); // Base de datos lista para el de Ranking e IA

// 3. NAVEGACIÓN (Cambio entre Inicio e IA)
function showSection(id) {
    const home = document.getElementById('home-view');
    const ia = document.getElementById('ia-view');
    
    if (id === 'inicio' || id === 'home') {
        home.style.display = 'grid';
        ia.style.display = 'none';
    } else if (id === 'ia') {
        home.style.display = 'none';
        ia.style.display = 'flex';
    }
}

// 4. LÓGICA DEL MODAL (Cerrar con X o clic fuera)
function toggleModal(show) {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('authModal');
    if (event.target == modal) {
        toggleModal(false);
    }
}

// 5. MANEJO DE USUARIOS (Login y Registro Unificado)
function manejarAuth() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;

    if (!email || !pass) {
        alert("Por favor rellena todos los campos");
        return;
    }

    // Intentamos iniciar sesión
    auth.signInWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            alert("¡Bienvenido de nuevo!");
            toggleModal(false);
            actualizarPerfil(userCredential.user);
        })
        .catch((error) => {
            // Si el usuario no existe, lo creamos automáticamente
            if (error.code === 'auth/user-not-found') {
                auth.createUserWithEmailAndPassword(email, pass)
                    .then((userCredential) => {
                        alert("¡Cuenta creada y sesión iniciada!");
                        // Guardamos al usuario en la base de datos para el de RANKING
                        db.collection("usuarios").doc(userCredential.user.uid).set({
                            correo: email,
                            puntos: 0,
                            fecha_registro: new Date()
                        });
                        toggleModal(false);
                    })
                    .catch(err => alert("Error al crear cuenta: " + err.message));
            } else {
                alert("Error: " + error.message);
            }
        });
}

// Actualizar el círculo de perfil con la letra del usuario
function actualizarPerfil(user) {
    const profileBox = document.querySelector('.profile-circle');
    if (profileBox) {
        profileBox.innerText = user.email.charAt(0).toUpperCase();
    }
}

// Esta función es la que tus botones están buscando
function handleNavClick(event, sectionId, groupId) {
    // 1. Cambia la sección visual
    showSection(sectionId);
    
    // 2. Lógica para abrir/cerrar subgrupos (opcional)
    const subgroup = document.getElementById(groupId);
    if (subgroup) {
        const isVisible = subgroup.style.display === 'flex';
        subgroup.style.display = isVisible ? 'none' : 'flex';
    }
}

// También añade esta por si acaso, ya que la imagen muestra que la usas en el logo
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('expanded');
    }
}

// 6. ESCUCHADOR DE ESTADO (Mantiene la sesión activa)
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("Usuario conectado:", user.email);
        actualizarPerfil(user);
        // Aquí el de NOTIFICACIONES puede activar sus permisos
    } else {
        console.log("No hay usuario");
    }
});