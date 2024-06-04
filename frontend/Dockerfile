# Basisbild
FROM node:18

# Arbeitsverzeichnis im Container erstellen
WORKDIR /app

# Abhängigkeiten kopieren
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm install

# Rest des App-Quellcodes kopieren
COPY . .

# App bauen
RUN npm run build

EXPOSE 3000

# Nginx-Server starten
CMD ["npm", "start"]