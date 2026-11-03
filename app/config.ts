export type Config = {
    currency: string;
    coinMarketCapApi: {
        baseUrl: string;
        key: string;
    }
    app: {
        port: number;
        auth_key: string;
    }
}

export default function buildConfig() : Config {
    if (!process.env.APP_AUTH_KEY) {
        console.log('APP_AUTH_KEY is required.');
        process.exit(1);
    }

    return {
        currency: 'USD',
        coinMarketCapApi: {
            baseUrl: "https://pro-api.coinmarketcap.com",
            key: String(process.env.COIN_MARKET_CAP_API_KEY),
        },
        app: {
            port: Number(process.env.APP_PORT ?? 3000),
            auth_key: String(process.env.APP_AUTH_KEY),
        }
    }
}
