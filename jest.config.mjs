export default {
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^#app/(.*)\\.js$': '<rootDir>/app/$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            '@swc/jest',
            {
                jsc: {
                    parser: {
                        syntax: 'typescript',
                    },
                },
                module: {
                    type: 'es6',
                },
            },
        ],
    },
    testMatch: ['<rootDir>/test/**/*.test.ts'],
};
