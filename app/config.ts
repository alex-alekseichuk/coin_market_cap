export type Config = {
    currency: string;
    coinMarketCapApi: {
        baseUrl: string;
        key: string;
    }
    app: {
        port: number;
    }
}

export default function buildConfig() : Config {
    return {
        currency: 'USD',
        coinMarketCapApi: {
            baseUrl: "https://pro-api.coinmarketcap.com",
            key: String(process.env.COIN_MARKET_CAP_API_KEY),
        },
        app: {
            port: Number(process.env.APP_PORT ?? 3000),
        }
    }
}
