-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 14, 2017 at 08:24 PM
-- Server version: 10.2.7-MariaDB
-- PHP Version: 5.5.38

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gezc_db_strt_local`
--
CREATE DATABASE IF NOT EXISTS `gezc_db_strt_local` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `gezc_db_strt_local`;

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`gezc_db_strt_local`@`localhost` PROCEDURE `ControleStartlijstFlarm` (IN `ControleDatum` DATE)  BEGIN
	DROP TABLE IF EXISTS links1;
	CREATE TEMPORARY TABLE  links1 ( 
		`SA_ID` BIGINT NULL ,
		`FLARM_ID` INT NULL );

	INSERT INTO links1
	SELECT ID, (
		SELECT
			flarm.ID AS FLARM_ID
		FROM flarm_view as flarm
		WHERE 
			((sl.DATUM = flarm.DATUM) and 
			(flarm.VLIEGTUIG_ID = sl.VLIEGTUIG_ID) AND
			((abs(time_to_sec(timediff(`sl`.`STARTTIJD`,`flarm`.`STARTTIJD`))) < 5*60) OR (abs(time_to_sec(timediff(`sl`.`LANDINGSTIJD`,`flarm`.`LANDINGSTIJD`))) < 5*60)))
		LIMIT 0,1
	)
	FROM 
		oper_startlijst as sl
	WHERE
		sl.VERWIJDERD != 1 AND
		sl.STARTTIJD is not null AND
		COALESCE(sl.SOORTVLUCHT_ID,0) != 815 AND
		sl.DATUM = ControleDatum;

	DROP TABLE IF EXISTS links2;
	CREATE TEMPORARY TABLE  links2 ( 
		`SA_ID` BIGINT NULL ,
		`FLARM_ID` INT NULL );

	INSERT INTO links2
	SELECT ID, (
		SELECT
			flarm.ID AS FLARM_ID
		FROM flarm_view as flarm
		WHERE 
			((sl.DATUM = flarm.DATUM) and 
			(flarm.VLIEGTUIG_ID = sl.VLIEGTUIG_ID) AND
			((abs(time_to_sec(timediff(`sl`.`STARTTIJD`,`flarm`.`STARTTIJD`))) < 5*60) OR (abs(time_to_sec(timediff(`sl`.`LANDINGSTIJD`,`flarm`.`LANDINGSTIJD`))) < 5*60)))
		LIMIT 0,1
	)
	FROM 
		oper_startlijst as sl
	WHERE
		sl.VERWIJDERD != 1 AND
		sl.STARTTIJD is not null AND
		COALESCE(sl.SOORTVLUCHT_ID,0) != 815 AND
		sl.DATUM = ControleDatum;


	DROP TABLE IF EXISTS ControleStartlijstFlarm;
	CREATE TEMPORARY TABLE  ControleStartlijstFlarm ( 
		`SA_ID` BIGINT NULL ,
		`DAGNUMMER` INT NULL ,
		`SA_REG_CALL` VARCHAR(25) NULL ,
		`SA_VLIEGTUIG_ID` INT NULL ,
		`SA_VLIEGERNAAM` VARCHAR(300) NULL ,
		`SA_INZITTENDENAAM` VARCHAR(300) NULL ,
		`SA_STARTTIJD` VARCHAR(10) NULL ,
		`SA_LANDINGSTIJD` VARCHAR(10) NULL ,
		`SA_DUUR` VARCHAR(10) NULL ,
        `SA_SOORTVLUCHT` VARCHAR(75) NULL ,
        `SA_STARTMETHODE` VARCHAR(75) NULL ,
		`FLARM_ID` INT NULL ,
		`FLARM_STARTTIJD` VARCHAR(10) NULL ,
		`FLARM_LANDINGSTIJD` VARCHAR(10) NULL ,
		`FLARM_CODE` VARCHAR(6) NULL ,
		`FLARM_VLIEGTUIG_ID` INT NULL ,
		`FLARM_REG_CALL` VARCHAR(25) NULL ,
		`FLARM_BAAN` VARCHAR(25) NULL ,
		`dSTARTTIJD` INT NULL ,
		`dLANDINGSTIJD` INT NULL,
		`VLIEGER_LIDTYPE_ID` INT NULL) ;

	INSERT INTO ControleStartlijstFlarm
	SELECT
		slv.ID AS SA_ID, 
		slv.DAGNUMMER, 
		RegCall(sl.VLIEGTUIG_ID) AS SA_REG_CALL,
		slv.VLIEGTUIG_ID AS SA_VLIEGTUIG_ID,
		slv.VLIEGERNAAM AS SA_VLIEGERNAAM,
		slv.INZITTENDENAAM AS SA_INZITTENDENAAM,
		slv.STARTTIJD AS SA_STARTTIJD,
		slv.LANDINGSTIJD AS SA_LANDINGSTIJD,
		slv.DUUR AS SA_DUUR,
        slv.SOORTVLUCHT AS SA_SOORTVLUCHT,
        slv.STARTMETHODE AS SA_STARTMETHODE,
		flarm.ID AS FLARM_ID,
		flarm.STARTTIJD AS FLARM_STARTTIJD,
		flarm.LANDINGSTIJD AS FLARM_LANDINGSTIJD,
		flarm.FLARM_CODE,
		flarm.VLIEGTUIG_ID AS FLARM_VLIEGTUIG_ID,
		flarm.REG_CALL AS FLARM_REG_CALL,
		flarm.BAAN AS FLARM_BAAN,

		abs(time_to_sec(timediff(`sl`.`STARTTIJD`,`flarm`.`STARTTIJD`))) AS dSTARTTIJD,
		abs(time_to_sec(timediff(`sl`.`LANDINGSTIJD`,`flarm`.`LANDINGSTIJD`))) AS dLANDINGSTIJD,
        
		rl.LIDTYPE_ID AS VLIEGER_LIDTYPE_ID

	FROM startlijst_view as slv
		JOIN oper_startlijst as sl on (slv.ID = sl.ID)
		LEFT JOIN links1 as links on (sl.ID = links.SA_ID)
		LEFT JOIN flarm_view as flarm on (links.FLARM_ID = flarm.ID)
        LEFT JOIN ref_leden as rl on (slv.VLIEGER_ID = rl.ID)

	where
		sl.STARTTIJD is not null AND
		COALESCE(sl.SOORTVLUCHT_ID,0) != 815 AND
		sl.DATUM = ControleDatum

	UNION

	SELECT
		slv.ID AS SA_ID, 
		slv.DAGNUMMER, 
		RegCall(sl.VLIEGTUIG_ID) AS SA_REG_CALL,
		slv.VLIEGTUIG_ID AS SA_VLIEGTUIG_ID,
		slv.VLIEGERNAAM AS SA_VLIEGERNAAM,
		slv.INZITTENDENAAM AS SA_INZITTENDENAAM,
		slv.STARTTIJD AS SA_STARTTIJD,
		slv.LANDINGSTIJD AS SA_LANDINGSTIJD,
		slv.DUUR AS SA_DUUR,
        slv.SOORTVLUCHT AS SA_SOORTVLUCHT,
        slv.STARTMETHODE AS SA_STARTMETHODE,        
		flarm.ID AS FLARM_ID,
		flarm.STARTTIJD AS FLARM_STARTTIJD,
		flarm.LANDINGSTIJD AS FLARM_LANDINGSTIJD,
		flarm.FLARM_CODE,
		flarm.VLIEGTUIG_ID AS FLARM_VLIEGTUIG_ID,
		flarm.REG_CALL AS FLARM_REG_CALL,
		flarm.BAAN AS FLARM_BAAN,

		abs(time_to_sec(timediff(`sl`.`STARTTIJD`,`flarm`.`STARTTIJD`))) AS dSTARTTIJD,
		abs(time_to_sec(timediff(`sl`.`LANDINGSTIJD`,`flarm`.`LANDINGSTIJD`))) AS dLANDINGSTIJD,
        
		rl.LIDTYPE_ID AS VLIEGER_LIDTYPE_ID

	FROM flarm_view as flarm
		LEFT JOIN links2 as links on (flarm.ID = links.FLARM_ID)
		LEFT JOIN oper_startlijst as sl on (links.SA_ID = sl.ID)
		LEFT JOIN startlijst_view as slv on (links.SA_ID = slv.ID)
		LEFT JOIN ref_leden as rl on (slv.VLIEGER_ID = rl.ID)

	where
		slv.ID IS NULL AND 
		flarm.DATUM = ControleDatum;
END$$

--
-- Functions
--
CREATE DEFINER=`gezc_db_strt_local`@`localhost` FUNCTION `LidAanwezigGeweestVandaag` (`vID` INT) RETURNS INT(1) BEGIN
	DECLARE r INT;

        SET r = (select count(*)
            from `oper_aanwezig` as `a` 
            where 
            (
                (`a`.`LID_ID` = vID) and 
                (`a`.`DATUM` = cast(now() as date))
            )
        );
        
RETURN r;

END$$

CREATE DEFINER=`gezc_db_strt_local`@`localhost` FUNCTION `LidAanwezigVandaag` (`vID` INT) RETURNS INT(1) BEGIN
	DECLARE r INT;

        SET r = (select count(*)
            from `oper_aanwezig` as `a` 
            where 
            (
                (`a`.`LID_ID` = vID) and 
                (`a`.`AANKOMST` is not null) and 
                isnull(`a`.`VERTREK`) and 
                (`a`.`DATUM` = cast(now() as date))
            )
        );
        
RETURN r;

END$$

CREATE DEFINER=`gezc_db_strt_local`@`localhost` FUNCTION `LidVliegt` (`ID` INT) RETURNS TIME BEGIN
        RETURN 
        (
            select 
                STARTTIJD
            from 
                oper_startlijst
            where
            (
                ((VLIEGER_ID = ID) or (INZITTENDE_ID = ID)) and 
                (STARTTIJD is not null) and 
                isnull(LANDINGSTIJD) and 
                (DATUM = cast(now() as date))
            )
            ORDER BY STARTTIJD LIMIT 1
        );
        

END$$

CREATE DEFINER=`gezc_db_strt_local`@`localhost` FUNCTION `RegCall` (`vID` INT) RETURNS VARCHAR(25) CHARSET utf8 BEGIN
	DECLARE r varchar(25);

		IF (vID = NULL) THEN
			SET r = NULL; 
		ELSE
			SET r = (
				select concat(ifnull(`v`.`REGISTRATIE`,''),' (',ifnull(`v`.`CALLSIGN`,''),')') 
					from ref_vliegtuigen as v
				where ID = vID
			);
        END IF;

		RETURN r;
END$$

CREATE DEFINER=`gezc_db_strt_local`@`localhost` FUNCTION `vergelijk` (`s1` VARCHAR(255), `s2` VARCHAR(255)) RETURNS INT(11) BEGIN
DECLARE s1_len, s2_len, i, j, c, c_temp, cost INT;
DECLARE s1_char CHAR;
-- max strlen=255
DECLARE cv0, cv1 VARBINARY(256);
SET s1_len = CHAR_LENGTH(s1), s2_len = CHAR_LENGTH(s2), cv1 = 0x00, j = 1, i = 1, c = 0;
IF s1 = s2 THEN
RETURN 0;
ELSEIF s1_len = 0 THEN
RETURN s2_len;
ELSEIF s2_len = 0 THEN
RETURN s1_len;
ELSE
WHILE j <= s2_len DO
SET cv1 = CONCAT(cv1, UNHEX(HEX(j))), j = j + 1;
END WHILE;
WHILE i <= s1_len DO
SET s1_char = SUBSTRING(s1, i, 1), c = i, cv0 = UNHEX(HEX(i)), j = 1;
WHILE j <= s2_len DO
SET c = c + 1;
IF s1_char = SUBSTRING(s2, j, 1) THEN
SET cost = 0; ELSE SET cost = 1;
END IF;
SET c_temp = CONV(HEX(SUBSTRING(cv1, j, 1)), 16, 10) + cost;
IF c > c_temp THEN SET c = c_temp; END IF;
SET c_temp = CONV(HEX(SUBSTRING(cv1, j+1, 1)), 16, 10) + 1;
IF c > c_temp THEN
SET c = c_temp;
END IF;
SET cv0 = CONCAT(cv0, UNHEX(HEX(c))), j = j + 1;
END WHILE;
SET cv1 = cv0, i = i + 1;
END WHILE;
END IF;
RETURN c;
END$$

CREATE DEFINER=`gezc_db_strt_local`@`localhost` FUNCTION `VliegerStartlijstVandaag` (`ID` INT) RETURNS INT(11) BEGIN
	RETURN  (
		SELECT COUNT(*)
		FROM
			`oper_startlijst` as `sl`
		WHERE 
		 (`sl`.`DATUM` = CAST(NOW() AS DATE)) AND `VLIEGER_ID` = ID
	);
END$$

CREATE DEFINER=`gezc_db_strt_local`@`localhost` FUNCTION `VliegerVliegtijdVandaag` (`ID` INT) RETURNS TIME BEGIN
	RETURN  (
		SELECT SUM(
			TIMEDIFF(IFNULL(`sl`.`LANDINGSTIJD`, CURTIME()), `sl`.`STARTTIJD`))
		FROM
			`oper_startlijst` as `sl`
		WHERE 
		 (`sl`.`DATUM` = CAST(NOW() AS DATE)) AND `VLIEGER_ID` = ID
	);
END$$

CREATE DEFINER=`gezc_db_strt_local`@`localhost` FUNCTION `VliegtuigAanwezigVandaag` (`vID` INT) RETURNS INT(1) BEGIN
	DECLARE r INT;

        SET r = (select count(*)
            from `oper_aanwezig` as `a` 
            where 
            (
                (`a`.`VLIEGTUIG_ID` = vID) and 
                (`a`.`AANKOMST` is not null) and 
                isnull(`a`.`VERTREK`) and 
                (`a`.`DATUM` = cast(now() as date))
            )
        );
        
RETURN r;

END$$

CREATE DEFINER=`gezc_db_strt_local`@`localhost` FUNCTION `VliegtuigOverland` (`ID` INT) RETURNS INT(11) BEGIN
        RETURN 
        (
            SELECT 
                count(*)
            FROM
                oper_startlijst JOIN
                oper_aanwezig ON oper_startlijst.vlieger_id = oper_aanwezig.lid_id
            WHERE
                (oper_startlijst.DATUM = cast(now() as date)) AND
                oper_startlijst.vliegtuig_id = ID AND 
                oper_startlijst.vliegtuig_id = oper_aanwezig.voorkeur_vliegtuig_id AND
                starttijd IS NOT NULL AND 
                landingstijd IS NULL
            ORDER BY 
                starttijd DESC 

        );
        

END$$

CREATE DEFINER=`gezc_db_strt_local`@`localhost` FUNCTION `VliegtuigVliegt` (`ID` INT) RETURNS VARCHAR(6) CHARSET utf8 BEGIN RETURN (
SELECT TIME_FORMAT( TIMEDIFF( CURTIME( ) , STARTTIJD ) ,  '%H:%i' ) AS VLIEGTIJD
FROM oper_startlijst
WHERE (
(
VLIEGTUIG_ID = ID
)
AND (
STARTTIJD IS NOT NULL
)
AND ISNULL( LANDINGSTIJD ) 
AND (
DATUM = CAST( NOW( ) AS DATE )
)
)
ORDER BY STARTTIJD
LIMIT 1
);
END$$

CREATE DEFINER=`gezc_db_strt_local`@`localhost` FUNCTION `VoorkeurType` (`csv` VARCHAR(50)) RETURNS VARCHAR(50) CHARSET utf8 BEGIN
        RETURN (
            SELECT GROUP_CONCAT(CODE) AS x FROM types WHERE TYPEGROUP_ID = 4 AND csv LIKE CONCAT('%',ID,'%') 
        );
        

END$$

CREATE DEFINER=`gezc_db_strt_local`@`localhost` FUNCTION `Wachttijd` (`LidID` INT) RETURNS TIME BEGIN
        RETURN (
            SELECT 
				CASE WHEN LidVliegt(`a`.`LID_ID`) IS NULL
				THEN ifnull(WLS,timediff(curtime(),AANKOMST))
				ELSE null END AS `WACHTTIJD` 
            FROM 
                oper_aanwezig a  left join
                (select
                        VLIEGER_ID, timediff(curtime(),LANDINGSTIJD) AS WLS  -- wachtijd sind laatste start
                    from 
                        oper_startlijst
                    where
                    ( 
                        (STARTTIJD is not null) and 
                        (DATUM = cast(now() as date))
                    )
                    ORDER BY STARTTIJD DESC
                    LIMIT 1) AS S ON S.VLIEGER_ID = a.LID_ID
            WHERE 
                (a.LID_ID = LidID) and 
                (a.AANKOMST is not null) and 
                isnull(a.VERTREK) and 
                (a.DATUM = cast(now() as date)) 
        );
        
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `dagoverzicht_view`
-- (See below for the actual view)
--
CREATE TABLE `dagoverzicht_view` (
`ID` mediumint(8)
,`NAAM` varchar(255)
,`DATUM` date
,`OPMERKING` varchar(100)
,`DDWV_VOORAANMELDING` int(1)
,`STARTS` bigint(21)
,`VLIEGER` bigint(21)
,`INZITTENDE` bigint(21)
,`DDWV` bigint(21)
,`SLEEP` bigint(21)
,`OPREKENING` bigint(21)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `flarm_view`
-- (See below for the actual view)
--
CREATE TABLE `flarm_view` (
`ID` int(11)
,`DATUM` date
,`FLARM_CODE` varchar(6)
,`VLIEGTUIG_ID` mediumint(8)
,`REG_CALL` varchar(25)
,`STARTTIJD` time
,`LANDINGSTIJD` time
,`BAAN` varchar(75)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `invoer_vliegtuigen_view`
-- (See below for the actual view)
--
CREATE TABLE `invoer_vliegtuigen_view` (
`ID` mediumint(8)
,`REG_CALL` varchar(25)
,`ZITPLAATSEN` tinyint(1)
,`TMG` int(1)
,`SLEEPKIST` int(1)
,`ZELFSTART` int(1)
,`TYPE_ID` mediumint(6)
,`CLUBKIST` tinyint(1)
,`VLIEGT` varchar(6)
,`OVERLAND` int(11)
,`AANWEZIG` int(1)
,`LAATSTE_AANPASSING` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `ledenaanwezig_view`
-- (See below for the actual view)
--
CREATE TABLE `ledenaanwezig_view` (
`ID` bigint(20)
,`LID_ID` mediumint(8)
,`NAAM` varchar(255)
,`LIDTYPE_ID` mediumint(8)
,`VOORKEUR_VLIEGTUIG_TYPE` varchar(100)
,`VOORKEUR_VLIEGTUIG_ID` mediumint(8)
,`VOORKEUR_TYPE` varchar(50)
,`VOORKEUR_REGCALL` varchar(25)
,`ACTUELE_VLIEGTIJD` varchar(10)
,`AANKOMST` varchar(10)
,`VERTREK` varchar(10)
,`INSTRUCTEUR` int(1)
,`AANWEZIG` varchar(5)
,`OPMERKING` varchar(100)
,`LAATSTE_AANPASSING` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `ledenlijst_view`
-- (See below for the actual view)
--
CREATE TABLE `ledenlijst_view` (
`ID` mediumint(8)
,`NAAM` varchar(255)
,`ACHTERNAAM` varchar(30)
,`MOBIEL` varchar(255)
,`TELEFOON` varchar(255)
,`INSTRUCTEUR` int(1)
,`STARTLEIDER` int(1)
,`HEEFT_BETAALD` int(1)
,`LIERIST` int(1)
,`LIDTYPE` varchar(75)
,`LIDTYPE_ID` mediumint(8)
,`GPL_VERLOOPT` date
,`MEDICAL_VERLOOPT` date
,`AANWEZIG` int(1)
,`AANWEZIG_GEWEEST` int(1)
,`LAATSTE_AANPASSING` timestamp
);

-- --------------------------------------------------------

--
-- Table structure for table `oper_aanwezig`
--

CREATE TABLE `oper_aanwezig` (
  `ID` bigint(20) NOT NULL,
  `LID_ID` mediumint(8) DEFAULT NULL COMMENT 'FK naar ref_leden',
  `VLIEGTUIG_ID` mediumint(8) DEFAULT NULL COMMENT 'FK naar ref_vliegtuigen',
  `DATUM` date DEFAULT NULL COMMENT 'Datum van aanwezigheid',
  `AANKOMST` time DEFAULT NULL COMMENT 'Aankomsttijd',
  `VERTREK` time DEFAULT NULL COMMENT 'Vertrektijd',
  `OPMERKING` varchar(100) DEFAULT NULL,
  `DDWV_VOORAANMELDING` int(1) DEFAULT NULL,
  `VOORKEUR_VLIEGTUIG_TYPE` varchar(100) DEFAULT NULL COMMENT 'Op welk vliegtuig type wil dit vliegen?',
  `VOORKEUR_VLIEGTUIG_ID` mediumint(8) DEFAULT NULL COMMENT 'Op welk specifiek vliegtuig wil dit vliegen',
  `LAATSTE_AANPASSING` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `oper_aanwezig`
--

INSERT INTO `oper_aanwezig` (`ID`, `LID_ID`, `VLIEGTUIG_ID`, `DATUM`, `AANKOMST`, `VERTREK`, `OPMERKING`, `DDWV_VOORAANMELDING`, `VOORKEUR_VLIEGTUIG_TYPE`, `VOORKEUR_VLIEGTUIG_ID`, `LAATSTE_AANPASSING`) VALUES
(1711141000290, NULL, 290, '2017-11-14', '00:49:00', NULL, NULL, NULL, NULL, NULL, '2017-11-13 23:49:14'),
(1711142010178, 10178, NULL, '2017-11-14', '00:49:00', NULL, NULL, NULL, '403', NULL, '2017-11-13 23:49:14');

-- --------------------------------------------------------

--
-- Table structure for table `oper_daginfo`
--

CREATE TABLE `oper_daginfo` (
  `ID` mediumint(8) NOT NULL,
  `DATUM` date NOT NULL,
  `BAAN_ID` mediumint(8) DEFAULT NULL,
  `WINDRICHTING_ID` mediumint(8) DEFAULT NULL,
  `WINDKRACHT_ID` mediumint(8) DEFAULT NULL,
  `STARTMETHODE_ID` mediumint(8) DEFAULT NULL,
  `OCHTEND_DDI` varchar(200) DEFAULT NULL,
  `OCHTEND_INSTRUCTEUR` varchar(200) DEFAULT NULL,
  `OCHTEND_LIERIST` varchar(200) DEFAULT NULL,
  `OCHTEND_HULPLIERIST` varchar(200) DEFAULT NULL,
  `OCHTEND_STARTLEIDER` varchar(200) DEFAULT NULL,
  `MIDDAG_DDI` varchar(200) DEFAULT NULL,
  `MIDDAG_INSTRUCTEUR` varchar(200) DEFAULT NULL,
  `MIDDAG_LIERIST` varchar(200) DEFAULT NULL,
  `MIDDAG_HULPLIERIST` varchar(200) DEFAULT NULL,
  `MIDDAG_STARTLEIDER` varchar(200) DEFAULT NULL,
  `OPMERKINGEN` text DEFAULT NULL,
  `SOORTBEDRIJF_ID` mediumint(8) DEFAULT NULL,
  `LAATSTE_AANPASSING` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `VELD_ID` mediumint(8) NOT NULL,
  `BEDRIJF_ID` mediumint(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `oper_daginfo`
--

INSERT INTO `oper_daginfo` (`ID`, `DATUM`, `BAAN_ID`, `WINDRICHTING_ID`, `WINDKRACHT_ID`, `STARTMETHODE_ID`, `OCHTEND_DDI`, `OCHTEND_INSTRUCTEUR`, `OCHTEND_LIERIST`, `OCHTEND_HULPLIERIST`, `OCHTEND_STARTLEIDER`, `MIDDAG_DDI`, `MIDDAG_INSTRUCTEUR`, `MIDDAG_LIERIST`, `MIDDAG_HULPLIERIST`, `MIDDAG_STARTLEIDER`, `OPMERKINGEN`, `SOORTBEDRIJF_ID`, `LAATSTE_AANPASSING`, `VELD_ID`, `BEDRIJF_ID`) VALUES
(1, '2017-10-29', 102, 205, 304, 550, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 701, '2017-10-29 15:51:21', 901, 1550),
(2, '2017-11-14', 101, 201, 304, 551, 'Ygugygu', '676t7i', 'Gygygu', 'Gg6', 'Gyugyug', NULL, NULL, NULL, NULL, NULL, 'Hjhllkhj', 701, '2017-11-13 23:52:07', 901, 1553);

-- --------------------------------------------------------

--
-- Table structure for table `oper_flarm`
--

CREATE TABLE `oper_flarm` (
  `ID` int(11) NOT NULL,
  `FLARM_CODE` varchar(6) DEFAULT NULL,
  `VLIEGTUIG_ID` mediumint(8) DEFAULT NULL,
  `REG_CALL` varchar(15) DEFAULT NULL,
  `DATUM` date DEFAULT NULL,
  `STARTTIJD` time DEFAULT NULL,
  `LANDINGSTIJD` time DEFAULT NULL,
  `BAAN_ID` mediumint(9) DEFAULT NULL,
  `LAATSTE_AANPASSING` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `oper_flarm`
--

INSERT INTO `oper_flarm` (`ID`, `FLARM_CODE`, `VLIEGTUIG_ID`, `REG_CALL`, `DATUM`, `STARTTIJD`, `LANDINGSTIJD`, `BAAN_ID`, `LAATSTE_AANPASSING`) VALUES
(6080, '484B59', 296, 'PH-721 (E4)', '2016-04-24', '10:25:30', '10:30:14', NULL, '2016-04-24 08:30:17'),
(6081, '484B59', 296, 'PH-721 (E4)', '2016-04-24', '11:01:40', '11:05:18', NULL, '2016-04-24 09:05:21'),
(6082, '484781', 252, 'PH-794 (E10)', '2016-04-24', '11:05:56', '11:10:02', NULL, '2016-04-24 09:10:05'),
(6083, '484B59', 296, 'PH-721 (E4)', '2016-04-24', '11:26:25', '11:31:01', NULL, '2016-04-24 09:31:04'),
(6084, 'DD8342', NULL, NULL, '2016-04-24', NULL, '11:27:41', NULL, '2016-04-24 09:27:44'),
(6085, '484781', 252, 'PH-794 (E10)', '2016-04-24', '11:40:58', '11:44:15', NULL, '2016-04-24 09:44:18'),
(6086, '484B59', 296, 'PH-721 (E4)', '2016-04-24', '11:57:54', '12:02:52', NULL, '2016-04-24 10:02:55'),
(6087, '484781', 252, 'PH-794 (E10)', '2016-04-24', '12:06:07', '12:09:38', NULL, '2016-04-24 10:09:41'),
(6088, '484B59', 296, 'PH-721 (E4)', '2016-04-24', '12:18:04', '12:22:49', NULL, '2016-04-24 10:22:52'),
(6089, '484781', 252, 'PH-794 (E10)', '2016-04-24', '12:33:24', '12:38:36', NULL, '2016-04-24 10:38:39'),
(6090, '484B59', 296, 'PH-721 (E4)', '2016-04-24', '12:43:47', '12:49:55', NULL, '2016-04-24 10:49:58'),
(6091, '484781', 252, 'PH-794 (E10)', '2016-04-24', '12:50:00', '12:53:58', NULL, '2016-04-24 10:54:01'),
(6092, '484B59', 296, 'PH-721 (E4)', '2016-04-24', '13:05:06', '13:25:31', NULL, '2016-04-24 11:25:34'),
(6093, '484829', NULL, NULL, '2016-04-24', '13:21:55', NULL, NULL, '2016-04-24 11:21:58'),
(6094, '48483B', NULL, NULL, '2016-04-24', '13:24:31', NULL, NULL, '2016-04-24 11:24:34'),
(6095, '484B59', 296, 'PH-721 (E4)', '2016-04-24', '13:48:39', NULL, NULL, '2016-04-24 11:48:42'),
(6096, '484B59', 296, 'PH-721 (E4)', '2016-04-24', '14:07:36', NULL, NULL, '2016-04-24 12:07:39');

-- --------------------------------------------------------

--
-- Table structure for table `oper_gps`
--

CREATE TABLE `oper_gps` (
  `ID` int(11) NOT NULL,
  `DATUM` date NOT NULL,
  `LATITUDE` double NOT NULL,
  `LONGITUDE` double NOT NULL,
  `BAAN_ID` mediumint(8) DEFAULT NULL,
  `LAATSTE_AANPASSING` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `oper_rooster`
--

CREATE TABLE `oper_rooster` (
  `ID` mediumint(8) NOT NULL,
  `DATUM` date NOT NULL,
  `DDWV` int(1) NOT NULL DEFAULT 0,
  `CLUB_BEDRIJF` int(1) NOT NULL DEFAULT 1,
  `OCHTEND_DDI` mediumint(8) DEFAULT NULL,
  `OCHTEND_INSTRUCTEUR` mediumint(8) DEFAULT NULL,
  `OCHTEND_LIERIST` mediumint(8) DEFAULT NULL,
  `OCHTEND_HULPLIERIST` mediumint(8) DEFAULT NULL,
  `OCHTEND_STARTLEIDER` mediumint(8) DEFAULT NULL,
  `MIDDAG_DDI` mediumint(8) DEFAULT NULL,
  `MIDDAG_INSTRUCTEUR` mediumint(8) DEFAULT NULL,
  `MIDDAG_LIERIST` mediumint(8) DEFAULT NULL,
  `MIDDAG_HULPLIERIST` mediumint(8) DEFAULT NULL,
  `MIDDAG_STARTLEIDER` mediumint(8) DEFAULT NULL,
  `LAATSTE_AANPASSING` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `oper_startlijst`
--

CREATE TABLE `oper_startlijst` (
  `ID` bigint(20) NOT NULL,
  `DAGNUMMER` varchar(4) NOT NULL COMMENT 'Dagnummer, start iedere dag op 1',
  `VLIEGTUIG_ID` mediumint(8) NOT NULL COMMENT 'FK ref_vliegtuigen',
  `DATUM` date NOT NULL COMMENT 'Datum van vliegen',
  `STARTTIJD` time DEFAULT NULL COMMENT 'Starttijd',
  `LANDINGSTIJD` time DEFAULT NULL COMMENT 'Landingstijd',
  `STARTMETHODE_ID` mediumint(8) NOT NULL COMMENT 'Op welke wijze is vliegtuig gestart',
  `OPMERKING` text DEFAULT NULL COMMENT 'Opmerking in start adminsitratie',
  `SOORTVLUCHT_ID` mediumint(8) DEFAULT NULL,
  `OP_REKENING_ID` mediumint(8) DEFAULT NULL COMMENT 'Wie betaald deze vlucht',
  `VLIEGER_ID` mediumint(8) DEFAULT NULL COMMENT 'FK ref_leden',
  `INZITTENDE_ID` mediumint(8) DEFAULT NULL COMMENT 'FK ref_leden',
  `VLIEGERNAAM` varchar(45) DEFAULT NULL,
  `INZITTENDENAAM` varchar(45) DEFAULT NULL,
  `SLEEPKIST_ID` mediumint(8) DEFAULT NULL,
  `VERWIJDERD` int(1) NOT NULL DEFAULT 0,
  `LAATSTE_AANPASSING` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `oper_startlijst`
--

INSERT INTO `oper_startlijst` (`ID`, `DAGNUMMER`, `VLIEGTUIG_ID`, `DATUM`, `STARTTIJD`, `LANDINGSTIJD`, `STARTMETHODE_ID`, `OPMERKING`, `SOORTVLUCHT_ID`, `OP_REKENING_ID`, `VLIEGER_ID`, `INZITTENDE_ID`, `VLIEGERNAAM`, `INZITTENDENAAM`, `SLEEPKIST_ID`, `VERWIJDERD`, `LAATSTE_AANPASSING`) VALUES
(1604241013532, '1', 296, '2016-04-24', '10:25:00', '10:30:00', 550, NULL, 809, 10729, 10729, 10178, NULL, NULL, NULL, 0, '2016-04-24 08:30:14'),
(1604241019088, '2', 252, '2016-04-24', '12:06:00', '12:09:00', 550, NULL, NULL, 10549, 10549, NULL, NULL, NULL, NULL, 0, '2016-04-24 10:09:44'),
(1604241045479, '3', 296, '2016-04-24', '11:01:00', '11:06:00', 550, NULL, 809, 10831, 10831, 10178, NULL, NULL, NULL, 0, '2016-06-11 10:51:49'),
(1604241103041, '4', 252, '2016-04-24', '11:06:00', '11:10:00', 550, NULL, 805, 10338, 10338, NULL, NULL, NULL, NULL, 0, '2016-04-24 09:10:18'),
(1604241114489, '5', 296, '2016-04-24', '11:26:00', '11:31:00', 550, NULL, 809, 10549, 10549, 10450, NULL, NULL, NULL, 0, '2016-04-24 09:31:10'),
(1604241121080, '6', 252, '2016-04-24', '11:41:00', '11:44:00', 550, NULL, 805, 10603, 10603, NULL, NULL, NULL, NULL, 0, '2016-04-24 09:44:21'),
(1604241142287, '7', 296, '2016-04-24', '11:57:00', '12:02:00', 550, NULL, 813, 10781, 10781, 10338, NULL, NULL, NULL, 0, '2016-04-24 10:02:59'),
(1604241213289, '8', 296, '2016-04-24', '12:18:00', '12:22:00', 550, NULL, 809, 10729, 10729, 10178, NULL, NULL, NULL, 0, '2016-04-24 10:22:48'),
(1604241231016, '9', 252, '2016-04-24', '12:33:00', '12:38:00', 550, NULL, 805, 10603, 10603, NULL, NULL, NULL, NULL, 0, '2016-04-24 10:38:52'),
(1604241237259, '10', 296, '2016-04-24', '12:43:00', '12:49:00', 550, NULL, 813, 10781, 10781, 10450, NULL, NULL, NULL, 0, '2016-04-24 10:49:49'),
(1604241245205, '11', 278, '2016-04-24', '13:21:00', NULL, 550, NULL, 807, 10484, 10484, NULL, NULL, NULL, NULL, 0, '2016-04-24 11:21:58'),
(1604241245392, '12', 249, '2016-04-24', '13:24:00', NULL, 550, NULL, 807, 10522, 10522, NULL, NULL, NULL, NULL, 0, '2016-04-24 11:24:34'),
(1604241247329, '13', 252, '2016-04-24', '12:49:00', '12:56:00', 550, NULL, 805, 10603, 10603, NULL, NULL, NULL, NULL, 0, '2016-04-24 10:58:50'),
(1604241326259, '14', 296, '2016-04-24', '13:16:00', '13:26:00', 550, NULL, 809, 10379, 10379, 10338, NULL, NULL, NULL, 0, '2016-04-24 11:26:41'),
(1604241339431, '15', 296, '2016-04-24', '13:48:00', '13:53:00', 550, NULL, 809, 10831, 10831, 10338, NULL, NULL, NULL, 0, '2016-06-11 10:51:49'),
(1604241353453, '16', 296, '2016-04-24', '14:08:00', '14:30:00', 550, NULL, 809, 10346, 10346, 10338, NULL, NULL, NULL, 0, '2016-04-24 13:00:40'),
(1711140049146, '1', 290, '2017-11-14', NULL, NULL, 551, 'We ', 814, 10178, 10178, NULL, NULL, NULL, NULL, 1, '2017-11-13 23:50:39'),
(1711140053004, '2', 290, '2017-11-14', NULL, NULL, 551, 'We have to ', 805, 10178, 10178, NULL, NULL, NULL, NULL, 0, '2017-11-13 23:53:00');

-- --------------------------------------------------------

--
-- Table structure for table `ref_leden`
--

CREATE TABLE `ref_leden` (
  `ID` mediumint(8) NOT NULL,
  `LIDNR` varchar(10) DEFAULT NULL,
  `CODE` varchar(10) DEFAULT NULL,
  `NAAM` varchar(255) NOT NULL,
  `LIDTYPE_ID` mediumint(8) NOT NULL,
  `MOBIEL` varchar(255) DEFAULT NULL,
  `TELEFOON` varchar(255) DEFAULT NULL,
  `VOORNAAM` varchar(15) DEFAULT NULL,
  `ACHTERNAAM` varchar(30) DEFAULT NULL,
  `GPL_VERLOOPT` date DEFAULT NULL,
  `MEDICAL_VERLOOPT` date DEFAULT NULL,
  `INSTRUCTEUR` int(1) NOT NULL DEFAULT 0,
  `LIERIST` int(1) NOT NULL DEFAULT 0,
  `STARTLEIDER` int(1) NOT NULL DEFAULT 0,
  `HEEFT_BETAALD` int(1) NOT NULL,
  `INLOGNAAM` varchar(45) DEFAULT NULL,
  `WACHTWOORD` varchar(255) DEFAULT NULL,
  `AVATAR` varchar(120) DEFAULT NULL,
  `VERWIJDERD` int(1) NOT NULL DEFAULT 0,
  `LAATSTE_AANPASSING` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `ref_leden`
--

INSERT INTO `ref_leden` (`ID`, `LIDNR`, `CODE`, `NAAM`, `LIDTYPE_ID`, `MOBIEL`, `TELEFOON`, `VOORNAAM`, `ACHTERNAAM`, `GPL_VERLOOPT`, `MEDICAL_VERLOOPT`, `INSTRUCTEUR`, `LIERIST`, `STARTLEIDER`, `HEEFT_BETAALD`, `INLOGNAAM`, `WACHTWOORD`, `AVATAR`, `VERWIJDERD`, `LAATSTE_AANPASSING`) VALUES
(0, '0', NULL, 'sa', 101, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 1, 'sa', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(8, '3012', '', '-Oprotkabel', 610, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, 0, '2013-03-27 19:31:51'),
(9, '3000', '', '-Penningmeester', 612, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, 0, '2013-03-27 19:33:21'),
(35, '10380', '', '-Company (bedrijven)', 600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, 0, '2017-09-10 14:05:59'),
(36, '10378', '', '-Bedrijf (bedrijven)', 600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, 0, '2017-09-10 14:05:59'),
(37, '10404', '', '-Unternehmung (bedrijven)', 600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, 0, '2017-09-10 14:05:59'),
(38, '24230', '3423', '-OZC (zusterclub)', 607, 't.b.v. DDWV', '123456', NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, 0, '2017-09-10 14:05:59'),
(39, '40410', 'klu', '-EVS (zusterclub)', 607, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, 0, '2017-09-10 14:05:59'),
(10178, '120101', NULL, 'Lucas Berends (erelid)', 601, '020-4743564', '06-12513739', 'Lucas', 'Berends', '2017-06-02', '2017-03-19', 1, 1, 0, 1, 'LucasB', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(10232, '166803', NULL, 'Ruben Nijenhuis (erelid)', 601, '016-4422116', NULL, 'Ruben', 'Nijenhuis', NULL, NULL, 0, 0, 0, 1, 'RubenN', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(10338, '211714', NULL, 'Floris Bakker (lid)', 602, NULL, '06-46617227', 'Floris', 'Bakker', '2016-08-18', '2017-06-28', 1, 1, 0, 1, 'FlorisB', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(10346, '200312', NULL, 'Aaron van Leeuwen (lid)', 602, NULL, '06-13699414', 'Aaron', 'Leeuwen, van', '0000-00-00', '2017-04-30', 0, 1, 0, 1, 'AaronL', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(10379, '201901', NULL, 'Robin van Hoof (lid)', 602, '0315-351659', '06-53255676', 'Robin', 'Hoof, van', '0000-00-00', '0000-00-00', 0, 1, 0, 1, 'RobinH', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(10450, '218715', NULL, 'Fabian Instructie(lid)', 602, '035-2124223', '06-53159743', 'Fabian', 'Instructie', '0000-00-00', '0000-00-00', 1, 0, 0, 1, 'FabianS', 'ww', NULL, 0, '2017-09-10 15:09:15'),
(10484, '200255', NULL, 'Boris Kever (lid)', 602, '010-3618418', '06-47156658', 'Boris', 'Kever', '0000-00-00', '0000-00-00', 0, 1, 0, 1, 'BorisK', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(10505, '211175', NULL, 'Maarten Appel (erelid)', 601, NULL, NULL, 'Maarten', 'Appel', '0000-00-00', '0000-00-00', 0, 0, 0, 1, 'MaartenA', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(10522, '200363', NULL, 'Frank Instructor (lid)', 602, '013-5136669', '06-24811848', 'Frank', 'Instructor', NULL, NULL, 0, 1, 0, 1, 'FrankA', 'ww', NULL, 0, '2017-09-10 15:09:15'),
(10549, '311204', NULL, 'Sam de Bruin (jeugdlid)', 603, '022-5338933', '06-24514531', 'Sam', 'Bruin, de', '0000-00-00', '0000-00-00', 0, 1, 0, 1, 'SamB', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(10603, '200108', NULL, 'Luuk Smit (lid)', 602, '0125-1925182', '06-52381724', 'Luuk', 'Smit', '2017-10-07', '2017-03-03', 0, 1, 0, 1, 'LuukS', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(10729, '201119', NULL, 'Mats Kok (lid)', 602, '024-3817883', '06-24647283', 'Mats', 'Kok', '0000-00-00', '2019-01-10', 0, 1, 1, 1, 'MatsK', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(10781, '201202', NULL, 'Thijs Vermeulen (lid)', 602, '024-3711712', '06-11749541', 'Thijs', 'Vermeulen', '0000-00-00', '0000-00-00', 0, 0, 0, 1, 'ThijsV', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(10831, '821629', NULL, 'Julian Karelse (jeugdlid)', 603, NULL, NULL, 'Julian', 'Karelse', '0000-00-00', '0000-00-00', 0, 0, 0, 1, 'JulianK', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(10862, '991701', NULL, 'Miranda van Dam (donateur)', 606, NULL, '06-12482681', 'Miranda', 'dam, van', '0000-00-00', '0000-00-00', 0, 0, 0, 1, 'MirandaD', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(10866, '999307', NULL, 'Sjaak Vervoort (donateur)', 606, NULL, NULL, 'Sjaak', 'Vervoort', NULL, NULL, 0, 0, 0, 1, 'SjaakV', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(20708, NULL, NULL, 'Felix Boersma (DDWV)', 625, '0622591518', NULL, 'Feleix', 'Boersma', NULL, NULL, 0, 0, 0, 2, 'FelixB', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(20709, NULL, NULL, 'Siem Preuter (DDWV)', 625, '0619912105', NULL, 'Siem', 'Preuter', NULL, NULL, 0, 0, 0, 2, 'SiemP', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(20712, NULL, NULL, 'Gerrit Maas (DDWV)', 625, '0625065198', NULL, 'Gerrit', 'Maas', NULL, NULL, 0, 0, 0, 2, 'GerritM', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(20713, NULL, NULL, 'Merel Hoekstra (DDWV)', 625, '0638937335', NULL, 'Merel', 'Hoeksma', NULL, NULL, 0, 0, 0, 2, 'MerelH', 'ww', NULL, 1, '2017-09-10 14:36:06'),
(20714, NULL, NULL, 'David Gunning (DDWV)', 625, '06-52431211', NULL, 'David', 'Gunning', NULL, NULL, 0, 0, 0, 2, 'DavidG', 'ww', NULL, 0, '2017-09-10 14:36:06'),
(1000240, NULL, NULL, 'Jesse Blom (nieuw lid)', 609, 'nvt', 'nvt', NULL, NULL, NULL, NULL, 0, 0, 0, 1, NULL, NULL, NULL, 0, '2017-09-10 13:45:33'),
(1000241, NULL, NULL, 'Adam Roef (nieuw lid)', 609, '06-12345678', '06-12345678', NULL, NULL, NULL, NULL, 0, 0, 0, 1, NULL, NULL, NULL, 0, '2017-09-10 13:45:33'),
(1000242, NULL, NULL, 'Peter van Dam (nieuw lid)', 609, '06-12345678', '06-12345678', NULL, NULL, NULL, NULL, 0, 0, 0, 1, NULL, NULL, NULL, 0, '2017-09-10 13:45:33');

-- --------------------------------------------------------

--
-- Table structure for table `ref_vliegtuigen`
--

CREATE TABLE `ref_vliegtuigen` (
  `ID` mediumint(8) NOT NULL,
  `REGISTRATIE` varchar(8) NOT NULL,
  `CALLSIGN` varchar(6) DEFAULT NULL,
  `ZITPLAATSEN` tinyint(1) NOT NULL DEFAULT 1,
  `CLUBKIST` tinyint(1) NOT NULL DEFAULT 0,
  `FLARM_CODE` varchar(6) DEFAULT NULL,
  `TYPE_ID` mediumint(6) DEFAULT NULL,
  `TMG` int(1) NOT NULL DEFAULT 0,
  `ZELFSTART` int(1) NOT NULL DEFAULT 0,
  `SLEEPKIST` int(1) NOT NULL DEFAULT 0,
  `VERWIJDERD` int(1) NOT NULL DEFAULT 0,
  `LAATSTE_AANPASSING` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `ref_vliegtuigen`
--

INSERT INTO `ref_vliegtuigen` (`ID`, `REGISTRATIE`, `CALLSIGN`, `ZITPLAATSEN`, `CLUBKIST`, `FLARM_CODE`, `TYPE_ID`, `TMG`, `ZELFSTART`, `SLEEPKIST`, `VERWIJDERD`, `LAATSTE_AANPASSING`) VALUES
(200, 'PH-1529', 'E12', 2, 1, '485069', 405, 0, 0, 0, 0, '2014-05-17 11:18:02'),
(213, 'ZS-1Z', 'V1', 1, 0, 'DD1534', NULL, 0, 1, 0, 0, '2017-09-10 14:25:03'),
(223, 'PH-1510', 'E5', 1, 1, '484FA8', 404, 0, 0, 0, 0, '2013-04-01 16:09:03'),
(224, 'PH-1058', 'E1', 1, 1, '484784', 401, 0, 0, 0, 0, '2016-03-28 10:14:06'),
(226, 'PH-1076', 'E2', 1, 1, '484785', 401, 0, 0, 0, 0, '2015-04-11 11:31:49'),
(248, 'ZS-2Z', 'O8', 2, 0, NULL, NULL, 0, 1, 0, 0, '2017-09-10 14:25:03'),
(249, 'PH-6021', '1Z1', 1, 0, '49483B', NULL, 0, 0, 0, 0, '2017-09-10 14:17:03'),
(252, 'PH-794', 'E10', 1, 1, '484781', 402, 0, 0, 0, 0, '2013-04-01 16:10:04'),
(255, 'PH-936', 'E9', 1, 1, 'DDACF5', 402, 0, 0, 0, 0, '2016-08-10 09:09:48'),
(278, 'PH-8028', '1Z2', 1, 0, '4A4829', NULL, 0, 0, 0, 0, '2017-09-10 14:17:03'),
(279, 'PH-2467', '2Z1', 2, 0, NULL, NULL, 0, 0, 0, 0, '2017-09-10 14:17:03'),
(290, 'PH-1303', 'E3', 1, 1, 'DDA9AB', 403, 0, 0, 0, 0, '2014-05-17 15:20:00'),
(295, 'PH-1057', 'E7', 2, 1, '484786', 405, 0, 0, 0, 0, '2014-01-13 21:42:44'),
(296, 'PH-721', 'E4', 2, 1, '484B59', 406, 0, 0, 0, 0, '2013-04-01 16:08:53'),
(297, 'PH-1292', 'E6', 2, 1, '484B5D', 406, 0, 0, 0, 0, '2013-04-01 16:09:12'),
(402, 'PH-1521', 'E11', 2, 1, '485026', 405, 0, 0, 0, 0, '2014-04-19 07:43:15'),
(426, 'PH-412', '2Z2', 2, 0, NULL, NULL, 0, 0, 0, 0, '2017-09-10 14:25:03'),
(431, 'PH-BEY', 'SLP', 1, 0, NULL, NULL, 0, 0, 1, 0, '2017-09-10 14:25:03'),
(503, 'PH-TMG', 'PP', 2, 0, NULL, NULL, 1, 0, 0, 0, '2017-09-10 14:25:03'),
(535, 'D-TMG', NULL, 2, 0, NULL, NULL, 1, 0, 0, 0, '2017-09-10 14:25:03');

-- --------------------------------------------------------

--
-- Stand-in structure for view `startlijst_view`
-- (See below for the actual view)
--
CREATE TABLE `startlijst_view` (
`ID` bigint(20)
,`DAGNUMMER` varchar(4)
,`REGISTRATIE` varchar(8)
,`CALLSIGN` varchar(6)
,`REG_CALL` varchar(25)
,`FLARM_CODE` varchar(6)
,`VLIEGTUIG_ID` mediumint(8)
,`DATUM` date
,`SOORTVLUCHT_ID` mediumint(8)
,`STARTMETHODE_ID` mediumint(8)
,`STARTTIJD` varchar(10)
,`LANDINGSTIJD` varchar(10)
,`DUUR` varchar(10)
,`OPMERKING` text
,`VLIEGERNAAM` varchar(303)
,`INZITTENDENAAM` varchar(255)
,`LAATSTE_AANPASSING` timestamp
,`VLIEGER_ID` mediumint(8)
,`INZITTENDE_ID` mediumint(8)
,`OP_REKENING_ID` mediumint(8)
,`OP_REKENING` varchar(255)
,`SOORTVLUCHT` varchar(75)
,`STARTMETHODE` varchar(75)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `startlijst_vlieger_view`
-- (See below for the actual view)
--
CREATE TABLE `startlijst_vlieger_view` (
`VLIEGERNAAM` varchar(303)
,`DAGNUMMER` varchar(4)
,`REGISTRATIE` varchar(8)
,`VLIEGTUIG_TYPE` varchar(5)
,`STARTTIJD` varchar(10)
,`DUUR` varchar(10)
,`DATUM` date
);

-- --------------------------------------------------------

--
-- Table structure for table `typegroep`
--

CREATE TABLE `typegroep` (
  `ID` mediumint(8) NOT NULL,
  `CODE` varchar(5) DEFAULT NULL,
  `OMSCHRIJVING` varchar(25) NOT NULL,
  `VERWIJDERD` int(1) NOT NULL DEFAULT 0,
  `LAATSTE_AANPASSING` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `typegroep`
--

INSERT INTO `typegroep` (`ID`, `CODE`, `OMSCHRIJVING`, `VERWIJDERD`, `LAATSTE_AANPASSING`) VALUES
(1, NULL, 'Banen', 0, '2012-08-31 09:34:12'),
(2, NULL, 'Windrichting', 0, '2012-08-31 09:34:12'),
(3, NULL, 'Windkracht', 0, '2012-08-31 09:34:12'),
(4, NULL, 'Vliegtuig type', 0, '2012-08-31 09:34:12'),
(5, NULL, 'Startmethode', 0, '2012-08-31 09:34:12'),
(6, NULL, 'Lidsoorten', 0, '2012-08-31 09:34:12'),
(7, NULL, 'Type bedrijf', 0, '2013-04-11 14:47:06'),
(8, NULL, 'Vluchtsoort', 0, '2012-08-31 09:34:12'),
(9, NULL, 'Vliegveld', 0, '2012-12-09 09:46:31'),
(15, NULL, 'Vliegbedrijf', 0, '2012-12-15 13:40:12');

-- --------------------------------------------------------

--
-- Table structure for table `types`
--

CREATE TABLE `types` (
  `ID` mediumint(8) NOT NULL,
  `TYPEGROUP_ID` mediumint(8) NOT NULL,
  `CODE` varchar(5) DEFAULT NULL,
  `OMSCHRIJVING` varchar(75) NOT NULL,
  `VERWIJDERD` int(1) DEFAULT 0,
  `SORTEER_VOLGORDE` tinyint(2) DEFAULT NULL,
  `EXT_REF` varchar(25) DEFAULT NULL,
  `LAATSTE_AANPASSING` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `types`
--

INSERT INTO `types` (`ID`, `TYPEGROUP_ID`, `CODE`, `OMSCHRIJVING`, `VERWIJDERD`, `SORTEER_VOLGORDE`, `EXT_REF`, `LAATSTE_AANPASSING`) VALUES
(101, 1, '14L', '14L', 0, NULL, NULL, '2014-01-12 19:34:47'),
(102, 1, '32L', '32L', 0, NULL, NULL, '2014-01-12 19:34:47'),
(103, 1, '04R', '04R', 0, NULL, NULL, '2014-12-20 11:16:42'),
(104, 1, '22L', '22L', 0, NULL, NULL, '2014-01-12 19:34:47'),
(105, 1, '14', '14', 0, NULL, NULL, '2014-01-12 19:34:47'),
(106, 1, '12', '12', 0, NULL, NULL, '2014-01-12 19:34:47'),
(107, 1, '30R', '30R', 0, NULL, NULL, '2014-01-12 19:34:47'),
(108, 1, '04L', '04L', 0, NULL, NULL, '2014-12-20 11:16:42'),
(109, 1, '22R', '22R', 0, NULL, NULL, '2014-01-12 19:34:47'),
(201, 2, 'N', 'Noord', 0, NULL, NULL, '2012-08-31 09:29:54'),
(202, 2, 'NNO', 'NNO', 1, NULL, NULL, '2012-08-31 09:29:54'),
(203, 2, 'NO', 'Noordoost', 0, NULL, NULL, '2012-08-31 09:29:54'),
(204, 2, 'ONO', 'ONO', 1, NULL, NULL, '2012-08-31 09:29:54'),
(205, 2, 'O', 'Oost', 0, NULL, NULL, '2012-08-31 09:29:54'),
(206, 2, 'OZO', 'OZO', 1, NULL, NULL, '2012-08-31 09:29:54'),
(207, 2, 'ZO', 'Zuidoost', 0, NULL, NULL, '2012-08-31 09:29:54'),
(208, 2, 'ZZO', 'ZZO', 1, NULL, NULL, '2012-08-31 09:29:54'),
(209, 2, 'Z', 'Zuid', 0, NULL, NULL, '2012-08-31 09:29:54'),
(210, 2, 'ZZW', 'ZZW', 1, NULL, NULL, '2012-08-31 09:29:54'),
(211, 2, 'ZW', 'Zuidwest', 0, NULL, NULL, '2012-08-31 09:29:54'),
(212, 2, 'WZV', 'WZW', 1, NULL, NULL, '2012-08-31 09:29:54'),
(213, 2, 'W', 'West', 0, NULL, NULL, '2012-08-31 09:29:54'),
(214, 2, 'WNW', 'WNW', 1, NULL, NULL, '2012-08-31 09:29:54'),
(215, 2, 'NW', 'Noordwest', 0, NULL, NULL, '2012-08-31 09:29:54'),
(216, 2, 'NNW', 'NNW', 1, NULL, NULL, '2012-08-31 09:29:54'),
(301, 3, NULL, 'Windkracht 1 (1-3 kn)', 0, NULL, NULL, '2012-08-31 09:29:54'),
(302, 3, NULL, 'Windkracht 2 (4-6 kn)', 0, NULL, NULL, '2012-08-31 09:29:54'),
(303, 3, NULL, 'Windkracht 3 (7-10 kn)', 0, NULL, NULL, '2012-08-31 09:29:54'),
(304, 3, NULL, 'Windkracht 4 (11-15 kn)', 0, NULL, NULL, '2012-08-31 09:29:54'),
(305, 3, NULL, 'Windkracht 5 (16 - 21 kn)', 0, NULL, NULL, '2012-08-31 09:29:54'),
(306, 3, NULL, 'Windkracht 6 (22 - 27 kn)', 0, NULL, NULL, '2012-08-31 09:29:54'),
(307, 3, NULL, 'Windkracht 7 (28 - 33 kn)', 0, NULL, NULL, '2012-08-31 09:29:54'),
(308, 3, NULL, 'Windkracht 8 (34 - 40 kn)', 0, NULL, NULL, '2012-08-31 09:29:54'),
(309, 3, NULL, 'Windkracht 0 (0 - 1 kn)', 0, NULL, NULL, '2012-08-31 09:29:54'),
(401, 4, 'DIS', 'Discus CS', 0, NULL, NULL, '2012-10-08 20:22:12'),
(402, 4, 'LS4', 'LS 4', 0, NULL, NULL, '2012-10-08 20:22:12'),
(403, 4, 'LS6', 'LS 6-18 w', 0, NULL, NULL, '2012-10-08 20:22:12'),
(404, 4, 'LS8', 'LS8', 0, NULL, NULL, '2012-08-31 09:29:54'),
(405, 4, 'Duo', 'Duo Discus', 0, NULL, NULL, '2012-10-08 20:22:12'),
(406, 4, 'ASK21', 'ASK 21', 0, NULL, NULL, '2012-10-08 20:22:12'),
(407, 4, 'ASK23', 'ASK 23 B', 1, NULL, NULL, '2014-12-28 11:37:58'),
(501, 5, 'slp', 'Slepen (zweefkist)', 0, NULL, NULL, '2014-10-02 15:08:10'),
(502, 5, 'slm', 'Slepen (motorkist)', 0, NULL, NULL, '2014-10-02 15:08:11'),
(506, 5, 'zel', 'Zelfstart (zweefkist)', 0, NULL, NULL, '2012-08-31 09:29:54'),
(507, 5, 'tmg', 'Zelfstart (TMG)', 0, NULL, NULL, '2012-08-31 09:29:54'),
(508, 5, 'vfr', 'Overig motorkisten', 0, NULL, NULL, '2012-08-31 09:29:54'),
(550, 5, 'gezc', 'Lierstart GeZC', 0, NULL, NULL, '2014-10-02 15:08:13'),
(551, 5, 'cct', 'Lierstart CCT', 0, NULL, NULL, '2014-10-02 15:08:14'),
(552, 5, 'zcrd', 'Lierstart ZCD/ZCR', 0, NULL, NULL, '2014-10-02 15:08:15'),
(553, 5, 'gae', 'Lierstart GAE', 0, NULL, NULL, '2014-10-02 15:08:16'),
(600, 6, '0', 'Diverse (Bijvoorbeeld bedrijven- of jongerendag)', 0, NULL, NULL, '2012-08-31 09:29:54'),
(601, 6, '1', 'Erelid', 0, NULL, NULL, '2012-08-31 09:29:54'),
(602, 6, '2', 'Lid', 0, NULL, NULL, '2012-08-31 09:29:54'),
(603, 6, '3', 'Jeugdlid', 0, NULL, NULL, '2012-08-31 09:29:54'),
(606, 6, '6', 'Donateur', 0, NULL, NULL, '2012-08-31 09:29:54'),
(607, 6, 'zus', 'Zusterclub', 0, NULL, NULL, '2012-09-19 20:09:05'),
(608, 6, '8', '5-rittenkaarthouder', 0, NULL, NULL, '2012-08-31 09:29:54'),
(609, 6, '9', 'nieuw lid, nog niet verwerkt in ledenadministratie', 0, NULL, NULL, '2012-08-31 09:29:54'),
(610, 6, NULL, 'Oprotkabel', 0, NULL, NULL, '2012-10-29 14:54:41'),
(611, 6, '9', 'Cursist', 0, NULL, NULL, '2012-12-03 19:37:37'),
(612, 6, NULL, 'Penningmeester', 0, NULL, NULL, '2012-12-10 20:44:33'),
(625, 6, '9', 'DDWV vlieger', 0, NULL, NULL, '2012-12-03 19:37:37'),
(701, 7, NULL, 'Club bedrijf', 0, NULL, NULL, '2013-04-11 14:47:06'),
(702, 7, NULL, 'Kamp + DDWV', 0, NULL, NULL, '2016-03-03 19:52:39'),
(703, 7, NULL, 'DDWV', 0, NULL, NULL, '2013-04-11 14:47:06'),
(801, 8, NULL, 'Passagierstart (kosten 40€)', 0, NULL, NULL, '2012-08-31 09:29:54'),
(802, 8, NULL, 'Relatiestart', 0, NULL, NULL, '2012-08-31 09:29:54'),
(803, 8, NULL, 'Start zusterclub', 0, NULL, NULL, '2012-09-19 19:55:23'),
(804, 8, NULL, 'Oprotkabel', 0, NULL, NULL, '2012-08-31 09:29:54'),
(805, 8, NULL, 'Normale GeZC start', 0, NULL, NULL, '2012-09-09 20:06:52'),
(806, 8, NULL, 'Proefstart privekist eenzitter', 0, NULL, NULL, '2012-08-31 09:29:54'),
(807, 8, NULL, 'Privestart', 0, NULL, NULL, '2012-08-31 09:29:54'),
(809, 8, NULL, 'Instructie of checkvlucht', 0, NULL, NULL, '2012-08-31 09:29:54'),
(810, 8, NULL, 'Solostart met tweezitter', 0, NULL, NULL, '2012-08-31 09:29:54'),
(811, 8, 'dis', 'Invliegen, Dienststart', 0, NULL, NULL, '2013-04-02 17:59:10'),
(812, 8, NULL, 'Donateursstart', 0, NULL, NULL, '2012-08-31 09:29:54'),
(813, 8, NULL, '5- of 10-rittenkaarthouder', 0, NULL, NULL, '2012-08-31 09:29:54'),
(814, 8, 'mid', 'DDWV: Midweekvliegen', 0, NULL, NULL, '2013-04-03 18:13:11'),
(815, 8, NULL, 'Sleepkist, Dienststart', 0, NULL, NULL, '2012-08-31 09:29:54'),
(901, 9, 'EHTL', 'Terlet', 0, NULL, NULL, '2012-12-09 09:49:30'),
(902, 9, 'EHDL', 'Deelen', 0, NULL, NULL, '2012-12-09 09:49:30'),
(903, 9, 'EHSB', 'Soesterberg', 0, NULL, NULL, '2012-12-09 09:49:30'),
(1550, 15, 'gezc', 'GeZC', 0, NULL, NULL, '2012-12-15 18:19:33'),
(1551, 15, 'cct', 'CCT', 0, NULL, NULL, '2012-12-15 18:19:33'),
(1552, 15, 'zcrd', 'ZCD/ZCR', 0, NULL, NULL, '2012-12-15 18:19:33'),
(1553, 15, 'gae', 'GAE', 0, NULL, NULL, '2012-12-15 18:19:33');

-- --------------------------------------------------------

--
-- Stand-in structure for view `vliegtuigenaanwezig_view`
-- (See below for the actual view)
--
CREATE TABLE `vliegtuigenaanwezig_view` (
`ID` bigint(20)
,`VLIEGTUIG_ID` mediumint(8)
,`REGISTRATIE` varchar(8)
,`CALLSIGN` varchar(6)
,`ZITPLAATSEN` tinyint(1)
,`CLUBKIST` varchar(5)
,`VLIEGTUIGTYPE` varchar(75)
,`AANKOMST` varchar(10)
,`VERTREK` varchar(10)
,`LAATSTE_AANPASSING` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vliegtuigenlijst_view`
-- (See below for the actual view)
--
CREATE TABLE `vliegtuigenlijst_view` (
`ID` mediumint(8)
,`REGISTRATIE` varchar(8)
,`CALLSIGN` varchar(6)
,`REGCALL` varchar(25)
,`ZITPLAATSEN` tinyint(1)
,`FLARM_CODE` varchar(6)
,`TYPE_ID` mediumint(6)
,`TMG` varchar(5)
,`SLEEPKIST` varchar(5)
,`ZELFSTART` varchar(5)
,`CLUBKIST` varchar(5)
,`VLIEGTUIGTYPE` varchar(75)
,`LAATSTE_AANPASSING` timestamp
);

