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
}

document
    .getElementById("addFriendBtn")
    .onclick = () => {

    alert(
        "Funcionalidade será liberada em breve."
    );
};

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