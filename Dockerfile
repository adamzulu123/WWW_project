FROM node:23.3.0-alpine

#katalog roboczy w kontenerze 
WORKDIR /app

COPY package*.json ./

#instalujemy zaleznosci 
RUN npm install 

#kopiujemy reszte plików projektu do kontenera
COPY . .

EXPOSE 3000

# Domyślna komenda uruchamiająca aplikację
CMD ["node", "server.js"]












