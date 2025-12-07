import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  rootDir: '../../',
  roots: ['<rootDir>/unit_testing', '<rootDir>/integration_testing', '<rootDir>/code/backend'],
  moduleDirectories: ['node_modules', '<rootDir>/code/backend/node_modules'],
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: path.resolve(__dirname, 'babel.config.json') }]
  },
  testEnvironment: 'node'
};
