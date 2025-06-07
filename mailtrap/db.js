// mailtrap/db.js
const db = require('../database/database');
module.exports = db;

function saveUser(user) {
  return new Promise((resolve, reject) => {
    const { email, nome, codigo, verificado } = user;
    const verificadoInt = verificado ? 1 : 0;

    const sql = `INSERT INTO usuarios (email, nome, codigo, verificado) VALUES (?, ?, ?, ?)`;

    db.run(sql, [email, nome, codigo, verificadoInt], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

function verifyCode(email, codigo) {
  return new Promise((resolve, reject) => {
    const sqlSelect = `SELECT * FROM usuarios WHERE email = ?`;

    db.get(sqlSelect, [email], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row && row.codigo === codigo) {
        const sqlUpdate = `UPDATE usuarios SET verificado = 1 WHERE email = ?`;
        db.run(sqlUpdate, [email], (err2) => {
          if (err2) {
            reject(err2);
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(false);
      }
    });
  });
}

module.exports = { saveUser, verifyCode };