-- --------------------------------------------------------

--
-- Structure for view `dagoverzicht_view`
--
DROP TABLE IF EXISTS `dagoverzicht_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`gezc_db_strt_local`@`localhost` SQL SECURITY DEFINER VIEW `dagoverzicht_view`  AS  select `rf`.`ID` AS `ID`,`rf`.`NAAM` AS `NAAM`,`aanwezig`.`DATUM` AS `DATUM`,`aanwezig`.`OPMERKING` AS `OPMERKING`,`aanwezig`.`DDWV_VOORAANMELDING` AS `DDWV_VOORAANMELDING`,(select count(0) AS `STARTS` from `oper_startlijst` where (`oper_startlijst`.`VLIEGER_ID` = `aanwezig`.`LID_ID` or `oper_startlijst`.`INZITTENDE_ID` = `aanwezig`.`LID_ID`) and (`oper_startlijst`.`STARTTIJD` is not null or `oper_startlijst`.`LANDINGSTIJD` is not null) and `oper_startlijst`.`SOORTVLUCHT_ID` <> 815 and `oper_startlijst`.`DATUM` = `aanwezig`.`DATUM`) AS `STARTS`,(select count(0) AS `VLIEGER` from `oper_startlijst` where `oper_startlijst`.`VLIEGER_ID` = `aanwezig`.`LID_ID` and (`oper_startlijst`.`STARTTIJD` is not null or `oper_startlijst`.`LANDINGSTIJD` is not null) and `oper_startlijst`.`SOORTVLUCHT_ID` <> 815 and `oper_startlijst`.`DATUM` = `aanwezig`.`DATUM`) AS `VLIEGER`,(select count(0) AS `INZITTENDENAAM` from `oper_startlijst` where `oper_startlijst`.`INZITTENDE_ID` = `aanwezig`.`LID_ID` and (`oper_startlijst`.`STARTTIJD` is not null or `oper_startlijst`.`LANDINGSTIJD` is not null) and `oper_startlijst`.`SOORTVLUCHT_ID` <> 815 and `oper_startlijst`.`DATUM` = `aanwezig`.`DATUM`) AS `INZITTENDE`,(select count(0) AS `DDWV` from `oper_startlijst` where `oper_startlijst`.`OP_REKENING_ID` = `aanwezig`.`LID_ID` and (`oper_startlijst`.`STARTTIJD` is not null or `oper_startlijst`.`LANDINGSTIJD` is not null) and `oper_startlijst`.`SOORTVLUCHT_ID` = 814 and `oper_startlijst`.`DATUM` = `aanwezig`.`DATUM`) AS `DDWV`,(select count(0) AS `SLEEP` from `oper_startlijst` where `oper_startlijst`.`OP_REKENING_ID` = `aanwezig`.`LID_ID` and `oper_startlijst`.`STARTMETHODE_ID` = 501 and (`oper_startlijst`.`STARTTIJD` is not null or `oper_startlijst`.`LANDINGSTIJD` is not null) and `oper_startlijst`.`DATUM` = `aanwezig`.`DATUM`) AS `SLEEP`,(select count(0) AS `OPREKENING` from `oper_startlijst` where `oper_startlijst`.`OP_REKENING_ID` = `aanwezig`.`LID_ID` and (`oper_startlijst`.`STARTTIJD` is not null or `oper_startlijst`.`LANDINGSTIJD` is not null) and `oper_startlijst`.`SOORTVLUCHT_ID` <> 815 and `oper_startlijst`.`DATUM` = `aanwezig`.`DATUM`) AS `OPREKENING` from (`oper_aanwezig` `aanwezig` join `ref_leden` `rf` on(`aanwezig`.`LID_ID` = `rf`.`ID`)) where `aanwezig`.`LID_ID` is not null order by `rf`.`NAAM` ;

-- --------------------------------------------------------

--
-- Structure for view `flarm_view`
--
DROP TABLE IF EXISTS `flarm_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`gezc_db_strt_local`@`localhost` SQL SECURITY DEFINER VIEW `flarm_view`  AS  select `flarm`.`ID` AS `ID`,`flarm`.`DATUM` AS `DATUM`,`flarm`.`FLARM_CODE` AS `FLARM_CODE`,`rv`.`ID` AS `VLIEGTUIG_ID`,`RegCall`(`rv`.`ID`) AS `REG_CALL`,`flarm`.`STARTTIJD` AS `STARTTIJD`,`flarm`.`LANDINGSTIJD` AS `LANDINGSTIJD`,`types`.`OMSCHRIJVING` AS `BAAN` from ((`oper_flarm` `flarm` left join `ref_vliegtuigen` `rv` on(`rv`.`FLARM_CODE` = `flarm`.`FLARM_CODE`)) left join `types` on(`flarm`.`BAAN_ID` = `types`.`ID`)) order by `flarm`.`ID` ;

