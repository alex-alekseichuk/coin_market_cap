# Crypto API based on CoinMarketCap

## Contacts for feedback:
- email: alex.alekseichuk@gmail.com
- telegram: @kikudjiro

## System Architecture

There are 2 HTTP API:
- admin API for CRUD management of the cryptocurrencies for tracking the prices
- public API for browsing the current prices and the history log

Backend storage is the sqlite db.
There are 2 tables to hold cryptos and their log records.

There is the cron-like job scheduled to download prices for managed cryptos from CoinMarketCap API
and save their in the DB.

There is a clean architecture with segregation into parts:
- domain & service (the core; knows nothing about other parts)
- common modules/utils (knows nothing about app and other parts)
- infra: routes,repos,api (app specific)
- config(specific for the app)
- index.ts is the main/launch module of the service. 

### index.ts

- index.ts loads all the components,
- instantiate them
- configure dependencies
- the modules are DI-ready and testable. later, it's easy to instantiate them and use via DI container.

Repositories are split into Command and Query at line of CQRS.
Raw SQL is used w/o any ORM.

Services are really separated from the infra, including object model and errors schema.

common/ modules are ready to be moved to separated shared NPM packages
to be reused in other services.

express is used for HTTP server layer.

3rd-party software, like express, axios, etc., are used via specific common adapters.
So, the app doesn't depend on them, and can be refactored to use another libs.

The TypeScript is used. The dependencies are used as TypeScript interfaces.

axios is used as HTTP client for loading actual crypto prices periodically by cron.
Updating of the prices is a part of the same service.
Later, it's ok to move/separate it to another service.

There is simplified version of cron engine based on JS Interval.
It's much simpler than node-cron, but cover all the scheduling needs of the app.

There is graceful_shutdown module to close DB, cron, and http_server on exit.

## Docker

Build and run:

```sh
docker build -t coin-market-cap .

docker run -d --name coin-market-cap \
  -p 3000:3000 \
  -v coin-market-cap-data:/app \
  -e APP_AUTH_KEY=... \
  -e COIN_MARKET_CAP_API_KEY=... \
  coin-market-cap
```

- `APP_AUTH_KEY` is required (the app exits on startup without it);
- `COIN_MARKET_CAP_API_KEY` is used by the cron job to fetch prices;
- the sqlite db lives in `/app` (mounted volume), so it survives container restarts.

## Tasks

### Done
- research CoinMarketCap API
- implement client of CoinMarketCap API
- implement CRUD
- sqlite layer
- graceful_shutdown
- implement middlewares to handle errors on service layer and http one
- errors on the service layer of admin API
- add simpleAuthBearerMiddleware(key)
- implement public crypto history API
- implement cron-like job for getting the prices from CMP API
- add Dockerfile
- add validations/*.ts schemas and schemaValidationMiddleware

### TODO
- add swagger
- refactor: move tables creation to migrations
- refactor: move api, repositories, and routes under infra/ subfolder.
- add AGENTS.md
- add /ping route
- add middleware to log requests

