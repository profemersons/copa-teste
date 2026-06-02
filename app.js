let currentCode = null;
let currentPlayer = null;

function showScreen(id){

  document
    .querySelectorAll(".screen")
    .forEach(screen=>{
      screen.classList.remove("active");
    });

  document
    .getElementById(id)
    .classList.add("active");
}

function showLoading(){

  document
    .getElementById("loading")
    .classList.remove("hidden");
}

function hideLoading(){

  document
    .getElementById("loading")
    .classList.add("hidden");
}

/* -------------------
VERIFICAR CÓDIGO
------------------- */

async function verifyCode(){

  const code = document
    .getElementById("codeInput")
    .value
    .trim()
    .toUpperCase();

  const errorBox =
    document.getElementById("codeError");

  errorBox.textContent = "";

  if(!code){
    errorBox.textContent =
      "Digite um código.";
    return;
  }

  showLoading();

  const { data, error } =
    await client
      .from("player_codes")
      .select("*")
      .eq("code",code)
      .single();

  hideLoading();

  if(error || !data){

    errorBox.textContent =
      "Código inválido.";

    return;
  }

  currentCode = code;

  /* PRIMEIRO ACESSO */

  if(data.used === false){

    showScreen("screen-register");

    return;
  }

  /* JÁ POSSUI CONTA */

  const { data: player } =
    await client
      .from("players")
      .select("*")
      .eq("code",code)
      .single();

  currentPlayer = player;

  document
    .getElementById("playerPreview")
    .innerHTML = `
      <h2>
        ${player.emoji}
        ${player.name}
      </h2>

      <p>
        ${player.turma_area}
      </p>
    `;

  showScreen("screen-pin");
}

/* -------------------
CADASTRO
------------------- */

async function register(){

  const name =
    document.getElementById("nameInput").value;

  const emoji =
    document.getElementById("emojiInput").value;

  const turma =
    document.getElementById("turmaInput").value;

  const pin =
    document.getElementById("pinInput").value;

  showLoading();

  const { data, error } =
    await client
      .from("players")
      .insert([
        {
          code: currentCode,
          name,
          emoji,
          turma_area: turma,
          type:"student",
          pin
        }
      ])
      .select()
      .single();

  if(error){

    hideLoading();

    alert(
      "Erro ao criar conta"
    );

    console.log(error);

    return;
  }

  await client
    .from("player_codes")
    .update({
      used:true
    })
    .eq(
      "code",
      currentCode
    );

  currentPlayer = data;

  hideLoading();

  document
    .getElementById("playerPreview")
    .innerHTML = `
      <h2>
        ${data.emoji}
        ${data.name}
      </h2>

      <p>
        ${data.turma_area}
      </p>
    `;

  showScreen("screen-pin");
}

/* -------------------
LOGIN
------------------- */

async function login(){

  const pin =
    document.getElementById("loginPin").value;

  const errorBox =
    document.getElementById("loginError");

  errorBox.textContent = "";

  if(pin !== currentPlayer.pin){

    errorBox.textContent =
      "PIN inválido.";

    return;
  }

  localStorage.setItem(
    "player",
    JSON.stringify(currentPlayer)
  );
 //talvez precise arrumar aqui
  window.location.href =
    "album/album.html";
}

window.verifyCode = verifyCode;
window.register = register;
window.login = login;