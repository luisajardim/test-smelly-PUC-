const { UserService } = require('../src/userService');

describe('UserService - Suíte de Testes Limpa', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('deve retornar um usuário com id gerado e status "ativo" quando os dados são válidos', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario).toMatchObject({ nome, email, idade, isAdmin: false, status: 'ativo' });
      expect(usuario.id).toEqual(expect.any(String));
    });

    test('deve criar um usuário administrador quando isAdmin é true', () => {
      // Arrange
      const isAdmin = true;

      // Act
      const usuario = userService.createUser('Admin', 'admin@teste.com', 40, isAdmin);

      // Assert
      expect(usuario.isAdmin).toBe(true);
    });

    test('deve lançar erro quando o usuário é menor de idade', () => {
      // Arrange
      const idadeMenor = 17;

      // Act
      const criarMenor = () => userService.createUser('Menor', 'menor@email.com', idadeMenor);

      // Assert
      expect(criarMenor).toThrow('O usuário deve ser maior de idade.');
    });

    test('deve lançar erro quando campos obrigatórios estão ausentes', () => {
      // Arrange
      const emailAusente = undefined;

      // Act
      const criarSemEmail = () => userService.createUser('Sem Email', emailAusente, 30);

      // Assert
      expect(criarSemEmail).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('deve retornar o usuário cadastrado quando o id existe', () => {
      // Arrange
      const usuarioCriado = userService.createUser('Fulano de Tal', 'fulano@teste.com', 25);

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado).toEqual(usuarioCriado);
    });

    test('deve retornar null quando o id não existe', () => {
      // Arrange
      const idInexistente = 'id-inexistente';

      // Act
      const resultado = userService.getUserById(idInexistente);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('deve desativar um usuário comum e retornar true', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
      expect(userService.getUserById(usuarioComum.id).status).toBe('inativo');
    });

    test('não deve desativar um usuário administrador e deve retornar false', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
      expect(userService.getUserById(usuarioAdmin.id).status).toBe('ativo');
    });

    test('deve retornar false quando o usuário não existe', () => {
      // Arrange
      const idInexistente = 'id-inexistente';

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('deve incluir nome e status de cada usuário cadastrado', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);
      const bob = userService.createUser('Bob', 'bob@email.com', 32);
      userService.deactivateUser(bob.id);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toMatch(/Alice.*ativo/);
      expect(relatorio).toMatch(/Bob.*inativo/);
    });

    test('deve informar que não há usuários quando o cadastro está vazio', () => {
      // Arrange
      // (o banco já é limpo no beforeEach)

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Nenhum usuário cadastrado');
    });
  });
});
