// mailtrap/index.js
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const db = require('./db');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525, // Changed to 2525
  auth: {
    user: "97dab3789e5a35",
    pass: "a30771425ce6d8"
  }
});

// Cadastro de usuário
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  db.run(
    'INSERT INTO users (email, password, verificationCode) VALUES (?, ?, ?)',
    [email, password, verificationCode],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao cadastrar usuário' });
      }

      transporter.sendMail({
        from: '"Shadow Eye" <noreply@shadoweye.com>',
        to: email,
        subject: "Verifique seu e-mail",
        text: `Seu código de verificação é: ${verificationCode}`,
      });

      res.json({ message: 'Usuário cadastrado. Verifique seu e-mail.' });
    }
  );
});

// Confirmação de código
app.post('/api/verify', (req, res) => {
  const { email, code } = req.body;

  db.get(
    'SELECT verificationCode FROM users WHERE email = ?',
    [email],
    (err, row) => {
      if (err || !row) return res.status(400).json({ message: 'Usuário não encontrado' });

      if (row.verificationCode === code) {
        db.run('UPDATE users SET verified = 1 WHERE email = ?', [email]);
        res.json({ message: 'E-mail verificado com sucesso!' });
      } else {
        res.status(400).json({ message: 'Código inválido' });
      }
    }
  );
});

app.listen(3000, () => {
  console.log('Rodando na porta 3000');
});
