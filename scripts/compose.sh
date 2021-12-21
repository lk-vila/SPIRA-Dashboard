source .env*

if [[ -z "${PORT}" ]]; then
echo "Using default port"
export PORT=8000
fi

sudo -E docker-compose up