-- --------------------------------------------------------

--
-- Structure for view `invoer_vliegtuigen_view`
--
DROP TABLE IF EXISTS `invoer_vliegtuigen_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`gezc_db_strt_local`@`localhost` SQL SECURITY DEFINER VIEW `invoer_vliegtuigen_view`  AS  (select `rv`.`ID` AS `ID`,`REGCALL`(`rv`.`ID`) AS `REG_CALL`,`rv`.`ZITPLAATSEN` AS `ZITPLAATSEN`,`rv`.`TMG` AS `TMG`,`rv`.`SLEEPKIST` AS `SLEEPKIST`,`rv`.`ZELFSTART` AS `ZELFSTART`,`rv`.`TYPE_ID` AS `TYPE_ID`,`rv`.`CLUBKIST` AS `CLUBKIST`,`VLIEGTUIGVLIEGT`(`rv`.`ID`) AS `VLIEGT`,`VLIEGTUIGOVERLAND`(`rv`.`ID`) AS `OVERLAND`,`VLIEGTUIGAANWEZIGVANDAAG`(`rv`.`ID`) AS `AANWEZIG`,coalesce((select `oper_aanwezig`.`LAATSTE_AANPASSING` from `oper_aanwezig` where `oper_aanwezig`.`VLIEGTUIG_ID` = `rv`.`ID` order by `oper_aanwezig`.`LAATSTE_AANPASSING` desc limit 0,1),`rv`.`LAATSTE_AANPASSING`) AS `LAATSTE_AANPASSING` from `ref_vliegtuigen` `rv` where `rv`.`VERWIJDERD` = 0) ;

-- --------------------------------------------------------

--
-- Structure for view `ledenaanwezig_view`
--
DROP TABLE IF EXISTS `ledenaanwezig_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`gezc_db_strt_local`@`localhost` SQL SECURITY DEFINER VIEW `ledenaanwezig_view`  AS  (select `a`.`ID` AS `ID`,`l`.`ID` AS `LID_ID`,`l`.`NAAM` AS `NAAM`,`l`.`LIDTYPE_ID` AS `LIDTYPE_ID`,`a`.`VOORKEUR_VLIEGTUIG_TYPE` AS `VOORKEUR_VLIEGTUIG_TYPE`,`a`.`VOORKEUR_VLIEGTUIG_ID` AS `VOORKEUR_VLIEGTUIG_ID`,`VOORKEURTYPE`(`a`.`VOORKEUR_VLIEGTUIG_TYPE`) AS `VOORKEUR_TYPE`,`REGCALL`(`a`.`VOORKEUR_VLIEGTUIG_ID`) AS `VOORKEUR_REGCALL`,time_format(timediff(curtime(),`LIDVLIEGT`(`l`.`ID`)),'%H:%i') AS `ACTUELE_VLIEGTIJD`,time_format(`a`.`AANKOMST`,'%H:%i') AS `AANKOMST`,time_format(`a`.`VERTREK`,'%H:%i') AS `VERTREK`,`l`.`INSTRUCTEUR` AS `INSTRUCTEUR`,case `LIDAANWEZIGVANDAAG`(`l`.`ID`) when 0 then 'false' else 'true' end AS `AANWEZIG`,`a`.`OPMERKING` AS `OPMERKING`,`a`.`LAATSTE_AANPASSING` AS `LAATSTE_AANPASSING` from (`oper_aanwezig` `a` join `ledenlijst_view` `l` on(`a`.`LID_ID` = `l`.`ID`)) where `a`.`DATUM` = cast(current_timestamp() as date)) ;

