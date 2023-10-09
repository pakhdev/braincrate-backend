export interface MysqlError extends Error {
    code?: string;
    errno?: number;
    sqlMessage?: string;
    sqlState?: string;
    sql?: string;
    stack?: string;
}
