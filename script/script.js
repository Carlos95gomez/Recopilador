// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDBTxQ0NE6dlr8xnQu6ruvWCqIohMoalp8",
    authDomain: "recopilador-40494.firebaseapp.com",
    projectId: "recopilador-40494",
    storageBucket: "recopilador-40494.appspot.com",
    messagingSenderId: "446230847754",
    appId: "1:446230847754:web:b8b8af9dc251bf842d1af3",
    measurementId: "G-32YG14M155"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Función para obtener la lista de predios de Firebase
function getPredios(callback) {
    database.ref('predios').on('value', (snapshot) => {
        const predios = [];
        snapshot.forEach((childSnapshot) => {
            predios.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        callback(predios);
    });
}

// Función para mostrar los predios
function displayPredios() {
    getPredios((predios) => {
        const container = document.getElementById('prediosContainer');
        container.innerHTML = '';

        predios.forEach((predio) => {
            const predioDiv = document.createElement('div');
            predioDiv.className = 'card mb-3';
            predioDiv.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${predio.nombre}</h5>
                    <ul class="list-group list-group-flush mb-3">
                        <li class="list-group-item">Cultivo: ${predio.cultivo}</li>
                        <li class="list-group-item">Fecha: ${predio.fechaSiembra}</li>
                        <li class="list-group-item">Área: ${predio.area} hectáreas</li>
                    </ul>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${predio.id}">
                        Eliminar
                    </button>
                </div>
            `;
            container.appendChild(predioDiv);
        });

        // Agregar event listeners a los botones de eliminar
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                console.log('Eliminando predio con ID:', id);
                deletePredio(id);
            });
        });
    });
}

// Función para eliminar un predio
function deletePredio(id) {
    database.ref('predios/' + id).remove()
        .then(() => {
            console.log('Predio eliminado');
        })
        .catch((error) => {
            console.error('Error eliminando predio:', error);
        });
}

// Función para exportar datos
function exportarDatos() {
    getPredios((predios) => {
        const dataStr = JSON.stringify(predios, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.download = `predios_${new Date().toISOString().split('T')[0]}.json`;
        link.href = url;
        link.click();
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Event listener para el formulario
    document.getElementById('predioForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nombrePredio = document.getElementById('nombrePredio').value;
        const cultivo = document.getElementById('cultivo').value;
        const fechaSiembra = document.getElementById('fechaSiembra').value;
        const area = parseFloat(document.getElementById('area').value);

        if (!nombrePredio || !cultivo || !fechaSiembra || isNaN(area)) {
            console.error('Faltan datos o son inválidos');
            return;
        }

        const newPredioRef = database.ref('predios').push();
        
        const predio = {
            nombre: nombrePredio,
            cultivo: cultivo,
            fechaSiembra: fechaSiembra,
            area: area
        };
        
        newPredioRef.set(predio)
            .then(() => {
                console.log('Predio guardado correctamente');
            })
            .catch((error) => {
                console.error('Error guardando predio:', error);
            });

        this.reset();
    });

    // Event listener para el botón de exportar
    document.getElementById('exportButton').addEventListener('click', exportarDatos);

    // Mostrar predios al cargar la página
    displayPredios();
});