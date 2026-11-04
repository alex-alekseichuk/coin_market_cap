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

Repositories are split into Command and Query at line of CQRS.

Services are really separated from the infra, including object model and errors schema.

common/ modules are ready to be moved to separated shared NPM packages
to be reused in other services.

express is used for HTTP layer.

3rd-party software, like express, axios, etc., are used via specific common adapters.
So, the app doesn't depend on them, and can be refactored to use another libs.

The TypeScript is used. The dependencies are used as TypeScript interfaces.

There is simplified version of cron engine implemented by hand.
It's much simpler than node-cron, but cover all the scheduling needs of the app.

### index.ts

- index.ts loads all the components,
- instantiate them
- configure dependencies
- the modules are DI-ready and testable. later, it's easy to instantiate them and use via DI container.

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

### TODO
- add validations/*.ts schemas and schemaValidationMiddleware
- add swagger
- refactor: move tables creation to migrations
- add Dockerfile
- refactor: move api, repositories, and routes under infra/ subfolder.
- add AGENTS.md
- add /ping route
- add middleware to log requests