-- --------------------------------------------------------

--
-- Structure for view `ledenlijst_view`
--
DROP TABLE IF EXISTS `ledenlijst_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`gezc_db_strt_local`@`localhost` SQL SECURITY DEFINER VIEW `ledenlijst_view`  AS  (select `l`.`ID` AS `ID`,`l`.`NAAM` AS `NAAM`,`l`.`ACHTERNAAM` AS `ACHTERNAAM`,`l`.`MOBIEL` AS `MOBIEL`,`l`.`TELEFOON` AS `TELEFOON`,`l`.`INSTRUCTEUR` AS `INSTRUCTEUR`,`l`.`STARTLEIDER` AS `STARTLEIDER`,`l`.`HEEFT_BETAALD` AS `HEEFT_BETAALD`,`l`.`LIERIST` AS `LIERIST`,`t`.`OMSCHRIJVING` AS `LIDTYPE`,`l`.`LIDTYPE_ID` AS `LIDTYPE_ID`,`l`.`GPL_VERLOOPT` AS `GPL_VERLOOPT`,`l`.`MEDICAL_VERLOOPT` AS `MEDICAL_VERLOOPT`,`LIDAANWEZIGVANDAAG`(`l`.`ID`) AS `AANWEZIG`,`LIDAANWEZIGGEWEESTVANDAAG`(`l`.`ID`) AS `AANWEZIG_GEWEEST`,coalesce((select `oper_aanwezig`.`LAATSTE_AANPASSING` from `oper_aanwezig` where `oper_aanwezig`.`LID_ID` = `l`.`ID` order by `oper_aanwezig`.`LAATSTE_AANPASSING` desc limit 0,1),`l`.`LAATSTE_AANPASSING`) AS `LAATSTE_AANPASSING` from (`ref_leden` `l` left join `types` `t` on(`l`.`LIDTYPE_ID` = `t`.`ID`)) where `l`.`VERWIJDERD` = 0) ;

-- --------------------------------------------------------

--
-- Structure for view `startlijst_view`
--
DROP TABLE IF EXISTS `startlijst_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`gezc_db_strt_local`@`localhost` SQL SECURITY DEFINER VIEW `startlijst_view`  AS  (select `sl`.`ID` AS `ID`,`sl`.`DAGNUMMER` AS `DAGNUMMER`,`v`.`REGISTRATIE` AS `REGISTRATIE`,`v`.`CALLSIGN` AS `CALLSIGN`,`REGCALL`(`v`.`ID`) AS `REG_CALL`,`v`.`FLARM_CODE` AS `FLARM_CODE`,`sl`.`VLIEGTUIG_ID` AS `VLIEGTUIG_ID`,`sl`.`DATUM` AS `DATUM`,`sl`.`SOORTVLUCHT_ID` AS `SOORTVLUCHT_ID`,`sl`.`STARTMETHODE_ID` AS `STARTMETHODE_ID`,time_format(`sl`.`STARTTIJD`,'%H:%i') AS `STARTTIJD`,time_format(`sl`.`LANDINGSTIJD`,'%H:%i') AS `LANDINGSTIJD`,case when `sl`.`DATUM` = cast(current_timestamp() as date) then time_format(timediff(ifnull(`sl`.`LANDINGSTIJD`,curtime()),`sl`.`STARTTIJD`),'%H:%i') else case when `sl`.`LANDINGSTIJD` is not null then time_format(timediff(`sl`.`LANDINGSTIJD`,`sl`.`STARTTIJD`),'%H:%i') else '' end end AS `DUUR`,`sl`.`OPMERKING` AS `OPMERKING`,case when `sl`.`VLIEGERNAAM` is not null then concat(ifnull(`vl`.`NAAM`,''),' (',ifnull(`sl`.`VLIEGERNAAM`,''),')') else `vl`.`NAAM` end AS `VLIEGERNAAM`,coalesce(`sl`.`INZITTENDENAAM`,`il`.`NAAM`) AS `INZITTENDENAAM`,`sl`.`LAATSTE_AANPASSING` AS `LAATSTE_AANPASSING`,`sl`.`VLIEGER_ID` AS `VLIEGER_ID`,`sl`.`INZITTENDE_ID` AS `INZITTENDE_ID`,`sl`.`OP_REKENING_ID` AS `OP_REKENING_ID`,`rl`.`NAAM` AS `OP_REKENING`,`sv`.`OMSCHRIJVING` AS `SOORTVLUCHT`,`sm`.`OMSCHRIJVING` AS `STARTMETHODE` from ((((((`oper_startlijst` `sl` left join `ref_leden` `vl` on(`sl`.`VLIEGER_ID` = `vl`.`ID`)) left join `ref_leden` `il` on(`sl`.`INZITTENDE_ID` = `il`.`ID`)) left join `ref_leden` `rl` on(`sl`.`OP_REKENING_ID` = `rl`.`ID`)) left join `ref_vliegtuigen` `v` on(`sl`.`VLIEGTUIG_ID` = `v`.`ID`)) left join `types` `sv` on(`sl`.`SOORTVLUCHT_ID` = `sv`.`ID`)) left join `types` `sm` on(`sl`.`STARTMETHODE_ID` = `sm`.`ID`)) where `sl`.`VERWIJDERD` = 0) ;

