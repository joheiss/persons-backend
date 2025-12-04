docker build -t persons-backend .
docker run -d -p 3000:3000 persons-backend

# used ports
sudo lsof -i -n -P | grep TCP