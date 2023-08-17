# SQLite-Query

> 一个简单的 SQLite 客户端工具

## Feature

- [x] 连接SQLite
- [x] 执行SQL
- [x] 导出SQL文件
- [x] 执行SQL文件
- [x] 支持 `Memory` 数据库
- [x] 支持多`Tab`查询
- [ ] 附加数据库
- [ ] 自动刷新数据库
- [ ] 自动增加`limit`
- [ ] 数据库加密

## Known issues

- `Insert`语句中`Value("value1")` 会触发错误，详见[DQS](https://sqlite.org/compile.html#dqs)和[Better-SQLite3 Bundled configuration](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/compilation.md#bundled-configuration)

## License
GPL V3
