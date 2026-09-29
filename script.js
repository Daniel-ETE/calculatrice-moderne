// ==============================
// RECUPERATION DES ELEMENTS
// ==============================

const ecran = document.querySelector("#ecran");
const boutons = document.querySelectorAll("button");
const boutonMode = document.querySelector("#mode");


// ==============================
// VARIABLES
// ==============================

let calcul = "";
let mode = 0;


// ==============================
// AFFICHAGE
// ==============================

function afficher(texte) {

    ecran.textContent = texte === "" ? "0" : texte;

    // Aller automatiquement vers la droite
    ecran.scrollLeft = ecran.scrollWidth;
}


// ==============================
// BOUTON MODE
// ==============================

boutonMode.addEventListener("click", function () {

    mode++;

    if (mode > 2) {
        mode = 0;
    }

    boutonMode.textContent = "MODE " + mode;

    calcul = "";

    afficher("0");

});


// ==============================
// GESTION DES BOUTONS
// ==============================

boutons.forEach(function (bouton) {

    bouton.addEventListener("click", function () {

        const valeur = bouton.dataset.value || bouton.textContent;


        // MODE est déjà géré
        if (bouton === boutonMode) {
            return;
        }


        // ==========================
        // AC
        // ==========================

        if (valeur === "AC") {

            calcul = "";
            afficher("0");

            return;
        }


        // ==========================
        // EFFACER
        // ==========================

        if (valeur === "←") {

            calcul = calcul.slice(0, -1);

            afficher(calcul);

            return;
        }


        // ==========================
        // EGAL
        // ==========================

        if (valeur === "=") {

            if (mode === 0) {
                calculerNormal();
            }

            else if (mode === 1) {
                calculerFraction();
            }

            else if (mode === 2) {
                calculerBinaire();
            }

            return;
        }


        // ==========================
        // MODE 2 : BINAIRE
        // ==========================

        if (mode === 2) {

            if (
                valeur === "0" ||
                valeur === "1" ||
                valeur === "+" ||
                valeur === "-" ||
                valeur === "*" ||
                valeur === "/"
            ) {

                calcul += valeur;

                afficher(calcul);
            }

            return;
        }


        // ==========================
        // MODE 0 ET MODE 1
        // ==========================

        calcul += valeur;

        afficher(calcul);

    });

});


// =================================================
// TRAITEMENT DES RACINES
// =================================================

function traiterRacines(expression) {

    // ---------------------------------------------
    // RACINE N-IEME
    // Exemple :
    // 2^√16 → 4
    // 3^√27 → 3
    // ---------------------------------------------

    expression = expression.replace(
        /(\d+(?:\.\d+)?)\^√(\d+(?:\.\d+)?)/g,

        function (match, indice, nombre) {

            const resultat =
                Math.pow(
                    Number(nombre),
                    1 / Number(indice)
                );

            return resultat;
        }
    );


    // ---------------------------------------------
    // RACINE CARREE SIMPLE
    // √16 → 4
    // ---------------------------------------------

    expression = expression.replace(
        /√(\d+(?:\.\d+)?)/g,

        function (match, nombre) {

            return Math.sqrt(Number(nombre));
        }
    );


    return expression;
}


// ==============================
// MODE 0 : CALCUL NORMAL
// ==============================

function calculerNormal() {

    try {

        let expression = calcul;


        // Racines
        expression = traiterRacines(expression);


        // Puissances restantes
        expression = expression.replaceAll("^", "**");


        // Pourcentage
        expression = expression.replace(
            /(\d+(\.\d+)?)%/g,
            "($1/100)"
        );


        const resultat = Function(
            '"use strict"; return (' + expression + ')'
        )();


        if (!Number.isFinite(resultat)) {
            throw new Error();
        }


        calcul = resultat.toString();

        afficher(calcul);

    } catch (erreur) {

        afficher("Erreur");

        calcul = "";

    }

}


// =================================================
// MODE 1 : CALCUL EXACT DES FRACTIONS
// =================================================

function calculerFraction() {

    try {

        // On calcule directement avec les fractions
        const resultat =
            calculerExpressionFraction(calcul);


        // Transformation en texte
        calcul =
            fractionVersTexte(resultat);


        afficher(calcul);

    } catch (erreur) {

        afficher("Erreur");

        calcul = "";

    }

}


// =================================================
// CREATION D'UNE FRACTION IRREDUCTIBLE
// =================================================

function creerFraction(numerateur, denominateur = 1) {

    if (denominateur === 0) {
        throw new Error("Division par zéro");
    }


    // Le dénominateur doit être positif
    if (denominateur < 0) {

        numerateur = -numerateur;
        denominateur = -denominateur;

    }


    // Simplification avec le PGCD
    const diviseur = pgcd(
        Math.abs(numerateur),
        Math.abs(denominateur)
    );


    return {

        n: numerateur / diviseur,
        d: denominateur / diviseur

    };

}


// =================================================
// ADDITION DE FRACTIONS
// =================================================

function additionFraction(a, b) {

    return creerFraction(

        a.n * b.d + b.n * a.d,

        a.d * b.d

    );

}


// =================================================
// SOUSTRACTION DE FRACTIONS
// =================================================

function soustractionFraction(a, b) {

    return creerFraction(

        a.n * b.d - b.n * a.d,

        a.d * b.d

    );

}


// =================================================
// MULTIPLICATION DE FRACTIONS
// =================================================

function multiplicationFraction(a, b) {

    return creerFraction(

        a.n * b.n,

        a.d * b.d

    );

}


// =================================================
// DIVISION DE FRACTIONS
// =================================================

