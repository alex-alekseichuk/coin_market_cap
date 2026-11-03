# Crypto API based on CoinMarketCap

## Done:
- research CoinMarketCap API
- implement client of CoinMarketCap API
- implement CRUD
- sqlite layer
- graceful_shutdown
- implement middlewares to handle errors on service layer and http one
- errors on the service layer of admin API
- add simpleAuthBearerMiddleware(key)
- implement public crypto history API

## TODO:
- implement cron-like job for getting the prices from CMP API
- add validations/*.ts schemas and schemaValidationMiddleware
- add swagger
- refactor: move tables creation to migrations
- add Dockerfile
- refactor: move api, repositories, and routes under infra/ subfolder.
- add AGENTS.md

## Contacts for feedback:
- email: alex.alekseichuk@gmail.com
- telegram: @kikudjiro
