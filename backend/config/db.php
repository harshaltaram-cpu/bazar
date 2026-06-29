<?php
// database connection setup
$host = 'localhost';
$db   = 'laxmibazar'; // change this
$user = 'root'; // change if necessary
$pass = ''; // change if necessary

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Fetch all games
$stmt = $pdo->query("SELECT * FROM lucky_numbers");
$games = $stmt->fetchAll(PDO::FETCH_ASSOC);

// You can now loop through $games to build your HTML table
foreach ($games as $game) {
    echo "Game: " . $game['game_name'] . " | Open: " . $game['open_lucky_number'] . " | Close: " . $game['close_lucky_number'] . "<br>";
}
?>

<?php
// Assuming you receive these variables from your admin panel form submission ($_POST)
$game_id = 1; // Example: 1 is MAHAKALYAN
$new_open = '1-2-3-4';
$new_close = '5-6-7-8';

// Update the specific game
$sql = "UPDATE lucky_numbers SET open_lucky_number = ?, close_lucky_number = ? WHERE id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$new_open, $new_close, $game_id]);

echo "Lucky numbers updated successfully!";
?>