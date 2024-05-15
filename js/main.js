const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const window_height = canvas.height;
const window_width = canvas.width;

canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, text) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.originalColor = color;
        this.text = text;
        this.speed = 3; // Velocidad constante de 3
        this.dx = (Math.random() - 0.5) * 2 * this.speed; // Dirección horizontal aleatoria (-1 o 1) multiplicada por la velocidad
        this.dy = -Math.random() * this.speed; // Dirección vertical hacia arriba con velocidad aleatoria
        this.visible = true;
    }

    draw() {
        if (!this.visible) return;

        ctx.beginPath();
        ctx.strokeStyle = this.color; // Establecer el color de la línea
        ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        ctx.stroke(); // Dibujar solo el borde del círculo

        // Dibujar el número en el centro del círculo
        ctx.fillStyle = "#000"; // Color negro para el número
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "20px Arial";
        ctx.fillText(this.text, this.posX, this.posY);

        ctx.closePath();
    }

    update(circles) {
        if (!this.visible) return;

        this.draw();

        this.posX += this.dx; // Mover en el eje X
        this.posY += this.dy; // Mover en el eje Y

        // Rebotar en los bordes laterales
        if (this.posX + this.radius >= window_width || this.posX - this.radius <= 0) {
            this.dx = -this.dx; // Invertir la dirección horizontal al chocar con los bordes laterales
        }

        // Rebotar con otros círculos y ajustar posición para evitar solapamiento
        for (let otherCircle of circles) {
            if (this !== otherCircle && otherCircle.visible) {
                let distance = getDistance(this.posX, otherCircle.posX, this.posY, otherCircle.posY);
                if (distance < this.radius + otherCircle.radius) {
                    let angle = Math.atan2(otherCircle.posY - this.posY, otherCircle.posX - this.posX);
                    let overlap = this.radius + otherCircle.radius - distance + 1;

                    // Calcular nuevos componentes de velocidad después del choque
                    let u1 = this.dx;
                    let v1 = this.dy;
                    let u2 = otherCircle.dx;
                    let v2 = otherCircle.dy;

                    // Intercambiar velocidades después del choque (rebote elástico)
                    this.dx = u2;
                    this.dy = v2;
                    otherCircle.dx = u1;
                    otherCircle.dy = v1;

                    // Mover los círculos para evitar solapamiento
                    this.posX -= overlap * Math.cos(angle);
                    this.posY -= overlap * Math.sin(angle);
                    otherCircle.posX += overlap * Math.cos(angle);
                    otherCircle.posY += overlap * Math.sin(angle);
                }
            }
        }

        // Desaparecer al llegar al borde superior
        if (this.posY - this.radius <= 0) {
            this.visible = false;
        }
    }

    containsPoint(x, y) {
        // Utilizar la fórmula del teorema de Pitágoras (distancia al cuadrado) para determinar si el punto (x, y) está dentro del círculo
        let dx = x - this.posX;
        let dy = y - this.posY;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }
}

function getDistance(x1, x2, y1, y2) {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;
    return Math.sqrt(xDistance ** 2 + yDistance ** 2);
}

let circles = [];

// Crear 20 círculos aleatorios comenzando desde abajo
for (let i = 0; i < 20; i++) {
    let radius = Math.random() * 50 + 20; // Radio entre 20 y 70
    let x = Math.random() * (window_width - radius * 2) + radius;
    let y = window_height + radius + i * 50; // Posición debajo de la pantalla, incrementando el espacio vertical
    let text = (i + 1).toString(); // Números del 1 al 20
    let color = "blue"; // Todos azules al inicio

    let circle = new Circle(x, y, radius, color, text);
    circles.push(circle);
}

canvas.addEventListener("click", (event) => {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    // Verificar si el clic está dentro de algún círculo visible
    for (let circle of circles) {
        if (circle.visible && circle.containsPoint(mouseX, mouseY)) {
            circle.visible = false; // Hacer que el círculo sea invisible al hacer clic sobre él
            console.log(`Clicked Circle ${circle.text} at (${circle.posX.toFixed(1)}, ${circle.posY.toFixed(1)})`);
            break; // Salir del bucle una vez que se ha encontrado el círculo clickeado
        }
    }
});

function updateCircles() {
    requestAnimationFrame(updateCircles);
    ctx.clearRect(0, 0, window_width, window_height);

    for (let circle of circles) {
        circle.update(circles);
    }
}

// Iniciar la animación
updateCircles();