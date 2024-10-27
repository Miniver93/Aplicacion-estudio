const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const $questionsAndAnswers = $("#questions-and-answers");
const $questionForm = $("#questions-form");
const $inputQuestion = $("#dynamic-question");
const $inputAnswer = $("#dynamic-answer");
const $answerForm = $("#answers-form");
const $resetButton = $("#reset-button");
const $loadButton = $("#load-button");
const $saveButton = $("#save-button");


const storageKey = "questionsAndAnswers";

// Cargar las preguntas y respuestas del localStorage al cargar la página
window.onload = function () {
    $inputQuestion.focus();
    const storedData = JSON.parse(localStorage.getItem(storageKey));

    if (storedData) {
        storedData.forEach((item) => {
            // Crear y añadir la pregunta
            const $questionElement = document.createElement("h3");
            $questionElement.classList.add("question");
            $questionElement.textContent = item.question;
            $questionsAndAnswers.appendChild($questionElement);

            // Crear y añadir las respuestas con asteriscos
            (item.answers || []).forEach((answer) => {
                const asterisks = "*".repeat(answer.length);
                const $answerElement = document.createElement("h3");
                $answerElement.classList.add("answer");
                $answerElement.textContent = asterisks;

                // Mostrar la respuesta en hover, accediendo a localStorage directamente
                $answerElement.addEventListener("mouseover", () => {
                    const updatedData = JSON.parse(localStorage.getItem(storageKey)) || [];
                    const questionIndex = Array.from($questionsAndAnswers.children)
                        .filter(el => el.classList.contains("question"))
                        .indexOf($questionElement);

                    const answerIndex = (item.answers || []).indexOf(answer);

                    if (updatedData[questionIndex] && updatedData[questionIndex].answers) {
                        $answerElement.textContent = updatedData[questionIndex].answers[answerIndex];
                    }
                });
                $answerElement.addEventListener("mouseout", () => {
                    const updatedData = JSON.parse(localStorage.getItem(storageKey)) || [];
                    const questionIndex = Array.from($questionsAndAnswers.children)
                        .filter(el => el.classList.contains("question"))
                        .indexOf($questionElement);

                    const answerIndex = (item.answers || []).indexOf(answer);

                    if (updatedData[questionIndex] && updatedData[questionIndex].answers) {
                        const asterisks = "*".repeat(updatedData[questionIndex].answers[answerIndex].length);
                        $answerElement.textContent = asterisks;
                    }
                });

                $questionsAndAnswers.appendChild($answerElement);
            });
        });
    }
};


$questionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const question = $questionForm.question.value;

    // Guardar la nueva pregunta
    if (question) {
        const storedData = JSON.parse(localStorage.getItem(storageKey)) || [];
        storedData.push({ question, answer: "" });
        localStorage.setItem(storageKey, JSON.stringify(storedData));

        const $questionElement = document.createElement("h3");
        $questionElement.classList.add("question");
        $questionElement.textContent = question;
        $questionsAndAnswers.appendChild($questionElement);

        $questionForm.reset();
        $inputAnswer.focus();
    }
});

$answerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const answer = $answerForm.answer.value;


    // Guardar la respuesta
    // Cambia la manera en que se almacenan las respuestas.
    if (answer) {
        const storedData = JSON.parse(localStorage.getItem(storageKey)) || [];
        const lastQuestionIndex = storedData.length - 1;

        if (lastQuestionIndex >= 0) {
            // Si ya hay respuestas, añade la nueva al array de respuestas
            if (!storedData[lastQuestionIndex].answers) {
                storedData[lastQuestionIndex].answers = []; // Inicializa el array si no existe
            }
            storedData[lastQuestionIndex].answers.push(answer); // Añade la nueva respuesta
            localStorage.setItem(storageKey, JSON.stringify(storedData));
        }

        // Crear un elemento para la respuesta con asteriscos
        const asterisks = "*".repeat(answer.length);
        const $answerElement = document.createElement("h3");
        $answerElement.classList.add("answer");
        $answerElement.textContent = asterisks;

        // Mostrar la respuesta en hover
        $answerElement.addEventListener("mouseover", () => {
            $answerElement.textContent = answer; // Muestra la respuesta
        });

        $answerElement.addEventListener("mouseout", () => {
            $answerElement.textContent = asterisks; // Vuelve a los asteriscos
        });

        $questionsAndAnswers.appendChild($answerElement);
        $answerForm.reset();
    }
});

$resetButton.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
});

$saveButton.addEventListener("click", () => {
    const storedData = JSON.parse(localStorage.getItem(storageKey)) || [];
    const jsonData = JSON.stringify(storedData);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    link.click();
    URL.revokeObjectURL(url);
});

