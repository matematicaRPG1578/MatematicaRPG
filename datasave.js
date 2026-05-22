// ============================================================
// DATASAVE - SISTEMA DE ARMAZENAMENTO DE DADOS
// Matemática RPG - Backup e Persistência de Dados
// ============================================================

class DataSaveManager {
  constructor() {
    this.BACKUP_KEY = 'game_datasave_backup';
    this.PERSONAGENS_KEY = 'game_personagens_list';
    this.ULTIMA_ATUALIZACAO = 'game_ultima_atualizacao';
  }

  // ========== SALVAR PERSONAGEM ==========
  salvarPersonagem(nome, classe, senha, foto, descricao, itens, nivel, xp, hp, energia) {
    const personagemId = this.gerarId(nome);
    
    const dados = {
      id: personagemId,
      nome: nome,
      classe: classe,
      senha: senha,
      foto: foto || '👤',
      descricao: descricao,
      itens: itens,
      nivel: nivel,
      xp: xp,
      hp: hp,
      energia: energia,
      dataCriacao: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString()
    };

    // Salva com prefixo
    localStorage.setItem(`personagem_nome_${personagemId}`, nome);
    localStorage.setItem(`personagem_classe_${personagemId}`, classe);
    localStorage.setItem(`personagem_senha_${personagemId}`, senha);
    localStorage.setItem(`personagem_foto_${personagemId}`, foto);
    localStorage.setItem(`personagem_desc_${personagemId}`, descricao);
    localStorage.setItem(`personagem_itens_${personagemId}`, JSON.stringify(itens));
    localStorage.setItem(`personagem_nivel_${personagemId}`, nivel);
    localStorage.setItem(`personagem_xp_${personagemId}`, xp);
    localStorage.setItem(`personagem_hp_${personagemId}`, hp);
    localStorage.setItem(`personagem_energia_${personagemId}`, energia);
    localStorage.setItem(`personagem_data_criacao_${personagemId}`, dados.dataCriacao);
    localStorage.setItem(`personagem_ultima_atualizacao_${personagemId}`, dados.ultimaAtualizacao);

    // Adiciona à lista de personagens
    this.adicionarAListaPersonagens(personagemId, nome);

    // Cria backup automático
    this.criarBackup(dados);

    console.log('✅ Personagem salvo com sucesso:', nome);
    return personagemId;
  }

  // ========== CARREGAR PERSONAGEM ==========
  carregarPersonagem(id) {
    try {
      const nome = localStorage.getItem(`personagem_nome_${id}`);
      
      if (!nome) {
        console.error('❌ Personagem não encontrado:', id);
        return null;
      }

      return {
        id: id,
        nome: nome,
        classe: localStorage.getItem(`personagem_classe_${id}`),
        senha: localStorage.getItem(`personagem_senha_${id}`),
        foto: localStorage.getItem(`personagem_foto_${id}`) || '👤',
        descricao: localStorage.getItem(`personagem_desc_${id}`),
        itens: JSON.parse(localStorage.getItem(`personagem_itens_${id}`) || '[]'),
        nivel: parseInt(localStorage.getItem(`personagem_nivel_${id}`) || '1'),
        xp: parseInt(localStorage.getItem(`personagem_xp_${id}`) || '0'),
        hp: parseInt(localStorage.getItem(`personagem_hp_${id}`) || '100'),
        energia: parseInt(localStorage.getItem(`personagem_energia_${id}`) || '50'),
        dataCriacao: localStorage.getItem(`personagem_data_criacao_${id}`),
        ultimaAtualizacao: localStorage.getItem(`personagem_ultima_atualizacao_${id}`)
      };
    } catch (e) {
      console.error('❌ Erro ao carregar personagem:', e);
      return null;
    }
  }

  // ========== LISTAR TODOS OS PERSONAGENS ==========
  listarTodosPersonagens() {
    try {
      const listaJson = localStorage.getItem(this.PERSONAGENS_KEY);
      return listaJson ? JSON.parse(listaJson) : [];
    } catch (e) {
      console.error('❌ Erro ao listar personagens:', e);
      return [];
    }
  }

