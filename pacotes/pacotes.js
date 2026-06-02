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


    const todayOpenings = (data || []).filter(p =>
        p.created_at &&
        p.created_at.startsWith(today)
    );

    packsRemaining = DEV_MODE
        ? 3
        : 3 - todayOpenings.length;

    /*
const todayOpenings =
(data || []).filter(
    p =>
        p.opened_at.startsWith(
            today
        )
);

packsRemaining =
3 - todayOpenings.length;
*/

    updateUI();
}

function updateUI() {

    document.getElementById(
        "remainingText"
    ).textContent =
        `Você ainda pode abrir ${packsRemaining} pacote(s) hoje`;

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
        i < 3;
        i++
    ) {

        const sticker =
            commons[
            Math.floor(
                Math.random() *
                commons.length
            )
            ];

        rewards.push(
            sticker
        );

        await addToInventory(
            sticker.id
        );
    }

    await client
        .from(
            "pack_openings"
        )
        .insert([
            {
                player_id:
                    player.id,
                pack_size: 3
            }
        ]);

    packsRemaining--;

    updateUI();

    showRewards(
        rewards
    );
}

async function addToInventory(
    stickerId
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