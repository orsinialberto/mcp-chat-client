# Prima di eseguire il progetto installare ed avviare Ollama

curl -fsSL https://ollama.com/install.sh | sh

# Controlla se il servizio è attivo
curl http://localhost:11434

# Verifica se Ollama è installato
ollama --version

# Avvia Ollama (se non già in esecuzione)
ollama serve

# Installa un modello (se non ne hai)
ollama pull llama2

# Lista modelli installati
ollama list

# Test manuale API
curl http://localhost:11434/api/tags

# Installa librerie legacy 
npm install --legacy-peer-deps

# Avvia applicativo node.js
npm run dev

# Host su cui è esposto l'applicativo
http://localhost:3000