  // ========== ATUALIZAR PERSONAGEM ==========
  atualizarPersonagem(id, dados) {
    try {
      const personagem = this.carregarPersonagem(id);
      
      if (!personagem) {
        console.error('❌ Personagem não encontrado para atualização:', id);
        return false;
      }

      // Atualiza apenas os campos fornecidos
      Object.keys(dados).forEach(chave => {
        if (chave === 'itens') {
          localStorage.setItem(`personagem_${chave}_${id}`, JSON.stringify(dados[chave]));
        } else {
          localStorage.setItem(`personagem_${chave}_${id}`, dados[chave]);
        }
      });

      // Atualiza timestamp de modificação
      localStorage.setItem(`personagem_ultima_atualizacao_${id}`, new Date().toISOString());

      // Cria backup da atualização
      this.criarBackup(this.carregarPersonagem(id));

      console.log('✅ Personagem atualizado:', id);
      return true;
    } catch (e) {
      console.error('❌ Erro ao atualizar personagem:', e);
      return false;
    }
  }

  // ========== DELETAR PERSONAGEM ==========
  deletarPersonagem(id) {
    try {
      const personagem = this.carregarPersonagem(id);
      
      if (!personagem) {
        console.error('❌ Personagem não encontrado para deleção:', id);
        return false;
      }

      // Remove todas as chaves do personagem
      const chaves = [
        'nome', 'classe', 'senha', 'foto', 'desc', 'itens', 
        'nivel', 'xp', 'hp', 'energia', 'data_criacao', 'ultima_atualizacao'
      ];

      chaves.forEach(chave => {
        localStorage.removeItem(`personagem_${chave}_${id}`);
      });

      // Remove da lista
      this.removerDaListaPersonagens(id);

      console.log('✅ Personagem deletado:', id);
      return true;
    } catch (e) {
      console.error('❌ Erro ao deletar personagem:', e);
      return false;
    }
  }

  // ========== ADICIONAR À LISTA DE PERSONAGENS ==========
  adicionarAListaPersonagens(id, nome) {
    try {
      const lista = this.listarTodosPersonagens();
      
      // Verifica se já existe
      if (!lista.find(p => p.id === id)) {
        lista.push({
          id: id,
          nome: nome,
          dataCriacao: new Date().toISOString()
        });
        localStorage.setItem(this.PERSONAGENS_KEY, JSON.stringify(lista));
      }
    } catch (e) {
      console.error('❌ Erro ao adicionar à lista:', e);
    }
  }

  // ========== REMOVER DA LISTA DE PERSONAGENS ==========
  removerDaListaPersonagens(id) {
    try {
      const lista = this.listarTodosPersonagens();
      const novaLista = lista.filter(p => p.id !== id);
      localStorage.setItem(this.PERSONAGENS_KEY, JSON.stringify(novaLista));
    } catch (e) {
      console.error('❌ Erro ao remover da lista:', e);
    }
  }

