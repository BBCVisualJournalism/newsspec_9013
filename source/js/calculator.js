define(['lib/news_special/bootstrap', 'data'], function (news, DataModel) {

    'use strict';

    var Calculator = function () {};
    Calculator.prototype = {

        getUserInput: function () {
            var testRegEx = new RegExp(/^0|\d+$/);

            var beerText = parseFloat($('#beerInput').val(), 10),
                wineText = parseFloat($('#wineInput').val(), 10),
                spiritsText = parseFloat($('#spiritsInput').val(), 10);

            if (!isNaN(beerText) && !isNaN(wineText) && !isNaN(spiritsText)) {
                if (beerText >= 0 && wineText >= 0 && spiritsText >= 0) {
                    return {
                        beers: beerText,
                        wines: wineText,
                        spirits: spiritsText
                    };
                }
            }
            return false;
        },

        calcAnnualNumberOfDrinks: function (readerAnswers) {
            var pintsPerYear = Math.round(readerAnswers.beers * 52),
                glassesOfWinePerYear = Math.round(readerAnswers.wines * 52),
                shotsPerYear = Math.round(readerAnswers.spirits * 52);

            return {
                beers: pintsPerYear,
                wines: glassesOfWinePerYear,
                spirits: shotsPerYear
            };
        },

        calcReaderAnnualTotalsByDrink: function (readerAnswers) {

            var litresOfAlcoholFromBeerPerYear = readerAnswers.beers * 52 * 2.8 * 0.01,
                litresOfAlcoholFromWinePerYear = readerAnswers.wines * 52 * 2.1 * 0.01,
                litresOfAlcoholFromSpiritsPerYear = readerAnswers.spirits * 52 * 1 * 0.01;

            return {
                beers: litresOfAlcoholFromBeerPerYear,
                wines: litresOfAlcoholFromWinePerYear,
                spirits: litresOfAlcoholFromSpiritsPerYear
            };
        },

        calcAnnualTotal: function (readerAnswers) {
            var litresOfAlcoholByDrinkType = this.calcReaderAnnualTotalsByDrink(readerAnswers);
            
            return litresOfAlcoholByDrinkType.beers + litresOfAlcoholByDrinkType.wines + litresOfAlcoholByDrinkType.spirits;
        },

        calcCountryDrinksPerYear: function (countryData) {
            var countryPintsPerYear = Math.round(countryData[0] / 2.8 / 0.01),
                countryGlassesOfWinePerYear = Math.round(countryData[1] / 2.1 / 0.01),
                countryShotsPerYear = Math.round(countryData[2] / 1 / 0.01);

            return {
                beers: countryPintsPerYear,
                wines: countryGlassesOfWinePerYear,
                spirits: countryShotsPerYear
            };

        }
    };

    return Calculator;

});