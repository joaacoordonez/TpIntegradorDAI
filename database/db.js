import pkg from 'pg';
const { Pool } = pkg;

import DBConfig from '../src/configs/dbConfig.js';

const pool = new Pool(DBConfig);

export default pool;