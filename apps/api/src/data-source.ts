import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

const options: DataSourceOptions = {
  type: 'postgres',
  url:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@127.0.0.1:5432/core',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  entities: [path.join(__dirname, 'modules/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
  migrationsTableName: '_migrations',
};

export default new DataSource(options);
