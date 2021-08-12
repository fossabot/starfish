# Initial mongodb config steps

1. Make sure the mongodb container is running after running `docker-compose up -d -f docker-compose-prod.yml`.
2. Get the container ID of the mongodb container with `docker ps`. 
3. Connect to the container shell by running `docker exec -it CONTAINER_ID_HERE bash`. 
4. Connect to mongodb with `mongo -u MONGO_ROOT_USER -p MONGO_ROOT_PASSWORD`.
5. Switch to the Starfish database with `use starfish`.
6. Add the new user with :
```js
db.createUser({
  user: "DB_USER_HERE",
  pwd: "DB_PASSWORD_HERE",
  roles: [
    {
      role: `readWrite`,
      db: `starfish`,
    },
  ],
})
```