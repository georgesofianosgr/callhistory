Endpoints: 
```
POST /events
```

```
GET /metrics/failures
```


Setup & run the app
```
# If you need a postgres & adminer
docker compose -f docker-compose.dev.yml up -d

# Install all packages
npm install

# Generate prisma client
npm run prisma:types

# Run initial db migration
npm run prisma:deploy

# Run the server
npm run dev
```
