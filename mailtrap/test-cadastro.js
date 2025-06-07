const { saveUser } = require('./db');

async function testar() {
  try {
    await saveUser({
      email: 'teste@exemplo.com',
      nome: 'Usuário Teste',
      codigo: '123456',
      verificado: false
    });
    console.log('Usuário cadastrado manualmente!');
  } catch (error) {
    console.error('Erro ao cadastrar:', error.message);
  }
}

testar();