function divisionFraction(a, b) {

    if (b.n === 0) {
        throw new Error("Division par zéro");
    }


    return creerFraction(

        a.n * b.d,

        a.d * b.n

    );

}


// =================================================
// AFFICHAGE D'UNE FRACTION
// =================================================

function fractionVersTexte(fraction) {

    if (fraction.d === 1) {
        return fraction.n.toString();
    }


    return fraction.n + "/" + fraction.d;

}


// =================================================
// TRANSFORMATION D'UN NOMBRE EN FRACTION
// =================================================

function nombreVersFraction(nombre) {

    // Nombre entier
    if (!nombre.includes(".")) {

        return creerFraction(
            parseInt(nombre),
            1
        );

    }


    // Nombre décimal
    const parties =
        nombre.split(".");


    const partieEntiere =
        parties[0];


    const partieDecimale =
        parties[1];


    const denominateur =
        Math.pow(
            10,
            partieDecimale.length
        );


    const numerateur =
        parseInt(
            partieEntiere + partieDecimale
        );


    return creerFraction(
        numerateur,
        denominateur
    );

}


// =================================================
// CALCUL D'UNE EXPRESSION DE FRACTIONS
// =================================================

function calculerExpressionFraction(expression) {

    // On enlève les espaces
    expression =
        expression.replace(/\s/g, "");


    let position = 0;


    // =============================================
    // ADDITION ET SOUSTRACTION
    // =============================================

    function lireExpression() {

        let resultat =
            lireTerme();


        while (

            position < expression.length &&

            (
                expression[position] === "+" ||
                expression[position] === "-"
            )

        ) {

            const operateur =
                expression[position];

            position++;


            const suivant =
                lireTerme();


            if (operateur === "+") {

                resultat =
                    additionFraction(
                        resultat,
                        suivant
                    );

            }

            else {

                resultat =
                    soustractionFraction(
                        resultat,
                        suivant
                    );

            }

        }


        return resultat;

    }


    // =============================================
    // MULTIPLICATION ET DIVISION
    // =============================================

    function lireTerme() {

        let resultat =
            lireFacteur();


        while (

            position < expression.length &&

            (
                expression[position] === "*" ||
                expression[position] === "/"
            )

        ) {

            const operateur =
                expression[position];

            position++;


            const suivant =
                lireFacteur();


            if (operateur === "*") {

                resultat =
                    multiplicationFraction(
                        resultat,
                        suivant
                    );

            }

            else {

                resultat =
                    divisionFraction(
                        resultat,
                        suivant
                    );

            }

        }


        return resultat;

    }


    // =============================================
    // NOMBRES ET PARENTHESES
    // =============================================

    function lireFacteur() {


        // Nombre négatif
        if (expression[position] === "-") {

            position++;

            const fraction =
                lireFacteur();


            return creerFraction(

                -fraction.n,

                fraction.d

            );

        }


        // Parenthèses
        if (expression[position] === "(") {

            position++;

            const resultat =
                lireExpression();


            if (expression[position] !== ")") {
                throw new Error("Parenthèse manquante");
            }


            position++;

            return resultat;

        }


        // Lecture du nombre
        let nombre = "";


        while (

            position < expression.length &&

            /[0-9.]/.test(
                expression[position]
            )

        ) {

            nombre +=
                expression[position];

            position++;

        }


        if (nombre === "") {
            throw new Error("Nombre invalide");
        }


        return nombreVersFraction(nombre);

    }


    const resultat =
        lireExpression();


    // Vérifie qu'il ne reste aucun caractère
    if (position < expression.length) {
        throw new Error("Expression invalide");
    }


    return resultat;

}


// =================================================
// PGCD
// PLUS GRAND COMMUN DIVISEUR
// =================================================

function pgcd(a, b) {

    a = Math.abs(a);
    b = Math.abs(b);


    while (b !== 0) {

        const reste =
            a % b;

        a = b;

        b = reste;

    }


    return a;

}


// =================================================
// MODE 2 : BINAIRE
// =================================================

function calculerBinaire() {

    try {

        let operateur = null;


        // Recherche de l'opérateur

        if (calcul.includes("+")) {
            operateur = "+";
        }

        else if (calcul.includes("-")) {
            operateur = "-";
        }

        else if (calcul.includes("*")) {
            operateur = "*";
        }

        else if (calcul.includes("/")) {
            operateur = "/";
        }


        // Aucun opérateur

        if (operateur === null) {

            afficher("Erreur");

            calcul = "";

            return;

        }


        // Séparation

        const nombres =
            calcul.split(operateur);


        const nombre1 =
            nombres[0];

        const nombre2 =
            nombres[1];


        if (

            nombre1 === "" ||
            nombre2 === ""

        ) {

            afficher("Erreur");

            calcul = "";

            return;

        }


        // Binaire → décimal

        const decimal1 =
            parseInt(nombre1, 2);

        const decimal2 =
            parseInt(nombre2, 2);


        let resultat;


        // Addition

        if (operateur === "+") {

            resultat =
                decimal1 + decimal2;

        }


        // Soustraction

        else if (operateur === "-") {

            resultat =
                decimal1 - decimal2;

        }


        // Multiplication

        else if (operateur === "*") {

            resultat =
                decimal1 * decimal2;

        }


        // Division

        else if (operateur === "/") {

            if (decimal2 === 0) {

                afficher("Erreur");

                calcul = "";

                return;

            }


            resultat =
                decimal1 / decimal2;

        }


        // Conversion décimal → binaire

        resultat =
            Math.floor(resultat);


        calcul =
            resultat.toString(2);


        afficher(calcul);

    }

    catch (erreur) {

        afficher("Erreur");

        calcul = "";

    }

}