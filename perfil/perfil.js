const player = JSON.parse(
    localStorage.getItem("player")
);

if (!player) {
    window.location.href = "../index.html";
}

init();

async function init() {

    fillPlayer();

    generateQr();

    await loadStats();

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

    document.getElementById("playerCode").textContent =
        player.code;

    document.getElementById("pointsCount").textContent =
        player.points || 0;
}

function generateQr() {

    new QRCode(
        document.getElementById("qrcode"),
        {
            text: player.code,
            width: 180,
            height: 180
        }
    );
}

async function loadStats() {

    const { data: inventory } =
        await client
            .from("inventory")
            .select("*")
            .eq("player_id", player.id);

    const unique =
        inventory?.length || 0;

    const total =
        inventory?.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        ) || 0;

    document.getElementById(
        "uniqueStickers"
    ).textContent = unique;

    document.getElementById(
        "totalStickers"
    ).textContent = total;

    const { data: friends } =
        await client
            .from("friends")
            .select("*");

    const friendCount =
        friends?.filter(
            f =>
                f.player_a === player.id ||
                f.player_b === player.id
        ).length || 0;

    document.getElementById(
        "friendsCount"
    ).textContent =
        friendCount;

    const { data: trades } =
        await client
            .from("trades")
            .select("*");

    const tradeCount =
        trades?.filter(
            t =>
                t.from_player === player.id ||
                t.to_player === player.id
        ).length || 0;

    document.getElementById(
        "tradesCount"
    ).textContent =
        tradeCount;
    document.getElementById(
        "friendsCountCard"
    ).textContent = friendCount;
    document.getElementById(
        "friendsCount"
    ).textContent =
        friendCount;
}

document
    .getElementById("addFriendBtn")
    .onclick = () => {

        document
            .getElementById("friendModal")
            .classList.remove("hidden");

    };
function closeFriendModal() {

    document
        .getElementById("friendModal")
        .classList.add("hidden");

}

document
    .getElementById("logoutBtn")
    .onclick = () => {

        localStorage.removeItem(
            "player"
        );

        window.location.href =
            "../index.html";
    };

function goAlbum() {

    window.location.href =
        "../album/album.html";
}
function goPacks() {
    window.location.href =
        "../pacotes/pacotes.html";
}

/* =========================
AMIGOS
========================= */

async function addFriend() {

    const code =
        document
            .getElementById("friendCode")
            .value
            .trim()
            .toUpperCase();

    if (!code) {
        alert("Digite um código.");
        return;
    }

    if (code === player.code) {
        alert("Você não pode adicionar a si mesmo.");
        return;
    }

    const { data: friend } =
        await client
            .from("players")
            .select("*")
            .eq("code", code)
            .single();

    if (!friend) {
        alert("Jogador não encontrado.");
        return;
    }

    const { data: existing } =
        await client
            .from("friends")
            .select("*");

    const already =
        existing.some(f =>
            (f.player_a === player.id &&
                f.player_b === friend.id)
            ||
            (f.player_a === friend.id &&
                f.player_b === player.id)
        );

    if (already) {
        alert("Esse amigo já foi adicionado.");
        return;
    }

    await client
        .from("friends")
        .insert([{
            player_a: player.id,
            player_b: friend.id
        }]);

    alert(`Agora você é amigo de ${friend.name}!`);

    closeFriendModal();

    await loadStats();
}

function closeFriendModal() {

    document
        .getElementById("friendModal")
        .classList.add("hidden");
}

/*ver lista de amigos*/


document
    .getElementById("viewFriendsBtn")
    .onclick = async () => {

        await loadFriendsList();

        document
            .getElementById("friendsListModal")
            .classList.remove("hidden");

    };
function closeFriendsList() {

    document
        .getElementById("friendsListModal")
        .classList.add("hidden");

}
async function loadFriendsList() {

    const container =
        document.getElementById("friendsList");

    container.innerHTML = "Carregando...";

    const { data: friendships } =
        await client
            .from("friends")
            .select("*");

    const myFriends =
        friendships.filter(f =>
            f.player_a === player.id ||
            f.player_b === player.id
        );

    container.innerHTML = "";

    if (!myFriends.length) {

        container.innerHTML =
            "<p>Você ainda não possui amigos cadastrados.</p>";

        return;
    }

    for (const item of myFriends) {

        const friendId =
            item.player_a === player.id
                ? item.player_b
                : item.player_a;

        const { data: friend } =
            await client
                .from("players")
                .select("*")
                .eq("id", friendId)
                .single();

        const { data: inventory } =
            await client
                .from("inventory")
                .select("id")
                .eq("player_id", friendId);

        const unique =
            inventory?.length || 0;

        const div =
            document.createElement("div");

        div.className = "friend-item";

        div.innerHTML = `
    <h4>${friend.emoji} ${friend.name}</h4>

    <p>${friend.turma_area}</p>

    <p>📖 ${unique} figurinhas únicas</p>

    <p>🏆 ${friend.points || 0} pontos</p>

    <button onclick="removeFriend('${item.id}')">
        ❌ Remover amigo
    </button>
`;

        container.appendChild(div);
    }
}
async function removeFriend(friendshipId) {

    const confirmDelete =
        confirm(
            "Deseja realmente remover este amigo?"
        );

    if (!confirmDelete) return;

    const { error } =
        await client
            .from("friends")
            .delete()
            .eq("id", friendshipId);

    if (error) {

        alert(
            "Erro ao remover amigo."
        );

        return;
    }

    alert(
        "Amizade removida."
    );

    await loadStats();

    await loadFriendsList();
}