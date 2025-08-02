document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling para la navegación
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Efecto de las tarjetas al hacer scroll (simple, puedes usar librerías como AOS.js para algo más avanzado)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.about-card, .service-card, .portfolio-item').forEach(card => {
        card.style.opacity = 0; // Ocultar inicialmente
        card.style.transform = 'translateY(20px)'; // Bajar un poco
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });

    // Clases CSS para la animación (añadir a style.css si no las tienes)
    /*
    .fade-in-up {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    */

    // ----- Lógica del Chatbot (para integración directa con Rasa) -----
    // Si estás usando Voiceflow, este bloque de código no es necesario,
    // ya que Voiceflow maneja su propio widget JS.

    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChatBtn = document.querySelector('.chat-header-bot .close-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    // URL de tu servidor de Rasa. ¡IMPORTANTE! Cambia esto si lo despliegas.
    // Durante el desarrollo, 'http://localhost:5005' está bien.
    const RASA_API_URL = 'http://localhost:5005/webhooks/rest/webhook';

    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.toggle('visible');
        if (chatbotWindow.classList.contains('visible')) {
            // Envía un mensaje de bienvenida solo si no hay mensajes aún
            if (chatMessages.children.length === 0) {
                 appendMessage('bot', '¡Hola! Soy el asistente de Forge Reality. ¿En qué puedo ayudarte hoy?');
            }
            chatInput.focus(); // Enfocar el input al abrir
        }
    });

    closeChatBtn.addEventListener('click', () => {
        chatbotWindow.classList.remove('visible');
    });

    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        messageElement.innerText = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
    }

    async function sendMessage() {
        const userInput = chatInput.value.trim();
        if (userInput === '') return;

        appendMessage('user', userInput);
        chatInput.value = ''; // Limpiar input

        try {
            const response = await fetch(RASA_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sender: 'user', message: userInput })
            });

            const data = await response.json();
            if (data && data.length > 0) {
                data.forEach(msg => {
                    if (msg.text) {
                        appendMessage('bot', msg.text);
                    }
                    // Aquí puedes añadir lógica para manejar respuestas enriquecidas de Rasa
                    // por ejemplo, si Rasa envía 'msg.buttons', podrías renderizar botones en el chat.
                    // if (msg.buttons) {
                    //     msg.buttons.forEach(button => {
                    //         const btnElement = document.createElement('button');
                    //         btnElement.innerText = button.title;
                    //         btnElement.onclick = () => {
                    //             chatInput.value = button.payload;
                    //             sendMessage();
                    //         };
                    //         // Añadir clases y estilos a btnElement
                    //         chatMessages.appendChild(btnElement);
                    //     });
                    // }
                });
            } else {
                appendMessage('bot', 'Lo siento, no pude entenderte. ¿Podrías reformular tu pregunta?');
            }
        } catch (error) {
            console.error('Error al comunicarse con Rasa:', error);
            appendMessage('bot', 'Lo siento, el asistente no está disponible en este momento. Inténtalo más tarde.');
        }
    }

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});