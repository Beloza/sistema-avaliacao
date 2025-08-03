let funcionarias = JSON.parse(localStorage.getItem('funcionarias')) || [];
let avaliacoes = JSON.parse(localStorage.getItem('avaliacoes')) || {};
let modoADM = false;
let senhaADM = localStorage.getItem('senhaADM') || 'admin123';

function salvarDados() {
  localStorage.setItem('funcionarias', JSON.stringify(funcionarias));
  localStorage.setItem('avaliacoes', JSON.stringify(avaliacoes));
}

function renderizarFuncionarias() {
  const container = document.getElementById('funcionariasContainer');
  container.innerHTML = '';
  funcionarias.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'funcionaria';
    div.innerHTML = `
      <img src="${f.foto}" alt="${f.nome}">
      <h2>${f.nome}</h2>
      <div class="avaliacoes">
        <button onclick="avaliar(${i}, 'Boa')">😊</button>
        <button onclick="avaliar(${i}, 'Neutra')">😐</button>
        <button onclick="avaliar(${i}, 'Ruim')">😞</button>
      </div>
    `;
    container.appendChild(div);
  });
  atualizarListaExclusao();
}

function avaliar(index, tipo) {
  if (modoADM) return; // bloqueia avaliação no modo ADM
  const nome = funcionarias[index].nome;
  avaliacoes[nome] = avaliacoes[nome] || [];
  avaliacoes[nome].push(tipo);
  salvarDados();
  piscarBotao(index, tipo);
}

function piscarBotao(index, tipo) {
  const div = document.getElementsByClassName('funcionaria')[index];
  const botoes = div.querySelectorAll('button');
  botoes.forEach((btn) => {
    if (btn.innerText.includes('😊') && tipo === 'Boa' ||
        btn.innerText.includes('😐') && tipo === 'Neutra' ||
        btn.innerText.includes('😞') && tipo === 'Ruim') {
      btn.style.backgroundColor = '#2ecc71';
      setTimeout(() => {
        btn.style.backgroundColor = '';
      }, 300);
    }
  });
}

function entrarModoADM() {
  const senha = prompt('Digite a senha do modo ADM:');
  if (senha === senhaADM) {
    modoADM = true;
    document.getElementById('adminPanel').classList.add('active');
  } else {
    alert('Senha incorreta!');
  }
}

function sairModoADM() {
  modoADM = false;
  document.getElementById('adminPanel').classList.remove('active');
  document.getElementById('relatorioBox').classList.remove('active');
}

function adicionarFuncionaria() {
  const nome = document.getElementById('nomeNova').value.trim();
  const fotoInput = document.getElementById('fotoNova');
  if (!nome || !fotoInput.files[0]) {
    alert('Nome e foto são obrigatórios!');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    funcionarias.push({ nome, foto: reader.result });
    salvarDados();
    renderizarFuncionarias();
    document.getElementById('nomeNova').value = '';
    fotoInput.value = '';
  };
  reader.readAsDataURL(fotoInput.files[0]);
}

function excluirFuncionaria() {
  const select = document.getElementById('listaExclusao');
  const nomeSelecionado = select.value;
  if (!nomeSelecionado) return;
  if (!confirm(`Tem certeza que deseja excluir ${nomeSelecionado}?`)) return;

  funcionarias = funcionarias.filter(f => f.nome !== nomeSelecionado);
  delete avaliacoes[nomeSelecionado];
  salvarDados();
  renderizarFuncionarias();
}

function atualizarListaExclusao() {
  const select = document.getElementById('listaExclusao');
  select.innerHTML = '';
  funcionarias.forEach(f => {
    const option = document.createElement('option');
    option.value = f.nome;
    option.textContent = f.nome;
    select.appendChild(option);
  });
}

function gerarRelatorio() {
  const relatorio = Object.entries(avaliacoes).map(([nome, lista]) => {
    const contagem = { Boa: 0, Neutra: 0, Ruim: 0 };
    lista.forEach(v => contagem[v]++);
    return `${nome}:\n  😊 Boas: ${contagem.Boa}\n  😐 Neutras: ${contagem.Neutra}\n  😞 Ruins: ${contagem.Ruim}\n`;
  }).join('\n') || 'Nenhuma avaliação registrada.';

  document.getElementById('relatorioTexto').textContent = relatorio;
  document.getElementById('relatorioBox').classList.add('active');
}

function limparAvaliacoes() {
  if (!confirm("Deseja realmente limpar TODAS as avaliações?")) return;
  avaliacoes = {};
  salvarDados();
  gerarRelatorio();
}

function alterarSenhaADM() {
  const novaSenha = document.getElementById('novaSenha').value.trim();
  if (!novaSenha) return alert("Digite uma nova senha válida.");
  senhaADM = novaSenha;
  localStorage.setItem('senhaADM', senhaADM);
  alert("Senha alterada com sucesso!");
  document.getElementById('novaSenha').value = '';
}

// Inicialização
renderizarFuncionarias();
