# Используем официальный Node.js образ
FROM node:16

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы в контейнер
COPY package*.json ./
RUN npm install
COPY . .

# Открываем порт и запускаем сервер
EXPOSE 3000
CMD ["npm", "start"]