-- --------------------------------------------------------

--
-- Structure for view `startlijst_vlieger_view`
--
DROP TABLE IF EXISTS `startlijst_vlieger_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`gezc_db_strt_local`@`localhost` SQL SECURITY DEFINER VIEW `startlijst_vlieger_view`  AS  (select `sl`.`VLIEGERNAAM` AS `VLIEGERNAAM`,`sl`.`DAGNUMMER` AS `DAGNUMMER`,`sl`.`REGISTRATIE` AS `REGISTRATIE`,`t`.`CODE` AS `VLIEGTUIG_TYPE`,`sl`.`STARTTIJD` AS `STARTTIJD`,`sl`.`DUUR` AS `DUUR`,`sl`.`DATUM` AS `DATUM` from ((`startlijst_view` `sl` left join `ref_vliegtuigen` `v` on(`sl`.`VLIEGTUIG_ID` = `v`.`ID`)) left join `types` `t` on(`v`.`TYPE_ID` = `t`.`ID`)) where `v`.`CLUBKIST` = 1 and `sl`.`VLIEGERNAAM` is not null and `sl`.`LANDINGSTIJD` is not null order by `sl`.`VLIEGERNAAM`,`sl`.`STARTTIJD`) ;

-- --------------------------------------------------------

--
-- Structure for view `vliegtuigenaanwezig_view`
--
DROP TABLE IF EXISTS `vliegtuigenaanwezig_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`gezc_db_strt_local`@`localhost` SQL SECURITY DEFINER VIEW `vliegtuigenaanwezig_view`  AS  (select `a`.`ID` AS `ID`,`v`.`ID` AS `VLIEGTUIG_ID`,`v`.`REGISTRATIE` AS `REGISTRATIE`,`v`.`CALLSIGN` AS `CALLSIGN`,`v`.`ZITPLAATSEN` AS `ZITPLAATSEN`,`v`.`CLUBKIST` AS `CLUBKIST`,`v`.`VLIEGTUIGTYPE` AS `VLIEGTUIGTYPE`,time_format(`a`.`AANKOMST`,'%H:%i') AS `AANKOMST`,time_format(`a`.`VERTREK`,'%H:%i') AS `VERTREK`,`a`.`LAATSTE_AANPASSING` AS `LAATSTE_AANPASSING` from (`vliegtuigenlijst_view` `v` join `oper_aanwezig` `a` on(`v`.`ID` = `a`.`VLIEGTUIG_ID`)) where `a`.`DATUM` = cast(current_timestamp() as date)) ;

