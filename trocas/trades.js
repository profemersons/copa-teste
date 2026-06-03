const player = JSON.parse(localStorage.getItem("player"));

if (!player) {
    window.location.href = "../index.html";
}

let selectedSticker = null;
let friend = null;

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
    await loadStickers();

    document.getElementById("loading").style.display = "none";
    document.getElementById("app").style.display = "block";
}

/* =========================
PASSO 1 - ÁLBUM
========================= */

async function loadStickers() {

    const { data: inventory } = await client
        .from("inventory")
        .select("*")
        .eq("player_id", player.id);

    const { data: stickers } = await client
        .from("stickers")
        .select("*")
        .order("global_number");

    const ownedMap = {};

    inventory.forEach(item => {
        ownedMap[item.sticker_id] = item.quantity;
    });

    const container =
        document.getElementById("albumContainer");

    container.innerHTML = "";

    areasOrder.forEach(area => {

        const areaStickers =
            stickers.filter(
                s => s.area === area
            );

        if (!areaStickers.length) return;

        const section =
            document.createElement("section");

        section.className = "area";

        section.innerHTML = `
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

            if (!qty) return;

            const card =
                document.createElement("div");

            card.className = "card";

            card.innerHTML = `
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
            `;

            card.onclick = () => {
                selectedSticker = sticker;
                goStep2();
            };

            grid.appendChild(card);

        });

        if (grid.children.length > 0) {
            container.appendChild(section);
        }

    });

}

/* =========================
PASSO 2
========================= */

function goStep2() {
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";

    document.getElementById("stepText").innerText = "2. Escolha o amigo";
}

/* =========================
BUSCAR AMIGO
========================= */

async function searchFriend() {

    const code = document.getElementById("friendCode").value.trim();

    if (!code) return;

    if (code === player.code) {
        alert("Você não pode trocar consigo mesmo.");
        return;
    }

    const { data } = await client
        .from("players")
        .select("*")
        .eq("code", code)
        .single();

    if (!data) {
        alert("Amigo não encontrado");
        return;
    }

    friend = data;

    document.getElementById("friendResult").style.display = "block";
    document.getElementById("friendResult").innerHTML = `
        <h3>${data.emoji} ${data.name}</h3>
        <p>${data.turma_area}</p>
    `;

    document.getElementById("pinArea").style.display = "block";
}

/* =========================
CONFIRMAR TROCA
========================= */

async function confirmTrade() {

    if (!friend || !selectedSticker) {
        return;
    }

    const pin =
        document.getElementById("pinInput")
            .value
            .trim();

    if (!pin) {

        alert(
            "Digite seu PIN."
        );

        return;
    }

    const { data: me } =
        await client
            .from("players")
            .select("*")
            .eq("id", player.id)
            .single();

    if (!me) {

        alert(
            "Erro ao validar usuário."
        );

        return;
    }

    if (pin !== me.pin) {

        alert(
            "PIN incorreto."
        );

        return;
    }

    if (friend.code === player.code) {

        alert(
            "Troca inválida."
        );

        return;
    }

    // REMOVE DO PLAYER

    const { data: inv } =
        await client
            .from("inventory")
            .select("*")
            .eq("player_id", player.id)
            .eq("sticker_id", selectedSticker.id)
            .single();

    if (inv.quantity > 1) {

        await client
            .from("inventory")
            .update({
                quantity:
                    inv.quantity - 1
            })
            .eq("id", inv.id);

    } else {

        await client
            .from("inventory")
            .delete()
            .eq("id", inv.id);
    }

    // ADICIONA NO AMIGO

    const {
        data: friendInv
    } =
        await client
            .from("inventory")
            .select("*")
            .eq(
                "player_id",
                friend.id
            )
            .eq(
                "sticker_id",
                selectedSticker.id
            )
            .maybeSingle();

    if (friendInv) {

        await client
            .from("inventory")
            .update({
                quantity:
                    friendInv.quantity + 1
            })
            .eq(
                "id",
                friendInv.id
            );

    } else {

        await client
            .from("inventory")
            .insert([
                {
                    player_id:
                        friend.id,

                    sticker_id:
                        selectedSticker.id,

                    quantity: 1
                }
            ]);
    }

    alert(
        "Troca realizada com sucesso! 🎉"
    );

    location.reload();
}

/* =========================
NAV
========================= */

function goAlbum() {
    window.location.href = "../album/album.html";
}

function goPacks() {
    window.location.href = "../packs/pacotes.html";
}

function goMissions() {
    window.location.href = "../missions/missions.html";
}

function goTrades() {
    window.location.reload();
}

function goProfile() {
    window.location.href = "../perfil/perfil.html";
}