source .env

if [[ ! -z "${PORT}" ]]; then
export PORT=8000
fi

sudo docker-compose up