-- --------------------------------------------------------

--
-- Structure for view `vliegtuigenlijst_view`
--
DROP TABLE IF EXISTS `vliegtuigenlijst_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`gezc_db_strt_local`@`localhost` SQL SECURITY DEFINER VIEW `vliegtuigenlijst_view`  AS  (select `v`.`ID` AS `ID`,`v`.`REGISTRATIE` AS `REGISTRATIE`,`v`.`CALLSIGN` AS `CALLSIGN`,`RegCall`(`v`.`ID`) AS `REGCALL`,`v`.`ZITPLAATSEN` AS `ZITPLAATSEN`,`v`.`FLARM_CODE` AS `FLARM_CODE`,`v`.`TYPE_ID` AS `TYPE_ID`,case `v`.`TMG` when 0 then 'false' else 'true' end AS `TMG`,case `v`.`SLEEPKIST` when 0 then 'false' else 'true' end AS `SLEEPKIST`,case `v`.`ZELFSTART` when 0 then 'false' else 'true' end AS `ZELFSTART`,case `v`.`CLUBKIST` when 0 then 'false' else 'true' end AS `CLUBKIST`,`t`.`OMSCHRIJVING` AS `VLIEGTUIGTYPE`,`v`.`LAATSTE_AANPASSING` AS `LAATSTE_AANPASSING` from (`ref_vliegtuigen` `v` left join `types` `t` on(`v`.`TYPE_ID` = `t`.`ID`)) where `v`.`VERWIJDERD` = 0) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `oper_aanwezig`
--
ALTER TABLE `oper_aanwezig`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `VLIEGTUIG_ID` (`VLIEGTUIG_ID`),
  ADD KEY `DATUM` (`DATUM`),
  ADD KEY `LID_ID` (`LID_ID`),
  ADD KEY `FK_VLIEGTUIG` (`VLIEGTUIG_ID`);

--
-- Indexes for table `oper_daginfo`
--
ALTER TABLE `oper_daginfo`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `DATUM` (`DATUM`),
  ADD KEY `FK_BAAN` (`BAAN_ID`),
  ADD KEY `FK_WINDRICHTING` (`WINDRICHTING_ID`),
  ADD KEY `FK_WINDKRACHT` (`WINDKRACHT_ID`),
  ADD KEY `FK_STARTMETHODE` (`STARTMETHODE_ID`),
  ADD KEY `FK_VELD_ID` (`VELD_ID`),
  ADD KEY `FK_BEDRIJF_ID` (`BEDRIJF_ID`);

--
-- Indexes for table `oper_flarm`
--
ALTER TABLE `oper_flarm`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `BAAN_idx` (`BAAN_ID`);

--
-- Indexes for table `oper_gps`
--
ALTER TABLE `oper_gps`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `DATUM_IDX` (`DATUM`),
  ADD KEY `FK_oper_gps` (`BAAN_ID`);

--
-- Indexes for table `oper_rooster`
--
ALTER TABLE `oper_rooster`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `DATUM_2` (`DATUM`),
  ADD KEY `DATUM` (`DATUM`),
  ADD KEY `FK_oper_rooster` (`MIDDAG_DDI`);

--
-- Indexes for table `oper_startlijst`
--
ALTER TABLE `oper_startlijst`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `ID_UNIQUE` (`ID`),
  ADD KEY `VLIEGTUIG_ID` (`VLIEGTUIG_ID`),
  ADD KEY `DATUM` (`DATUM`),
  ADD KEY `VERWIJDERD` (`VERWIJDERD`),
  ADD KEY `INZITTENDE_ID` (`INZITTENDE_ID`),
  ADD KEY `FK_VLIEGER` (`VLIEGER_ID`),
  ADD KEY `FK_INZITTENDE` (`INZITTENDE_ID`),
  ADD KEY `FK_VLIEGTUIG_ID` (`VLIEGTUIG_ID`),
  ADD KEY `FK_SLEEPKIST` (`SLEEPKIST_ID`),
  ADD KEY `VLIEGTUIG_ID_2` (`VLIEGTUIG_ID`),
  ADD KEY `_oper_startlijst_fk_betalen_idx` (`OP_REKENING_ID`),
  ADD KEY `LAASTE_AANPASSING` (`LAATSTE_AANPASSING`);

--
-- Indexes for table `ref_leden`
--
ALTER TABLE `ref_leden`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `ID` (`ID`),
  ADD KEY `NAAM` (`NAAM`),
  ADD KEY `VOORNAAM` (`VOORNAAM`),
  ADD KEY `ACHTERNAAM` (`ACHTERNAAM`),
  ADD KEY `FK_LIDTYPE` (`LIDTYPE_ID`),
  ADD KEY `LAATSTE_AANPASSING` (`LAATSTE_AANPASSING`);
ALTER TABLE `ref_leden` ADD FULLTEXT KEY `MATCHNAAM` (`NAAM`);

--
-- Indexes for table `ref_vliegtuigen`
--
ALTER TABLE `ref_vliegtuigen`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `ID_UNIQUE` (`ID`),
  ADD KEY `REGISTRATIE` (`REGISTRATIE`),
  ADD KEY `CALLSIGN` (`CALLSIGN`),
  ADD KEY `VERWIJDERD` (`VERWIJDERD`),
  ADD KEY `FK_TYPE` (`TYPE_ID`),
  ADD KEY `LAATSTE_AANPASSING` (`LAATSTE_AANPASSING`);

--
-- Indexes for table `typegroep`
--
ALTER TABLE `typegroep`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `ID_UNIQUE` (`ID`),
  ADD KEY `Verwijderd` (`VERWIJDERD`);

--
-- Indexes for table `types`
--
ALTER TABLE `types`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `TYPEGROUP_ID` (`TYPEGROUP_ID`),
  ADD KEY `VERWIJDERD` (`VERWIJDERD`),
  ADD KEY `FK_TYPEGROUP` (`TYPEGROUP_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `oper_aanwezig`
