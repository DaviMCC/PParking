module.exports = {
    user: 'system',
    password: 'system',
    connectString: 'localhost/xe',
    externalAuth: process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
  };
  