  // ========== CRIAR BACKUP ==========
  criarBackup(dados) {
    try {
      const backups = this.obterBackups();
      
      const backup = {
        id: dados.id,
        nome: dados.nome,
        timestamp: new Date().toISOString(),
        dados: dados
      };

      backups.push(backup);

      // Mantém apenas os últimos 50 backups
      if (backups.length > 50) {
        backups.shift();
      }

      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backups));
      console.log('💾 Backup criado para:', dados.nome);
    } catch (e) {
      console.error('❌ Erro ao criar backup:', e);
    }
  }

  // ========== OBTER BACKUPS ==========
  obterBackups() {
    try {
      const backupsJson = localStorage.getItem(this.BACKUP_KEY);
      return backupsJson ? JSON.parse(backupsJson) : [];
    } catch (e) {
      console.error('❌ Erro ao obter backups:', e);
      return [];
    }
  }

  // ========== RESTAURAR DO BACKUP ==========
  restaurarBackup(backupId) {
    try {
      const backups = this.obterBackups();
      const backup = backups.find(b => b.id === backupId);

      if (!backup) {
        console.error('❌ Backup não encontrado:', backupId);
        return false;
      }

      const dados = backup.dados;
      return this.atualizarPersonagem(dados.id, {
        nome: dados.nome,
        classe: dados.classe,
        senha: dados.senha,
        foto: dados.foto,
        desc: dados.descricao,
        itens: dados.itens,
        nivel: dados.nivel,
        xp: dados.xp,
        hp: dados.hp,
        energia: dados.energia
      });
    } catch (e) {
      console.error('❌ Erro ao restaurar backup:', e);
      return false;
    }
  }

  // ========== ADICIONAR XP ==========
  adicionarXP(id, quantidade) {
    try {
      const personagem = this.carregarPersonagem(id);
      if (!personagem) return false;

      const xpAtual = personagem.xp;
      const xpNovo = xpAtual + quantidade;

      // Verifica se sobe de nível (100 XP = 1 nível)
      const nivelAtual = personagem.nivel;
      const nivelNovo = Math.floor(xpNovo / 100) + 1;

      this.atualizarPersonagem(id, {
        xp: xpNovo,
        nivel: nivelNovo
      });

      console.log(`✅ +${quantidade} XP adicionado. Nível: ${nivelNovo}`);
      return true;
    } catch (e) {
      console.error('❌ Erro ao adicionar XP:', e);
      return false;
    }
  }

  // ========== ADICIONAR HP ==========
  adicionarHP(id, quantidade) {
    try {
      const personagem = this.carregarPersonagem(id);
      if (!personagem) return false;

      const hpNovo = personagem.hp + quantidade;

      this.atualizarPersonagem(id, {
        hp: hpNovo
      });

      console.log(`✅ +${quantidade} HP adicionado.`);
      return true;
    } catch (e) {
      console.error('❌ Erro ao adicionar HP:', e);
      return false;
    }
  }

  // ========== ADICIONAR ENERGIA ==========
  adicionarEnergia(id, quantidade) {
    try {
      const personagem = this.carregarPersonagem(id);
      if (!personagem) return false;

      const energiaNova = personagem.energia + quantidade;

      this.atualizarPersonagem(id, {
        energia: energiaNova
      });

      console.log(`✅ +${quantidade} Energia adicionada.`);
      return true;
    } catch (e) {
      console.error('❌ Erro ao adicionar energia:', e);
      return false;
    }
  }

  // ========== ADICIONAR ITEM ==========
  adicionarItem(id, item) {
    try {
      const personagem = this.carregarPersonagem(id);
      if (!personagem) return false;

      const itensNovos = personagem.itens || [];
      itensNovos.push(item);

      this.atualizarPersonagem(id, {
        itens: itensNovos
      });

      console.log(`✅ Item "${item}" adicionado ao inventário.`);
      return true;
    } catch (e) {
      console.error('❌ Erro ao adicionar item:', e);
      return false;
    }
  }

  // ========== REMOVER ITEM ==========
  removerItem(id, item) {
    try {
      const personagem = this.carregarPersonagem(id);
      if (!personagem) return false;

      const itensNovos = personagem.itens.filter(i => i !== item);

      this.atualizarPersonagem(id, {
        itens: itensNovos
      });

      console.log(`✅ Item "${item}" removido do inventário.`);
      return true;
    } catch (e) {
      console.error('❌ Erro ao remover item:', e);
      return false;
    }
  }

  // ========== EXPORTAR TODOS OS DADOS ==========
  exportarDados() {
    try {
      const personagens = this.listarTodosPersonagens();
      const dados = {};

      personagens.forEach(p => {
        dados[p.id] = this.carregarPersonagem(p.id);
      });

      const export_data = {
        versao: '1.0',
        dataExportacao: new Date().toISOString(),
        totalPersonagens: personagens.length,
        personagens: dados
      };

      return export_data;
    } catch (e) {
      console.error('❌ Erro ao exportar dados:', e);
      return null;
    }
  }

  // ========== IMPORTAR DADOS ==========
  importarDados(dadosJson) {
    try {
      const dados = typeof dadosJson === 'string' ? JSON.parse(dadosJson) : dadosJson;

      if (!dados.personagens) {
        console.error('❌ Formato de dados inválido');
        return false;
      }

      Object.values(dados.personagens).forEach(personagem => {
        this.salvarPersonagem(
          personagem.nome,
          personagem.classe,
          personagem.senha,
          personagem.foto,
          personagem.descricao,
          personagem.itens,
          personagem.nivel,
          personagem.xp,
          personagem.hp,
          personagem.energia
        );
      });

      console.log('✅ Dados importados com sucesso!');
      return true;
    } catch (e) {
      console.error('❌ Erro ao importar dados:', e);
      return false;
    }
  }

  // ========== LIMPAR TODOS OS DADOS ==========
  limparTodosDados() {
    try {
      if (!confirm('⚠️ ATENÇÃO! Isso deletará TODOS os personagens e dados. Tem certeza?')) {
        return false;
      }

      const personagens = this.listarTodosPersonagens();
      personagens.forEach(p => {
        this.deletarPersonagem(p.id);
      });

      localStorage.removeItem(this.PERSONAGENS_KEY);
      localStorage.removeItem(this.BACKUP_KEY);

      console.log('✅ Todos os dados foram limpos!');
      return true;
    } catch (e) {
      console.error('❌ Erro ao limpar dados:', e);
      return false;
    }
  }

  // ========== GERAR ID ÚNICO ==========
  gerarId(nome) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${nome}_${timestamp}_${random}`.toLowerCase().replace(/\s+/g, '_');
  }

  // ========== ESTATÍSTICAS ==========
  obterEstatisticas() {
    try {
      const personagens = this.listarTodosPersonagens();
      const backups = this.obterBackups();

      let nivelMedio = 0;
      let xpTotal = 0;
      let hpTotal = 0;

      personagens.forEach(p => {
        const pers = this.carregarPersonagem(p.id);
        if (pers) {
          nivelMedio += pers.nivel;
          xpTotal += pers.xp;
          hpTotal += pers.hp;
        }
      });

      return {
        totalPersonagens: personagens.length,
        nivelMedio: personagens.length > 0 ? (nivelMedio / personagens.length).toFixed(1) : 0,
        xpTotal: xpTotal,
        hpTotal: hpTotal,
        totalBackups: backups.length,
        ultimaAtualizacao: personagens.length > 0 ? personagens[personagens.length - 1].dataCriacao : 'N/A'
      };
    } catch (e) {
      console.error('❌ Erro ao obter estatísticas:', e);
      return null;
    }
  }

  // ========== VERIFICAR INTEGRIDADE ==========
  verificarIntegridade() {
    try {
      const personagens = this.listarTodosPersonagens();
      let erros = [];

      personagens.forEach(p => {
        const pers = this.carregarPersonagem(p.id);
        if (!pers) {
          erros.push(`Personagem ${p.id} não encontrado`);
        } else if (!pers.nome || !pers.classe) {
          erros.push(`Personagem ${p.id} com dados incompletos`);
        }
      });

      if (erros.length === 0) {
        console.log('✅ Integridade dos dados verificada com sucesso!');
        return true;
      } else {
        console.warn('⚠️ Erros encontrados:', erros);
        return false;
      }
    } catch (e) {
      console.error('❌ Erro ao verificar integridade:', e);
      return false;
    }
  }
}

// ============================================================
// INSTÂNCIA GLOBAL
// ============================================================
const dataSave = new DataSaveManager();

// ============================================================
// EXEMPLOS DE USO
// ============================================================

/*
// Salvar novo personagem
dataSave.salvarPersonagem(
  'Herói',
  'Guerreiro',
  'senha123',
  '⚔️',
  'Um grande guerreiro',
  ['Espada', 'Escudo'],
  1,
  0,
  100,
  50
);

// Carregar personagem
const personagem = dataSave.carregarPersonagem('herói_1234567_abcdef');
console.log(personagem);

// Listar todos
const todos = dataSave.listarTodosPersonagens();
console.log(todos);

// Adicionar XP
dataSave.adicionarXP('herói_1234567_abcdef', 50);

// Exportar
const dados = dataSave.exportarDados();
console.log(JSON.stringify(dados, null, 2));

// Estatísticas
const stats = dataSave.obterEstatisticas();
console.log(stats);
*/

console.log('🎮 DataSave carregado com sucesso!');