--
ALTER TABLE `oper_aanwezig`
  MODIFY `ID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1711142010179;

--
-- AUTO_INCREMENT for table `oper_daginfo`
--
ALTER TABLE `oper_daginfo`
  MODIFY `ID` mediumint(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `oper_flarm`
--
ALTER TABLE `oper_flarm`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6097;

--
-- AUTO_INCREMENT for table `oper_gps`
--
ALTER TABLE `oper_gps`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `oper_rooster`
--
ALTER TABLE `oper_rooster`
  MODIFY `ID` mediumint(8) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `oper_startlijst`
--
ALTER TABLE `oper_startlijst`
  MODIFY `ID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1711140053005;

--
-- AUTO_INCREMENT for table `ref_leden`
--
ALTER TABLE `ref_leden`
  MODIFY `ID` mediumint(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1000243;

--
-- AUTO_INCREMENT for table `ref_vliegtuigen`
--
ALTER TABLE `ref_vliegtuigen`
  MODIFY `ID` mediumint(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=536;

--
-- AUTO_INCREMENT for table `typegroep`
--
ALTER TABLE `typegroep`
  MODIFY `ID` mediumint(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `types`
--
ALTER TABLE `types`
  MODIFY `ID` mediumint(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1554;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `oper_aanwezig`
--
ALTER TABLE `oper_aanwezig`
  ADD CONSTRAINT `FK_lid` FOREIGN KEY (`LID_ID`) REFERENCES `ref_leden` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `oper_aanwezig_ibfk_2` FOREIGN KEY (`VLIEGTUIG_ID`) REFERENCES `ref_vliegtuigen` (`ID`) ON UPDATE CASCADE;

--
-- Constraints for table `oper_daginfo`
--
ALTER TABLE `oper_daginfo`
  ADD CONSTRAINT `oper_daginfo_ibfk_1` FOREIGN KEY (`BAAN_ID`) REFERENCES `types` (`ID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `oper_daginfo_ibfk_2` FOREIGN KEY (`WINDRICHTING_ID`) REFERENCES `types` (`ID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `oper_daginfo_ibfk_3` FOREIGN KEY (`WINDKRACHT_ID`) REFERENCES `types` (`ID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `oper_daginfo_ibfk_4` FOREIGN KEY (`STARTMETHODE_ID`) REFERENCES `types` (`ID`) ON UPDATE NO ACTION;

--
-- Constraints for table `oper_flarm`
--
ALTER TABLE `oper_flarm`
  ADD CONSTRAINT `BAAN` FOREIGN KEY (`BAAN_ID`) REFERENCES `types` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `oper_gps`
--
ALTER TABLE `oper_gps`
  ADD CONSTRAINT `FK_oper_gps` FOREIGN KEY (`BAAN_ID`) REFERENCES `types` (`ID`) ON UPDATE CASCADE;

--
-- Constraints for table `oper_startlijst`
--
ALTER TABLE `oper_startlijst`
  ADD CONSTRAINT `_oper_startlijst_fk_betalen` FOREIGN KEY (`OP_REKENING_ID`) REFERENCES `ref_leden` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `_oper_startlijst_fk_inzittende` FOREIGN KEY (`INZITTENDE_ID`) REFERENCES `ref_leden` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `_oper_startlijst_fk_vlieger` FOREIGN KEY (`VLIEGER_ID`) REFERENCES `ref_leden` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `oper_startlijst_ibfk_1` FOREIGN KEY (`VLIEGTUIG_ID`) REFERENCES `ref_vliegtuigen` (`ID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `oper_startlijst_ibfk_2` FOREIGN KEY (`SLEEPKIST_ID`) REFERENCES `ref_vliegtuigen` (`ID`) ON UPDATE CASCADE;

--
-- Constraints for table `ref_leden`
--
ALTER TABLE `ref_leden`
  ADD CONSTRAINT `FK_LIDTYPE` FOREIGN KEY (`LIDTYPE_ID`) REFERENCES `types` (`ID`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `ref_vliegtuigen`
--
ALTER TABLE `ref_vliegtuigen`
  ADD CONSTRAINT `FK_TYPE` FOREIGN KEY (`TYPE_ID`) REFERENCES `types` (`ID`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `types`
--
ALTER TABLE `types`
  ADD CONSTRAINT `FK_TYPEGROUP` FOREIGN KEY (`TYPEGROUP_ID`) REFERENCES `typegroep` (`ID`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