$loadButton.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const jsonData = JSON.parse(e.target.result);
            localStorage.setItem(storageKey, JSON.stringify(jsonData));
            location.reload();
        };
        reader.readAsText(file);
    };
    input.click();
});

document.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); // Evitar el comportamiento por defecto de Enter en formularios

        const questionValue = $inputQuestion.value.trim(); // Obtener el valor del input de pregunta
        const answerValue = $inputAnswer.value.trim(); // Obtener el valor del input de respuesta

        // Comprobar si ambos inputs tienen contenido
        if (questionValue && answerValue) {
            // Enviar ambos formularios
            $questionForm.dispatchEvent(new Event("submit"));
            $answerForm.dispatchEvent(new Event("submit"));
        } else if (questionValue) {
            // Si solo hay contenido en la pregunta
            $questionForm.dispatchEvent(new Event("submit"));
            $inputAnswer.focus(); // Enfocar el input de respuesta
        } else if (answerValue) {
            // Si solo hay contenido en la respuesta
            $answerForm.dispatchEvent(new Event("submit"));
        }
    }
});
// Delegación de eventos en el contenedor principal
// Delegación de eventos en el contenedor principal
$questionsAndAnswers.addEventListener("click", (e) => {
    // Verifica si el clic es en un elemento h3
    if (e.target.tagName === "H3") {
        const questionText = e.target.textContent;
        const clickedPosition = e.offsetX;

        // Crear el input para edición
        const $input = document.createElement("input");
        $input.type = "text";
        $input.value = questionText;

        // Ajusta el estilo del input para igualarlo al h3
        $input.style.width = `${e.target.clientWidth}px`;
        $input.style.height = `${e.target.clientHeight}px`;
        $input.style.fontSize = getComputedStyle(e.target).fontSize;
        $input.style.lineHeight = getComputedStyle(e.target).lineHeight;
        $input.style.padding = getComputedStyle(e.target).padding;
        $input.style.margin = getComputedStyle(e.target).margin;
        $input.style.border = "none";
        $input.style.borderBottom = "1px solid #333";
        $input.style.outline = "none";
        $input.style.backgroundColor = "transparent";
        $input.style.color = "inherit";
        $input.style.display = "inline-block";

        if (e.target.classList.contains("answer")) {
            $input.style.fontWeight = "lighter";
        }

        // Reemplaza el h3 con el input
        e.target.replaceWith($input);
        $input.focus();

        // Calcular la posición del cursor
        const charWidth = 8;  // Ancho promedio de cada carácter
        const charIndex = Math.floor(clickedPosition / charWidth); // Índice aproximado del carácter clicado

        // Posicionar el cursor en el índice calculado
        setTimeout(() => {
            $input.setSelectionRange(charIndex, charIndex);
        }, 0);

        // Guardar al perder el foco
        // Guardar al perder el foco
        // Guardar al perder el foco
        $input.addEventListener("blur", () => {
            const editedText = $input.value;
            e.target.textContent = editedText; // Actualizar el h3 con el nuevo valor
            $input.replaceWith(e.target); // Volver a mostrar el h3 inmediatamente

            const storedData = JSON.parse(localStorage.getItem(storageKey)) || [];

            if (e.target.classList.contains("question")) {
                const questionIndex = Array.from($questionsAndAnswers.children)
                    .filter(el => el.classList.contains("question"))
                    .indexOf(e.target);

                if (storedData[questionIndex]) {
                    storedData[questionIndex].question = editedText;
                }
            } else if (e.target.classList.contains("answer")) {
                const answersList = Array.from($questionsAndAnswers.children)
                    .filter(el => el.classList.contains("answer"));

                const answerIndex = answersList.indexOf(e.target);

                let questionIndex = -1;
                for (let i = answerIndex; i >= 0; i--) {
                    if (answersList[i].previousElementSibling && answersList[i].previousElementSibling.classList.contains("question")) {
                        questionIndex++;
                    }
                }

                if (storedData[questionIndex] && storedData[questionIndex].answers) {
                    storedData[questionIndex].answers[answerIndex - questionIndex] = editedText;
                }
            }

            localStorage.setItem(storageKey, JSON.stringify(storedData));
        });

        // Guardar y salir con Enter
        $input.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                $input.blur();  // Forzar el guardado y la salida del input
            }
        });
    }
});


// Función para sincronizar el ancho del input con el contenido
window.syncInputWidth = function (input, helperId) {
    const initialWidth = 145; // Ancho inicial del input
    const helper = document.getElementById(helperId);
    helper.textContent = input.value || " "; // Actualiza el contenido del helper

    // Calcular el nuevo ancho basándose en el ancho del helper
    const newWidth = Math.max(initialWidth, helper.offsetWidth); // Aumenta el ancho mínimo a 20px
    input.style.width = newWidth + "px"; // Establece el nuevo ancho al input
};


