export type Config = {
    currency: string;
    coinMarketCapApi: {
        baseUrl: string;
        key: string;
    }
}

export default function buildConfig() : Config {
    return {
        currency: 'USD',
        coinMarketCapApi: {
            baseUrl: "https://pro-api.coinmarketcap.com",
            key: String(process.env.COIN_MARKET_CAP_API_KEY),
        }
    }
}
