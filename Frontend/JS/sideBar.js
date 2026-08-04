
const cerrarSesion = () => {
    const token = localStorage.getItem("token");
    localStorage.removeItem(token);
    localStorage.clear();
    window.location.href = "../Templates/login.html";
};

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");

    if (!sidebar) return;

    sidebar.innerHTML = `
        <button class="sidebar-toggle" id="sidebarToggle" type="button" aria-label="Abrir menú">
            ☰
        </button>

        <aside class="sidebar" aria-label="Menú lateral">
            <div class="sidebar-header">
                <div class="brand">
                    <div class="brand-icon">🦷</div>
                    <div>
                        <h2>Clínica Dental</h2>
                        <p>Panel administrativo</p>
                    </div>
                </div>
            </div>

            <nav class="sidebar-menu">
                <a class="nav-item active" href="../Templates/citas.html">
                    <span class="nav-icon">📅</span>
                    <span class="nav-label">Citas</span>
                </a>
                <a class="nav-item" href="../Templates/pacientes.html">
                    <span class="nav-icon">👥</span>
                    <span class="nav-label">Pacientes</span>
                </a>
                <a class="nav-item" href="../Templates/tratamientos.html">
                    <span class="nav-icon">🦷</span>
                    <span class="nav-label">Tratamientos</span>
                </a>
                <a class="nav-item" href="../Templates/usuarios.html">
                    <span class="nav-icon">👤</span>
                    <span class="nav-label">Usuarios</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <button id="btnCerrarSesion" type="button">
                    <span>🚪</span>
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    `;

    const toggleButton = document.getElementById("sidebarToggle");
    const sidebarPanel = document.querySelector("#sidebar .sidebar");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");

    if (toggleButton && sidebarPanel) {
        toggleButton.addEventListener("click", () => {
            sidebarPanel.classList.toggle("collapsed");
            document.body.classList.toggle("sidebar-collapsed");
            const isCollapsed = sidebarPanel.classList.contains("collapsed");
            toggleButton.setAttribute("aria-label", isCollapsed ? "Abrir menú" : "Cerrar menú");
        });
    }

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", cerrarSesion);
    }
});