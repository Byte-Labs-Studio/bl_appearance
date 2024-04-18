

CREATE TABLE IF NOT EXISTS `appearance` (
    `id` varchar(100) NOT NULL,
    `skin` longtext DEFAULT NULL,
    `clothes` longtext DEFAULT NULL,
    `tattoos`  longtext DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `outfits` (
    `id` int NOT NULL AUTO_INCREMENT,
    `player_id` varchar(100) NOT NULL,
    `label` varchar(100) NOT NULL,
    `outfit` longtext DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;