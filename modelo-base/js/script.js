/* =========================================================
   MODELO BASE — JavaScript
   Funções prontas: menu no celular, ano automático no rodapé
   e envio do formulário para o Supabase (Back End).
   ========================================================= */

// ----- Menu que abre/fecha no celular -----
const menuBotao = document.getElementById('menuBotao');
const menu = document.getElementById('menu');

if (menuBotao && menu) {
  menuBotao.addEventListener('click', () => {
    menu.classList.toggle('ativo');
  });

  // fecha o menu ao clicar em um link
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => menu.classList.remove('ativo'));
  });
}

// ----- Ano automático no rodapé -----
const ano = document.getElementById('ano');
if (ano) {
  ano.textContent = new Date().getFullYear();
}

// ----- Formulário de contato (grava no Supabase) -----
const form = document.getElementById('formContato');
const aviso = document.getElementById('formAviso');

if (form) {
  form.addEventListener('submit', async (evento) => {
    evento.preventDefault(); // evita recarregar a página

    const botao = form.querySelector('button[type="submit"]');
    const dados = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      mensagem: form.mensagem.value.trim(),
    };

    if (botao) botao.disabled = true;

    try {
      if (supabaseClient) {
        // Back End configurado: grava a mensagem na tabela "contatos".
        const { error } = await supabaseClient.from('contatos').insert([dados]);
        if (error) throw error;
      } else {
        // Supabase ainda não configurado: só registra no console.
        console.log('Supabase não configurado — mensagem (apenas local):', dados);
      }

      mostrarAviso('Mensagem enviada! ✅', '#1a7f37');
      form.reset();
    } catch (erro) {
      console.error('Erro ao enviar:', erro);
      mostrarAviso('Não foi possível enviar. Tente de novo.', '#b42318');
    } finally {
      if (botao) botao.disabled = false;
    }
  });
}

function mostrarAviso(texto, cor) {
  if (!aviso) return;
  aviso.textContent = texto;
  aviso.style.color = cor;
  aviso.hidden = false;
}
