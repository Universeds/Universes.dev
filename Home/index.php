

<?php
require_once '../vendor/autoload.php';
use GeoIp2\Database\Reader;

$reader = new Reader('../maxmind-db/GeoLite2-City.mmdb');
$user_ip = $_SERVER['REMOTE_ADDR'];

try {
    $record = $reader->city($user_ip);
    if ($record->country->isoCode === 'FR') {
        header('Location: forbidden.html');
        exit;
    } else {
        $country = $record->country->name;
    }
} catch (Exception $e) {
    $country = 'Unknown';
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Cozy Portfolio</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
<body>
    <header>
        <h1 class="float-text"> Uni's Portfolio</h1>
        <p>Your country is: <?php echo $country; ?></p>

        <nav>
            <ul>
                <li><a class="float-text">About</a></li>
                <li class="dropdown">
                    <a class="float-text">Contact</a>
                    <ul class="dropdown-content">
                        <li>
                            <a href="mailto:biguniversess@gmail.com" class="email-link">
                                <i class="fas fa-envelope"></i>
                                <span class="original-text">&ensp;Email</span>
                                <span class="hover-text">&ensp;&ensp;&ensp;Biguniversess@gmail.com</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://discord.com/users/Biguniverses" class="discord-link">
                                <i class="fab fa-discord"></i>
                                <span class="hover-text">&ensp;    &emsp;Biguniverses</span>
                                <span class="original-text">&ensp;Discord</span>
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="portfolio">
            <h2 class="float-text">My Work :></h2>
            <div class="portfolio-frame">
                <div class="portfolio-grid">
                    <div class="portfolio-item" data-title="Project One">
                        <h3>Project One</h3>
                        <p>Short description...</p>
                    </div>
                    <div class="portfolio-item" data-title="Project Two">
                        <h3>Project Two</h3>
                        <p>Short description...</p>
                    </div>
                    <div class="portfolio-item" data-title="Project Three">
                        <h3>Project Three</h3>
                        <p>Short description...</p>
                    </div>
                    <div class="portfolio-item" data-title="Project Four">
                        <h3>Project Four</h3>
                        <p>Short description...</p>
                    </div>
                    <div class="portfolio-item" data-title="Project Five">
                        <h3>Project Five</h3>
                        <p>Short description...</p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <p>Made with <span class="heart">&#10084;</span> by Universe</p>
    </footer>

    <div id="portfolioModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3 id="modalTitle"></h3>
            <p id="modalDescription"></p>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
