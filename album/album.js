const player = JSON.parse(
    localStorage.getItem("player")
);

if (!player) {
    window.location.href = "../index.html";
}

const areasOrder = [
    "Tecnologia da Informação",
    "Gestão e Negócios",
    "Comunicação e Marketing",
    "Gastronomia e Alimentação",
    "Operações e Serviços",
    "Saúde",
    "Bem-estar",
    "Beleza e Estética",
    "Moda",
    "Educação",
    "Idiomas",
    "Turismo e Hospitalidade",
    "Desenvolvimento Social",
    "Meio Ambiente, Segurança e Saúde no Trabalho",
    "Design, Artes e Arquitetura"
];

init();

async function init() {

    fillPlayer();

    const stickers = await loadStickers();
    const inventory = await loadInventory();

    buildAlbum(stickers, inventory);

    document.getElementById("loading").style.display = "none";
    document.getElementById("app").style.display = "block";
}

function fillPlayer() {

    document.getElementById("playerName").textContent =
        player.name;

    document.getElementById("playerCourse").textContent =
        player.turma_area;

    document.getElementById("playerEmoji").textContent =
        player.emoji;
}

async function loadStickers() {

    const { data } = await client
        .from("stickers")
        .select("*")
        .order("global_number");

    return data || [];
}

async function loadInventory() {

    const { data } = await client
        .from("inventory")
        .select("*")
        .eq("player_id", player.id);

    return data || [];
}

function buildAlbum(stickers, inventory) {

    const ownedMap = {};

    inventory.forEach(item => {
        ownedMap[item.sticker_id] = item.quantity;
    });

    const discovered = stickers.filter(
        s => ownedMap[s.id]
    ).length;

    document.getElementById(
        "progressText"
    ).textContent =
        `${discovered} / ${stickers.length} Figurinhas`;

    const percent =
        (discovered / stickers.length) * 100;

    document.getElementById(
        "progressPercent"
    ).textContent =
        `${Math.round(percent)}% Completo`;

    const container =
        document.getElementById("albumContainer");

    areasOrder.forEach(area => {

        const areaStickers =
            stickers.filter(
                s => s.area === area
            );

        if (!areaStickers.length) return;

        const section =
            document.createElement("section");

        section.className = "area";

        section.innerHTML =
            `
      <div class="area-title">
        ${area}
      </div>

      <div class="grid"></div>
      `;

        const grid =
            section.querySelector(".grid");

        areaStickers.forEach(sticker => {

            const qty =
                ownedMap[sticker.id];

            const card =
                document.createElement("div");

            card.className =
                qty
                    ? "card"
                    : "card locked";

            if (
                sticker.type === "legendary"
            ) {
                card.classList.add(
                    "legendary"
                );
            }

            card.innerHTML =
                qty
                    ? `
            <div class="emoji">
              ${sticker.emoji}
            </div>

            <div class="number">
              #${String(
                        sticker.global_number
                    ).padStart(3, "0")}
            </div>

            ${qty > 1
                        ? `<div class="quantity">x${qty}</div>`
                        : ""
                    }
          `
                    : `
            <div class="emoji">🔒</div>

            <div class="number">
              #${String(
                        sticker.global_number
                    ).padStart(3, "0")}
            </div>
          `;

            card.onclick =
                () =>
                    openSticker(
                        sticker,
                        !!qty
                    );

            grid.appendChild(card);

        });

        container.appendChild(
            section
        );

    });

}

function openSticker(
    sticker,
    discovered
) {

    const modal =
        document.getElementById("modal");

    const body =
        document.getElementById("modalBody");

    if (!discovered) {

        body.innerHTML = `
      <h2>❓ Figurinha não descoberta</h2>

      <p>
        Número:
        #${String(
            sticker.global_number
        ).padStart(3, "0")}
      </p>

      <p>
        Área:
        ${sticker.area}
      </p>
    `;

    } else {

        body.innerHTML = `
      <div class="modal-sticker">
        ${sticker.emoji}
      </div>

      <h2>
        ${sticker.profession}
      </h2>

      <p>
        <b>Área:</b>
        ${sticker.area}
      </p>

      <p>
        <b>Curso:</b>
        ${sticker.course}
      </p>

      <p>
        <b>Na Copa:</b><br>
        ${sticker.copa_description}
      </p>

      <p>
        <b>No Dia a Dia:</b><br>
        ${sticker.real_description}
      </p>

      <p>
        <b>Tipo:</b>
        ${sticker.type}
      </p>
    `;
    }

    modal.classList.remove("hidden");
}

document
    .getElementById("closeModal")
    .onclick =
    () =>
        document
            .getElementById("modal")
            .classList.add("hidden");
function goProfile() {
    window.location.href =
        "../perfil/perfil.html";
}
function goPacks() {
    window.location.href =
        "../pacotes/pacotes.html";
}
function goTrades() {
   window.location.href =
        "../trocas/trades.html";
}