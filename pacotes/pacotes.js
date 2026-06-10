// ⚠️ REMOVER ANTES DA COPA
const DEV_MODE = true;

const player =
    JSON.parse(
        localStorage.getItem("player")
    );

if (!player) {
    window.location.href =
        "../index.html";
}

let packsRemaining = 3;

init();

async function init() {

    await loadTodayStatus();

    document.getElementById(
        "loading"
    ).style.display = "none";

    document.getElementById(
        "app"
    ).style.display = "block";
}

async function loadTodayStatus() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    const { data } =
        await client
            .from("pack_openings")
            .select("*")
            .eq(
                "player_id",
                player.id
            );

    const todayOpenings =
        (data || []).filter(
            p =>
                p.created_at &&
                p.created_at.startsWith(today)
        );
    //APAGAR DEPOIS TESTE
    packsRemaining = DEV_MODE
        ? 9999
        : 3 - todayOpenings.length;
    //APAGAR DEPOIS TESTE
    /*
        packsRemaining =
            3 - todayOpenings.length;
    
        if (packsRemaining < 0) {
            packsRemaining = 0;
        }
    */
    updateUI();
}

function updateUI() {

    document.getElementById(
        "remainingText"
    ).textContent =
        `📦 Pacotes disponíveis hoje: ${packsRemaining}/3`;

    const packs =
        document.querySelectorAll(
            ".pack"
        );

    packs.forEach(
        (pack, index) => {

            if (
                index >= packsRemaining
            ) {

                pack.classList.add(
                    "used"
                );

            } else {

                pack.classList.remove(
                    "used"
                );
            }
        }
    );
}

document
    .querySelectorAll(".pack")
    .forEach(pack => {

        pack.onclick =
            () => openPack();

    });

async function openPack() {

    const now = new Date();

    const hour =
        now.getHours();

    if (hour < 7) {

        alert(
            "Os pacotes só podem ser abertos após as 7h da manhã."
        );

        return;
    }

    if (
        packsRemaining <= 0
    ) {

        alert(
            "Você já abriu todos os pacotes de hoje."
        );

        return;
    }

    const { data: commons } =
        await client
            .from("stickers")
            .select("*")
            .eq(
                "type",
                "common"
            );

    const rewards = [];

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const sticker =
            commons[
            Math.floor(
                Math.random() *
                commons.length
            )
            ];

        const isShiny =
            Math.random() < 0.10; // TESTE

        rewards.push({
            ...sticker,
            is_shiny: isShiny
        });

        await addToInventory(
            sticker.id,
            isShiny
        );


    }

    await client
        .from("pack_openings")
        .insert([
            {
                player_id:
                    player.id,
                pack_size: 4
            }
        ]);

    packsRemaining--;

    updateUI();

    showRewards(
        rewards
    );
}

async function addToInventory(
    stickerId,
    isShiny
) {

    const {
        data: existing
    } =
        await client
            .from(
                "inventory"
            )
            .select("*")
            .eq(
                "player_id",
                player.id
            )
            .eq(
                "sticker_id",
                stickerId
            )
            .eq(
                "is_shiny",
                isShiny
            )
            .maybeSingle();

    if (existing) {

        await client
            .from(
                "inventory"
            )
            .update({
                quantity:
                    existing.quantity +
                    1
            })
            .eq(
                "id",
                existing.id
            );

    } else {

        await client
            .from(
                "inventory"
            )
            .insert([
                {
                    player_id:
                        player.id,
                    sticker_id:
                        stickerId,
                    is_shiny:
                        isShiny,
                    quantity: 1
                }
            ]);
    }
}

function showRewards(rewards) {

    const container =
        document.getElementById("resultContainer");

    container.innerHTML = "";

    const modal =
        document.getElementById("modal");

    modal.classList.remove("hidden");

    let i = 0;

    function showNext() {

        if (i >= rewards.length) return;

        const sticker = rewards[i];

        const div = document.createElement("div");

        div.className = "reward";

        div.innerHTML = `
            <div class="reward-emoji">
    ${sticker.emoji}
</div>

${sticker.is_shiny
                ? `<div class="reward-shiny">
         ⭐ BRILHANTE
       </div>`
                : ""
            }

            <div>
                ${sticker.profession}
            </div>
        `;

        container.appendChild(div);

        // vibração leve (mobile)
        if (navigator.vibrate) {
            navigator.vibrate(40);
        }

        i++;

        setTimeout(showNext, 600);
    }

    showNext();
}
function goAlbum() {

    window.location.href =
        "../album/album.html";
}

function goProfile() {

    window.location.href =
        "../perfil/perfil.html";
}

//talvez apagar aqui embaixo

function bindCloseButton() {
    const btn = document.getElementById("closeResult");

    if (!btn) return;

    btn.addEventListener("click", () => {
        document.getElementById("modal").classList.add("hidden");
    });
}
bindCloseButton();