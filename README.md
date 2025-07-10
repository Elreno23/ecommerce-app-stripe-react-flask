# 🛒 Ecommerce App con Stripe, React y Flask

Aplicación web fullstack que permite gestionar usuarios, productos y órdenes de compra con autenticación segura y pagos integrados vía Stripe. El proyecto combina tecnologías modernas para crear una experiencia robusta de tienda online.

---

## 🚀 Tecnologías utilizadas

- **Frontend:** React, Stripe.js, Context API
- **Backend:** Flask, SQLAlchemy, JWT, bcrypt
- **Base de datos:** PostgreSQL
- **Otros:** Webpack, Gitpod, Codespaces

---

## 💳 Funcionalidades principales

- Registro e inicio de sesión con autenticación JWT
- Hasheo de contraseñas con `bcrypt` para mayor seguridad
- Visualización de productos y carrito de compras básico
- Creación de órdenes protegidas por token
- Checkout con Stripe integrado y funcional
- CRUD de órdenes y detalles de compra

---

## 📂 Estructura del proyecto

├── src/ │ ├── api/ # Backend con Flask │ ├── front/ # Frontend con React │ ├── store/ # Estado global de la app ├── .env.example # Variables de entorno (sin datos sensibles) ├── README.md # Este archivo


---

## 📸 Demo

Este proyecto está listo para deploy en plataformas como Render o Vercel.  
*Próximamente: link al demo online*

---

## ✍️ Autor

Proyecto desarrollado por **Rodolfo (@Elreno23)**  
👉 GitHub: [github.com/Elreno23](https://github.com/Elreno23)  
🔗 LinkedIn: [linkedin.com/in/elreno](https://linkedin.com/in/elreno)
---

## 📌 Notas

La aplicación ya es funcional, pero aún faltan afinar varios aspectos:

- Vincular cada sesión de checkout con su orden correspondiente
- Integrar el webhook de Stripe para marcar automáticamente las órdenes como pagadas
- Mostrar historial de compras del usuario
- Mejorar la experiencia y el diseño

